// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBuGe6aiHJW6BAulWszRq3C381jz7fyvSU",
  authDomain: "defi-6680e.firebaseapp.com",
  projectId: "defi-6680e",
  storageBucket: "defi-6680e.appspot.com",
  messagingSenderId: "944359750884",
  appId: "1:944359750884:web:06df6eba0e54c6157080f1",
  measurementId: "G-Y1XVQLZXGF"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);

const saveUser = async (user) => {
  const userRef = doc(firestore, `users/${user.uid}`);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    const { displayName, email } = user;
    const createdAt = new Date();
    try {
      await setDoc(userRef, {
        displayName,
        email,
        createdAt
      });
    } catch (error) {
      console.error('Error creating user document', error);
    }
  }
};

export { auth, firestore, saveUser };
