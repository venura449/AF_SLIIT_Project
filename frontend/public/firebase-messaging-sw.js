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
  console.log(' Received background message ', payload); 
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png'
  };  
  self.registration.showNotification(notificationTitle, notificationOptions);
});

