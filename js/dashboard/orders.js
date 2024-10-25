import { db } from "../firebase/database.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// Function to fetch the number of products
async function fetchOrdersCount() {
  try {
    const ordersCollection = collection(db, "orders"); 
    const orderDocs = await getDocs(ordersCollection); 
    
    const orderCount = orderDocs.size;

    // Update the product count in the HTML
    document.getElementById("orders-count").textContent = orderCount;
  } catch (error) {
    console.error("Error fetching product count:", error);
  }
}

// Call the function to fetch and display product count
fetchOrdersCount();
