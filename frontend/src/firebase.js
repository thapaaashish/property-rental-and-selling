// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-de08b.firebaseapp.com",
  projectId: "mern-estate-de08b",
  storageBucket: "mern-estate-de08b.firebasestorage.app",
  messagingSenderId: "980106385876",
  appId: "1:980106385876:web:4eafa25a8f35d1f5c8de41"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);