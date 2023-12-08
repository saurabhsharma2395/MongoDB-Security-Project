// loginHandler.js

// loginHandler.js or similar file
document.getElementById('logoutLink').addEventListener('click', function(event) {
    event.preventDefault();
    
    // Clear JWT from localStorage or cookies
    localStorage.removeItem('token'); // If using localStorage
  
    // Redirect to login page
    window.location.href = '/login';
  });