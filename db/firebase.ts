import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase konfiguration
const firebaseConfig = {
    apiKey: "AIzaSyDQNmDw41m_laPQViZpWkN-9Db5d_U40MU",
    authDomain: "buchoase1.firebaseapp.com",
    projectId: "buchoase1",
    storageBucket: "buchoase1.appspot.com",
    messagingSenderId: "103848561597",
    appId: "1:103848561597:web:ecd3c406e231e92098a0d4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };
