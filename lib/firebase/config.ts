import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyD5oIbm1dPhzSX8Wo5-8S_xeGju-oQi9nk",
  authDomain: "new-calude-minecmms.firebaseapp.com",
  projectId: "new-calude-minecmms",
  storageBucket: "new-calude-minecmms.firebasestorage.app",
  messagingSenderId: "378387113538",
  appId: "1:378387113538:web:e62a380fbf9b18f5cf6fdb",
  measurementId: "G-P3QQ4MQQ4S"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
