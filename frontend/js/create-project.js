/**
 * Create Project Form JavaScript
 * Handles form validation, submission, and API integration
 */

const API_BASE = '/api';

// Form elements cache
const form = document.getElementById('createProjectForm');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const successText = document.getElementById('successText');
const errorText = document.getElementById('errorText');
const loadingOverlay = document.getElementById('loadingOverlay');

// Form field elements
const projectNameInput = document.getElementById('projectName');
const locationInput = document.getElementById('location');
const areaTypeSelect = document.getElementById('areaType');
const boundarySizeInput = document.getElementById('boundarySize');
const statusSelect = document.getElementById('status');

// Error element references
const errorElements = {
    name: document.getElementById('nameError'),
    location: document.getElementById('locationError'),
    area_type: document.getElementById('areaTypeError'),
    boundary_size: document.getElementById('boundarySizeError'),
    status: document.getElementById('statusError')
};

/**
 * Initialize form on page load
 */
document.addEventListener('DOMContentLoaded', () => {
    // Verify user is authenticated
    verifyAuthentication();
    
    // Attach form submit handler
    form.addEventListener('submit', handleFormSubmit);
    
    // Attach input change handlers for real-time validation
    projectNameInput.addEventListener('blur', () => validateField('name', projectNameInput.value));
    locationInput.addEventListener('blur', () => validateField('location', locationInput.value));
    areaTypeSelect.addEventListener('change', () => validateField('area_type', areaTypeSelect.value));
    boundarySizeInput.addEventListener('blur', () => validateField('boundary_size', boundarySizeInput.value));
    statusSelect.addEventListener('change', () => validateField('status', statusSelect.value));
});

/**
 * Verify user is authenticated and has engineer role
 */
async function verifyAuthentication() {
    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            // Not authenticated, redirect to login
            window.location.href = '/login.html';
            return;
        }

        const user = await response.json();
        
        // Verify engineer role
        if (user.role !== 'engineer') {
            alert('Access denied. Engineer role required.');
            window.location.href = '/engineer-dashboard.html';
            return;
        }

    } catch (error) {
        console.error('Authentication check error:', error);
        window.location.href = '/login.html';
    }
}

/**
 * Handle form submission
 */
async function handleFormSubmit(event) {
    event.preventDefault();
    
    // Clear previous messages
    hideMessages();
    
    // Validate all fields
    const isValid = validateForm();
    
    if (!isValid) {
        return;
    }
    
    // Show loading overlay
    showLoading(true);
    
    try {
        // Prepare request data
        const projectData = {
            name: projectNameInput.value.trim(),
            location: locationInput.value.trim(),
            area_type: areaTypeSelect.value,
            boundary_size: parseFloat(boundarySizeInput.value),
            status: statusSelect.value
        };
        
        // Send to API
        const response = await fetch(`${API_BASE}/projects/create`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(projectData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to create project');
        }
        
        const createdProject = await response.json();
        
        // Show success message
        showSuccess(`Project "${createdProject.name}" created successfully!`);
        
        // Reset form
        form.reset();
        
        // Redirect to dashboard after 1.5 seconds
        setTimeout(() => {
            window.location.href = '/engineer-dashboard.html';
        }, 1500);
        
    } catch (error) {
        console.error('Project creation error:', error);
        showError(error.message || 'An error occurred while creating the project. Please try again.');
        showLoading(false);
    }
}

/**
 * Validate entire form
 */
function validateForm() {
    const nameValid = validateField('name', projectNameInput.value);
    const locationValid = validateField('location', locationInput.value);
    const areaTypeValid = validateField('area_type', areaTypeSelect.value);
    const boundarySizeValid = validateField('boundary_size', boundarySizeInput.value);
    const statusValid = validateField('status', statusSelect.value);
    
    return nameValid && locationValid && areaTypeValid && boundarySizeValid && statusValid;
}

/**
 * Validate individual field
 */
function validateField(fieldName, value) {
    const errorElement = errorElements[fieldName];
    
    if (!errorElement) return true;
    
    let isValid = true;
    let errorMessage = '';
    
    switch (fieldName) {
        case 'name':
            if (!value || value.trim() === '') {
                isValid = false;
                errorMessage = 'Project name is required';
            } else if (value.trim().length > 255) {
                isValid = false;
                errorMessage = 'Project name must be less than 255 characters';
            }
            break;
            
        case 'location':
            if (!value || value.trim() === '') {
                isValid = false;
                errorMessage = 'Location is required';
            } else if (value.trim().length > 255) {
                isValid = false;
                errorMessage = 'Location must be less than 255 characters';
            }
            break;
            
        case 'area_type':
            const validTypes = ['construction', 'electrical', 'plumbing', 'hvac', 'landscaping', 'painting', 'roofing', 'demolition', 'other'];
            if (!value || !validTypes.includes(value)) {
                isValid = false;
                errorMessage = 'Please select a valid area type';
            }
            break;
            
        case 'boundary_size':
            const sizeValue = parseFloat(value);
            if (!value) {
                isValid = false;
                errorMessage = 'Boundary size is required';
            } else if (isNaN(sizeValue) || sizeValue <= 0) {
                isValid = false;
                errorMessage = 'Boundary size must be a positive number';
            }
            break;
            
        case 'status':
            const validStatuses = ['planned', 'active', 'on-hold', 'completed'];
            if (!value || !validStatuses.includes(value)) {
                isValid = false;
                errorMessage = 'Please select a valid status';
            }
            break;
    }
    
    // Update error display
    if (isValid) {
        errorElement.textContent = '';
        errorElement.classList.remove('show');
        
        // Remove error styling from input
        const inputElement = document.getElementById(fieldName === 'area_type' ? 'areaType' : 
                                                    fieldName === 'boundary_size' ? 'boundarySize' :
                                                    fieldName === 'name' ? 'projectName' : fieldName);
        if (inputElement) {
            inputElement.classList.remove('error');
        }
    } else {
        errorElement.textContent = errorMessage;
        errorElement.classList.add('show');
        
        // Add error styling to input
        const inputElement = document.getElementById(fieldName === 'area_type' ? 'areaType' : 
                                                    fieldName === 'boundary_size' ? 'boundarySize' :
                                                    fieldName === 'name' ? 'projectName' : fieldName);
        if (inputElement) {
            inputElement.classList.add('error');
        }
    }
    
    return isValid;
}

/**
 * Show success message
 */
function showSuccess(message) {
    successText.textContent = message;
    successMessage.style.display = 'flex';
    errorMessage.style.display = 'none';
}

/**
 * Show error message
 */
function showError(message) {
    errorText.textContent = message;
    errorMessage.style.display = 'flex';
    successMessage.style.display = 'none';
}

/**
 * Hide all messages
 */
function hideMessages() {
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';
}

/**
 * Show/hide loading overlay
 */
function showLoading(show) {
    if (show) {
        loadingOverlay.style.display = 'flex';
        form.style.opacity = '0.6';
        form.style.pointerEvents = 'none';
    } else {
        loadingOverlay.style.display = 'none';
        form.style.opacity = '1';
        form.style.pointerEvents = 'auto';
    }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
