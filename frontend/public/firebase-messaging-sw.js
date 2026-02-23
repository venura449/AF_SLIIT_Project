importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCBB07rm5z4T3dPSFv0lgx1cgTesHyjZRM",
  authDomain: "projectaf-6635f.firebaseapp.com",
  projectId: "projectaf-6635f",
  messagingSenderId: "126605678225",
  appId: "1:126605678225:web:29cec11be9d7ab93f41130"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
  });
});