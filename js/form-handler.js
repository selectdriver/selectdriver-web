// Reusable form handler with inline feedback (no alert popups)
async function handleFormSubmit(event, type) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = document.getElementById('submit-btn');
    const btnText = document.getElementById('btn-text');
    const feedbackEl = document.getElementById('form-feedback');

    // Helper to get field value
    const getValue = (name) => {
        const input = form.querySelector(`[name="${name}"]`);
        return input ? input.value.trim() : '';
    };

    // Honeypot check (anti-spam)
    const honeypot = getValue('website');
    if (honeypot) {
        // Bot detected — silently show success
        showFeedback(feedbackEl, 'success');
        form.reset();
        return;
    }

    // Collect data based on form type
    let formData = {};

    if (type === 'companies') {
        formData = {
            companyName: getValue('companyName'),
            contactName: getValue('contactName'),
            email: getValue('email'),
            phone: getValue('phone'),
            need: getValue('need'),
            message: getValue('message'),
            website: honeypot // pass honeypot value to server too
        };
    } else if (type === 'drivers') {
        formData = {
            fullName: getValue('fullName'),
            country: getValue('country'),
            email: getValue('email'),
            phone: getValue('phone'),
            experience: getValue('experience'),
            summary: getValue('summary'),
            website: honeypot
        };
    } else if (type === 'contact') {
        formData = {
            fullName: getValue('fullName'),
            email: getValue('email'),
            subject: getValue('subject'),
            message: getValue('message'),
            website: honeypot
        };
    }

    // Disable button and show loading state
    if (submitBtn) {
        submitBtn.disabled = true;
        if (btnText) btnText.textContent = 'Enviando...';
    }

    // Hide previous feedback
    if (feedbackEl) {
        feedbackEl.classList.remove('show');
    }

    try {
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, data: formData })
        });

        const result = await response.json();

        if (response.ok) {
            let successState = 'success';
            if (type === 'drivers') {
                successState = 'success-drivers';
            }
            showFeedback(feedbackEl, successState);
            form.reset();
            // Scroll feedback into view
            if (feedbackEl) {
                feedbackEl.classList.remove('hidden');
                feedbackEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
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
            if (btnText) btnText.textContent = 'Enviar Solicitud';
        }
    }
}

function showFeedback(el, state) {
    if (!el) return;

    const messages = {
        'success': {
            bg: 'bg-green-50',
            border: 'border-green-200',
            icon: 'fas fa-check-circle text-green-500',
            title: '¡Solicitud recibida correctamente!',
            text: 'Hemos recibido su solicitud. Un consultor se pondrá en contacto pronto.'
        },
        'success-drivers': {
            bg: 'bg-green-50',
            border: 'border-green-200',
            icon: 'fas fa-check-circle text-green-500',
            title: '¡Evaluación recibida!',
            text: 'Recibido. Revisaremos tu información y te contactaremos por WhatsApp con el siguiente paso.'
        },
        'error': {
            bg: 'bg-red-50',
            border: 'border-red-200',
            icon: 'fas fa-exclamation-circle text-red-500',
            title: 'Error al enviar el mensaje',
            text: 'Ha ocurrido un problema al procesar su solicitud. Por favor, inténtelo de nuevo o contáctenos directamente en <a href="mailto:info@selectdriver.es" class="underline font-medium">info@selectdriver.es</a>.'
        },
        'network-error': {
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            icon: 'fas fa-wifi text-yellow-500',
            title: 'Error de conexión',
            text: 'No se ha podido enviar el mensaje. Compruebe su conexión a internet e inténtelo de nuevo.'
        }
    };

    const msg = messages[state] || messages['error'];
    el.classList.remove('hidden');
    el.className = `mb-6 rounded-xl p-5 border ${msg.bg} ${msg.border} show`;
    el.innerHTML = `
        <div class="flex items-start gap-3">
            <i class="${msg.icon} text-xl flex-shrink-0 mt-0.5"></i>
            <div>
                <p class="font-semibold text-gray-800 mb-1">${msg.title}</p>
                <p class="text-sm text-gray-600">${msg.text}</p>
            </div>
        </div>
    `;
}
