document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const messageDiv = document.getElementById('message');

    function showMessage(msg, type) {
        messageDiv.textContent = msg;
        messageDiv.className = `message ${type}`;
        setTimeout(() => {
            messageDiv.textContent = '';
            messageDiv.className = 'message';
        }, 5000);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('regUsername').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;

            try {
                const res = await fetch('/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, email, password })
                });

                const data = await res.json();

                if (res.ok) {
                    showMessage(data.msg + " Redirecting to login...", 'success');
                    // Store token if needed, but for now redirect to login after successful registration
                    if (data.token) {
                        localStorage.setItem('token', data.token); // Still store token if provided by backend
                    }
                    setTimeout(() => {
                        window.location.href = '/login.html'; // Redirect to login page
                    }, 1500); // Wait 1.5 seconds before redirecting
                } else {
                    showMessage(data.msg || 'Registration failed', 'error');
                }
            } catch (err) {
                console.error('Error during registration:', err);
                showMessage('An unexpected error occurred.', 'error');
            }
        });
    }
});