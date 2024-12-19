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
    icebreakerDiv.innerHTML = selectedStrings.map(str => `<p>${str}</p>`).join('');
  }

  // Add event listener to the button
  document.getElementById('shuffleIcebreaker').addEventListener('click', shuffleAndDisplay);









