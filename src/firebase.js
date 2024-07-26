// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBuGe6aiHJW6BAulWszRq3C381jz7fyvSU",
  authDomain: "defi-6680e.firebaseapp.com",
  projectId: "defi-6680e",
  storageBucket: "defi-6680e.appspot.com",
  messagingSenderId: "944359750884",
  appId: "1:944359750884:web:06df6eba0e54c6157080f1",
  measurementId: "G-Y1XVQLZXGF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
