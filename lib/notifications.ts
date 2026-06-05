import { Capacitor } from '@capacitor/core';
import type { DayOfWeek, PlannerItem, Quest } from '../types';

let NotificationsLib: any = null;
const getNotifications = async () => {
  if (NotificationsLib) return NotificationsLib;
  try {
    const mod = await import('@capacitor/local-notifications');
    NotificationsLib = mod;
    return mod;
  } catch {
    return null;
  }
};

const QUEST_NOTIF_ID = 1001;
const PLANNER_NOTIF_ID = 1002;

export async function requestNotificationPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  const lib = await getNotifications();
  if (!lib) return false;
  try {
    const { display } = await lib.LocalNotifications.requestPermissions();
    return display === 'granted';
  } catch {
    return false;
  }
}

export async function scheduleQuestReminder(quests: Quest[]): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  const lib = await getNotifications();
  if (!lib) return;

  const activeCount = quests.filter(q => !q.isSystemQuest).length;
  if (activeCount === 0) return;

  try {
    await lib.LocalNotifications.cancel({ notifications: [{ id: QUEST_NOTIF_ID }] }).catch(() => {});

    const now = new Date();
    const trigger = new Date();
    trigger.setHours(9, 0, 0, 0);
    if (trigger <= now) trigger.setDate(trigger.getDate() + 1);

    await lib.LocalNotifications.schedule({
      notifications: [
        {
          id: QUEST_NOTIF_ID,
          title: '⚔ R.L.L — Quest Log Active',
          body: `${activeCount} active quest${activeCount !== 1 ? 's' : ''} await your return, Hunter. Complete your objectives.`,
          schedule: { at: trigger, repeats: false, allowWhileIdle: true },
          sound: 'default',
          smallIcon: 'ic_notification',
        },
      ],
    });
  } catch (e) {
    console.error('[notifications] scheduleQuestReminder error:', e);
  }
}

export async function schedulePlannerReminder(
  weeklyPlan: Record<DayOfWeek, PlannerItem[]>
): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  const lib = await getNotifications();
  if (!lib) return;

  const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayName = days[new Date().getDay()];
  const todayTasks = weeklyPlan[todayName] ?? [];
  const pending = todayTasks.filter(t => !t.completed);

  if (pending.length === 0) return;

  try {
    await lib.LocalNotifications.cancel({ notifications: [{ id: PLANNER_NOTIF_ID }] }).catch(() => {});

    const now = new Date();
    const trigger = new Date();
    trigger.setHours(8, 30, 0, 0);
    if (trigger <= now) {
      trigger.setHours(20, 0, 0, 0);
      if (trigger <= now) {
        trigger.setDate(trigger.getDate() + 1);
        trigger.setHours(8, 30, 0, 0);
      }
    }

    const preview = pending
      .slice(0, 2)
      .map(t => `• ${t.text}`)
      .join('\n');
    const extra = pending.length > 2 ? `\n+${pending.length - 2} more` : '';

    await lib.LocalNotifications.schedule({
      notifications: [
        {
          id: PLANNER_NOTIF_ID,
          title: `📋 R.L.L — ${pending.length} Task${pending.length !== 1 ? 's' : ''} Remaining Today`,
          body: `${preview}${extra}`,
          schedule: { at: trigger, repeats: false, allowWhileIdle: true },
          sound: 'default',
          smallIcon: 'ic_notification',
        },
      ],
    });
  } catch (e) {
    console.error('[notifications] schedulePlannerReminder error:', e);
  }
}

export async function cancelAllNotifications(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  const lib = await getNotifications();
  if (!lib) return;
  try {
    const { notifications } = await lib.LocalNotifications.getPending();
    if (notifications.length > 0) {
      await lib.LocalNotifications.cancel({ notifications });
    }
  } catch {}
}
