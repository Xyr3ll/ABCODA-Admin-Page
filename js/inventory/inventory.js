import { db, storage } from "../firebase/database.js";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  where,
  query,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

// Category List
document
  .getElementById("categorySelect")
  .addEventListener("change", async function () {
    const selectedCategory = this.value;

    let q;
    if (selectedCategory === "All") {
      q = query(collection(db, "products"));
    } else {
      q = query(
        collection(db, "products"),
        where("category", "==", selectedCategory)
      );
    }

    const querySnapshot = await getDocs(q);
    const inventoryTableBody = document.getElementById("inventoryTableBody");

    inventoryTableBody.innerHTML = "";

    // Populate the table with filtered data
    querySnapshot.forEach((doc) => {
      const product = doc.data();
      const row = document.createElement("tr");

      row.innerHTML = `
          <td>
          <img
            src="${product.imageUrl || "images/default.png"}"
            alt="${product.name}"
            style="width: 100px; height: auto; border-radius: 10px"
            class="product-image"
            data-image-url="${product.imageUrl || "../images/default.png"}"
          />
        <td>${product.id}</td>
        <td>${product.name}</td>
        <td>${product.price}</td>
        <td>${product.category}</td>
        <td>${product.totalRatings}</td>
        <td>
          <button class="edit-btn" onclick="editProduct('${
            product.id
          }')"><img src=images/edit.png></button>
          <button class="delete-btn" onclick="deleteProduct('${
            product.id
          }')"><img src=images/delete.png></button>
        </td>
      `;

      inventoryTableBody.appendChild(row);
    });

    setupImageClickHandler();
  });

// Function to open a modal with animation
function openAddModal(modalId) {
  const popup = document.getElementById("addProductModal");
  popup.style.visibility = "visible"; // Make it visible
  popup.style.transform = "translate(-50%, -50%) scale(1)"; // Reset scale to 1
}

// Function to hide the popup
function closeAddModal(modalId) {
  const popup = document.getElementById("addProductModal");
  popup.style.visibility = "hidden"; // Hide it
  popup.style.transform = "translate(-50%, -50%) scale(0.1)"; // Scale down
}

// Function to open a modal with animation
function openEditModal(modalId) {
  const popup = document.getElementById("editProductModal");
  popup.style.visibility = "visible"; // Make it visible
  popup.style.transform = "translate(-50%, -50%) scale(1)"; // Reset scale to 1
}

// Function to hide the popup
function closeEditModal(modalId) {
  const popup = document.getElementById("editProductModal");
  popup.style.visibility = "hidden"; // Hide it
  popup.style.transform = "translate(-50%, -50%) scale(0.1)"; // Scale down
}

// Setup event listeners and initializations
document.addEventListener("DOMContentLoaded", () => {
  const addProductModal = "addProductModal";
  const editProductModal = "editProductModal";
  const addProductForm = document.getElementById("addProductForm");
  const editProductForm = document.getElementById("editProductForm");

  // Event listener for opening the add product modal
  document.querySelector(".add-product-btn").addEventListener("click", () => {
    openAddModal(addProductModal);
  });

  // Event listener for closing the add product modal
  document
    .querySelector(`#${addProductModal} .close-btn`)
    .addEventListener("click", () => {
      closeAddModal(addProductModal);
    });

  // Event listener for closing the edit product modal
  document
    .querySelector(`#${editProductModal} .close-btn`)
    .addEventListener("click", () => {
      closeEditModal(editProductModal);
    });

  // Function to open a popup
  function openPopup(popupId) {
    document.getElementById(popupId).classList.add("open-popup");
  }

  // Function to close a popup
  window.closePopup = function (popupId) {
    document.getElementById(popupId).classList.remove("open-popup");
  };

  // Handle add product form submission
  addProductForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const productName = document.getElementById("productName").value;
    const productPrice = document.getElementById("productPrice").value;
    const productStock = document.getElementById("productStock").value;
    const productCategory = document.getElementById("flowers").value;
    const productImage = document.getElementById("productImage").files[0];
    const productDesc = document.getElementById("productDescription").value;

    try {
      let imageUrl = "";
      if (productImage) {
        // Upload image and get URL
        const storageRef = ref(
          storage,
          `products/${Date.now()}_${productImage.name}`
        );
        await uploadBytes(storageRef, productImage);
        imageUrl = await getDownloadURL(storageRef);
      }

      let totalRatings = 0;

      const docRef = await addDoc(collection(db, "products"), {
        name: productName,
        price: Number(productPrice),
        stock: Number(productStock),
        category: productCategory,
        imageUrl: imageUrl,
        description: productDesc,
        totalRatings: totalRatings,
        createdAt: new Date().toISOString(),
      });

      console.log(
        "Product successfully added to Firestore with ID:",
        docRef.id
      );
      await updateDoc(docRef, { id: docRef.id });

      openPopup("addProductPopup");
      addProductForm.reset();
      document.getElementById("productImagePreview").src = "../images/default.png"; 
    } catch (error) {
      console.error("Error adding product to Firestore: ", error);
      alert("Failed to add product. Please try again.");
    }
  });

  // Handle edit product form submission
  editProductForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const productId = document.getElementById("editProductId").value;
    const updatedProductName = document.getElementById("editProductName").value;
    const updatedProductPrice =
      document.getElementById("editProductPrice").value;
    const updatedProductStock =
      document.getElementById("editProductStock").value;
    const updatedProductCategory = document.getElementById("editFlowers").value;
    const productImage = document.getElementById("editProductImage").files[0];
    const productDesc = document.getElementById("editProductDescription").value;

    try {
      const docRef = doc(db, "products", productId);

      let imageUrl = "";
      if (productImage) {
        // Upload new image and get URL
        const storageRef = ref(
          storage,
          `products/${Date.now()}_${productImage.name}`
        );
        await uploadBytes(storageRef, productImage);
        imageUrl = await getDownloadURL(storageRef);
      } else {
        // Retrieve current image URL if no new image is uploaded
        const docSnap = await getDoc(docRef);
        imageUrl = docSnap.data().imageUrl;
      }

      await updateDoc(docRef, {
        name: updatedProductName,
        price: Number(updatedProductPrice),
        stock: Number(updatedProductStock),
        category: updatedProductCategory,
        description: productDesc,
        imageUrl: imageUrl,
        updatedAt: new Date().toISOString(),
      });

      openPopup("editProductPopup");
      console.log("Product successfully updated in Firestore!");
    } catch (error) {
      console.error("Error updating product in Firestore: ", error);
      alert("Failed to update product. Please try again.");
    }
  });

  // Initialize real-time listener for products
  setupRealTimeListener();
});

// Function to set up real-time listener
function setupRealTimeListener() {
  const productsCollection = collection(db, "products");

  onSnapshot(
    productsCollection,
    (querySnapshot) => {
      renderProducts(querySnapshot);
    },
    (error) => {
      console.error("Error fetching products from Firestore: ", error);
    }
  );
}

// Function to handle editing a product
window.editProduct = async function (productId) {
  try {
    const docRef = doc(db, "products", productId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const product = docSnap.data();
      document.getElementById("editProductId").value = product.id;
      document.getElementById("editProductName").value = product.name;
      document.getElementById("editProductPrice").value = product.price;
      document.getElementById("editProductStock").value = product.stock;
      document.getElementById("editFlowers").value = product.category;
      document.getElementById("editProductDescription").value =
        product.description;

      // Set the image preview
      const imagePreview = document.getElementById("editProductImagePreview");
      if (product.imageUrl) {
        imagePreview.src = product.imageUrl;
      } else {
        imagePreview.src = ".//images/default.png";
      }

      openEditModal("editProductModal");
    } else {
      alert("Product not found.");
    }
  } catch (error) {
    console.error("Error retrieving product: ", error);
    alert("Failed to retrieve product details. Please try again.");
  }
};

// Function to render products in the table
function renderProducts(querySnapshot) {
  const inventoryTableBody = document.getElementById("inventoryTableBody");
  let tableRows = "";

  querySnapshot.forEach((doc) => {
    const product = doc.data();
    tableRows += `
      <tr data-id="${product.id}">
        <td>
          <img
            src="${product.imageUrl || "../images/default.png"}"
            alt="${product.name}"
            style="width: 100px; height: auto; border-radius: 10px"
            class="product-image"
            data-image-url="${product.imageUrl || "../images/default.png"}"
          />
        <td>${product.id}</td>
        <td>${product.name}</td>
        <td>${product.price}</td>
        <td>${product.category}</td>
        <td>${product.totalRatings}</td>
        <td>
          <button class="edit-btn" onclick="editProduct('${
            product.id
          }')"><img src="../images/edit.png"></button>
          <button class="delete-btn" onclick="deleteProduct('${
            product.id
          }')"><img src="../images/delete.png"></button>
        </td>
      </tr>
    `;
  });

  inventoryTableBody.innerHTML = tableRows;
  setupImageClickHandler();
}

// Function to show the popup
function showPopup() {
  const popup = document.getElementById("deletePopupProduct");
  popup.style.visibility = "visible"; // Make it visible
  popup.style.transform = "translate(-50%, -50%) scale(1)"; // Reset scale to 1
}

// Function to hide the popup
function hidePopup() {
  const popup = document.getElementById("deletePopupProduct");
  popup.style.visibility = "hidden"; // Hide it
  popup.style.transform = "translate(-50%, -50%) scale(0.1)"; // Scale down
}

// Example usage: showing the popup
window.deleteProduct = function (productId) {
  showPopup();

  const confirmButton = document.getElementById("confirmDeleteButton");
  const cancelButton = document.getElementById("cancelDeleteButton");

  confirmButton.onclick = async function () {
    try {
      await deleteDoc(doc(db, "products", productId));
      console.log("Product successfully deleted from Firestore!");
      setupRealTimeListener();
      hidePopup();
    } catch (error) {
      console.error("Error deleting product from Firestore: ", error);
      alert("Failed to delete product. Please try again.");
    }
  };

  cancelButton.onclick = function () {
    hidePopup();
  };
};

// Function to handle image click in the table
function setupImageClickHandler() {
  const imageElements = document.querySelectorAll(".product-image");

  imageElements.forEach((img) => {
    img.addEventListener("click", function () {
      openLightbox(this.src);
    });
  });
}

// Function to open the lightbox modal with the clicked image
function openLightbox(imageSrc) {
  const lightboxModal = document.getElementById("lightboxModal");
  const lightboxImage = document.getElementById("lightboxImage");

  lightboxImage.src = imageSrc;
  lightboxModal.style.display = "flex";
}

// Function to close the lightbox modal
function closeLightbox() {
  const lightboxModal = document.getElementById("lightboxModal");
  lightboxModal.style.display = "none";
}

// Event listener for closing the lightbox modal when clicking outside the image
window.onclick = function (event) {
  const lightboxModal = document.getElementById("lightboxModal");
  if (event.target === lightboxModal) {
    closeLightbox();
  }
};
