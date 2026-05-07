import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const firebaseEnabled = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.messagingSenderId &&
  firebaseConfig.appId &&
  import.meta.env.VITE_FIREBASE_VAPID_KEY
);

let app = null;
let messagingPromise = null;

const getMessagingInstance = async () => {
  if (!firebaseEnabled || typeof window === 'undefined') return null;
  if (!messagingPromise) {
    messagingPromise = isSupported()
      .then((supported) => {
        if (!supported) return null;
        app = app || initializeApp(firebaseConfig);
        return getMessaging(app);
      })
      .catch((error) => {
        console.warn('Firebase messaging disabled:', error.message);
        return null;
      });
  }
  return messagingPromise;
};

export const requestPermission = async () => {
  try {
    const messaging = await getMessagingInstance();
    if (!messaging || !('Notification' in window)) return null;

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });
      return token;
    }
  } catch (error) {
    console.error('FCM permission error:', error);
  }
  return null;
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    getMessagingInstance().then((messaging) => {
      if (!messaging) {
        resolve(null);
        return;
      }

      onMessage(messaging, (payload) => {
        resolve(payload);
      });
    });
  });

export { getMessagingInstance, firebaseEnabled };
