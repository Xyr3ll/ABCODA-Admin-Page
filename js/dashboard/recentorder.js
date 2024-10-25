import { db } from "../firebase/database.js";
import {
    collection,
    onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    const ordersList = document.querySelector("#ordersTableBody");

    // Function to update the orders table
    const updateOrdersTable = (ordersSnapshot) => {
        // Clear the table body before populating
        ordersList.innerHTML = "";

        ordersSnapshot.forEach((doc) => {
            const order = doc.data();
            const flowerItems = order.flowerItems || [];

            // Extract flower names from the flowerItems array
            const flowerNames = flowerItems
                .map((flower) => flower.name)
                .join(", ");

            // Calculate total price for the order
            const totalPrice = flowerItems.reduce((total, item) => total + item.totalPrice, 0);

            const row = document.createElement("tr");
            
            row.innerHTML = `
                <td>${flowerNames}</td>
                <td>${totalPrice}</td>
                <td>${order.paymentMethod}</td>
                <td>${order.status}</td>
            `;

            ordersList.appendChild(row); // Append the row to the table body
        });
    };

    // Listen for real-time updates to the orders collection
    const ordersCollection = collection(db, "orders");
    onSnapshot(ordersCollection, (querySnapshot) => {
        updateOrdersTable(querySnapshot);
    }, (error) => {
        console.error("Error listening for orders: ", error);
    });
});
