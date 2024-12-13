document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    const otpSection = document.getElementById('otp-section');
    const verifyOtpButton = document.getElementById('verify-otp-button');
    const forgotPasswordLink = document.getElementById('forgot-password');  // Forgot Password link
    const forgotPasswordForm = document.getElementById('forgot-password-form');  // Forgot Password form
    const forgotPasswordSubmitButton = document.getElementById('forgot-password-submit');
    const forgotPasswordOtpSection = document.getElementById('forgot-password-otp-section'); // Forgot Password OTP section
    const forgotPasswordVerifyOtpButton = document.getElementById('forgot-password-verify-otp-button'); // Forgot Password Verify OTP button
    const resetPasswordSection = document.getElementById('reset-password-section'); // Reset Password section
    const resetPasswordSubmitButton = document.getElementById('reset-password-submit'); // Reset Password button

	if (form) {
	    form.addEventListener('submit', (event) => {
	        event.preventDefault(); // Prevent default form submission

	        const email = document.getElementById('email').value;
	        const password = document.getElementById('password').value;

	        fetch('/loginUser', {
	            method: 'POST',
	            headers: {
	                'Content-Type': 'application/json',
	            },
	            body: JSON.stringify({ email: email, password: password }),
	       credentials: 'include' // Ensure cookies are sent
	        })
	        .then(response => response.json())
	        .then(data => {
	            console.log('Backend Response:', data); // Log the response to verify

	            const messageElement = document.getElementById('message');
	            if (data.success) {
	                messageElement.textContent = data.message; // Display success message
	                messageElement.style.color = 'green';
	 
	                     // Show OTP section and hide login form if otpSection exists
	                    

						
						           setTimeout(() => {
						               // Replace with your desired URL
									   if (otpSection) 
										{
	                        otpSection.style.display = 'block';
								form.style.display = 'none';
				   	                    }
									   
									   
						           }, 2000); // 2000 milliseconds = 2 seconds
						


	            } else {
	                messageElement.textContent = data.message || 'Login failed.'; // Display error message
	                messageElement.style.color = 'red';
	            }
	        })
	        .catch(error => {
	            console.error('Error occurred:', error.message);
	            const messageElement = document.getElementById('message');
	            messageElement.textContent = 'An error occurred: ' + error.message;
	            messageElement.style.color = 'red';
	        });
	    });
	}


    if (verifyOtpButton && otpSection) {
        verifyOtpButton.addEventListener('click', () => {
            const email = document.getElementById('email').value;
            const otp = document.getElementById('otp').value;

            fetch('/verifyOtp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email, otp: otp }),
                credentials: 'include' // Ensure cookies are sent
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = '/dashboard'; // Ensure this redirect is correct
                } else {
                    alert(data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while verifying the OTP. Please try again.');
            });
        });
    }

    // Handle Forgot Password form submission
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default behavior of the link

            // Show the forgot password form
            forgotPasswordForm.style.display = 'block';
            form.style.display = 'none'; // Hide the login form
        });
    }

    // Submit Forgot Password email
    if (forgotPasswordSubmitButton) {
        forgotPasswordSubmitButton.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent form submission from reloading the page

            const email = document.getElementById('forgot-email').value;

            fetch('/forgotPassword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email }),
                credentials: 'include' // Ensure cookies are sent
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    alert(data.message);
                    // Show OTP section to verify OTP for password reset
                    forgotPasswordOtpSection.style.display = 'block';
                    forgotPasswordForm.style.display = 'none';
                } else {
                    alert(data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while requesting the OTP. Please try again.');
            });
        });
    }

    // Verify Password Reset OTP for forgot password
    if (forgotPasswordVerifyOtpButton && forgotPasswordOtpSection) {
        forgotPasswordVerifyOtpButton.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent form submission from reloading the page

            const email = document.getElementById('forgot-email').value;
            const otp = document.getElementById('forgot-password-otp').value;

            fetch('/verifyPasswordResetOtp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email, otp: otp }),
                credentials: 'include' // Ensure cookies are sent
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Show reset password section to reset password
                    resetPasswordSection.style.display = 'block';
                    forgotPasswordOtpSection.style.display = 'none';
                } else {
                    alert(data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while verifying the OTP. Please try again.');
            });
        });
    }

    // Reset password after OTP verification
    if (resetPasswordSubmitButton) {
        resetPasswordSubmitButton.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent form submission from reloading the page

            const newPassword = document.getElementById('new-password').value;

            fetch('/resetPassword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ newPassword: newPassword }),
                credentials: 'include' // Ensure cookies are sent
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Password reset successful. Please log in with your new password.');
                    window.location.href = '/login'; // Redirect to login page
                } else {
                    alert(data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while resetting the password. Please try again.');
            });
        });
    }
});
