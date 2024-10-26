function toggleTime(messageElement) {
    const timeElement = messageElement.querySelector('.convo-chat');
    
    // Toggle the display of the time element
    if (timeElement.style.display === "none" || timeElement.style.display === "") {
        timeElement.style.display = "block"; // Show the time
    } else {
        timeElement.style.display = "none"; // Hide the time
    }
}
