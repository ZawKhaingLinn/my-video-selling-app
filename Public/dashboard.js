document.addEventListener('DOMContentLoaded', async () => {
    const welcomeMessage = document.getElementById('welcomeMessage');
    const logoutButton = document.getElementById('logoutButton');
    const navItems = document.querySelectorAll('.dashboard-nav .nav-item');
    const contentSections = document.querySelectorAll('.content-section');

    // For Upload Form functionality (new)
    const contentTypeSelect = document.getElementById('contentType');
    const videoFileInputGroup = document.getElementById('videoFileInputGroup');
    const externalLinkInputGroup = document.getElementById('externalLinkInputGroup');
    const uploadForm = document.getElementById('uploadForm');
    const uploadMessageDiv = document.getElementById('uploadMessage');


    // --- Authentication Check ---
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = '/login.html'; // Redirect to login page
        return;
    }

    try {
        const res = await fetch('/api/auth/me', {
            method: 'GET',
            headers: {
                'x-auth-token': token
            }
        });

        const data = await res.json();

        if (res.ok) {
            welcomeMessage.textContent = `Welcome, ${data.username}!`; // Update welcome message
            // You can store full user data in a global variable if needed:
            // window.currentUser = data;
        } else {
            alert(data.msg || 'Authentication failed. Please login again.');
            localStorage.removeItem('token');
            window.location.href = '/login.html';
        }

    } catch (err) {
        console.error('Error fetching user data:', err);
        alert('An error occurred. Please try again.');
        localStorage.removeItem('token');
        window.location.href = '/login.html';
    }

    // --- Logout Functionality ---
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('token');
            alert('You have been logged out.');
            window.location.href = '/login.html';
        });
    }

    // --- Dashboard Navigation Logic (NEW) ---
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active to clicked nav item
            item.classList.add('active');

            // Hide all content sections
            contentSections.forEach(section => section.classList.remove('active'));

            // Show the corresponding section
            const targetSectionId = item.dataset.section;
            const targetSection = document.getElementById(targetSectionId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });

    // --- Upload Form Type Toggle (NEW) ---
    if (contentTypeSelect) {
        contentTypeSelect.addEventListener('change', () => {
            if (contentTypeSelect.value === 'video') {
                videoFileInputGroup.style.display = 'block';
                externalLinkInputGroup.style.display = 'none';
                externalLinkInputGroup.querySelector('input').removeAttribute('required'); // Remove required for hidden field
                videoFileInputGroup.querySelector('input').setAttribute('required', 'required'); // Add required for visible field
            } else {
                videoFileInputGroup.style.display = 'none';
                externalLinkInputGroup.style.display = 'block';
                videoFileInputGroup.querySelector('input').removeAttribute('required');
                externalLinkInputGroup.querySelector('input').setAttribute('required', 'required');
            }
        });
        // Set initial state based on default selection
        contentTypeSelect.dispatchEvent(new Event('change'));
    }

    // --- Placeholder for Upload Form Submission Logic (will be implemented next) ---
    if (uploadForm) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            uploadMessageDiv.className = 'message'; // Clear previous message styles
            uploadMessageDiv.textContent = 'Uploading...';
            uploadMessageDiv.style.display = 'block'; // Show "Uploading..." message

            // ** This is where the actual upload logic will go in the next step **
            // For now, simulate an upload
            console.log("Simulating upload...");
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
            uploadMessageDiv.textContent = 'Content upload simulated successfully! (Backend not yet implemented)';
            uploadMessageDiv.className = 'message success';
            uploadForm.reset(); // Clear form

            // You'll likely need to fetch content here and update the "My Videos" section
        });
    }
});