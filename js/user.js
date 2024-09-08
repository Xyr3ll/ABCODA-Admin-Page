import { db } from "./firebase/database.js"; // Make sure db is initialized properly
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// Reference to the table body
const userTableBody = document.getElementById("userTableBody");

// Function to fetch user data
async function fetchUserData() {
  try {
    const querySnapshot = await getDocs(collection(db, "users")); // Correct way to get the collection

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
    const user = doc.data(); // Access user data

    const defaultProfileImage = "images/defaultProfile.png"; // Set the path to your default image
    const deleteButtonImage = "images/delete.png"; // Set the path to your delete icon image

    // Create a table row and insert user data into each cell
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
        <button class="delete-btn" onclick="deleteUser('${doc.id}')">
          <img src="${deleteButtonImage}" alt="Delete" width="20" height="20">
        </button>
      </td>
    </tr>
  `;

    // Append the row to the table body
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
  popup.style.visibility = "visible"; // Make it visible
  popup.style.transform = "translate(-50%, -50%) scale(1)"; // Reset scale to 1
}

// Function to hide the popup
function hidePopup() {
  const popup = document.getElementById("deletePopupUser");
  popup.style.visibility = "hidden"; // Hide it
  popup.style.transform = "translate(-50%, -50%) scale(0.1)"; // Scale down
}

// Example usage: showing the popup
window.deleteUser = function (userId) {
  showPopup();

  const confirmButton = document.getElementById("confirmDeleteButton");
  const cancelButton = document.getElementById("cancelDeleteButton");

  confirmButton.onclick = async function () {
    try {
      await deleteDoc(doc(db, "users", userId));
      console.log("User successfully deleted from Firestore!");
      hidePopup();
    } catch (error) {
      console.error("Error deleting user from Firestore: ", error);
      alert("Failed to delete user. Please try again.");
    }
  };

  cancelButton.onclick = function () {
    hidePopup();
  };
};

// Call the fetchUserData function to populate the table on page load
window.onload = fetchUserData;
