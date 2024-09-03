// Get the modal
const modal = document.getElementById('logout-modal');

// Get the <span> element that closes the modal
const closeModal = document.querySelector('.modal .close');

// Function to open the logout modal
function openLogoutModal() {
  modal.style.display = 'block';
}

// Function to close the logout modal
function closeLogoutModal() {
  modal.style.display = 'none';
}

// Function to confirm logout
function confirmLogout() {
  window.location.href = 'https://xyr3ll.github.io/ABCODA-Landing-Page/';
}

// Event listener to close the modal when clicking outside of the modal content
window.onclick = function(event) {
  if (event.target === modal) {
    closeLogoutModal();
  }
}

document.querySelector('.sidebar-list-item a[href="#"]').addEventListener('click', function(event) {
  event.preventDefault();
  openLogoutModal();
});
