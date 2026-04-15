const admin = require('firebase-admin');
const path = require('path');

// To initialize Firebase, you must provide the serviceAccountKey.json
// Download it from Firebase Console -> Project Settings -> Service Accounts
// and place it in the server/config directory.

try {
  const serviceAccount = require('./ksaceventmanagement-firebase-adminsdk-fbsvc-68ff4d6bd1.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin initialized successfully.');
} catch (error) {
  console.error('Firebase Admin initialization error:', error.message);
  console.warn('CRITICAL: Please ensure your service account JSON is in server/config/');
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
