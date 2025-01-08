window.addEventListener('load', async function () {
    try {
        // Fetch the available interests from the server
        const interestUrl = 'https://toriando19.github.io/database/json-data/interests.json' || 'http://localhost:3000/interests';
        const interestResponse = await fetch(interestUrl);

        if (!interestResponse.ok) {
            throw new Error('Failed to fetch interests');
        }

        // Check if the response is empty before parsing
        const interestText = await interestResponse.text();
        const interests = interestText ? JSON.parse(interestText) : [];

        // Get the current session data
        const sessionData = JSON.parse(sessionStorage.getItem('sessionData'));
        if (!sessionData) {
            throw new Error('No session data found');
        }

        // Track initial states of checkboxes to detect changes
        const initialStates = {};
        const checkboxes = document.querySelectorAll('.user-profile input[type="checkbox"]');

        checkboxes.forEach(checkbox => {
            initialStates[checkbox.id] = checkbox.checked;
        });

        // Function to update checkboxes based on the session data
        const updateCheckboxes = () => {
            checkboxes.forEach(checkbox => {
                const interestId = checkbox.getAttribute('data-interest-id');
                const isUserInterested = sessionData.user_interest.some(
                    userInterest =>
                        userInterest.user_interest_interest == interestId &&
                        userInterest.user_interest_user == sessionData.user_id
                );
                checkbox.checked = isUserInterested;
                initialStates[checkbox.id] = checkbox.checked; // Update initial state to match the session data
            });
        };

        // Initial rendering of checkboxes
        updateCheckboxes();

        // Create and append the submit button
        const submitButton = document.createElement('button');
        submitButton.classList.add('submit-interest');
        submitButton.type = 'submit';
        submitButton.textContent = 'Submit Changes';
        submitButton.disabled = true;  // Disable initially
        const interestForm = document.getElementById('interestForm');
        interestForm.appendChild(submitButton);

        // Monitor checkbox changes and enable/disable the submit button
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                let changesMade = false;

                // Check if any checkbox has changed by comparing current state with initial state
                checkboxes.forEach(checkbox => {
                    if (checkbox.checked !== initialStates[checkbox.id]) {
                        changesMade = true;
                    }
                });

                // Enable or disable the submit button based on whether there are changes
                submitButton.disabled = !changesMade;
            });
        });

        // Handle form submission
        interestForm.addEventListener('submit', async function (event) {
            event.preventDefault(); // Prevent default form submission

            // Prepare data for additions and removals
            const additions = [];
            const removals = [];

            checkboxes.forEach(checkbox => {
                const interestId = checkbox.getAttribute('data-interest-id');
                const isChecked = checkbox.checked;

                const isCurrentlyInSession = sessionData.user_interest.some(
                    userInterest =>
                        userInterest.user_interest_interest == interestId &&
                        userInterest.user_interest_user == sessionData.user_id
                );

                if (isChecked && !isCurrentlyInSession) {
                    additions.push({ userId: sessionData.user_id, interestId });
                } else if (!isChecked && isCurrentlyInSession) {
                    removals.push({ userId: sessionData.user_id, interestId });
                }
            });

            // Execute additions
            for (const addition of additions) {
                await addUserInterest(addition.userId, addition.interestId);
            }

            // Execute removals
            for (const removal of removals) {
                await removeUserInterest(removal.userId, removal.interestId);
            }

            // Update sessionData and sessionStorage
            additions.forEach(addition => {
                sessionData.user_interest.push({
                    user_interest_user: addition.userId,
                    user_interest_interest: addition.interestId
                });
            });

            removals.forEach(removal => {
                sessionData.user_interest = sessionData.user_interest.filter(
                    userInterest => userInterest.user_interest_interest != removal.interestId
                );
            });

            sessionStorage.setItem('sessionData', JSON.stringify(sessionData));

            // Update the checkboxes based on the new data
            updateCheckboxes();

            // Reset initialStates after submission
            checkboxes.forEach(checkbox => {
                initialStates[checkbox.id] = checkbox.checked;
            });

            // Disable the submit button again after submission if no changes
            submitButton.disabled = true;

            // Alert the user that changes have been saved
            alert('Changes have been successfully saved!');
        });

        // Function to add user interest by making a request
        async function addUserInterest(userId, interestId) {
            const response = await fetch(`${interestUrl}?user_interest_user=${userId}&user_interest_interest=${interestId}`, {
                method: 'GET'
            });
            if (!response.ok) {
                throw new Error(`Failed to add interest for user ${userId} and interest ${interestId}`);
            }
        }

        // Function to remove user interest by making a request
        async function removeUserInterest(userId, interestId) {
            const response = await fetch(`${interestUrl}?user_interest_user=${userId}&user_interest_interest=${interestId}`, {
                method: 'GET'
            });
            if (!response.ok) {
                throw new Error(`Failed to remove interest for user ${userId} and interest ${interestId}`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while loading the interests. Please try again.');
    }
});

document.querySelectorAll('#interestForm .toggleSwitch').forEach(toggle => {
    toggle.addEventListener('click', function () {
        const checkbox = this.previousElementSibling;
        checkbox.checked = !checkbox.checked; // Toggle the checkbox state
        console.log(`${checkbox.id} is now ${checkbox.checked ? 'checked' : 'unchecked'}`);

        // Trigger the change event to enable/disable the submit button
        checkbox.dispatchEvent(new Event('change'));
    });
});
