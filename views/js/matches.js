///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Explore Matches  ///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function displayMatchingUsers() {
    const sessionData = JSON.parse(sessionStorage.getItem('sessionData')); // Assuming it's stored as a JSON string

    if (!sessionData || !sessionData.user_id) {
        console.error('No session data or user ID found in sessionStorage.');
        return;
    }

    const currentUserId = sessionData.user_id;  // Get the logged-in user ID
    const currentUserUsername = sessionData.user_username;  // Get the logged-in user's username from sessionStorage
    const currentUserInterests = sessionData.user_interest;  // Get the interests from session data
    const totalUserInterests = currentUserInterests.length;  // Total number of interests from session data

    try {
        const userInterestResponse = await fetch('http://localhost:3000/userinterest');
        const userInterests = await userInterestResponse.json();

        const matchingUserInterests = [];
        currentUserInterests.forEach(interest => {
            const matchedInterests = userInterests.filter(item =>
                item.user_interest_interest == interest.user_interest_interest &&
                item.user_interest_user != currentUserId // Ensure we don't match the current user
            );
            matchingUserInterests.push(...matchedInterests);
        });

        const usersResponse = await fetch('http://localhost:3000/users');
        const users = await usersResponse.json();

        let matchingUsers = [];
        let userInterestCounts = {}; // Track how many interests each user shares

        matchingUserInterests.forEach(item => {
            const matchingUser = users.find(user => user.user_id == item.user_interest_user);
            if (matchingUser && !matchingUsers.some(u => u.user_id === matchingUser.user_id)) {
                matchingUsers.push(matchingUser);

                if (!userInterestCounts[matchingUser.user_id]) {
                    userInterestCounts[matchingUser.user_id] = 0;
                }
                userInterestCounts[matchingUser.user_id]++;
            }
        });

        const exploreMatches = document.getElementById('exploreMatches');
        exploreMatches.innerHTML = ''; // Clear previous content
        if (matchingUsers.length > 0) {
            matchingUsers.forEach(user => {
                const sharedInterestCount = userInterestCounts[user.user_id];
                const percentage = Math.round((sharedInterestCount / totalUserInterests) * 100);

                const matchContainer = document.createElement('div');
                matchContainer.classList.add('match-container');

                const newMatch = document.createElement('h4');
                newMatch.textContent = 'Nyt match';
                newMatch.classList.add('newMatch');
                matchContainer.appendChild(newMatch);
                
                const userInfo = document.createElement('p');
                userInfo.textContent = `${percentage}% match`;
                matchContainer.appendChild(userInfo);
                
                const viewButton = document.createElement('button');
                viewButton.classList.add('match-view');
                viewButton.textContent = 'Se match';
                viewButton.onclick = () => {
                    viewUserInfo(user.user_username, percentage);
                };
                
                const chatButton = document.createElement('button');
                chatButton.textContent = 'Chat';
                chatButton.classList.add('match-chat');
                chatButton.onclick = () => {
                    alert(`You're starting a chat with ${user.user_username}`);
                    createChat(currentUserId, user.user_id);  // Pass user IDs instead of usernames
                };

                matchContainer.appendChild(viewButton);
                matchContainer.appendChild(chatButton);

                exploreMatches.appendChild(matchContainer);
            });
        } else {
            exploreMatches.innerHTML = 'No matching users found.';
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('An error occurred while fetching matching users.');
    }
}

window.onload = displayMatchingUsers;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Create Chat  ///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function createChat(chat_user_1_id, chat_user_2_id) {
    try {
        // Send GET request to the endpoint with query parameters
        const response = await fetch(`http://localhost:3000/new-chat?chat_user_1=${chat_user_1_id}&chat_user_2=${chat_user_2_id}`);

        const result = await response.json();
        console.log('Response from createChat API:', result);
        
        if (response.ok) {
            alert('Chat created successfully!');
        } else {
            alert(`Error creating chat: ${result.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error creating chat:', error);
        alert('Error creating chat');
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// View User Info //////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function viewUserInfo(username, matchPercentage) {
    try {
        const usersResponse = await fetch('http://localhost:3000/users');
        const users = await usersResponse.json();

        const user = users.find(user => user.user_username === username);

        if (!user) {
            alert('User not found.');
            return;
        }

        const userId = user.user_id; // Get the user_id of the matched user

        const userInterestResponse = await fetch('http://localhost:3000/userinterest');
        const userInterests = await userInterestResponse.json();

        const matchedInterests = userInterests.filter(interest => interest.user_interest_user === userId);

        const interestsResponse = await fetch('http://localhost:3000/interests');
        const interests = await interestsResponse.json();

        const interestDescriptions = matchedInterests.map(matchedInterest => {
            const interest = interests.find(i => i.interest_id === matchedInterest.user_interest_interest);
            return interest ? interest.interest_description : 'Unknown Interest';
        });

        const userInfoSection = document.getElementById('userInfoSection');
        if (!userInfoSection) {
            console.error('User info section element not found.');
            alert('User info section is missing in the UI.');
            return;
        }

        userInfoSection.innerHTML = `
            <h3>User Info</h3>
            <p><strong>Username:</strong> ${user.user_username}</p>
            <p><strong>Percent Match:</strong> ${matchPercentage}%</p>
            <p><strong>User Interests:</strong></p>
            <ul>
                ${interestDescriptions.map(description => `<li>${description}</li>`).join('')}
            </ul>
        `;
    } catch (error) {
        console.error('Error fetching user info:', error);
        alert('Error fetching user info.');
    }
}
