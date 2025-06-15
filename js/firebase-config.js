// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

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
const db = getFirestore(app);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { db, auth, analytics }; 