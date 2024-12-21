function populateUserProfile() {
    // Retrieve and parse the 'sessionData' key from sessionStorage
    const storedSessionData = sessionStorage.getItem('sessionData');
    let sessionData = {};

    // Parse the JSON string if the key exists
    if (storedSessionData) {
        sessionData = JSON.parse(storedSessionData);
    }

    // Fallback values for missing data
    const userData = {
        name: sessionData.user_name || 'Not available',
        username: sessionData.username || 'Not available',
        email: sessionData.user_email || 'Not available',
        password: sessionData.user_password ? '*****' : 'Not available', // Mask the password
    };

    // Populate HTML elements with the user data
    document.getElementById('userProfileName').textContent = userData.name;
    document.getElementById('userProfileUserName').textContent = userData.username;
    document.getElementById('userProfileEmail').textContent = userData.email;
    document.getElementById('userProfilePassword').textContent = userData.password;
}

// Add an onclick function to the close button to hide the profile section and overlay
document.getElementById('profileClose').addEventListener('click', function() {
    document.getElementById('userProfileSection').style.display = 'none';
    document.getElementById('profileOverlay').style.display = 'none';
});

// Add an onclick function to the changeInterest button to show the profile section and overlay
document.getElementById('changeInterest').addEventListener('click', function() {
    document.getElementById('userProfileSection').style.display = 'block';
    document.getElementById('profileOverlay').style.display = 'block';
});


// Call the function to populate the data
populateUserProfile();
