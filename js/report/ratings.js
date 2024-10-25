import { db } from "../firebase/database.js";
import {
  collection,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// Function to fetch and calculate average ratings in real-time
function listenForRatings() {
  const productsRef = collection(db, "products");

  // Listen for real-time updates
  onSnapshot(productsRef, (querySnapshot) => {
    let totalRatings = 0;
    let numRatings = 0;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.totalRatings && data.numRatings > 0) {
        totalRatings += data.totalRatings;
        numRatings += data.numRatings;
      }
    });

    // Calculate average rating
    const averageRating = numRatings > 0 ? (totalRatings / numRatings).toFixed(2) : 0;

    // Update the DOM with the average rating
    document.getElementById("ratings-count").textContent = averageRating;
  });
}

// Call the function to start listening for ratings updates
listenForRatings();
