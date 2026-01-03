// Form Validation Module
class FormValidator {
    static validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    static validatePassword(password) {
        // Minimum 8 characters, at least one uppercase, one lowercase, one number
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return regex.test(password);
    }

    static validateName(name) {
        return name && name.trim().length >= 2;
    }

    static validateDate(date) {
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate >= today;
    }

    static validateTripData(data) {
        const errors = [];

        if (!data.name || data.name.trim().length < 3) {
            errors.push('Trip name must be at least 3 characters');
        }

        if (!data.startDate || !data.endDate) {
            errors.push('Please select start and end dates');
        } else {
            const start = new Date(data.startDate);
            const end = new Date(data.endDate);
            
            if (start > end) {
                errors.push('Start date must be before end date');
            }
        }

        return errors;
    }

    static showError(input, message) {
        const formGroup = input.closest('.form-group');
        let errorDiv = formGroup.querySelector('.field-error');
        
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'field-error error-message';
            formGroup.appendChild(errorDiv);
        }
        
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        input.style.borderColor = 'var(--error-color)';
    }

    static clearError(input) {
        const formGroup = input.closest('.form-group');
        const errorDiv = formGroup.querySelector('.field-error');
        
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
        
        input.style.borderColor = '';
    }

    static validateField(input) {
        const type = input.type;
        const value = input.value.trim();
        
        this.clearError(input);
        
        if (input.required && !value) {
            this.showError(input, 'This field is required');
            return false;
        }
        
        switch(type) {
            case 'email':
                if (!this.validateEmail(value)) {
                    this.showError(input, 'Please enter a valid email address');
                    return false;
                }
                break;
                
            case 'password':
                if (!this.validatePassword(value)) {
                    this.showError(input, 'Password must be at least 8 characters with uppercase, lowercase, and number');
                    return false;
                }
                break;
                
            case 'text':
                if (input.id === 'name' && !this.validateName(value)) {
                    this.showError(input, 'Name must be at least 2 characters');
                    return false;
                }
                break;
        }
        
        return true;
    }
}

// Real-time form validation
document.addEventListener('DOMContentLoaded', function() {
    // Add input validation listeners
    document.querySelectorAll('input[required]').forEach(input => {
        input.addEventListener('blur', function() {
            FormValidator.validateField(this);
        });
        
        input.addEventListener('input', function() {
            FormValidator.clearError(this);
        });
    });
});

// Export for use in other modules
window.FormValidator = FormValidator;