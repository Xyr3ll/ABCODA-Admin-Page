import { db } from "../firebase/database.js";
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

    renderProducts(querySnapshot); 

    setupRealTimeListener(); 
  } catch (error) {
    console.error("Error fetching user data: ", error);
  }
}

// Function to render the user data into the table
function renderProducts(querySnapshot) {
  userTableBody.innerHTML = "";

  querySnapshot.forEach((doc) => {
    const user = doc.data();

    const defaultProfileImage = "images/defaultProfile.png";
    const deleteButtonImage = "images/delete.png";

    const row = `
    <tr data-id="${doc.id}">
      <td>
        <img src="${
          user.ProfileImage || defaultProfileImage
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
      renderProducts(querySnapshot);
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

window.deleteUser = async function (email) {
  showPopup();

  const confirmButton = document.getElementById("confirmDeleteButton");
  const cancelButton = document.getElementById("cancelDeleteButton");

  confirmButton.onclick = async function () {
    try {
      const response = await fetch(`https://abcoda-server.vercel.app/delete-user/${email}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('User successfully deleted from both Firestore and Authentication');
        hidePopup();
      } else {
        const errorText = await response.text();
        console.error('Error deleting user:', errorText);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  cancelButton.onclick = function () {
    hidePopup();
  };
};

window.onload = fetchUserData;
