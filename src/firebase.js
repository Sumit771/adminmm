// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA-iTSLBHVix4qU_Hym1GJF1aAwvSFhbMU",
  authDomain: "studio-2283640178-f1623.firebaseapp.com",
  databaseURL: "https://studio-2283640178-f1623-default-rtdb.firebaseio.com",
  projectId: "studio-2283640178-f1623",
  storageBucket: "studio-2283640178-f1623.firebasestorage.app",
  messagingSenderId: "468041326202",
  appId: "1:468041326202:web:15808cf936dd959b6965c3"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);