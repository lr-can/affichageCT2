import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyA6dkSNYdVrk7FH4UgYCzWfSjxQdKYcurc",
  authDomain: "cms-collonges.firebaseapp.com",
  // ⭐ CHANGE CETTE URL
  databaseURL: "https://cms-collonges-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "cms-collonges",
  storageBucket: "cms-collonges.firebasestorage.app",
  messagingSenderId: "538658189486",
  appId: "1:538658189486:web:839790dbe07472233c7d3f"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };