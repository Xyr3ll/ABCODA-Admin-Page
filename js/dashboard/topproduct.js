import { db } from "../firebase/database.js";
import {
  collection,
  getDoc,
  doc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

let pieChartOptions = {
  series: [],
  chart: {
    type: "pie",
    height: 350,
    width: "100%",
  },
  labels: [], // Start with no labels
  colors: ["#246dec", "#cc3c43", "#367952", "#f5b74f", "#4f35a1"],
  legend: {
    position: "left",
  },
};

// Initialize the pie chart
let pieChart = new ApexCharts(
  document.querySelector("#pie-chart"),
  pieChartOptions
);
pieChart.render();

// Function to fetch top products and update the chart
async function fetchTopProducts() {
  let productSales = {};

  onSnapshot(collection(db, "orders"), (snapshot) => {
    productSales = {}; // Reset sales data for each snapshot

    snapshot.forEach((doc) => {
      const orderData = doc.data();
      const flowerItems = orderData.flowerItems || [];

      // Loop through each item in flowerItems array and accumulate sales
      flowerItems.forEach((item) => {
        const productId = item.productId;
        const quantity = item.quantity || 1;

        // Accumulate sales for each product
        if (productSales[productId]) {
          productSales[productId] += quantity;
        } else {
          productSales[productId] = quantity;
        }
      });
    });

    // Convert the sales object into an array of product IDs and sales
    const productSalesArray = Object.entries(productSales).map(
      ([productId, sales]) => ({ productId, sales })
    );

    // Sort by sales and get the top 5
    const topProducts = productSalesArray
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    // Fetch product details for the top 5 products
    Promise.all(
      topProducts.map(async (product) => {
        const productDoc = await getDoc(doc(db, "products", product.productId));
        return productDoc.exists()
          ? { ...productDoc.data(), sales: product.sales }
          : undefined;
      })
    ).then((productDetails) => {
      // Filter out undefined product details
      const validProductDetails = productDetails.filter(
        (product) => product !== undefined
      );

      // Check if there are valid product details
      if (validProductDetails.length > 0) {
        // Get product names and sales for chart data
        const topProductNames = validProductDetails.map(
          (product) => product.name
        );
        const topProductSales = validProductDetails.map(
          (product) => product.sales
        );

        console.log("Top Product Names:", topProductNames);
        console.log("Top Product Sales:", topProductSales);

        // Update Pie Chart with the top products based on sales
        pieChart.updateOptions({
          series: topProductSales,
          labels: topProductNames, 
        });
      } else {
        console.warn("No valid product details found. Resetting chart data.");

        pieChart.updateOptions({
          series: [],
          labels: [],
        });
      }
    });
  });
}

fetchTopProducts();
