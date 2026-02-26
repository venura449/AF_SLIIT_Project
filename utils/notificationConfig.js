const admin = require("firebase-admin");

let firebaseCredential;

if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
  firebaseCredential = admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  });
} else {
  console.warn("Firebase env variables not set, using emulator/mock.");
  // Optionally, use a dummy object for testing
  firebaseCredential = admin.credential.applicationDefault();
}

admin.initializeApp({
  credential: firebaseCredential,
});

module.exports = admin;