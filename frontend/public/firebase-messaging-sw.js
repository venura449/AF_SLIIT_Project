importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAAJvSp2_JJ2KXJYgg5oEP0o0cNTiZ3NWg",
  authDomain: "fir-notification-cc0bb.firebaseapp.com",
  projectId: "fir-notification-cc0bb",
  storageBucket: "fir-notification-cc0bb.firebasestorage.app",
  messagingSenderId: "920295350064",
  appId: "1:920295350064:web:4b9e5b435050381aec72f5",
  measurementId: "G-RFTG5WB69V"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {

  const title =
    payload?.notification?.title ||
    payload?.data?.title ||
    "New notification";

  const body =
    payload?.notification?.body ||
    payload?.data?.body ||
    "You have a new update.";

  const notificationOptions = {
    body,
    icon: "/firebase-logo.png",
    data: payload?.data || {},
  };

  self.registration.showNotification(title, notificationOptions);
});

self.addEventListener("notificationclick", function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow("/")
  );
});