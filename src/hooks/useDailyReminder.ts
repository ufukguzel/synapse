import {useCallback} from 'react';
import {APP_NAME} from '@/constants';
import {isNotificationsAvailable, notificationScheduler} from '@/services/notifications';
import {useAuth} from '@/providers';
import {useUpdateProfile} from './useProfile';

/** Format an hour (0-23) as a local "HH:00" label. */
export const formatHour = (hour: number) => `${String(hour).padStart(2, '0')}:00`;

/**
 * The daily reminder preference lives on the profile (source of truth); this
 * hook keeps it and the OS schedule in sync. When no notification driver is
 * registered the preference is still saved — it just isn't scheduled yet.
 */
export const useDailyReminder = () => {
  const {profile} = useAuth();
  const updateProfile = useUpdateProfile();

  const enabled = profile?.reminder_enabled ?? false;
  const hour = profile?.reminder_hour ?? 20;

  const apply = useCallback(
    async (nextEnabled: boolean, nextHour: number) => {
      // Persist first, then reconcile the OS schedule with the saved intent.
      await updateProfile.mutateAsync({
        reminder_enabled: nextEnabled,
        reminder_hour: nextHour,
      });

      if (!isNotificationsAvailable()) {
        return;
      }
      if (nextEnabled) {
        const granted = await notificationScheduler.requestPermission();
        if (!granted) {
          return;
        }
        await notificationScheduler.scheduleDailyReminder({
          hour: nextHour,
          minute: 0,
          title: 'Time to learn',
          body: `Keep your streak alive on ${APP_NAME}.`,
        });
      } else {
        await notificationScheduler.cancelDailyReminder();
      }
    },
    [updateProfile],
  );

  return {
    isAvailable: isNotificationsAvailable(),
    enabled,
    hour,
    isSaving: updateProfile.isPending,
    setEnabled: (next: boolean) => apply(next, hour),
    setHour: (next: number) => apply(enabled, next),
  };
};
