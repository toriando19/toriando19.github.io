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
        // Fetch user data from the backend
        const userUrl = 'https://toriando19.github.io/database/json-data/users.json' || 'http://localhost:3000/users';
        const userResponse = await fetch(userUrl);
        if (!userResponse.ok) throw new Error('Failed to fetch user data');

        const users = await userResponse.json();
        const user = users.find(u => u.user_email === email && u.user_password === password);

        if (!user) {
            alert('Invalid credentials. Please try again.');
            return;
        }

        // Fetch user interests data
        const userInterestUrl = 'https://toriando19.github.io/database/json-data/userinterest.json' || 'http://localhost:3000/userinterest';
        const interestResponse = await fetch(userInterestUrl);
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
        updateApplicationUI(data, data.user_interest || []);

    } catch (error) {
        console.error('Error during login:', error);
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
        document.querySelector('.burger-menu').style.display = 'none';
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
