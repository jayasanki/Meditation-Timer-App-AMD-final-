// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDQof-b7AbRRvfDPm5Y6Ng9J-VmrhN962o",
  authDomain: "meditationtimerapp-4ade3.firebaseapp.com",
  projectId: "meditationtimerapp-4ade3",
  storageBucket: "meditationtimerapp-4ade3.firebasestorage.app",
  messagingSenderId: "41027114493",
  appId: "1:41027114493:web:46ded099dca13868e1b594"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

// Export the app instance for use in other parts of your application
export default app;