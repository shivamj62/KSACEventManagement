import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Replace the following with your app's Firebase project configuration
// You can find this in your Firebase Console: Project Settings > General > Your Apps
const firebaseConfig = {

  apiKey: "AIzaSyABJDaFAbZ7QfRy-y-bL5ivT5qOc2hwljc",

  authDomain: "ksaceventmanagement.firebaseapp.com",

  projectId: "ksaceventmanagement",

  storageBucket: "ksaceventmanagement.firebasestorage.app",

  messagingSenderId: "811175512214",

  appId: "1:811175512214:web:59de137fb5756c0d021ab7",

  measurementId: "G-PD5HVFYPL5"

};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
