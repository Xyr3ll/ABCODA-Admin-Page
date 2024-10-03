import { db } from "../firebase/database.js";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// Define the bar chart with empty data initially
let barChartOptions = {
  series: [
    {
      name: "Orders",
      data: [], // Start with no data
    },
  ],
  chart: {
    type: "bar",
    height: 350,
    toolbar: {
      show: false,
    },
  },
  colors: ["#246dec", "#cc3c43", "#367952", "#f5b74f", "#4f35a1"],
  plotOptions: {
    bar: {
      distributed: true,
      borderRadius: 4,
      horizontal: false,
      columnWidth: "40%",
    },
  },
  dataLabels: {
    enabled: false,
  },
  legend: {
    show: false,
  },
  xaxis: {
    categories: [], // Start with no categories
  },
  yaxis: {
    title: {
      text: "Count",
    },
  },
};

// Initialize the bar chart
let barChart = new ApexCharts(
  document.querySelector("#bar-chart"),
  barChartOptions
);
barChart.render();

// Function to fetch product details for top products
async function fetchProductDetails(topProducts) {
  // Log topProducts to check if it is defined and has data
  console.log("Top Products:", topProducts);

  return await Promise.all(
    topProducts.map(async (product) => {
      try {
        const productDoc = await getDoc(doc(db, "products", product.productId));
        return { ...productDoc.data(), sales: product.sales };
      } catch (error) {
        console.error("Error fetching product details:", error);
        return null; // Return null for error handling
      }
    })
  );
}

// Function to fetch top products and update the chart
// Function to fetch top products and update the chart
async function fetchTopProducts() {
  let productSales = {};

  // Use onSnapshot to listen for changes in the 'orders' collection
  onSnapshot(collection(db, "orders"), (snapshot) => {
    productSales = {};

    snapshot.forEach((doc) => {
      const orderData = doc.data();
      const productId = orderData.productId;
      const quantity = orderData.quantity || 1;

      // Accumulate sales for each product
      if (productSales[productId]) {
        productSales[productId] += quantity;
      } else {
        productSales[productId] = quantity;
      }
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

        // Update Bar Chart with the top products based on sales
        barChart.updateOptions({
          series: [{ name: "Orders", data: topProductSales }],
          xaxis: { categories: topProductNames },
        });
      } else {
        console.warn("No valid product details found. Resetting chart data.");

        // Optionally reset chart data if no products are found
        barChart.updateOptions({
          series: [{ name: "Orders", data: [] }],
          xaxis: { categories: [] },
        });
      }
    });
  });
}

// Call the function to start listening for updates
fetchTopProducts();
