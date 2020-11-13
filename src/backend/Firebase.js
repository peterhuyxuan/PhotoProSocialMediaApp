import firebase from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyDqY7ORYxXYOaFO5cULMp-3YmzOigSj8kI",
  authDomain: "photopro-f262b.firebaseapp.com",
  databaseURL: "https://photopro-f262b.firebaseio.com",
  projectId: "photopro-f262b",
  storageBucket: "photopro-f262b.appspot.com",
  messagingSenderId: "151605385923",
  appId: "1:151605385923:web:ee281eecd1a4884c12e076",
  measurementId: "G-CW3NYBP46S",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

export { db, auth, storage };
