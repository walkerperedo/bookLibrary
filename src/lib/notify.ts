export async function ensureNotifyPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
  if (Notification.permission === 'default') {
    try {
      return await Notification.requestPermission();
    } catch {
      return 'denied';
    }
  }
  return Notification.permission;
}

export function notify(title: string, opts?: NotificationOptions) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    new Notification(title, opts);
  }
}
