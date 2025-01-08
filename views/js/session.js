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
        
        // Check if response is not empty and parse the JSON
        const users = await userResponse.text();
        const parsedUsers = users ? JSON.parse(users) : [];

        const user = parsedUsers.find(u => u.user_email === email && u.user_password === password);

        if (!user) {
            alert('Invalid credentials. Please try again.');
            return;
        }

        // Fetch user interests data
        const userInterestUrl = 'https://toriando19.github.io/database/json-data/userinterest.json' || 'http://localhost:3000/userinterest';
        const interestResponse = await fetch(userInterestUrl);

        if (!interestResponse.ok) throw new Error('Failed to fetch user interests');
        
        // Check if response is not empty and parse the JSON
        const interests = await interestResponse.text();
        const parsedInterests = interests ? JSON.parse(interests) : [];

        const userInterest = parsedInterests.filter(interest => parseInt(interest.user_interest_user) === user.user_id);

        // Fetch chat data
        const chatUrl = 'https://toriando19.github.io/database/json-data/chats.json' || 'http://localhost:3000/chats';
        const chatResponse = await fetch(chatUrl);

        if (!chatResponse.ok) throw new Error('Failed to fetch chats');

        // Check if response is not empty and parse the JSON
        const chats = await chatResponse.text();
        const parsedChats = chats ? JSON.parse(chats) : [];

        // Fetch message data
        const messageUrl = 'https://toriando19.github.io/database/json-data/messages.json' || 'http://localhost:3000/messages';
        const messageResponse = await fetch(messageUrl);

        if (!messageResponse.ok) throw new Error('Failed to fetch messages');

        // Check if response is not empty and parse the JSON
        const messages = await messageResponse.text();
        const parsedMessages = messages ? JSON.parse(messages) : [];

        // Filter messages related to current user's chats
        const userMessages = parsedMessages.filter(message => 
            message.message_chat_id === userChats.chat_id || 
            message.message_sender === user.user_id || 
            message.message_receiver === user.user_id);

        // Filter chats where either chat_user_1 or chat_user_2 matches the logged-in user
        const userChats = parsedChats.filter(chat => chat.chat_user_1 === user.user_id || chat.chat_user_2 === user.user_id);

        // Store session data
        const sessionData = {
            user_id: user.user_id,
            username: user.user_username,
            user_name: user.user_name,
            user_email: user.user_email,
            user_interest: userInterest,
            chats: userChats, // Add fetched chats to session data
            messages: userMessages // Add fetched messages to session data
        };
        sessionStorage.setItem('sessionData', JSON.stringify(sessionData));

        // Clear input fields
        document.querySelector('#email').value = '';
        document.querySelector('#password').value = '';

        // Update the UI
        updateApplicationUI(user, userInterest || [], userChats || [], userMessages || []);

    } catch (error) {
        console.error('Error during login:', error);
    }
});

// Function to update the application UI after login
function updateApplicationUI(user, userInterest, userChats) {
    if (window.innerWidth <= 390) {
        document.querySelector('.application').style.display = 'block';
        document.querySelector('.login').style.display = 'none';
        document.querySelector('#welcomeUser').innerHTML = `Welcome, ${user.user_name}!`;

        updateUserInterests(userInterest);
        updateUserChats(userChats);  // Function to update chats UI
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

// Function to update user chats dynamically
function updateUserChats(userChats) {
    const chatContainer = document.querySelector('.chat-container');
    chatContainer.innerHTML = '';  // Clear the previous chat list
    
    userChats.forEach(chat => {
        const chatElement = document.createElement('div');
        chatElement.classList.add('chat-item');
        chatElement.innerHTML = `
            <p><strong>Chat with ${chat.chat_user_1 === user.user_id ? chat.chat_user_2 : chat.chat_user_1}</strong></p>
            <p>${chat.chat_message}</p>
        `;
        chatContainer.appendChild(chatElement);
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
            updateUserChats(userData.chats);  // Update chats from session data
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
