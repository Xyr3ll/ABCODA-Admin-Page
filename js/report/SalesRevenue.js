import { db } from "../firebase/database.js";
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// Helper to generate a date range between two dates
function generateDateRange(start, end, interval = "daily") {
  const dates = [];
  let currentDate = new Date(start);

  while (currentDate <= end) {
    let dateStr;

    if (interval === "daily") {
      dateStr = currentDate.toISOString().split("T")[0];
      currentDate.setDate(currentDate.getDate() + 1);
    } else if (interval === "monthly") {
      dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
      currentDate.setMonth(currentDate.getMonth() + 1);
    } else if (interval === "yearly") {
      dateStr = `${currentDate.getFullYear()}`;
      currentDate.setFullYear(currentDate.getFullYear() + 1);
    }

    dates.push(dateStr);
  }

  return dates;
}

// Helper to format date strings for chart view
function formatDateString(dateString, interval) {
  const [year, month] = dateString.split("-");
  if (interval === "monthly") {
    return new Date(year, month - 1).toLocaleString("en-US", { month: "short", year: "numeric" });
  } else if (interval === "yearly") {
    return year;
  }
  return dateString; // Default: daily (YYYY-MM-DD)
}

// Fetch and aggregate sales revenue data from Firestore in real-time
function fetchSalesRevenueData(interval) {
  const ordersRef = collection(db, "orders");
  
  // Set up a snapshot listener
  onSnapshot(ordersRef, (querySnapshot) => {
    const revenueData = {};

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (!data.orderDate || data.status !== "complete" || !data.approved) return;

      const orderDate = new Date(data.orderDate.split(" ")[0]);
      let key;

      if (interval === "daily") {
        key = orderDate.toISOString().split("T")[0]; // YYYY-MM-DD
      } else if (interval === "monthly") {
        key = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, "0")}`; // YYYY-MM
      } else if (interval === "yearly") {
        key = `${orderDate.getFullYear()}`; // YYYY
      }

      const revenue = data.flowerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      revenueData[key] = (revenueData[key] || 0) + revenue;
    });

    console.log("Revenue Data:", revenueData);
    renderRevenueChart(interval, revenueData);
  });
}

// Render ApexChart based on selected interval and revenue data
function renderRevenueChart(interval = "daily", revenueData = {}) {
  // Generate full range for the selected interval
  const startDate = new Date("2024-10-01");
  const endDate = new Date();
  const fullRange = generateDateRange(startDate, endDate, interval);

  const labels = fullRange;
  const data = labels.map((label) => revenueData[label] || 0);

  // Chart options
  const options = {
    chart: {
      type: "line",
      height: 350,
      zoom: { enabled: false },
      toolbar: { show: false }
    },
    series: [{ name: "Sales Revenue", data: data }],
    xaxis: {
      categories: labels.map((label) => formatDateString(label, interval)),
      title: { text: interval.charAt(0).toUpperCase() + interval.slice(1) },
    },
    yaxis: {
      title: { text: "Revenue" },
      min: 0,
      labels: {
        formatter: function (value) {
          return value.toFixed(2); // Format as currency
        },
      },
    },
    title: {
      text: `Sales Revenue (${interval.charAt(0).toUpperCase() + interval.slice(1)})`,
      align: "center",
    },
    dataLabels: {
      enabled: false // Disable data labels if needed
    },
  };

  // Destroy previous chart instance if it exists
  const chartElement = document.querySelector("#revenue-chart");
  if (chartElement._chartInstance) {
    chartElement._chartInstance.destroy();
  }

  // Render the chart
  const chart = new ApexCharts(chartElement, options);
  chart.render();

  // Store the chart instance to manage re-renders
  chartElement._chartInstance = chart;
}

// Event listener for revenue combo box selection
document.getElementById("revenue-view").addEventListener("change", (e) => {
  const selectedInterval = e.target.value;
  fetchSalesRevenueData(selectedInterval);
});

// Initial fetch with default interval
const defaultInterval = "daily";
fetchSalesRevenueData(defaultInterval);
