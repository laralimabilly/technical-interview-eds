import { createModal } from '../modal/modal.ts';

interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    message: string;
}

interface ValidationError {
    field: string;
    message: string;
}

export async function renderAccordionModal() {
    const modalContent = document.createElement('form');
    modalContent.classList.add('contact-us-modal');
    modalContent.innerHTML = `
        <h2>Contact Us</h2>
        <div class="form-container">
            <div class="form-group">
                <label for="firstName">First Name: <span class="required" aria-label="required">*</span></label>
                <input type="text" id="firstName" name="firstName" required aria-describedby="firstName-error">
                <div class="error-message" id="firstName-error" role="alert" aria-live="polite"></div>
            </div>
            <div class="form-group">
                <label for="lastName">Last Name: <span class="required" aria-label="required">*</span></label>
                <input type="text" id="lastName" name="lastName" required aria-describedby="lastName-error">
                <div class="error-message" id="lastName-error" role="alert" aria-live="polite"></div>
            </div>
            <div class="form-group">
                <label for="email">Email: <span class="required" aria-label="required">*</span></label>
                <input type="email" id="email" name="email" required aria-describedby="email-error">
                <div class="error-message" id="email-error" role="alert" aria-live="polite"></div>
            </div>
            <div class="form-group">
                <label for="message">Message:</label>
                <textarea id="message" name="message" rows="4" aria-describedby="message-help" placeholder="Please share your question or comment..."></textarea>
                <div class="help-text" id="message-help">Optional: Tell us how we can help you</div>
            </div>
            <div class="form-actions">
                <button class="button secondary" type="submit">Submit</button>
            </div>
        </div>
    `;

    // Form validation functions
    function validateField(field: HTMLInputElement | HTMLTextAreaElement): ValidationError | null {
        const value = field.value.trim();
        const fieldName = field.name;

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            return {
                field: fieldName,
                message: `${getFieldDisplayName(fieldName)} is required`
            };
        }

        // Email specific validation
        if (fieldName === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                return {
                    field: fieldName,
                    message: 'Please enter a valid email address'
                };
            }
        }

        // Name field validation (no numbers or special characters)
        if ((fieldName === 'firstName' || fieldName === 'lastName') && value) {
            const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
            if (!nameRegex.test(value)) {
                return {
                    field: fieldName,
                    message: `${getFieldDisplayName(fieldName)} should only contain letters, spaces, hyphens, and apostrophes`
                };
            }
            if (value.length < 2) {
                return {
                    field: fieldName,
                    message: `${getFieldDisplayName(fieldName)} must be at least 2 characters long`
                };
            }
        }

        return null;
    }

    function getFieldDisplayName(fieldName: string): string {
        const displayNames: { [key: string]: string } = {
            firstName: 'First name',
            lastName: 'Last name',
            email: 'Email',
            message: 'Message'
        };
        return displayNames[fieldName] || fieldName;
    }

    function showFieldError(fieldName: string, message: string) {
        const errorElement = modalContent.querySelector(`#${fieldName}-error`) as HTMLElement;
        const inputElement = modalContent.querySelector(`[name="${fieldName}"]`) as HTMLElement;
        const formGroup = inputElement?.closest('.form-group') as HTMLElement;

        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        
        if (formGroup) {
            formGroup.classList.add('has-error');
        }
        
        if (inputElement) {
            inputElement.setAttribute('aria-invalid', 'true');
        }
    }

    function clearFieldError(fieldName: string) {
        const errorElement = modalContent.querySelector(`#${fieldName}-error`) as HTMLElement;
        const inputElement = modalContent.querySelector(`[name="${fieldName}"]`) as HTMLElement;
        const formGroup = inputElement?.closest('.form-group') as HTMLElement;

        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        
        if (formGroup) {
            formGroup.classList.remove('has-error');
        }
        
        if (inputElement) {
            inputElement.setAttribute('aria-invalid', 'false');
        }
    }

    function clearAllErrors() {
        const errorElements = modalContent.querySelectorAll('.error-message');
        const formGroups = modalContent.querySelectorAll('.form-group');
        const inputs = modalContent.querySelectorAll('input, textarea');

        errorElements.forEach(el => {
            (el as HTMLElement).textContent = '';
            (el as HTMLElement).style.display = 'none';
        });

        formGroups.forEach(group => {
            group.classList.remove('has-error');
        });

        inputs.forEach(input => {
            input.setAttribute('aria-invalid', 'false');
        });
    }

    function validateForm(): ValidationError[] {
        const errors: ValidationError[] = [];
        const fields = modalContent.querySelectorAll('input, textarea') as NodeListOf<HTMLInputElement | HTMLTextAreaElement>;

        fields.forEach(field => {
            const error = validateField(field);
            if (error) {
                errors.push(error);
            }
        });

        return errors;
    }

    // Add real-time validation
    const inputs = modalContent.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            const error = validateField(input as HTMLInputElement | HTMLTextAreaElement);
            if (error) {
                showFieldError(error.field, error.message);
            } else {
                clearFieldError(input.getAttribute('name') || '');
            }
        });

        input.addEventListener('input', () => {
            // Clear error on input if field was previously invalid
            const fieldName = input.getAttribute('name') || '';
            const formGroup = input.closest('.form-group');
            if (formGroup?.classList.contains('has-error')) {
                const error = validateField(input as HTMLInputElement | HTMLTextAreaElement);
                if (!error) {
                    clearFieldError(fieldName);
                }
            }
        });
    });

    // Form submission handler
    modalContent.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Clear previous errors
        clearAllErrors();
        
        // Validate form
        const errors = validateForm();
        
        if (errors.length > 0) {
            // Show errors
            errors.forEach(error => {
                showFieldError(error.field, error.message);
            });
            
            // Focus first error field
            const firstErrorField = modalContent.querySelector(`[name="${errors[0].field}"]`) as HTMLElement;
            firstErrorField?.focus();
            
            return;
        }

        // Form is valid, process submission
        const formData = new FormData(modalContent);
        const data: FormData = {
            firstName: formData.get('firstName') as string,
            lastName: formData.get('lastName') as string,
            email: formData.get('email') as string,
            message: formData.get('message') as string
        };

        // Show success message
        const successMessage = `Thank you, ${data.firstName}! Your message has been submitted successfully.

We'll get back to you at ${data.email} as soon as possible.

Your message:
${data.message || 'No additional message provided'}`;

        alert(successMessage);
        
        // Close modal after successful submission
        const dialog = modalContent.closest('dialog') as HTMLDialogElement;
        if (dialog) {
            dialog.close();
        }
    });

    // Create and show modal
    const { block, showModal } = await createModal({
        contentNodes: [modalContent],
    });
    
    document.body.appendChild(block);
    showModal();
    
    // Focus first input when modal opens
    setTimeout(() => {
        const firstInput = modalContent.querySelector('#firstName') as HTMLInputElement;
        firstInput?.focus();
    }, 100);
}