///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ---  ///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function fetchAndDisplayMessages(chat_id, user_id) {
  try {
    // Fetch all messages for the chat_id from the /messages endpoint
    const messageUrl = 'https://toriando19.github.io/database/json-data/messages.json' || 'http://localhost:3000/messages';
    const messagesResponse = await fetch(messageUrl);
    if (!messagesResponse.ok) throw new Error('Failed to fetch messages');

    const messages = await messagesResponse.json();
    const filteredMessages = messages.filter(message => message.chat_id === chat_id);

    // Get the message container to display messages
    const messageTimeline = document.getElementById('message-timeline');
    messageTimeline.innerHTML = '';  // Clear previous messages

    let lastDate = null; // Store the last displayed date
    
    // Display each message in the timeline
    filteredMessages.forEach(message => {
      const messageDate = new Date(message.sent_at);
      
      // Format the date as "7. januar 2025"
      const formattedDate = messageDate.toLocaleDateString('da-DK', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    
      // Check if the date has changed (i.e., it's a new day)
      if (lastDate !== formattedDate) {
        lastDate = formattedDate; // Update the last date
    
        // Create a new date header element and add it to the timeline
        const dateElement = document.createElement('p');
        dateElement.classList.add('message-date');
        dateElement.innerHTML = formattedDate; // Insert the formatted date text
        messageTimeline.appendChild(dateElement);
      }
    
      // Create the message element
      const messageElement = document.createElement('div');
      messageElement.classList.add('message-element');
    
      // Display the time in the shortened format "13:54"
      const shortenedTime = messageDate.toLocaleTimeString('da-DK', {
        hour: '2-digit',
        minute: '2-digit'
      });
    
      // Display the message content with shortened time
      messageElement.innerHTML = `
        <div class="message-time">${shortenedTime}</div>
        <div class="message-text">${message.message}</div>
      `;
      
      // Append the message to the timeline
      messageTimeline.appendChild(messageElement);
    });
    
    

  } catch (error) {
    console.error('Error fetching or displaying messages:', error);
  }
}





// Modify the `showMessageInput` function to call `fetchMessagesForChat`
async function showMessageInput(chat_id, recipient_id, recipient_name) {
  console.log("Chat ID:", chat_id, "Recipient ID:", recipient_id, "Recipient Name:", recipient_name);

  const sessionData = JSON.parse(sessionStorage.getItem('sessionData'));
  const user_id = sessionData.user_id; // Get the logged-in user's ID

  const chatOverlay = document.getElementById('chatOverlay'); // Reference to the chat overlay
  const inputDiv = document.getElementById('message-input');
  const icebreakerDiv = document.getElementById('icebreaker'); // Reference to the icebreaker section

  // Show the chat overlay
  chatOverlay.style.display = 'block';

  // Dynamically update the chat header div with the recipient's name and nickname
  const chatHeader = document.getElementById('chatHeader');
  chatHeader.innerHTML = `<p class="chatProfileNickname">${recipient_name}</p>`;

  // Display the input field and button
  inputDiv.innerHTML = `
    <div class="inputStyle">
      <button id="displayIcebreaker"> <img src="img/icons/ice-blue.png" alt="ice"> </button>
      <input type="text" id="userMessage" placeholder="Aa" />
      <button id="submitMessage">Send</button>
    </div>
  `;

  // Fetch and display the messages for the selected chat
  fetchAndDisplayMessages(chat_id, user_id);

  // Display the icebreaker questions (fixed at the bottom)
  initializeIcebreaker();

  document.getElementById('displayIcebreaker').addEventListener('click', () => {
    const icebreakerSection = document.getElementById('icebreakerSection');
    const currentDisplay = window.getComputedStyle(icebreakerSection).display;
    icebreakerSection.style.display = currentDisplay === 'none' ? 'block' : 'none';
  });

  // Handle message submission
  document.getElementById('submitMessage').addEventListener('click', async () => {
    const message = document.getElementById('userMessage').value;
    console.log("Message Input Value:", message);
  
    if (message.trim() !== "") {
      await sendMessageToAPI(chat_id, user_id, recipient_id, message); // Pass the correct sender_id and recipient_id
      document.getElementById('userMessage').value = ''; // Clear input
  
      // Re-fetch the messages to include the newly sent message
      fetchAndDisplayMessages(chat_id, user_id);
      
      // Hide the icebreaker section after sending a message
      const icebreakerSection = document.getElementById('icebreakerSection');
      icebreakerSection.style.display = 'none';  // Hide the icebreaker section
  
    } else {
      alert("Message cannot be empty");
    }
  });
  
}



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// --- ///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function sendMessageToAPI(chat_id, sender_id, recipient_id, message) {
  console.log("Sending message:", { chat_id, sender_id, recipient_id, message });

  // Input Validation
  if (!chat_id || !sender_id || !recipient_id || !message) {
    console.error("Error: Missing required fields. Please provide chat_id, sender_id, recipient_id, and message.");
    return { error: "Missing required fields" };
  }

  // Check if the message content is empty or null, and handle accordingly
  if (!message.trim()) {
    console.warn("Warning: The message is empty or only contains whitespace. Inserting as a null message.");
    message = null; // Store as null if message is empty
  }

  // Debugging to make sure we're sending the right values to the API
  console.log("Chat ID being sent:", chat_id);
  console.log("Sender ID being sent:", sender_id);
  console.log("Recipient ID being sent:", recipient_id);
  console.log("Message being sent:", message);

  try {
    const response = await fetch('http://localhost:3000/create-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id,
        sender_id,  // Sender ID (logged-in user)
        recipient_id,  // Recipient ID (other user in the chat)
        message,
        sent_at: new Date(),
      }),
    });

    if (response.ok) {
      console.log("Message sent successfully");
    } else {
      console.error("Failed to send message:", response.statusText);
    }
  } catch (error) {
    console.error("Error sending message:", error);
  }
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// --- ///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////


async function fetchChatDocuments() {
  try {
    const sessionData = JSON.parse(sessionStorage.getItem("sessionData"));
    if (!sessionData || !sessionData.user_id) throw new Error('User ID not found in session data');
    
    const user_id = sessionData.user_id;
    console.log("Fetching chats for User ID:", user_id);

    // Fetch chat data for the user
    const chatUrl = 'https://toriando19.github.io/database/json-data/chats.json' || 'http://localhost:3000/chats';
    const chatResponse = await fetch(chatUrl);
    if (!chatResponse.ok) throw new Error('Failed to fetch chats');

    const chats = await chatResponse.json();
    const filteredChats = chats.filter(chat => chat.chat_user_1 === user_id || chat.chat_user_2 === user_id);

    // Fetch user data
    const userUrl = 'https://toriando19.github.io/database/json-data/users.json' || 'http://localhost:3000/users';
    const userResponse = await fetch(userUrl);
    if (!userResponse.ok) throw new Error('Failed to fetch users');

    const users = await userResponse.json();
    const resultContainer = document.getElementById('chat-result');
    resultContainer.innerHTML = ''; // Clear previous results

    // Sort filteredChats to show the chat with the newest message first
    filteredChats.sort((a, b) => {
      const timeA = new Date(a.last_message_time); // Assuming the chat object has a last_message_time property
      const timeB = new Date(b.last_message_time);
      return timeB - timeA; // Sort in descending order (newest first)
    });

    // Fetch messages to check if there are any messages in the chats
    const messagesResponse = await fetch('http://localhost:3000/messages');
    if (!messagesResponse.ok) throw new Error('Failed to fetch messages');
    
    const messages = await messagesResponse.json();
    
    // Display the chats and their associated users, but only if they have messages
    filteredChats.forEach(chat => {
      // Check if there are any messages for this chat
      const chatMessages = messages.filter(message => message.chat_id === chat.id);
      if (chatMessages.length > 0) {
        const matchedUser = users.find(user => user.user_id === (chat.chat_user_1 === user_id ? chat.chat_user_2 : chat.chat_user_1));
        if (matchedUser) {
          const displayName = matchedUser.user_nickname || matchedUser.user_username;

          // Create a container div for the chat entry
          const chatContainer = document.createElement('div');
          chatContainer.classList.add('chat-entry');
      
          // Create an img element for the user's profile picture
          const profileImage = document.createElement('img');
          profileImage.src = matchedUser.profile_picture || '../img/profile.jpg'; // Fallback to a default image if none provided
          profileImage.alt = `${displayName}'s profile picture`;
          profileImage.classList.add('profile-image');
      
          // Create a div to group text elements (name and last message)
          const textBlock = document.createElement('div');
          textBlock.classList.add('text-block');
      
          // Create the main p element for displaying the user's name
          const nameDisplayer = document.createElement('p');
          nameDisplayer.innerHTML = `${displayName} <img src="img/icons/rightarrow-black.png" alt="arrow">`;
          nameDisplayer.classList.add('name-displayer');
          nameDisplayer.addEventListener('click', () => {
            // When a chat is clicked, fetch and display the messages for the selected chat
            showMessageInput(chat.id, matchedUser.user_id, displayName);
            fetchAndDisplayMessages(chat.id);  // Fetch and display messages for this chat
          });


      
          function formatTimeAgo(createdAt) {
            const now = new Date();
            const createdAtDate = new Date(createdAt);
            const timeDifference = now - createdAtDate; // Difference in milliseconds
        
            const minutes = Math.floor(timeDifference / 60000);
            const hours = Math.floor(timeDifference / 3600000);
            const days = Math.floor(timeDifference / 86400000);
        
            // Check if the time difference is less than a minute
            if (timeDifference < 60000) {
                return "Lige nu"; // "Just now"
            } else if (minutes < 60) {
                return `${minutes} min.`; // X minutes ago
            } else if (hours < 24) {
                return `${hours} t. `; // X hours ago
            } else if (days < 7) {
                return `${days} dag(e)`; // X days ago
            } else {
                return createdAtDate.toLocaleDateString(); // Show exact date if more than 7 days
            }
        }
        
        // Create the element for additional info
        const additionalInfo = document.createElement('p');
        
        // Get the latest message and its timestamp
        const latestMessage = chatMessages.length > 0 ? chatMessages[chatMessages.length - 1].message : 'No messages yet';
        const lastMessageTime = chatMessages.length > 0 ? formatTimeAgo(chatMessages[chatMessages.length - 1].sent_at) : 'No time available';
        
        // Update the additional info to show the latest message and the formatted time
        additionalInfo.textContent = `${latestMessage} · ${lastMessageTime}`;
        additionalInfo.classList.add('message-preview');
        


      
          // Append name and message preview to the text block
          textBlock.appendChild(nameDisplayer);
          textBlock.appendChild(additionalInfo);
      
          // Append the image and text block to the chat container
          chatContainer.appendChild(profileImage);
          chatContainer.appendChild(textBlock);
      
          // Append the chat container to the result container
          resultContainer.appendChild(chatContainer);
        }
      }
    });

  } catch (error) {
    console.error(error.message);
  }
}


// Call to initialize chats when the page loads
fetchChatDocuments();


// Add an onclick function to the close button to hide the profile section and overlay
document.getElementById('chatClose').addEventListener('click', function() {
  document.getElementById('chatOverlay').style.display = 'none';
});


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// --- ///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function hasMessages(chat_id) {
  try {
    // Fetch messages for the chat
    const messagesResponse = await fetch('https://toriando19.github.io/database/json-data/messages.json');
    if (!messagesResponse.ok) throw new Error('Failed to fetch messages');
    
    const messages = await messagesResponse.json();

    // Check if there are any messages with the matching chat_id
    const chatMessages = messages.filter(message => message.chat_id === chat_id);
    
    // Return true if there are messages, false otherwise
    return chatMessages.length > 0;
  } catch (error) {
    console.error("Error checking messages:", error.message);
    return false;  // If there is an error, assume no messages
  }
}


async function fetchAndDisplayAdminChats() {
  try {
    const sessionData = JSON.parse(sessionStorage.getItem("sessionData"));
    if (!sessionData || !sessionData.user_id) throw new Error('User ID not found in session data');
    
    const user_id = sessionData.user_id;
    console.log("Fetching admin chats for User ID:", user_id);

    // Fetch chat data for the user
    const chatResponse = await fetch('https://toriando19.github.io/database/json-data/chats.json');
    if (!chatResponse.ok) throw new Error('Failed to fetch chats');

    const chats = await chatResponse.json();
    const filteredChats = chats.filter(chat => chat.chat_user_1 === user_id || chat.chat_user_2 === user_id);

    // Fetch user data
    const userResponse = await fetch('https://toriando19.github.io/database/json-data/users.json');
    if (!userResponse.ok) throw new Error('Failed to fetch users');

    const users = await userResponse.json();
    const resultContainer = document.getElementById('adminChats');
    resultContainer.innerHTML = ''; // Clear previous results

    // Sort filteredChats to show the chat with the newest message first
    filteredChats.sort((a, b) => {
      const timeA = new Date(a.last_message_time); 
      const timeB = new Date(b.last_message_time);
      return timeB - timeA; // Sort in descending order (newest first)
    });

    // Display the chats and their associated users
    for (const chat of filteredChats) {
      const matchedUser = users.find(user => user.user_id === (chat.chat_user_1 === user_id ? chat.chat_user_2 : chat.chat_user_1));
      if (matchedUser) {
        const matchDisplayName = matchedUser.user_nickname || matchedUser.user_username;

        // Create a container div for the chat entry
        const matchContainer = document.createElement('div');
        matchContainer.classList.add('match-entry');

        // Create an img element for the user's profile picture
        const profileImage = document.createElement('img');
        profileImage.src = matchedUser.profile_picture || '../img/profile.jpg'; 
        profileImage.alt = `${matchDisplayName}'s profile picture`;
        profileImage.classList.add('profile-image');

        // Create a div to group text elements (name, status, and button)
        const matchTextBlock = document.createElement('div');
        matchTextBlock.classList.add('match-text-block');
        matchTextBlock.style.display = 'flex'; // Use Flexbox
        matchTextBlock.style.justifyContent = 'space-between'; // Space between the left and right elements
        matchTextBlock.style.alignItems = 'center'; // Ensure everything is vertically aligned

        // Create the main p element for displaying the user's name
        const nameMatchDisplayer = document.createElement('p');
        nameMatchDisplayer.textContent = `${matchedUser.user_username}`;
        nameMatchDisplayer.classList.add('match-name-displayer');
        
        // Create a button to open the chat and display messages
        const openChatButton = document.createElement('button');
        openChatButton.innerHTML = '<img src="img/icons/chat-black.png" alt="chat">';
        openChatButton.classList.add('open-chat-button');
        
        // Define the icon mapping for active and inactive chats
        const iconMapping = {
            active: 'chat-fill-black.png',
            inactive: 'chat-black.png'
        };

        // Check if the chat has messages using the hasMessages function
        const hasMessagesForChat = await hasMessages(chat.id);

        // Set the correct icon based on message availability
        if (hasMessagesForChat) {
          openChatButton.innerHTML = `<img src="img/icons/${iconMapping.active}" alt="chat active">`; // Active icon if there are messages
        } else {
          openChatButton.innerHTML = `<img src="img/icons/${iconMapping.inactive}" alt="chat inactive">`; // Inactive icon if no messages
        }

        // Event listener for when the button is clicked
        openChatButton.addEventListener('click', () => {
            // Fetch and display messages for the selected chat
            showMessageInput(chat.id, matchedUser.user_id, matchDisplayName);  // Open chat input
            fetchAndDisplayMessages(chat.id, user_id);  // Fetch messages for this chat
            
            // Set the appropriate icon when chat is opened (active)
            openChatButton.innerHTML = `<img src="img/icons/${iconMapping.active}" alt="chat active">`;

            // Reuse existing code for hiding matchesOverlay
            const matchesOverlay = document.getElementById("matchesOverlay");
            const burgerMenu = document.getElementById("burgerMenu");
            const button = document.getElementById("hamburgerMenu");

            // Hide matchesOverlay
            matchesOverlay.style.display = "none";

            // Also hide the burger menu if it's open
            burgerMenu.style.display = "none";
            button.innerHTML = '<img src="img/icons/burger-black.png" alt="Menu">'; // Reset burger menu button text
        });

        // Create delete button for the chat
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Slet chat';
        deleteButton.classList.add('delete-chat-button');
        deleteButton.addEventListener('click', async () => {
            const confirmation = confirm(`Slet chat med ${matchedUser.user_username}`);
            if (confirmation) {
                await deleteChat(chat.id);
                matchContainer.remove();  // Remove the chat from the UI after deletion
            }
        });

        // Append name, status image, and delete button to the text block
        matchTextBlock.appendChild(nameMatchDisplayer);
        matchTextBlock.appendChild(openChatButton);  // Append the Open Chat button
        matchTextBlock.appendChild(deleteButton);

        // Append the image and text block to the chat container
        matchContainer.appendChild(profileImage);
        matchContainer.appendChild(matchTextBlock);

        // Append the chat container to the result container
        resultContainer.appendChild(matchContainer);
      }
    }

  } catch (error) {
    console.error(error.message);
  }
}


const deleteChat = async (chatId) => {
  try {
    const response = await fetch(`http://localhost:3000/delete-chat/${chatId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete chat');
    }

    const result = await response.json();
    console.log(result);  // You can log or handle the result here
  } catch (error) {
    console.error('Error deleting chat:', error);
  }
};


// Call to initialize chats for the admin on page load
fetchAndDisplayAdminChats();


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Icebreaker  ////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Array of 20 strings for icebreaker questions
const strings = [
  "Hvilken type programmer får du aldrig nok af?",
  "Er der en tv-serie, du har været helt opslugt af for nylig?",
  "Har du en yndlingspodcast, du altid lytter til?",
  "Hvilket tv-program får dig til at grine hver gang?",
  "Hvilken dokumentar har gjort mest indtryk på dig?",
  "Er der en tv-vært, du virkelig synes har en god udstråling?",
  "Hvad er din go-to aktivitet, når du har fri?",
  "Hvilken genre film eller serier kan du bedst lide?",
  "Er der en episode af en tv-serie, du altid vender tilbage til?",
  "Hvilket program har du lært mest af?",
  "Har du en favorit podcast-episode, som du vil anbefale?",
  "Hvilken tv-serie kunne du ikke få nok af som barn?",
  "Er der en tv-serie, du har set flere gange, fordi du elsker den?",
  "Hvilket medieindhold får dig til at reflektere mest?",
  "Hvad har været den bedste oplevelse, du har haft med en tv-serie?",
  "Er du typen, der følger med i nyhedsprogrammer, eller er du mere til underholdning?",
  "Er der en tv- eller radiovært, der har inspireret dig på en særlig måde?",
  "Hvad er din yndlingsaktivitet, når du har tid til at slappe af?",
  "Hvilken genre musik får du altid lyst til at lytte til?",
  "Hvad er den mest interessante ting, du har lært gennem et tv-program eller en podcast?",
];

// Function to shuffle an array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Function to shuffle and display 3 strings as icebreaker questions
function shuffleAndDisplay() {
  shuffleArray(strings);
  const selectedStrings = strings.slice(0, 3);
  const icebreakerDiv = document.getElementById('icebreaker');
  
  // Create HTML for the icebreaker questions and add event listeners to them
  icebreakerDiv.innerHTML = selectedStrings.map(str => `
    <p class="icebreaker-question">${str}</p>
  `).join('');

  // Add event listeners to the question paragraphs
  const questionElements = document.querySelectorAll('.icebreaker-question');
  questionElements.forEach(question => {
    question.addEventListener('click', () => {
      const userMessageInput = document.getElementById('userMessage');
      userMessageInput.value = question.textContent;  // Set clicked question in the input field
    });
  });
}

// Function to initialize with default set of 3 questions
function initializeIcebreaker() {
  shuffleAndDisplay();  // Call to shuffle and display the initial 3 questions
}

// Initialize the icebreaker on page load
initializeIcebreaker();

// Add event listener to the shuffle button
document.getElementById('shuffleIcebreaker').addEventListener('click', shuffleAndDisplay);

// Event listener to close the chat overlay
document.getElementById('closeChatButton').addEventListener('click', () => {
  const chatOverlay = document.getElementById('chat-overlay');
  chatOverlay.style.display = 'none';
});