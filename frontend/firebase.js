import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAAJvSp2_JJ2KXJYgg5oEP0o0cNTiZ3NWg",
  authDomain: "fir-notification-cc0bb.firebaseapp.com",
  projectId: "fir-notification-cc0bb", 
  storageBucket: "fir-notification-cc0bb.firebasestorage.app",
  messagingSenderId: "920295350064",
  appId: "1:920295350064:web:4b9e5b435050381aec72f5",
  measurementId: "G-RFTG5WB69V"
};

const app = initializeApp(firebaseConfig);

const vapidKey= "BJo3-K9q83tKKW5PSIdV7cWZAR0tB_cp1Zly9rsL_qHrJLCLTnhSDG-DkD2rlelo8Zh-gn1mi6kXkTEGCLLS9yc";

const messaging = getMessaging(app);

export const requestForToken = async () => {
  try {
    console.log("Requesting permission for notifications...");
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      throw new Error("Notification permission not granted");
    }

    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );

    const currentToken = await getToken(messaging, {
      vapidKey: vapidKey,
      serviceWorkerRegistration: registration,
    });

    console.log("Current FCM token: ", currentToken);
    return currentToken;
  } catch (error) {
    console.error("Error getting token:", error);
    return error;
  }
};
