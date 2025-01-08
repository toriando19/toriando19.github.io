async function displayMatchingUsers() {
    const sessionData = JSON.parse(sessionStorage.getItem('sessionData'));

    if (!sessionData || !sessionData.user_id) {
        console.error('No session data or user ID found in sessionStorage.');
        return;
    }

    const currentUserId = sessionData.user_id;
    const currentUserInterests = sessionData.user_interest.map(interest => interest.user_interest_interest);

    try {
        // Fetch user interests, users, and chats from the backend
        const [userInterests, users, chats] = await Promise.all([
            fetch('http://localhost:3000/userinterest').then(res => res.json()),
            fetch('http://localhost:3000/users').then(res => res.json()),
            fetch('http://localhost:3000/chats').then(res => res.json())
        ]);

        const matchingUsers = {};

        // Mapping of interestId to icon and title
        const interestMapping = {
            1: { icon: 'views/img/icons/movie-white.png', title: 'Den Store Bagedyst' },
            2: { icon: 'views/img/icons/movie-white.png', title: 'Alle mod en' },
            3: { icon: 'views/img/icons/movie-white.png', title: 'Kender du typen' },
            4: { icon: 'views/img/icons/eye-white.png', title: 'TVA' },
            5: { icon: 'views/img/icons/podcast-white.png', title: 'Genstart' },
            6: { icon: 'views/img/icons/podcast-white.png', title: 'Sara og Monopolet' }
        };

        // Find matching users based on shared interests
        userInterests.forEach(interest => {
            if (currentUserInterests.includes(interest.user_interest_interest) && interest.user_interest_user !== currentUserId) {
                if (!matchingUsers[interest.user_interest_user]) {
                    matchingUsers[interest.user_interest_user] = {
                        sharedInterests: 0,
                        totalInterests: 0,
                        latestTimestamp: null,
                        matchingInterests: []
                    };
                }
                matchingUsers[interest.user_interest_user].sharedInterests++;
                matchingUsers[interest.user_interest_user].matchingInterests.push(interest.user_interest_interest);

                const currentInterestTime = new Date(interest.current_time).getTime();
                if (!matchingUsers[interest.user_interest_user].latestTimestamp || currentInterestTime > matchingUsers[interest.user_interest_user].latestTimestamp) {
                    matchingUsers[interest.user_interest_user].latestTimestamp = currentInterestTime;
                }
            }
        });

        // Calculate match percentages
        Object.keys(matchingUsers).forEach(userId => {
            matchingUsers[userId].totalInterests = userInterests.filter(item => item.user_interest_user == userId).length;
        });

        const sortedMatchingUsers = Object.keys(matchingUsers)
            .map(userId => ({
                userId,
                percentage: Math.round((matchingUsers[userId].sharedInterests / (currentUserInterests.length + matchingUsers[userId].totalInterests - matchingUsers[userId].sharedInterests)) * 100),
                latestTimestamp: matchingUsers[userId].latestTimestamp,
                matchingInterests: matchingUsers[userId].matchingInterests
            }))
            .sort((a, b) => b.percentage - a.percentage);

        const exploreMatches = document.getElementById('exploreMatches');
        exploreMatches.innerHTML = ''; // Clear previous content

        const currentTime = new Date().getTime();

        // Create match containers
        sortedMatchingUsers.forEach(({ userId, percentage, latestTimestamp, matchingInterests }) => {
            const matchingUser = users.find(user => user.user_id == userId);

            if (!matchingUser || matchingUser.user_id === currentUserId) return;

            const chatExists = chats.some(chat => 
                (chat.chat_user_1 === currentUserId && chat.chat_user_2 === matchingUser.user_id) || 
                (chat.chat_user_1 === matchingUser.user_id && chat.chat_user_2 === currentUserId)
            );

            if (chatExists) return;

            const matchContainer = document.createElement('div');
            matchContainer.classList.add('match-container');

            let showSuperMatch = percentage === 100;
            let showNewMatch = latestTimestamp && (currentTime - latestTimestamp <= 120000);
            let showMatch = !showSuperMatch && !showNewMatch;

            if (showSuperMatch) {
                const superMatch = document.createElement('h4');
                superMatch.textContent = 'Super Match';
                superMatch.classList.add('superMatch');
                matchContainer.appendChild(superMatch);
            } else if (showNewMatch) {
                const newMatch = document.createElement('h4');
                newMatch.textContent = 'Nyt match';
                newMatch.classList.add('newMatch');
                matchContainer.appendChild(newMatch);
            } else if (showMatch) {
                const matchLabel = document.createElement('h4');
                matchLabel.textContent = 'Match';
                matchLabel.classList.add('simpleMatch');
                matchContainer.appendChild(matchLabel);
            }

            const userInfo = document.createElement('p');
            userInfo.textContent = `${percentage}% match`;
            matchContainer.appendChild(userInfo);

            // Display matching interests with icons
            const interestsList = document.createElement('div');
            interestsList.classList.add('interests-match-list');

            // Set to track icons that have already been displayed
            const displayedIcons = new Set();

            matchingInterests.forEach(interestId => {
                const interest = interestMapping[interestId];
                if (interest && !displayedIcons.has(interest.icon)) {
                    // Create the image element dynamically
                    const iconElement = document.createElement('img');
                    iconElement.src = `/img/icons/${interest.icon.split('/').pop()}`;  // Extract filename and update path
                    iconElement.alt = interest.title;  // Use title as alt text

                    // Append the icon to the interests list
                    interestsList.appendChild(iconElement);

                    // Mark this icon as displayed
                    displayedIcons.add(interest.icon);
                }
            });

            matchContainer.appendChild(interestsList);



            const viewButton = document.createElement('button');
            viewButton.classList.add('match-view');
            viewButton.textContent = 'Se match';
            viewButton.onclick = () => {
                viewUserInfo(matchingUser.user_username, percentage, matchingInterests);
            };

            const chatButton = document.createElement('button');
            chatButton.textContent = 'Chat';
            chatButton.classList.add('match-chat');
            chatButton.onclick = () => {
                alert(`You're starting a chat with ${matchingUser.user_username}`);
                createChat(currentUserId, matchingUser.user_id);
            };

            matchContainer.appendChild(viewButton);
            matchContainer.appendChild(chatButton);

            exploreMatches.appendChild(matchContainer);
        });

        if (sortedMatchingUsers.length === 0) {
            exploreMatches.innerHTML = 'No matching users found.';
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('An error occurred while fetching matching users.');
    }
}





///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Update Timestamp after Changes in Interests ///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Call this function when a user updates their preferences
function updateInterestTimestamp() {
    const currentTime = new Date().toISOString();
    sessionStorage.setItem('lastUpdateTimestamp', currentTime);
    console.log('Timestamp updated: ', currentTime);
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

        // Check if chat already exists
        if (result.message === 'Chat already exists') {
            alert('Chat already exists with this user!');
        } else if (response.ok) {
            // If chat creation is successful
            alert('Chat created successfully!');

            // Reload the content by calling displayMatchingUsers
            displayMatchingUsers();

            // Hide the specific match overlay
            const matchOverlay = document.getElementById('specificMatchOverlay');
            if (matchOverlay) {
                matchOverlay.style.display = 'none';
            }

            // Set the active menu to the frontpage
            setActiveMenu("frontpageMenu");
        } else {
            // Handle any other errors
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

async function viewUserInfo(username, matchPercentage, matchingInterests) {
    try {
        const sessionData = JSON.parse(sessionStorage.getItem('sessionData')); // Get session data here
        if (!sessionData || !sessionData.user_id) {
            console.error('No session data or user ID found in sessionStorage.');
            return;
        }

        const currentUserId = sessionData.user_id;

        const usersResponse = await fetch('http://localhost:3000/users');
        const users = await usersResponse.json();

        const user = users.find(user => user.user_username === username);

        if (!user) {
            alert('User not found.');
            return;
        }

        const userId = user.user_id;

        const userInterestResponse = await fetch('http://localhost:3000/userinterest');
        const userInterests = await userInterestResponse.json();

        // Mapping of interestId to icon and title
        const interestMapping = {
            1: { icon: 'movie-black.png', title: 'Den Store Bagedyst' },
            2: { icon: 'movie-black.png', title: 'Alle mod en' },
            3: { icon: 'movie-black.png', title: 'Kender du typen' },
            4: { icon: 'eye-black.png', title: 'TVA' },
            5: { icon: 'podcast-black.png', title: 'Genstart' },
            6: { icon: 'podcast-black.png', title: 'Sara og Monopolet' }
        };
        
        // Show the matching interests as paragraphs with icons and titles
        const interestList = document.createElement('div'); // Using div to contain the paragraphs
        matchingInterests.forEach(interestId => {
            const interest = interestMapping[interestId];  // Get icon and title from the mapping
            if (interest) {
                const interestParagraph = document.createElement('p');
                const interestIcon = document.createElement('img');
                
                // Create a container div to wrap both the icon and the paragraph
                const interestContainer = document.createElement('div');
                interestContainer.classList.add('interest-info-view');  // Adding class to the container
                
                // Set the icon properties
                interestIcon.src = `/img/icons/${interest.icon}`;  // Correct local image path
                interestIcon.alt = interest.title; // Set the alt text for the image
                interestIcon.classList.add('interests-info-list'); // Add class for the icon
                
                // Set the paragraph content
                interestParagraph.textContent = interest.title; // Display the title of the interest
                
                // Append the icon and paragraph into the container div
                interestContainer.appendChild(interestIcon);
                interestContainer.appendChild(interestParagraph);
                
                // Append the container to the interest list
                interestList.appendChild(interestContainer);
            }
        });


        const userInfoSection = document.getElementById('userInfoSection');
        if (!userInfoSection) {
            console.error('User info section element not found.');
            alert('User info section is missing in the UI.');
            return;
        }

        // Clear previous content inside the userInfoSection and append the user info along with the chat button
        userInfoSection.innerHTML = `
            <div class="match-overlay-header">
                <button id="specficMatchClose" class="match-overlay-close"> <img src="img/icons/leftarrow-black.png" alt="arrow"> </button> <!-- replace with icon-image -->
                <div class="profileContainer">
                    <img class="profilePicture" src="img/profile.jpg" alt="logo">
                    <h1 class="overlay-h1"> ${user.user_username} </h1>
                </div>
            </div>
            <div class="specificMatch-info">
                <div class="match-overall-percentage">
                    <h3> Fælles Interesser </h3>
                    <p> ${matchPercentage}% </p>
                </div>
                <div class="match-progress-bar">
                    <div class="filled" style="width: ${matchPercentage}%;"></div>
                </div>

                <br>

                <p><strong>User Interests:</strong></p>
                ${interestList.outerHTML} <!-- Append the interestList as HTML here -->

                <br><br>

                <button id="startChatButton" class="chat-start-button"> Start en chat med ${user.user_username} </button>
            </div>
        `;

        // Add event listener to the chat button
        const chatButton = document.getElementById('startChatButton');
        chatButton.onclick = () => {
            alert(`You're starting a chat with ${user.user_username}`);
            createChat(currentUserId, user.user_id);  // Now we are sure currentUserId is available here
        };

        // Show the overlay
        document.getElementById('specificMatchOverlay').style.display = 'block';

        // Add the event listener for the close button inside this function
        const closeButton = document.getElementById('specficMatchClose');
        closeButton.addEventListener('click', function() {
            const matchOverlay = document.getElementById('specificMatchOverlay');

            // Hide profile section and overlay
            matchOverlay.style.display = 'none';

            // Set the active menu back to the "frontpageMenu"
            setActiveMenu("frontpageMenu");
        });

    } catch (error) {
        console.error('Error fetching user info:', error);
        alert('Error fetching user info.');
    }
}

