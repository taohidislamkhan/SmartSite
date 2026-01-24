/**
 * Common JavaScript for all pages
 * Handles:
 * - User authentication and header initialization
 * - Logout functionality
 * - Shared utilities
 */

const API_BASE = '/api';
let currentUser = null;

// Immediate test to prove JavaScript is running
console.log('=== common.js LOADED ===');
console.log('Time:', new Date().toLocaleTimeString());

/**
 * Show debug notification on page
 */
function showDebugNotification(message, duration = 5000) {
    const notification = document.getElementById('debugNotification');
    if (notification) {
        notification.textContent = message;
        notification.style.display = 'block';
        console.log('[DEBUG NOTIFICATION]', message);
        
        if (duration > 0) {
            setTimeout(() => {
                notification.style.display = 'none';
            }, duration);
        }
    } else {
        console.warn('debugNotification element not found on this page');
    }
}

/**
 * Load current user information from /api/auth/me
 */
async function loadCurrentUser() {
    try {
        console.log('=== loadCurrentUser START ===');
        console.log('Loading current user from', `${API_BASE}/auth/me`);
        
        const response = await fetch(`${API_BASE}/auth/me`, {
            method: 'GET',
            credentials: 'include'
        });

        console.log('Auth response received. Status:', response.status, 'StatusText:', response.statusText);

        if (!response.ok) {
            console.log('User not authenticated. Response status:', response.status);
            const errorText = await response.text();
            console.log('Error response:', errorText);
            showDebugNotification(`NOT LOGGED IN: ${response.status} ${response.statusText}. Please login first.`);
            return null;
        }

        currentUser = await response.json();
        console.log('=== Current user loaded ===');
        console.log('User ID:', currentUser.user_id);
        console.log('Email:', currentUser.email);
        console.log('Role:', currentUser.role);
        console.log('Engineer ID:', currentUser.engineer_id);
        console.log('Engineer Name:', currentUser.engineer_name);
        return currentUser;
    } catch (error) {
        console.error('=== Error loading current user ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        showDebugNotification(`ERROR LOADING USER: ${error.message}`);
        return null;
    }
}

/**
 * Update header with engineer name
 */
function updateHeaderWithUserInfo() {
    if (!currentUser) return;
    
    const nameElement = document.getElementById('engineerName');
    if (nameElement) {
        let displayName;
        
        // If engineer and has engineer_first_name, use that
        if (currentUser.role === 'engineer' && currentUser.engineer_first_name) {
            displayName = currentUser.engineer_first_name;
        } else if (currentUser.role === 'engineer' && currentUser.engineer_name) {
            // Use full engineer name if available
            displayName = currentUser.engineer_name;
        } else {
            // Fallback to email prefix
            displayName = currentUser.email.split('@')[0];
            displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
        }
        
        nameElement.textContent = displayName;
    }
}

/**
 * Handle logout
 */
function handleLogout(event) {
    console.log('=== handleLogout called ===');
    // Prevent default button behavior
    if (event) {
        console.log('Preventing default button behavior');
        event.preventDefault();
    }
    
    // Call the async logout
    performLogout();
}

/**
 * Perform the actual logout request
 */
async function performLogout() {
    console.log('=== performLogout START ===');
    try {
        console.log('Making POST request to /api/auth/logout');
        const response = await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });

        console.log('Response status:', response.status);

        // Regardless of response, redirect to login
        console.log('Redirecting to login.html');
        window.location.href = '/login.html';
        
    } catch (error) {
        console.error('Logout error:', error);
        // Still redirect even if there's an error
        window.location.href = '/login.html';
    }
}

/**
 * Initialize common page elements (header, logout)
 */
async function initializePageHeader() {
    try {
        console.log('=== initializePageHeader START ===');
        console.log('Initializing page header...');
        
        // Use existing currentUser if already loaded, don't reload
        // This prevents double authentication checks
        if (!currentUser) {
            console.log('Loading current user for header...');
            await loadCurrentUser();
        }

        // If still no user, just update UI - don't redirect (let calling page handle it)
        if (!currentUser) {
            console.log('No user available for header - UI will not be updated');
            return false;
        }

        console.log('User authenticated:', currentUser.email, 'Role:', currentUser.role);

        // Update header with user name
        console.log('Updating header with user info...');
        updateHeaderWithUserInfo();

        // Set up logout button
        console.log('Setting up logout button...');
        const logoutBtn = document.getElementById('logoutBtn');
        console.log('Logout button element found:', !!logoutBtn);
        
        if (logoutBtn) {
            console.log('Attaching click listener to logout button');
            // Using both onclick attribute and addEventListener for maximum compatibility
            logoutBtn.onclick = function(e) {
                console.log('Logout button onclick fired!');
                handleLogout(e);
                return false;
            };
            logoutBtn.addEventListener('click', function(e) {
                console.log('Logout button addEventListener fired!');
                handleLogout(e);
            });
            console.log('Logout button listeners attached successfully');
        } else {
            console.warn('Logout button with id="logoutBtn" not found on page');
        }

        console.log('=== initializePageHeader COMPLETE ===');
        return true;
    } catch (error) {
        console.error('Page header initialization error:', error);
        console.error('Error stack:', error.stack);
        return false;
    }
}

/**
 * Escape HTML characters
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Format currency values
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value);
}

/**
 * Format date values
 */
function formatDate(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Test function for debugging (call from browser console)
 */
function debugTest() {
    console.log('=== DEBUG TEST ===');
    console.log('currentUser:', currentUser);
    const logoutBtn = document.getElementById('logoutBtn');
    console.log('Logout button exists:', !!logoutBtn);
    if (logoutBtn) {
        console.log('Button text:', logoutBtn.textContent);
        console.log('Button classList:', logoutBtn.classList);
        console.log('Button onclick:', logoutBtn.onclick);
    }
    showDebugNotification('DEBUG: Check console for details');
}

/**
 * Initialize on DOMContentLoaded
 * Note: Each page can call initializePageHeader() explicitly or rely on this auto-initialization
 */
// Removed auto-initialization to avoid conflicts with page-specific initialization
// document.addEventListener('DOMContentLoaded', () => {
//     initializePageHeader();
// });
