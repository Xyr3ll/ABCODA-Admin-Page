import { db } from "../firebase/database.js";
import {
    collection,
    query,
    where,
    onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// Function to fetch and count orders
function listenForOrders(period) {
    // Create a Firestore query for all orders
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef); // No filtering by status or approval

    // Listen for real-time updates
    onSnapshot(q, (querySnapshot) => {
        let orderCount = 0;
        const today = new Date();
        let startDate;

        // Determine the start date based on the selected period
        switch (period) {
            case "TODAY":
                startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
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

        // Loop through each order to count them based on the selected period
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const orderDate = new Date(data.orderDate);

            // Check if the order falls within the selected period
            if (orderDate >= startDate) {
                orderCount += 1;
            }
        });

        // Update the DOM with the total order count
        document.getElementById("orders-count").textContent = orderCount;
    }, (error) => {
        console.error("Error listening for orders data:", error);
    });
}

// Event listener for the dropdown
document.getElementById("combo-box").addEventListener("change", (event) => {
    const selectedPeriod = event.target.value;
    document.getElementById("orders-p").textContent = `${selectedPeriod} ORDERS`; // Update title

    // Call listenForOrders function to update count based on selected period
    listenForOrders(selectedPeriod);
});

// Initial call to display today's orders on page load
listenForOrders("TODAY");
