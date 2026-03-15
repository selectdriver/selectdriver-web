// Reusable form handler with "Thank You" Popup
async function handleFormSubmit(event, type) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]') || document.getElementById('submit-btn');
    const btnText = submitBtn ? (submitBtn.querySelector('#btn-text') || submitBtn) : null;
    const feedbackEl = document.getElementById('form-feedback');

    // Helper to get field value
    const getValue = (name) => {
        const input = form.querySelector(`[name="${name}"]`);
        return input ? input.value.trim() : '';
    };

    // Honeypot check (anti-spam)
    const honeypot = getValue('website');
    if (honeypot) {
        showThankYouPopup(type, { fullName: getValue('fullName') || getValue('contactName') });
        form.reset();
        return;
    }

    // Math Captcha validation (if present)
    const captchaInput = form.querySelector('[name="captcha_answer"]');
    if (captchaInput) {
        const expected = parseInt(captchaInput.getAttribute('data-expected'));
        const actual = parseInt(captchaInput.value);
        if (actual !== expected) {
            showFeedback(feedbackEl, 'error', 'El resultado de la operación no es correcto.');
            return;
        }
    }

    // Collect data based on form type
    let formData = {
        source: window.location.pathname // REQ: Page source
    };

    if (type === 'companies') {
        formData = {
            ...formData,
            companyName: getValue('companyName'),
            contactName: getValue('contactName'),
            email: getValue('email'),
            phone: getValue('phone'),
            need: getValue('need'),
            message: getValue('message'),
            website: honeypot
        };
    } else if (type === 'drivers') {
        formData = {
            ...formData,
            fullName: getValue('fullName'),
            country: getValue('country'),
            email: getValue('email'),
            phone: getValue('phone'),
            experience: getValue('experience'),
            licensePriorSept2009: getValue('licensePriorSept2009'),
            licenseIssueDate: getValue('licenseIssueDate'),
            website: honeypot
        };
    } else if (type === 'contact') {
        formData = {
            ...formData,
            fullName: getValue('fullName'),
            email: getValue('email'),
            subject: getValue('subject'),
            message: getValue('message'),
            website: honeypot
        };
    }

    const originalBtnText = btnText ? (btnText.textContent || btnText.innerText) : 'Enviar';

    // Disable button and show loading state
    if (submitBtn) {
        submitBtn.disabled = true;
        if (btnText) btnText.textContent = 'Enviando...';
    }

    // Hide previous feedback
    if (feedbackEl) {
        feedbackEl.classList.add('hidden');
    }

    try {
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, data: formData })
        });

        const result = await response.json();

        if (response.ok) {
            form.reset();
            // Show successful popup
            showThankYouPopup(type, formData);
            // Refresh captcha if it exists
            if (typeof initMathCaptcha === 'function') initMathCaptcha();
        } else {
            console.error('Server error:', result);
            showFeedback(feedbackEl, 'error');
        }
    } catch (error) {
        console.error('Network error:', error);
        showFeedback(feedbackEl, 'network-error');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            if (btnText) btnText.textContent = originalBtnText;
        }
    }
}

function showThankYouPopup(type, data) {
    const name = data.fullName || data.contactName || 'Usuario';

    let title = '¡Gracias por contactar!';
    let message = 'Hemos recibido tu solicitud correctamente. Revisa tu correo electrónico para la confirmación de recepción.';
    let icon = 'fa-check-circle';
    let iconColor = 'text-blue-primary';
    let brandColor = 'bg-blue-primary';
    let btnColor = 'bg-blue-primary';

    // REQ: specific confirmation messages in Spanish
    if (type === 'drivers') {
        title = '¡Evaluación recibida!';
        message = `Hola <strong>${name}</strong>, hemos recibido tus datos. Revisaremos tu experiencia y te contactaremos por WhatsApp si tu perfil encaja. ¡Revisa tu email!`;
        icon = 'fa-id-card';
        iconColor = 'text-orange-action';
        brandColor = 'bg-orange-action';
        btnColor = 'bg-orange-action';
    } else if (type === 'companies') {
        title = 'Solicitud recibida';
        // REQ: expected next step / response timeframe (e.g., within 24 business hours)
        message = `Gracias <strong>${name}</strong>. Un consultor revisará las necesidades de <strong>${data.companyName}</strong> y se pondrá en contacto en un plazo máximo de **24 horas hábiles**. ¡Revisa tu email!`;
        icon = 'fa-building';
        iconColor = 'text-blue-primary';
        brandColor = 'bg-blue-primary';
        btnColor = 'bg-blue-primary';
    }

    // Create Modal Backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm';
    backdrop.id = 'thank-you-modal';

    // Modal Content
    backdrop.innerHTML = `
        <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100 opacity-100">
            <div class="${brandColor} h-2 w-full"></div>
            <div class="p-8 text-center">
                <div class="w-20 h-20 ${iconColor} bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fas ${icon} text-4xl"></i>
                </div>
                <h3 class="text-2xl font-bold text-gray-900 mb-4">${title}</h3>
                <p class="text-gray-600 leading-relaxed mb-8">
                    ${message.replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-primary">$1</strong>')}
                </p>
                <button onclick="closeThankYouPopup()" class="w-full ${btnColor} text-white font-bold py-4 rounded-xl hover:opacity-90 transition-all shadow-lg hover:shadow-xl active:scale-95">
                    Entendido
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(backdrop);
    document.body.style.overflow = 'hidden';
}

function closeThankYouPopup() {
    const modal = document.getElementById('thank-you-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

function showFeedback(el, state, customMsg = null) {
    if (!el) return;

    const messages = {
        'error': {
            bg: 'bg-red-50',
            border: 'border-red-200',
            icon: 'fas fa-exclamation-circle text-red-500',
            title: 'Error al enviar el mensaje',
            text: customMsg || 'Ha ocurrido un problema. Por favor, inténtelo de nuevo o contáctenos en <a href="mailto:info@selectdriver.es" class="underline font-medium">info@selectdriver.es</a>.'
        },
        'network-error': {
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            icon: 'fas fa-wifi text-yellow-500',
            title: 'Error de conexión',
            text: 'Compruebe su conexión a internet e inténtelo de nuevo.'
        }
    };

    const msg = messages[state] || messages['error'];
    el.classList.remove('hidden');
    el.className = `mb-6 rounded-xl p-5 border ${msg.bg} ${msg.border} block`;
    el.innerHTML = `
        <div class="flex items-start gap-3 text-left">
            <i class="${msg.icon} text-xl flex-shrink-0 mt-0.5"></i>
            <div>
                <p class="font-semibold text-gray-800 mb-1">${msg.title}</p>
                <p class="text-sm text-gray-600">${msg.text}</p>
            </div>
        </div>
    `;
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Simple Math Captcha Init
function initMathCaptcha() {
    const captchaContainers = document.querySelectorAll('.math-captcha-container');
    captchaContainers.forEach(container => {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        const operator = '+';
        const result = num1 + num2;

        container.innerHTML = `
            <div class="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <span class="text-sm font-bold text-gray-600">Seguridad: ¿Cuánto es ${num1} ${operator} ${num2}?</span>
                <input type="number" name="captcha_answer" required data-expected="${result}" 
                    class="w-20 px-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-primary focus:border-transparent outline-none text-center font-bold">
            </div>
        `;
    });
}

document.addEventListener('DOMContentLoaded', initMathCaptcha);
