import { db } from "../firebase/database.js";
import {
    collection,
    query,
    where,
    onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// Function to fetch and display active user count
function listenForActiveUserCount() {
    // Get the current time and subtract the desired active period (e.g., 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("lastActive", ">", tenMinutesAgo));

    // Listen for real-time updates
    onSnapshot(q, (querySnapshot) => {
        const activeUserCount = querySnapshot.size;
        document.getElementById("visitors-count").innerText = activeUserCount;
    }, (error) => {
        console.error("Error listening for active users: ", error);
    });
}

// Call the function to start listening for active users
listenForActiveUserCount();
