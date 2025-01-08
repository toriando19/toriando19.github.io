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
        // Send login request to the new API
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert('Invalid credentials. Please try again.');
            } else {
                alert('An error occurred during login. Please try again.');
            }
            return;
        }

        const data = await response.json();

        // Store session data
        const sessionData = {
            user_id: data.user_id,
            username: data.username,
            user_name: data.user_name,
            user_email: data.user_email,
            user_interest: data.user_interest || [],
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
