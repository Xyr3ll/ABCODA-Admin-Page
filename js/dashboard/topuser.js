import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { db } from "../firebase/database.js"; // Import your database
import { collection, getDocs, Timestamp }  from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// Define the bar chart options
const barChartOptions = {
  series: [
    {
      name: "Registrations",
      data: Array(12).fill(0), // Initialize with 12 months of zero
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
    categories: [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ],
  },
  yaxis: {
    title: {
      text: "Number of Registrations",
    },
  },
};

// Initialize the bar chart
const barChart = new ApexCharts(
  document.querySelector("#line-chart"),
  barChartOptions
);
barChart.render();

// Function to fetch user registrations from Firestore
async function fetchUserRegistrations() {
    const monthlyRegistrations = Array(12).fill(0); // Create an array to count registrations for each month
  
    try {
      const usersCollection = collection(db, "users"); // Reference to the users collection
      const userDocs = await getDocs(usersCollection); // Fetch all user documents
  
      userDocs.forEach((doc) => {
        const userData = doc.data();
        
        // Check if creationTime is a Firestore Timestamp and convert it to a Date object
        const registrationDate = userData.creationTime instanceof Timestamp
          ? userData.creationTime.toDate() // Convert Firestore Timestamp to Date
          : new Date(userData.creationTime); // If it's a string, create a Date directly
        
        console.log(`User: ${userData.email}, Registration Date: ${registrationDate}`); // Log user email and registration date
  
        const monthIndex = registrationDate.getMonth(); // Get month index (0-11)
        monthlyRegistrations[monthIndex] += 1; // Increment the count for the respective month
      });
  
      // Update the Bar Chart with monthly registrations
      console.log(monthlyRegistrations); // Debugging output
      barChart.updateOptions({
        series: [{ name: "Registrations", data: monthlyRegistrations }],
      });
    } catch (error) {
      console.error("Error fetching user registrations:", error);
    }
  }
  
  // Call the function to start counting registrations
  fetchUserRegistrations();