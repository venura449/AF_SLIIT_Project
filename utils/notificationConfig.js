const admin = require("firebase-admin");

const hasFirebaseConfig =
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_PRIVATE_KEY &&
  process.env.FIREBASE_CLIENT_EMAIL;

if (hasFirebaseConfig) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
} else {
  console.warn("Firebase env variables not set – push notifications disabled.");
  // Stub out messaging so imports don't crash the server
  admin.messaging = () => ({
    send: async () => "no-op",
    sendEachForMulticast: async () => ({
      successCount: 0,
      failureCount: 0,
      responses: [],
    }),
  });
}

module.exports = admin;