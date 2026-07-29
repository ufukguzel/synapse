# Daily reminder notifications

The daily study reminder is behind a **driver**, the same pattern as audio/speech
([MEDIA.md](MEDIA.md)): screens and hooks stay free of native modules, and the actual
scheduler is a one-line swap — or left unregistered.

## Source of truth

The preference lives on the profile: `reminder_enabled` and `reminder_hour` (0-23,
default off / 20:00). `useDailyReminder` writes those, then reconciles the OS schedule
through the registered driver. Because the intent is stored server-side, it survives a
reinstall — re-registering the driver can reschedule from the saved values.

## What ships today

No driver is registered, so `isNotificationsAvailable()` is `false`. The UI still lets the
user set the preference (it's saved), and simply notes that reminders will start once
notifications ship. Nothing crashes, nothing is scheduled.

## Registering a scheduler

```ts
// src/services/notifications/drivers/notifee.native.ts
import notifee, {TriggerType, RepeatFrequency} from '@notifee/react-native';
import {registerNotificationDriver} from '@/services/notifications';

registerNotificationDriver({
  async requestPermission() {
    const settings = await notifee.requestPermission();
    return settings.authorizationStatus >= 1;
  },
  async scheduleDailyReminder({hour, minute, title, body}) {
    await notifee.cancelTriggerNotification('daily-reminder');
    const now = new Date();
    const next = new Date();
    next.setHours(hour, minute, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    await notifee.createTriggerNotification(
      {id: 'daily-reminder', title, body},
      {type: TriggerType.TIMESTAMP, timestamp: next.getTime(), repeatFrequency: RepeatFrequency.DAILY},
    );
  },
  async cancelDailyReminder() {
    await notifee.cancelTriggerNotification('daily-reminder');
  },
});
```

Import it once from `App.tsx` (or `index.js`) before the navigators mount.

Platform notes:
- iOS — the permission prompt is handled by `requestPermission()`; add a background mode
  only if you later add remote push.
- Android 13+ — declare `POST_NOTIFICATIONS` and request it at runtime (the driver's
  `requestPermission` is the seam).

## Testing

Register a fake and clear it afterwards:

```ts
registerNotificationDriver({
  requestPermission: jest.fn().mockResolvedValue(true),
  scheduleDailyReminder: jest.fn(),
  cancelDailyReminder: jest.fn(),
});
// …
afterEach(() => registerNotificationDriver(null));
```

See `__tests__/notifications.test.ts`.
