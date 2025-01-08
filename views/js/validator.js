// ##############################
// THIS VALIDATOR.JS IS DIRECTLY COPY-PASTE FROM ONE OF SANTIAGO'S CLASSES 

// ##############################

// Validation Function
// Purpose: Validate form input based on different criterias and handle validation-errors when occuring
// Potentially invoking a callback function upon successful validation (triggering af new function related to the validation)

function validate(callback) {

	// event.target = refers to the element that triggered the event (in this case the form)
	const form = event.target
	console.log(form)
	// const validate_error = "rgba(240, 130, 240, 0.2)"
	const validate_error = "rgba(191, 64, 191, 1)"

	// Foreach element with the "data-validate", remove the 'validate_error' and the pink-error-border
	form.querySelectorAll("[data-validate]").forEach(function (element) {
		element.classList.remove("validate_error")
		// element.style.backgroundColor = "rgba(60, 80, 100, 1)"
		// element.style.backgroundColor = "white"
		element.style.border = "none"
	})

	// Foreach element with the "data-validate", contains one of following switch-cases
	form.querySelectorAll("[data-validate]").forEach(function (element) {

		// Switch-case-statement: Validation depending on different cases with different criterias
		// In case of error, on any of them, 'validate-error' will be shown including a 'pink'-border on the certain input-field
		switch (element.getAttribute("data-validate")) {

			// Makes sure that the 'string' is set to have a min. and max. lenght of characters (fx. the user_name)
			case "str":
				if (element.value.length < parseInt(element.getAttribute("data-min")) ||
					element.value.length > parseInt(element.getAttribute("data-max"))
				) {
					element.classList.add("validate_error")
					// element.style.backgroundColor = validate_error
					element.style.border = `4px solid ${validate_error}`
				}
				break;
			
			// Makes sure that the 'string of numbers' is set to have a min. and max. lenght of numbers, away from certain special-characters
			case "int":
				if (! /^\d+$/.test(element.value) ||
					parseInt(element.value) < parseInt(element.getAttribute("data-min")) ||
					parseInt(element.value) > parseInt(element.getAttribute("data-max"))
				) {
					element.classList.add("validate_error")
					// element.style.backgroundColor = validate_error
					element.style.border = `4px solid ${validate_error}`
				}
				break;
			
			// Makes sure that the 'email' MUST contain lower_cased characters/numbers before and after a '@'
			case "email": // A regular expression specifically designed to match the pattern of email addresses
				let re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
				if (!re.test(element.value.toLowerCase())) {
					element.classList.add("validate_error")
					// element.style.backgroundColor = validate_error
					element.style.border = `4px solid ${validate_error}`
				}
				break;
			
			// Regular Expression (Regex): A sequence of characters that defines a search pattern (often used for string matches/manipulation)

			// Using 'Regex' to make sure that the value matches the given (defined) pattern – more flexiable for different patterns
			case "regex": // Often used to validate inputs against complex patterns (fx emails, phone-numbers, ...)
				var regex = new RegExp(element.getAttribute("data-regex"))
				// var regex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
				if (!regex.test(element.value)) {
					console.log(element.value)
					console.log("regex error")
					element.classList.add("validate_error")
					// element.style.backgroundColor = validate_error
					element.style.border = `4px solid ${validate_error}`
				}
				break;

			// Makes sure that a value matches with another value – usually a confirmation field (fx 'Confirm password', compared to 'Password')
			case "match": // Used for direct value comparisons
				if (element.value != form.querySelector(`[name='${element.getAttribute("data-match-name")}']`).value) {
					element.classList.add("validate_error")
					// element.style.backgroundColor = validate_error
					element.style.border = `4px solid ${validate_error}`
				}
				break;
		}
	})

	// I
	if (!form.querySelector(".validate_error")) { 
		callback(); 
		return 
	}
	
  form.querySelector(".validate_error").focus()

}

// ##############################
function clear_validate_error() {
	// event.target.classList.remove("validate_error")
	// event.target.value = ""
}