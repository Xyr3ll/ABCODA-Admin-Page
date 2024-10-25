import { db } from "../firebase/database.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// Function to fetch the number of products
async function fetchProductCount() {
  try {
    const productsCollection = collection(db, "products");
    const productDocs = await getDocs(productsCollection);

    const productCount = productDocs.size; // Get the number of documents in the collection

    // Update the product count in the HTML
    document.getElementById("product-count").textContent = productCount;
  } catch (error) {
    console.error("Error fetching product count:", error);
  }
}

// Call the function to fetch and display product count
fetchProductCount();
