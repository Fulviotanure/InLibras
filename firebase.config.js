// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCQvmu1QFhhPXmu7cEL26oZjDqlM6xm1CM",
  authDomain: "inlibras.firebaseapp.com",
  projectId: "inlibras",
  storageBucket: "inlibras.firebasestorage.app",
  messagingSenderId: "892692492680",
  appId: "1:892692492680:web:d91721ab3bbec18ac90a3d",
  measurementId: "G-2LM858Y4EW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics }; 