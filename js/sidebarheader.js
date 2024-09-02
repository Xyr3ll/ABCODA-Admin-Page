// SIDEBAR TOGGLE
let sidebarOpen = false;
let sidebar = document.getElementById("sidebar");

function openSidebar() {
  if (sidebar) {
    sidebar.classList.add("sidebar-responsive");
    sidebarOpen = true;
  }
}

function closeSidebar() {
  if (sidebarOpen) {
    sidebar.classList.remove("sidebar-responsive");
    sidebarOpen = false;
  }
}