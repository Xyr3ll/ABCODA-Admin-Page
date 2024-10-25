import { db } from "../firebase/database.js";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// Function to fetch and calculate sales
async function calculateSales(period) {
  try {
    const today = new Date();
    let startDate;

    switch (period) {
      case "TODAY":
        startDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        break;
      case "WEEKLY":
        const weekStart = today.getDate() - today.getDay();
        startDate = new Date(today.getFullYear(), today.getMonth(), weekStart);
        break;
      case "MONTHLY":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case "YEARLY":
        startDate = new Date(today.getFullYear(), 0, 1);
        break;
    }

    const ordersRef = collection(db, "orders");
    const q = query(
      ordersRef,
      where("approved", "==", true),
      where("status", "==", "complete")
    );

    // Listen for real-time updates
    onSnapshot(q, (querySnapshot) => {
      let totalSales = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const orderDate = new Date(data.orderDate);

        // Initialize totalPrice for this order
        let orderTotalPrice = 0;

        // Check if flowerItems exists and is an array
        if (Array.isArray(data.flowerItems)) {
          // Loop through flowerItems to sum total prices
          data.flowerItems.forEach((item) => {
            if (item.totalPrice && typeof item.totalPrice === "number") {
              orderTotalPrice += item.totalPrice;
            } else {
              console.log(`Item in order ${doc.id} has no valid totalPrice.`);
            }
          });
        } else {
          console.log(`Order ${doc.id} has no flowerItems.`);
        }

        // Check if the order falls within the selected period
        if (orderDate >= startDate) {
          if (orderTotalPrice > 0) {
            totalSales += orderTotalPrice;
          } else {
            console.log(`Order ${doc.id} excluded due to invalid order total price.`);
          }
        }
      });

      // Update the DOM with the total sales
      document.getElementById("product-count").textContent =
        totalSales.toLocaleString();
    });
  } catch (error) {
    console.error("Error fetching sales data:", error);
  }
}

// Event listener for the dropdown
document.getElementById("combo-box").addEventListener("change", (event) => {
  const selectedPeriod = event.target.value;
  document.getElementById("sales-p").textContent = `${selectedPeriod} SALES`;
  calculateSales(selectedPeriod);
});

// Initial call to display today's sales on page load
calculateSales("TODAY");
