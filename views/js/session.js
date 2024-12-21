///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Login Function  ////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

document.querySelector('#loginForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent form submission refresh

    // Get the input values
    const email = document.querySelector('#email').value.trim();
    const password = document.querySelector('#password').value.trim();

    if (!email || !password) {
        alert('Please fill in both email and password.');
        return;
    }

    try {
        let users = [];
        let user = null;

        // First try to fetch user data from the backend (localhost)
        try {
            const response = await fetch('http://localhost:3000/users');
            if (!response.ok) throw new Error('Failed to fetch user data from localhost');
            users = await response.json();
            user = users.find(u => u.user_email === email && u.user_password === password);
        } catch (error) {
            console.error(error);
            // Fallback to reading from local JSON file if localhost request fails
            const fallbackResponse = await fetch('../database/json-data/users.json');
            if (!fallbackResponse.ok) throw new Error('Failed to fetch user data from JSON file');
            users = await fallbackResponse.json();
            user = users.find(u => u.user_email === email && u.user_password === password);
        }

        if (!user) {
            alert('Invalid credentials. Please try again.');
            return;
        }

        // Insert the user into the backend if not already there (i.e., matching login credentials found)
        const existingUser = users.find(u => u.user_email === user.user_email);
        if (!existingUser) {
            const postResponse = await fetch('http://localhost:3000/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user)
            });

            if (!postResponse.ok) {
                console.error('Failed to insert user into backend');
                alert('An error occurred while updating user data.');
                return;
            }
        }

        // Fetch user interests data
        const interestResponse = await fetch('http://localhost:3000/userinterest');
        if (!interestResponse.ok) throw new Error('Failed to fetch user interests');

        const userInterests = await interestResponse.json();
        const userInterest = userInterests.filter(interest => parseInt(interest.user_interest_user) === user.user_id);

        // Store session data
        const sessionData = {
            user_id: user.user_id,
            username: user.user_username,
            user_name: user.user_name,
            user_email: user.user_email,
            user_interest: userInterest
        };
        sessionStorage.setItem('sessionData', JSON.stringify(sessionData));

        // Clear input fields
        document.querySelector('#email').value = '';
        document.querySelector('#password').value = '';

        // Update the UI
        updateApplicationUI(user, userInterest);

    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred. Please try again.');
    }
});

// Function to update the application UI after login
function updateApplicationUI(user, userInterest) {
    if (window.innerWidth <= 390) {
        document.querySelector('.application').style.display = 'block';
        document.querySelector('.login').style.display = 'none';
        document.querySelector('#welcomeUser').innerHTML = `Welcome, ${user.user_name}!`;

        updateUserInterests(userInterest);
    } else {
        document.querySelector('.application').style.display = 'none';
        document.querySelector('.login').style.display = 'block';
    }
}

// Function to update user interests dynamically
function updateUserInterests(userInterest) {
    const checkboxes = document.querySelectorAll('.user-profile input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        const interestId = checkbox.getAttribute('data-interest-id');
        checkbox.checked = userInterest.some(ui => ui.user_interest_interest == interestId);
    });
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Logout Function  ///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

document.querySelector('#logoutBtn').addEventListener('click', function () {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('sessionData');
        document.querySelector('.application').style.display = 'none';
        document.querySelector('.login').style.display = 'block';
        document.querySelector('#email').value = '';
        document.querySelector('#password').value = '';
    }
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Session Management and Mobile-Only Enforcement ////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function enforceMobileOnly() {
    if (window.innerWidth > 390) {
        document.querySelector('.application').style.display = 'none';
        document.querySelector('.login').style.display = 'none';
        document.querySelector('.desktop-error').style.display = 'block';
    } else {
        const sessionData = sessionStorage.getItem('sessionData');
        if (sessionData) {
            document.querySelector('.application').style.display = 'block';
            document.querySelector('.login').style.display = 'none';
            const userData = JSON.parse(sessionData);
            document.querySelector('#welcomeUser').innerHTML = `Welcome, ${userData.user_name}!`;
            updateUserInterests(userData.user_interest);
        } else {
            document.querySelector('.application').style.display = 'none';
            document.querySelector('.login').style.display = 'block';
        }
        document.querySelector('.desktop-error').style.display = 'none';
    }
}

// On initial load
window.addEventListener('load', enforceMobileOnly);

// On window resize
window.addEventListener('resize', enforceMobileOnly);
