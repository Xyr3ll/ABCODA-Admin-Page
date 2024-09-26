import { db } from "./firebase/database.js"; // Ensure this imports your Firestore instance
import {
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// Function to fetch orders data and render it into the table
async function fetchOrdersData() {
  try {
    // Fetch data from Firestore orders collection
    const querySnapshot = await getDocs(collection(db, "orders"));

    // Pass the snapshot to render function
    renderProducts(querySnapshot);
  } catch (error) {
    console.error("Error fetching orders data:", error);
    alert("Failed to fetch orders data. Please try again.");
  }
}

// Reference to the table body
const orderTableBody = document.getElementById("orderTableBody");

// Function to render the orders data into the table
function renderProducts(querySnapshot) {
  orderTableBody.innerHTML = ""; // Clear the table body

  querySnapshot.forEach((doc) => {
    const orders = doc.data();
    const defaultProfileImage = "./images/defaultProfile.png";
    const ApproveButton = "./images/approve.png";
    const StatusButton = "./images/status.png";

    const row = `
      <tr data-id="${doc.id}">
        <td>${orders.orderId}</td>
        <td>${orders.customerName}</td>
        <td>${orders.itemName}</td>
        <td>${orders.deliveryAddress}</td>
        <td>${orders.price}</td>
        <td>
          <img src="${
            orders.imageUrl || defaultProfileImage
          }" alt="Order Image" width="50" height="50">
        </td>
        <td>
          ${(() => {
            switch (orders.status) {
              case "pending":
                return "Pending";
              case "onShip":
                return "On Ship";
              case "complete":
                return "Complete";
              default:
                return "Unknown";
            }
          })()}
        </td>
        <td>
          <img src="${
            orders.approval ? "images/approve.png" : "images/disapprove.png"
          }" 
               alt="${orders.approval ? "Approved" : "Not Approved"}" 
               width="20" height="20">
        </td>
        <td>
          <button class="approve-btn" 
                  onclick="approveOrder('${doc.id}', '${
      orders.customerName
    }', '${orders.imageUrl}')">
            <img src="${ApproveButton}" alt="Approve" width="20" height="20">
          </button>

           <select class="status-select" 
          data-order-id="${doc.id}" 
          onchange="changeOrderStatus('${doc.id}', '${
      orders.customerName
    }', this.value)">
          <option value="pending" ${
            orders.status === "pending" ? "selected" : ""
          }>Pending</option>
          <option value="onShip" ${
            orders.status === "onShip" ? "selected" : ""
          }>On Ship</option>
          <option value="complete" ${
            orders.status === "complete" ? "selected" : ""
          }>Complete</option>
    </select>
        </td>
      </tr>
    `;

    orderTableBody.innerHTML += row; // Add the new row to the table
  });
}

// Approve Order Function
window.approveOrder = async function (orderId, customerName, imageUrl) {
  const orderRef = doc(db, "orders", orderId);

  try {
    const orderDoc = await getDoc(orderRef);

    // Check if the document exists
    if (!orderDoc.exists()) {
      console.error("Order not found");
      alert("Order not found");
      return;
    }

    const orderData = orderDoc.data();
    const currentApprovalStatus = orderData.approval;

    let updateData = {
      approval: !currentApprovalStatus,
    };

    // Set new status message based on approval status
    const action = updateData.approval ? "approve" : "not approve";
    const confirmMessage = `Are you sure you want to ${action} the order for ${customerName}?`;

    if (confirm(confirmMessage)) {
      // Only include imageUrl if it exists
      if (imageUrl) {
        updateData.imageUrl = imageUrl; // Add imageUrl only if it's provided
      }

      // Update the order in Firestore using updateDoc
      await updateDoc(orderRef, updateData);
      alert(`Order for ${customerName} has been ${action}d!`);
      fetchOrdersData(); // Optionally refresh the data to see changes
    }
  } catch (error) {
    console.error("Error approving order: ", error);
    alert("There was an error approving the order. Please try again.");
  }

  // if (confirm(`Are you sure you want to approve the order for ${customerName}?`)) {
  //   const newStatus = "Approved";

  //   // Prepare the data to update in Firestore
  //   const updateData = {
  //     approval: true,
  //   };

  //   // Only include imageUrl if it exists
  //   if (imageUrl) {
  //     updateData.imageUrl = imageUrl; // Add imageUrl only if it's provided
  //   }

  //   // Update the order in Firestore using updateDoc
  //   const orderRef = doc(db, "orders", orderId); // Reference to the specific document
  //   try {
  //     await updateDoc(orderRef, updateData);
  //     alert(`Order for ${customerName} has been approved!`);
  //     fetchOrdersData(); // Optionally refresh the data to see changes
  //   } catch (error) {
  //     console.error("Error approving order: ", error);
  //     alert("There was an error approving the order. Please try again.");
  //   }
  // }
};

// Function to show the popup with a message and a confirm callback
function showPopup(message, confirmCallback) {
  const popup = document.getElementById("statusPopup");
  const popupMessage = document.getElementById("popupMessage");
  const confirmButton = document.getElementById("confirmStatusButton");

  popupMessage.innerText = message; // Set the message in the popup
  popup.style.display = "block"; // Show the popup

  // Store the callback function for the confirm button
  confirmButton.onclick = async function () {
    hidePopup();
    await confirmCallback(); // Execute the confirm callback
  };
}

// Function to hide the popup
function hidePopup() {
  console.log("hidePopup function is defined");
  const popup = document.getElementById("statusPopup");
  popup.style.display = "none"; // Hide the popup
}

document.addEventListener("DOMContentLoaded", function () {
  const cancelButton = document.querySelector(".cancel-button");
  cancelButton.addEventListener("click", hidePopup);
});

// Change Order Status Function
window.changeOrderStatus = function (orderId, customerName) {
  // Get the select element associated with the orderId
  const selectElement = document.querySelector(
    `.status-select[data-order-id="${orderId}"]`
  );
  const currentStatus = selectElement.value; // Get the currently selected status

  // Show the popup message for confirmation
  showPopup(
    `You have selected ${currentStatus} for ${customerName}. Are you sure you want to confirm this status?`,
    async function () {
      const updateData = { status: currentStatus }; // Use the current status
      const orderRef = doc(db, "orders", orderId);
      try {
        await updateDoc(orderRef, updateData);
        alert(
          `Order status for ${customerName} has been confirmed as ${currentStatus}!`
        );
        fetchOrdersData();
      } catch (error) {
        console.error("Error changing order status: ", error);
        alert(
          "There was an error changing the order status. Please try again."
        );
      }
    }
  );
};

// Fetch orders data when the window loads
window.onload = fetchOrdersData;
