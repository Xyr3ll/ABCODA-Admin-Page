import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, collection, getDocs} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";


// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDDX_cIC7o0q9HmG8-bEnQaFHzfF507Qik",
  authDomain: "abcoda-373f8.firebaseapp.com",
  databaseURL:
    "https://abcoda-373f8-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "abcoda-373f8",
  storageBucket: "abcoda-373f8.appspot.com",
  messagingSenderId: "1075179307307",
  appId: "1:1075179307307:web:3ac8cfbd1727f55f7b456e",
  measurementId: "G-G447VLTVFW",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
