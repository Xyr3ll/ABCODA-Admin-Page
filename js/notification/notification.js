function toggleNotification() {
    const notificationBox = document.getElementById('notificationBox');
    // Toggle the display property between 'block' and 'none'
    if (notificationBox.style.display === 'block') {
      notificationBox.style.display = 'none'; // Hide the notification box
    } else {
      notificationBox.style.display = 'block'; // Show the notification box
    }
  }
  
  // Optional: Click outside to close the notification box
  document.addEventListener('click', function(event) {
    const notificationContainer = document.querySelector('.notification-container');
    const notificationBox = document.getElementById('notificationBox');
  
    // Close the notification box if the click is outside of it
    if (!notificationContainer.contains(event.target) && !notificationBox.contains(event.target)) {
      notificationBox.style.display = 'none';
    }
  });
  