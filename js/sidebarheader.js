const activePage = window.location.pathname;
const navLinks = document.querySelectorAll('#sidebar a').forEach(link => {
  if(link.href.includes(`${activePage}`)){
    link.classList.add('active');
    console.log(link);
  }
})

function openSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.style.display = "block"; // Make sidebar visible
  setTimeout(() => {
    sidebar.classList.add("active");
  }, 10); 

  // Create overlay
  const overlay = document.createElement("div");
  overlay.className = "overlay active";
  overlay.onclick = closeSidebar; // Close sidebar when clicking overlay
  document.body.appendChild(overlay);
}

// Function to close the sidebar and remove the overlay
function closeSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.remove("active");

  setTimeout(() => {
    sidebar.style.display = "none";
  }, 300); 

  const overlay = document.querySelector(".overlay");
  if (overlay) overlay.remove(); 
}

document.querySelector(".menu-icon").addEventListener("click", openSidebar);
