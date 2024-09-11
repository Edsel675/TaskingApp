// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC7SRWjDHolP45_MUTYL4HTndLWnjQuCig",
  authDomain: "tasking-eafda.firebaseapp.com",
  databaseURL: "https://tasking-eafda-default-rtdb.firebaseio.com",
  projectId: "tasking-eafda",
  storageBucket: "tasking-eafda.appspot.com",
  messagingSenderId: "340528068216",
  appId: "1:340528068216:web:a14edb4f5cf2106c049f8d",
  measurementId: "G-YS01XP453R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);