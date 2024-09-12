import { db } from "./firebase/database.js"; // Ensure Firestore DB is initialized
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth, deleteUser as deleteAuthUser } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// Reference to the table body
const userTableBody = document.getElementById("userTableBody");

// Function to fetch user data
async function fetchUserData() {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));

    renderProducts(querySnapshot); // Render the initial data

    setupRealTimeListener(); // Set up real-time updates
  } catch (error) {
    console.error("Error fetching user data: ", error);
  }
}

// Function to render the user data into the table
function renderProducts(querySnapshot) {
  userTableBody.innerHTML = ""; // Clear the table body

  querySnapshot.forEach((doc) => {
    const user = doc.data();

    const defaultProfileImage = "images/defaultProfile.png"; // Set the path to your default image
    const deleteButtonImage = "images/delete.png"; // Set the path to your delete icon image

    const row = `
    <tr data-id="${doc.id}">
      <td>
        <img src="${
          user.profileImage || defaultProfileImage
        }" alt="Profile Image" width="50" height="50">
      </td>
      <td>${user.email}</td>
      <td>${user.firstName + " " + user.middleName + " " + user.lastName}</td>
      <td>${user.gender}</td>
      <td>${user.number}</td>
      <td>${user.otpVerified ? "Yes" : "No"}</td>
      <td>
        <button class="delete-btn" onclick="deleteUser('${doc.id}', '${user.email}')">
          <img src="${deleteButtonImage}" alt="Delete" width="20" height="20">
        </button>
      </td>
    </tr>
  `;

    userTableBody.innerHTML += row;
  });
}

// Function to set up real-time listener
function setupRealTimeListener() {
  const usersCollection = collection(db, "users");

  onSnapshot(
    usersCollection,
    (querySnapshot) => {
      renderProducts(querySnapshot); // Render updated data
    },
    (error) => {
      console.error("Error fetching users from Firestore: ", error);
    }
  );
}

// Function to show the popup
function showPopup() {
  const popup = document.getElementById("deletePopupUser");
  popup.style.visibility = "visible";
  popup.style.transform = "translate(-50%, -50%) scale(1)";
}

// Function to hide the popup
function hidePopup() {
  const popup = document.getElementById("deletePopupUser");
  popup.style.visibility = "hidden";
  popup.style.transform = "translate(-50%, -50%) scale(0.1)";
}

// Example usage: deleting the user from Firestore and Authentication
window.deleteUser = function (userId, userEmail) {
  showPopup();

  const confirmButton = document.getElementById("confirmDeleteButton");
  const cancelButton = document.getElementById("cancelDeleteButton");

  confirmButton.onclick = async function () {
    try {
      // Delete the Firestore document
      await deleteDoc(doc(db, "users", userId));
      console.log("User successfully deleted from Firestore!");

      // Delete the user from Firebase Authentication (Admin Privilege needed on server)
      const auth = getAuth();

      // Find and delete the user by their email in Authentication
      const user = auth.currentUser; // You can only delete the current user in the client side
      if (user && user.email === userEmail) {
        await deleteAuthUser(user); 
        console.log("User successfully deleted from Firebase Authentication!");
      } else {
        console.log("Admin rights required to delete other users.");
      }

      hidePopup();
    } catch (error) {
      console.error("Error deleting user: ", error);
      alert("Failed to delete user. Please try again.");
    }
  };

  cancelButton.onclick = function () {
    hidePopup();
  };
};

// Call the fetchUserData function to populate the table on page load
window.onload = fetchUserData;
