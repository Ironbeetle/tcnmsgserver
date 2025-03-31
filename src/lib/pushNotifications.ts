export async function registerForPushNotifications() {
    try {
        // Check if push notifications are supported
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            throw new Error('Push notifications are not supported');
        }

        // Request permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            throw new Error('Permission not granted for notifications');
        }

        // Register service worker
        const registration = await navigator.serviceWorker.register('/service-worker.js');

        // Get push subscription
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY'
        });

        // Send subscription to backend
        await fetch('/api/register-push', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscription),
        });

        return true;
    } catch (error) {
        console.error('Failed to register for push notifications:', error);
        return false;
    }
}