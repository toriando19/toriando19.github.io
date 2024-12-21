// Function to show message input field and existing messages when a user is clicked
async function showMessageInput(chat_id, recipient_id, recipient_name) {
  console.log("Chat ID:", chat_id, "Recipient ID:", recipient_id, "Recipient Name:", recipient_name);

  const inputDiv = document.getElementById('message-input');
  const messageTimelineDiv = document.getElementById('message-timeline');

  // Clear the message timeline
  messageTimelineDiv.innerHTML = '';

  try {
    // Fetch existing messages for the selected chat

    const messageUrl = 'https://toriando19.github.io/database/json-data/messages.json' || 'http://localhost:3000/messages';
    const messagesResponse = await fetch(messageUrl);
    if (!messagesResponse.ok) throw new Error('Failed to fetch messages');
    
    const messages = await messagesResponse.json();
    const filteredMessages = messages.filter(message => message.chat_id === chat_id);

    // Get the user_id from the session
    const sessionData = JSON.parse(sessionStorage.getItem("sessionData"));
    if (!sessionData || !sessionData.user_id) throw new Error('User ID not found in session data');
    
    const user_id = sessionData.user_id;
    console.log("Session User ID:", user_id);

    // Display the filtered messages
    filteredMessages.sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at));
    filteredMessages.forEach(message => {
      const messageElement = document.createElement('div');
      messageElement.classList.add('message');
      const senderName = message.sender_id === user_id ? "Me" : message.sender_name || "Unknown";
      messageElement.innerHTML = `
        <p><strong>${senderName}</strong> at ${new Date(message.sent_at).toLocaleString()}:</p>
        <p>${message.message}</p>
      `;
      messageTimelineDiv.appendChild(messageElement);
    });

    // Add input field and submit button
    inputDiv.innerHTML = `
      <input type="text" id="userMessage" placeholder="Type your message here" />
      <button id="submitMessage">Send Message</button>
    `;

    document.getElementById('submitMessage').addEventListener('click', async () => {
      const message = document.getElementById('userMessage').value;
      console.log("Message Input Value:", message);
      if (message.trim() !== "") {
        await sendMessageToAPI(chat_id, user_id, recipient_id, message);
        document.getElementById('userMessage').value = ''; // Clear input
        showMessageInput(chat_id, recipient_id, recipient_name); // Refresh messages
      } else {
        alert("Message cannot be empty");
      }
    });

  } catch (error) {
    console.error(error.message);
  }
}

// Function to send message to the create-message API
async function sendMessageToAPI(chat_id, sender_id, recipient_id, message) {
  console.log("Sending message:", { chat_id, sender_id, recipient_id, message });
  try {
    const response = await fetch('http://localhost:3000/create-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id,
        sender_id,
        recipient_id,
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

// Function to fetch and display chat documents based on the user_id
async function fetchChatDocuments() {
  try {
    const sessionData = JSON.parse(sessionStorage.getItem("sessionData"));
    if (!sessionData || !sessionData.user_id) throw new Error('User ID not found in session data');
    
    const user_id = sessionData.user_id;
    console.log("Fetching chats for User ID:", user_id);

    const chatResponse = await fetch('http://localhost:3000/chats');
    if (!chatResponse.ok) throw new Error('Failed to fetch chats');

    const chats = await chatResponse.json();
    const filteredChats = chats.filter(chat => chat.chat_user_1 === user_id || chat.chat_user_2 === user_id);

    const userUrl = 'https://toriando19.github.io/database/json-data/users.json' || 'http://localhost:3000/users';
    const userResponse = await fetch(userUrl);
    if (!userResponse.ok) throw new Error('Failed to fetch users');

    const users = await userResponse.json();
    const resultContainer = document.getElementById('chat-result');
    resultContainer.innerHTML = ''; // Clear previous results

    filteredChats.forEach(chat => {
      const matchedUser = users.find(user => user.user_id === (chat.chat_user_1 === user_id ? chat.chat_user_2 : chat.chat_user_1));
      if (matchedUser) {
        const displayName = matchedUser.user_nickname || matchedUser.user_username;
        const p = document.createElement('p');
        p.textContent = `Chat with ${displayName}`;
        p.addEventListener('click', () => showMessageInput(chat.id, matchedUser.user_id, displayName));
        resultContainer.appendChild(p);
      }
    });

  } catch (error) {
    console.error(error.message);
  }
}

// Call to initialize chats
fetchChatDocuments();



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Icebreaker  ////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Array of 20 strings
const strings = [
  "What's your favorite hobby?",
  "If you could visit any place in the world, where would it be?",
  "What’s the best meal you’ve ever had?",
  "Do you have a favorite movie or TV show?",
  "What’s the most interesting book you’ve read?",
  "If you could have any superpower, what would it be?",
  "What’s one thing on your bucket list?",
  "What’s your favorite season of the year?",
  "Do you prefer coffee or tea?",
  "What’s the most exciting trip you’ve been on?",
  "What’s your dream job?",
  "What’s one skill you wish you could master?",
  "If you could meet any historical figure, who would it be?",
  "What’s your favorite type of music?",
  "Do you have a favorite sport or physical activity?",
  "What’s your go-to comfort food?",
  "What’s your favorite holiday tradition?",
  "Do you prefer sunrise or sunset?",
  "What’s one thing you’re grateful for today?",
  "If you could live in any time period, which one would it be?"
];

// Function to shuffle an array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Function to shuffle and display 3 strings
function shuffleAndDisplay() {
  shuffleArray(strings);
  const selectedStrings = strings.slice(0, 3);
  const icebreakerDiv = document.getElementById('icebreaker');
  
  // Create HTML for the icebreaker questions and add event listeners to them
  icebreakerDiv.innerHTML = selectedStrings.map(str => `<p class="icebreaker-question">${str}</p>`).join('');

  // Add event listener to each question
  const questionElements = document.querySelectorAll('.icebreaker-question');
  questionElements.forEach(question => {
    question.addEventListener('click', () => {
      // When a question is clicked, set it as the value of the input field
      const userMessageInput = document.getElementById('userMessage');
      userMessageInput.value = question.textContent;  // Set clicked question in the input field
    });
  });
}

// Add event listener to the button
document.getElementById('shuffleIcebreaker').addEventListener('click', shuffleAndDisplay);