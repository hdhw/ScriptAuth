// Utility function to show error message
function showError(form, message) {
  // Remove any existing error messages
  const existingError = form.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }

  // Create and show new error message
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message text-red-500 text-sm mt-2';
  errorElement.textContent = message;
  
  // Insert after the last form element
  const submitButton = form.querySelector('button[type="submit"]');
  form.insertBefore(errorElement, submitButton ? submitButton.nextSibling : null);
  
  // Add shake animation to the form
  form.classList.add('animate-shake');
  setTimeout(() => form.classList.remove('animate-shake'), 500);
}

// Handle form submission
async function handleAuthFormSubmit(event, endpoint) {
  event.preventDefault();
  
  const form = event.target;
  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.innerHTML;
  
  // Check if this is a registration form and validate password match
  if (endpoint === 'register') {
    const password = form.querySelector('#password').value;
    const confirmPassword = form.querySelector('#confirmPassword').value;
    
    if (password !== confirmPassword) {
      showError(form, 'Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      showError(form, 'Password must be at least 6 characters');
      return;
    }
  }
  
  try {
    // Show loading state
    submitButton.disabled = true;
    submitButton.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      ${endpoint === 'login' ? 'Signing in...' : 'Creating account...'}
    `;
    
    const formData = new FormData(form);
    const response = await fetch(`/api/auth/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(Object.fromEntries(formData)),
      credentials: 'same-origin'
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }
    
    // Redirect on success
    if (data.redirect) {
      window.location.href = data.redirect;
    }
    
  } catch (error) {
    showError(form, error.message || 'An error occurred. Please try again.');
  } finally {
    // Reset button state
    submitButton.disabled = false;
    submitButton.innerHTML = originalButtonText;
  }
}

// Initialize auth forms when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => handleAuthFormSubmit(e, 'login'));
  }
  
  // Register form
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => handleAuthFormSubmit(e, 'register'));
  }
  
  // Logout button
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      try {
        await fetch('/', {
          method: 'POST',
          credentials: 'same-origin'
        });
        window.location.href = '/login';
      } catch (error) {
        console.error('Logout failed:', error);
      }
    });
  }
});
