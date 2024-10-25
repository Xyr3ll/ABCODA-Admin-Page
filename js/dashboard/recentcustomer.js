import { db } from "../firebase/database.js";
import {
    collection,
    onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    const usersList = document.querySelector("#customerTableBody"); 

    // Function to update the users table
    const updateUsersTable = (userSnapshot) => {
        // Clear the table body before populating
        usersList.innerHTML = "";

        userSnapshot.forEach((doc) => {
            const user = doc.data(); // Get the user data

            // Create a new row element
            const row = document.createElement("tr");

            // Create the profile image with fallback if image URL is not present
            const profileImage = user.ProfileImage
                ? `<img src="${user.ProfileImage}" alt="Profile Image" width="50" height="50" style="border-radius: 50%;">`
                : `<img src="images/defaultProfile.png" alt="Default Profile" width="50" height="50" style="border-radius: 50%;">`;

            // Define the row structure
            row.innerHTML = `
                <td>${profileImage}</td>
                <td>${user.email}</td>
            `;

            // Append the row to the table body
            usersList.appendChild(row);
        });
    };

    // Listen for real-time updates to the users collection
    const usersCollection = collection(db, "users"); 
    onSnapshot(usersCollection, (querySnapshot) => {
        updateUsersTable(querySnapshot);
    }, (error) => {
        console.error("Error listening for users: ", error);
    });
});
