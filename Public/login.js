document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');

    function showMessage(msg, type) {
        messageDiv.textContent = msg;
        messageDiv.className = `message ${type}`;
        setTimeout(() => {
            messageDiv.textContent = '';
            messageDiv.className = 'message';
        }, 5000);
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();

                if (res.ok) {
                    showMessage(data.msg + " Redirecting to dashboard...", 'success');
                    if (data.token) {
                        localStorage.setItem('token', data.token);
                        console.log('Logged in:', data.token);
                        setTimeout(() => {
                            window.location.href = '/dashboard.html'; // Redirect to dashboard after successful login
                        }, 1500); // Wait 1.5 seconds before redirecting
                    }
                } else {
                    showMessage(data.msg || 'Login failed', 'error');
                }
            } catch (err) {
                console.error('Error during login:', err);
                showMessage('An unexpected error occurred.', 'error');
            }
        });
    }
});