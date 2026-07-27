const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Directories that hold build output or native dependencies. Metro never needs to
 * resolve from them, but it does watch them by default - and on macOS without
 * watchman that means the fallback fs watcher polls thousands of files it will
 * never serve. The spurious change events it emits show up as an endless
 * "Refreshing..." banner in the app, so keep them out of the watch set.
 */
const IGNORED_DIRS = ['vendor', 'ios/Pods', 'ios/build', 'android/build', 'android/.gradle'];

const blockList = IGNORED_DIRS.map(
  dir => new RegExp(`^${escapeRegExp(path.resolve(__dirname, dir))}\\/.*$`),
);

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    sourceExts: ['ts', 'tsx', 'js', 'jsx', 'json', 'cjs', 'mjs'],
    blockList,
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
