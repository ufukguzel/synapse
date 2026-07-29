import {
  isNotificationsAvailable,
  notificationScheduler,
  registerNotificationDriver,
} from '../src/services/notifications';

afterEach(() => registerNotificationDriver(null));

describe('notification scheduler registry', () => {
  it('reports unavailable until a driver is registered', () => {
    expect(isNotificationsAvailable()).toBe(false);
    registerNotificationDriver({
      requestPermission: jest.fn(),
      scheduleDailyReminder: jest.fn(),
      cancelDailyReminder: jest.fn(),
    });
    expect(isNotificationsAvailable()).toBe(true);
  });

  it('degrades to no-ops with no driver (permission denied, schedule/cancel silent)', async () => {
    await expect(notificationScheduler.requestPermission()).resolves.toBe(false);
    await expect(
      notificationScheduler.scheduleDailyReminder({hour: 20, minute: 0, title: 't', body: 'b'}),
    ).resolves.toBeUndefined();
    await expect(notificationScheduler.cancelDailyReminder()).resolves.toBeUndefined();
  });

  it('forwards to the registered driver', async () => {
    const schedule = jest.fn().mockResolvedValue(undefined);
    registerNotificationDriver({
      requestPermission: jest.fn().mockResolvedValue(true),
      scheduleDailyReminder: schedule,
      cancelDailyReminder: jest.fn().mockResolvedValue(undefined),
    });

    await expect(notificationScheduler.requestPermission()).resolves.toBe(true);
    await notificationScheduler.scheduleDailyReminder({
      hour: 8,
      minute: 30,
      title: 'Time to learn',
      body: 'Keep your streak alive.',
    });
    expect(schedule).toHaveBeenCalledWith({
      hour: 8,
      minute: 30,
      title: 'Time to learn',
      body: 'Keep your streak alive.',
    });
  });
});
