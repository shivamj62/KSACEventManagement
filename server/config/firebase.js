const admin = require('firebase-admin');
const path = require('path');

// To initialize Firebase, you must provide the serviceAccountKey.json
// Download it from Firebase Console -> Project Settings -> Service Accounts
// and place it in the server/config directory.

try {
  let serviceAccount;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } else {
    try {
      serviceAccount = require('./ksaceventmanagement-firebase-adminsdk-fbsvc-68ff4d6bd1.json');
    } catch (e) {
      console.warn('⚠️ WARNING: No Firebase Service Account found (Env var or JSON file).');
      console.warn('Please add FIREBASE_SERVICE_ACCOUNT_JSON to your environment variables.');
    }
  }

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin initialized successfully.');
  }
} catch (error) {
  console.error('❌ Firebase Admin initialization error:', error.message);
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
