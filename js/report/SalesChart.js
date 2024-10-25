import { db } from "../firebase/database.js";
import {
  collection,
  getDocs,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

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
  const [year, month, day] = dateString.split("-");
  if (interval === "monthly") {
    return new Date(year, month - 1).toLocaleString("en-US", { month: "short", year: "numeric" });
  } else if (interval === "yearly") {
    return year;
  }
  return dateString;
}

// Fetch and aggregate sales data from Firestores
function fetchSalesData(interval) {
    const ordersRef = collection(db, "orders");
    onSnapshot(ordersRef, (querySnapshot) => {
      const salesData = {};
  
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Check if orderDate exists, status is "complete", and approval is true
        if (!data.orderDate || data.status !== "complete" || !data.approved) return;
  
        const orderDate = new Date(data.orderDate.split(" ")[0]);
        let key;
  
        if (interval === "daily") {
          key = orderDate.toISOString().split("T")[0]; 
        } else if (interval === "monthly") {
          key = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, "0")}`; 
        } else if (interval === "yearly") {
          key = `${orderDate.getFullYear()}`; 
        }
  
        const quantity = data.flowerItems.reduce((sum, item) => sum + item.quantity, 0);
        salesData[key] = (salesData[key] || 0) + quantity;
      });
  
      // Call renderSalesChart with the updated sales data
      renderSalesChart(interval, salesData);
    });
  }
  
  function renderSalesChart(interval = "daily", salesData = {}) {
    // Generate full range for the selected interval
    const startDate = new Date("2024-10-01");
    const endDate = new Date();
    const fullRange = generateDateRange(startDate, endDate, interval);
  
    const labels = fullRange;
    const data = labels.map((label) => salesData[label] || 0);
  
    // Chart options
    const options = {
      chart: {
        type: "line",
        height: 350,
        zoom: {
          enabled: false
        },
        toolbar: {
          show: false 
        }
      },
      series: [
        {
          name: "Sales Quantity",
          data: data,
        },
      ],
      xaxis: {
        categories: labels.map((label) => formatDateString(label, interval)),
        title: { text: interval.charAt(0).toUpperCase() + interval.slice(1) },
      },
      yaxis: {
        title: { text: "Quantity" },
        min: 0,
        max: Math.max(...data) + 47, 
        labels: {
          formatter: function (value) {
            return Math.floor(value); 
          },
        },
        tickAmount: 10, 
        forceNiceScale: true, 
      },
      title: {
        text: `Sales Quantity (${interval.charAt(0).toUpperCase() + interval.slice(1)})`,
        align: "center",
      },
      dataLabels: {
        enabled: false
      },
    };
  
    // Destroy previous chart instance if it exists
    const chartElement = document.querySelector("#sales-chart");
    if (chartElement._chartInstance) {
      chartElement._chartInstance.destroy();
    }
  
    // Render the chart
    const chart = new ApexCharts(chartElement, options);
    chart.render();
  
    // Store the chart instance to manage re-renders
    chartElement._chartInstance = chart;
  }
  
  // Event listener for combo box selection
  document.getElementById("sales-view").addEventListener("change", (e) => {
    const selectedInterval = e.target.value;
    // Re-fetch sales data for the selected interval
    fetchSalesData(selectedInterval);
  });
  
  // Initial render (daily view)
  document.addEventListener("DOMContentLoaded", () => {
    fetchSalesData("daily")
  });