document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signup-form');

    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent form submission from reloading the page

        const user = {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
            email: document.getElementById('email').value,
            firstname: document.getElementById('firstName').value,
            lastname: document.getElementById('lastName').value,
            address: document.getElementById('address').value
        };

        // Perform AJAX request to submit registration form
        fetch('/registerUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error('Network response was not ok: ' + err.message);
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alert('Registration successful! You can now log in.');
                window.location.href = '/login';
            } else {
                alert('Registration failed: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error.message);
            alert('An error occurred: ' + error.message);
        });
    });
});
