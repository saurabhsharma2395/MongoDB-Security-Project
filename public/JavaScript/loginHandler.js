// Assuming jQuery is used
$(document).ready(function() {
  const token = getCookie('token');
  
  if (token) {
      // If token is present, show the logout link
      $("#logoutLi").show();
  } else {
      // If not logged in, hide the logout link
      $("#logoutLi").hide();
  }
  
  // Function to get the value of a cookie by name
  function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
  }
});
