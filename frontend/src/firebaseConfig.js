import { initializeApp } from "firebase/app";
import { getMessaging,getToken,onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCBB07rm5z4T3dPSFv0lgx1cgTesHyjZRM",
  authDomain: "projectaf-6635f.firebaseapp.com",
  projectId: "projectaf-6635f",
  storageBucket: "projectaf-6635f.firebasestorage.app",
  messagingSenderId: "126605678225",
  appId: "1:126605678225:web:29cec11be9d7ab93f41130"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };