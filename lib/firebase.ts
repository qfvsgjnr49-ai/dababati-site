import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDFK1pANnidf_GSFbK8KAQNEKXkL_P4EAA",
  authDomain: "dababati.firebaseapp.com",
  projectId: "dababati",
  storageBucket: "dababati.firebasestorage.app",
  messagingSenderId: "276473282735",
  appId: "1:276473282735:web:124e38b54ddb3713f4145a"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);