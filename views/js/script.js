///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Hamburger Menu  ////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Function to handle activating the clicked menu
function setActiveMenu(activeId) {
    // Get all menu items
    const menuItems = document.querySelectorAll('.menu-nav a');

    // Remove 'active' class from all menu items
    menuItems.forEach(item => {
        item.classList.remove('active');
    });

    // Add 'active' class to the clicked menu item
    const activeMenu = document.getElementById(activeId);
    if (activeMenu) {
        activeMenu.classList.add('active');
    }
}


document.getElementById("hamburgerMenu").addEventListener("click", function() {
    // Get the burger menu and button
    const burgerMenu = document.getElementById("burgerMenu");
    const button = document.getElementById("hamburgerMenu");

    // Toggle the display of the burger menu
    if (burgerMenu.style.display === "none" || burgerMenu.style.display === "") {
        burgerMenu.style.display = "block";
        button.innerHTML = '<img src="img/icons/x-black.png" alt="Menu">'; // Change button text to "X"
    } else {
        burgerMenu.style.display = "none";
        button.innerHTML = '<img src="views/img/icons/burger-black.png" alt="Menu">'; // Change button text back to "☰"
    }
});

// Add event listeners for both frontpageMenu and frontpageLogo
document.getElementById("frontpageMenu").addEventListener("click", handleFrontPageClick);
document.getElementById("frontpageLogo").addEventListener("click", handleFrontPageClick);

// Define the function to handle the clicks
function handleFrontPageClick() {
    // Get the profile overlay and burger menu elements
    const profileOverlay = document.getElementById("profileOverlay");
    const chatsOverlay = document.getElementById("chatsOverlay");
    const chatOverlay = document.getElementById("chatOverlay");
    const matchOverlay = document.getElementById("specificMatchOverlay");
    const burgerMenu = document.getElementById("burgerMenu");
    const button = document.getElementById("hamburgerMenu");

    // Hide all overlays and the burger menu
    setActiveMenu("frontpageMenu");
    profileOverlay.style.display = "none";
    matchOverlay.style.display = "none";
    burgerMenu.style.display = "none";
    chatsOverlay.style.display = "none";
    chatOverlay.style.display = "none";
    button.innerHTML = '<img src="views/img/icons/burger-black.png" alt="Menu">';
}



document.getElementById("profileMenu").addEventListener("click", function() {
    const profileOverlay = document.getElementById("profileOverlay");
    const userProfileSection = document.getElementById("userProfileSection");
    const burgerMenu = document.getElementById("burgerMenu");
    const button = document.getElementById("hamburgerMenu");
    const chatOverlay = document.getElementById("chatOverlay");
    const chatsOverlay = document.getElementById("chatsOverlay");
    const matchOverlay = document.getElementById("specificMatchOverlay");
    const matchesOverlay = document.getElementById("matchesOverlay");
    
    // Show profile overlay and section, hide burger menu
    setActiveMenu("profileMenu");
    profileOverlay.style.display = "block";
    userProfileSection.style.display = "block"; // Ensure this is visible
    matchOverlay.style.display = "none";
    matchesOverlay.style.display = "none";
    chatOverlay.style.display = "none";
    chatsOverlay.style.display = "none";
    burgerMenu.style.display = "none";
    button.innerHTML = '<img src="views/img/icons/burger-black.png" alt="Menu">'; // Change button text back to "☰"
});

document.getElementById('profileClose').addEventListener('click', function() {
    const profileOverlay = document.getElementById('profileOverlay');
    const userProfileSection = document.getElementById('userProfileSection');
    
    // Hide profile section and overlay
    profileOverlay.style.display = 'none';
    userProfileSection.style.display = 'none';
    setActiveMenu("frontpageMenu");
});


document.getElementById("chatsMenu").addEventListener("click", handleChatsClick);
document.getElementById("chats").addEventListener("click", handleChatsClick);

function handleChatsClick() {
    // Get the profile overlay and burger menu elements
    const chatsOverlay = document.getElementById("chatsOverlay");
    const profileOverlay = document.getElementById("profileOverlay");
    const chatOverlay = document.getElementById("chatOverlay");
    const burgerMenu = document.getElementById("burgerMenu");
    const button = document.getElementById("hamburgerMenu");
    const matchOverlay = document.getElementById("specificMatchOverlay");
    const matchesOverlay = document.getElementById("matchesOverlay");

    // Show the chats overlay and hide others
    setActiveMenu("chatsMenu");
    chatsOverlay.style.display = "block"; // Show the chats overlay
    profileOverlay.style.display = "none"; // Hide the profile overlay
    chatOverlay.style.display = "none"; // Hide the chat overlay
    burgerMenu.style.display = "none"; // Hide the burger menu
    matchOverlay.style.display = "none";
    matchesOverlay.style.display = "none";
    button.innerHTML = '<img src="views/img/icons/burger-black.png" alt="Menu">'; // Reset burger menu button text
}


// Add an onclick function to the close button to hide the profile section and overlay
document.getElementById('chatsClose').addEventListener('click', function() {
    document.getElementById('chatsOverlay').style.display = 'none';
    setActiveMenu("frontpageMenu");
});


document.getElementById("matchesMenu").addEventListener("click", function() {
    const profileOverlay = document.getElementById("profileOverlay");
    const userProfileSection = document.getElementById("userProfileSection");
    const burgerMenu = document.getElementById("burgerMenu");
    const button = document.getElementById("hamburgerMenu");
    const chatOverlay = document.getElementById("chatOverlay");
    const chatsOverlay = document.getElementById("chatsOverlay");
    const matchOverlay = document.getElementById("specificMatchOverlay");
    const matchesOverlay = document.getElementById("matchesOverlay");
    
    // Show profile overlay and section, hide burger menu
    setActiveMenu("matchesMenu");
    matchesOverlay.style.display = "block";
    profileOverlay.style.display = "none";
    userProfileSection.style.display = "none"; // Ensure this is visible
    matchOverlay.style.display = "none";
    chatOverlay.style.display = "none";
    chatsOverlay.style.display = "none";
    burgerMenu.style.display = "none";
    button.innerHTML = '<img src="views/img/icons/burger-black.png" alt="Menu">'; // Change button text back to "☰"
});

document.getElementById('matchesClose').addEventListener('click', function() {
    const matchesOverlay = document.getElementById("matchesOverlay");
    // Hide profile section and overlay
    matchesOverlay.style.display = "none";
    setActiveMenu("frontpageMenu");
});


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// - - - -  ////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////







