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
            console.log("Users fetched from localhost:", users); // Log users fetched from localhost
            user = users.find(u => {
                console.log(`Comparing: ${u.user_email} with ${email} and ${u.user_password} with ${password}`); // Log comparison
                return u.user_email === email && u.user_password === password;
            });
        } catch (error) {
            console.error('Error fetching from localhost:', error);
            // Fallback to reading from GitHub if localhost request fails
            const githubResponse = await fetch('https://toriando19.github.io/database/json-data/users.json');
            if (!githubResponse.ok) throw new Error('Failed to fetch user data from GitHub');
            users = await githubResponse.json();
            console.log("Users fetched from GitHub:", users); // Log users fetched from GitHub
            user = users.find(u => u.user_email === email && u.user_password === password);
        }

        if (!user) {
            console.error('User not found:', email);  // Log if no user was found
            alert('Invalid credentials. Please try again.');
            return;
        }

        // Insert the user into the backend if not already there (i.e., matching login credentials found)
        let existingUser = null;
        try {
            const response = await fetch('http://localhost:3000/users');
            if (!response.ok) throw new Error('Failed to fetch users from localhost');
            users = await response.json();
            existingUser = users.find(u => u.user_email === user.user_email);
        } catch (error) {
            console.error('Error fetching users from localhost:', error);
            // Fallback to GitHub if localhost request fails
            const githubResponse = await fetch('https://toriando19.github.io/database/json-data/users.json');
            if (!githubResponse.ok) throw new Error('Failed to fetch user data from GitHub');
            users = await githubResponse.json();
            existingUser = users.find(u => u.user_email === user.user_email);
        }

        if (!existingUser) {
            // If no existing user, try to insert into the backend
            try {
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
            } catch (error) {
                console.error('Error while inserting user into localhost:', error);
                alert('An error occurred while inserting user data. GitHub fallback is not implemented.');
            }
        }

        // Fetch user interests data
        let userInterests = [];
        try {
            const interestResponse = await fetch('http://localhost:3000/userinterest');
            if (!interestResponse.ok) throw new Error('Failed to fetch user interests from localhost');
            userInterests = await interestResponse.json();
        } catch (error) {
            console.error('Error fetching interests:', error);
            const githubInterestResponse = await fetch('https://toriando19.github.io/database/json-data/user_interest.json');
            if (!githubInterestResponse.ok) throw new Error('Failed to fetch user interests from GitHub');
            userInterests = await githubInterestResponse.json();
        }

        // Filter user interests based on the user id
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
