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

    function validateField(field: HTMLInputElement | HTMLTextAreaElement): ValidationError | null {
        const value = field.value.trim();
        const fieldName = field.name;

        if (field.hasAttribute('required') && !value) {
            return {
                field: fieldName,
                message: `${getFieldDisplayName(fieldName)} is required`
            };
        }

        if (fieldName === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                return {
                    field: fieldName,
                    message: 'Please enter a valid email address'
                };
            }
        }

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

    modalContent.addEventListener('submit', (e) => {
        e.preventDefault();
        
        clearAllErrors();
        
        const errors = validateForm();
        
        if (errors.length > 0) {
            errors.forEach(error => {
                showFieldError(error.field, error.message);
            });

            const firstErrorField = modalContent.querySelector(`[name="${errors[0].field}"]`) as HTMLElement;
            firstErrorField?.focus();
            
            return;
        }

        const formData = new FormData(modalContent);
        const data: FormData = {
            firstName: formData.get('firstName') as string,
            lastName: formData.get('lastName') as string,
            email: formData.get('email') as string,
            message: formData.get('message') as string
        };

        const successMessage = `Thank you, ${data.firstName}! Your message has been submitted successfully.

We'll get back to you at ${data.email} as soon as possible.

Your message:
${data.message || 'No additional message provided'}`;

        alert(successMessage);
        
        const dialog = modalContent.closest('dialog') as HTMLDialogElement;
        if (dialog) {
            dialog.close();
        }
    });

    const { block, showModal } = await createModal({
        contentNodes: [modalContent],
    });
    
    document.body.appendChild(block);
    showModal();
    
    setTimeout(() => {
        const firstInput = modalContent.querySelector('#firstName') as HTMLInputElement;
        firstInput?.focus();
    }, 100);
}