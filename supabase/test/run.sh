#!/usr/bin/env bash
#
# Spin up a throwaway Postgres, apply the Supabase shim + every migration (in
# order) + the seed, then run functional_test.sql. Any failed assertion aborts
# with a non-zero exit, so this doubles as a CI gate.
#
#   supabase/test/run.sh
#
# Requires the Postgres server binaries (initdb, pg_ctl, psql). On Debian/Ubuntu
# install `postgresql`. Must NOT run as root (Postgres refuses); if you only
# have a postgres system user, run:  sudo -u postgres supabase/test/run.sh
#
# Override binary discovery with PG_BIN=/path/to/postgres/bin if needed.
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
migrations="$here/../migrations"
seed="$here/../seed.sql"

if [[ "$(id -u)" == "0" ]]; then
  echo "error: do not run as root — Postgres refuses. Try: sudo -u postgres $0" >&2
  exit 1
fi

# Locate the server binaries.
if [[ -n "${PG_BIN:-}" ]]; then
  bin="$PG_BIN"
elif command -v pg_ctl >/dev/null 2>&1; then
  bin="$(dirname "$(command -v pg_ctl)")"
else
  bin="$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1 || true)"
fi
if [[ -z "${bin:-}" || ! -x "$bin/initdb" ]]; then
  echo "error: could not find Postgres binaries (set PG_BIN)" >&2
  exit 1
fi

work="$(mktemp -d "${TMPDIR:-/tmp}/synapse-pgtest.XXXXXX")"
data="$work/data"
sock="$work/sock"
port="${PGPORT:-54329}"
mkdir -p "$data" "$sock"

cleanup() {
  "$bin/pg_ctl" -D "$data" -m immediate stop >/dev/null 2>&1 || true
  rm -rf "$work"
}
trap cleanup EXIT

echo "→ initdb ($("$bin/postgres" --version))"
"$bin/initdb" -D "$data" -A trust -U postgres >/dev/null

echo "→ starting server on $sock:$port"
"$bin/pg_ctl" -D "$data" \
  -o "-k $sock -p $port -c listen_addresses=''" \
  -l "$work/log" -w start >/dev/null

psql="$bin/psql -h $sock -p $port -U postgres -v ON_ERROR_STOP=1 -q"
$psql -c "create database synapse_test;" >/dev/null
db="$bin/psql -h $sock -p $port -U postgres -d synapse_test -v ON_ERROR_STOP=1 -q"

echo "→ applying shim"
$db -f "$here/shim.sql" >/dev/null

echo "→ applying migrations"
for f in "$migrations"/*.sql; do
  echo "   $(basename "$f")"
  $db -f "$f" >/dev/null
done

echo "→ applying seed"
$db -f "$seed" >/dev/null

echo "→ running functional tests"
$db -f "$here/functional_test.sql"

echo "✓ all migrations applied and functional tests passed"
