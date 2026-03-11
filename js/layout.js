document.addEventListener('DOMContentLoaded', () => {
    const headerPlaceholder = document.getElementById('header-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');

    const year = new Date().getFullYear();

    const headerContent = `
    <!-- Header fijo -->
    <header class="bg-white shadow-sm fixed w-full top-0 z-50 transition-all duration-300" id="main-header">
        <nav class="container mx-auto px-6 py-2">
            <div class="flex items-center justify-between">
                <!-- Logo -->
                <div class="flex items-center">
                    <a href="index.html" class="transition-transform hover:scale-105">
                        <img src="images/logo-selectdriver.png" alt="SelectDriver Logo" class="h-16 md:h-24 w-auto" style="image-rendering: -webkit-optimize-contrast; transform: translateZ(0);">
                    </a>
                </div>
                
                <!-- Navegación Desktop -->
                <div class="hidden md:flex space-x-8 items-center">
                    <a href="index.html" class="nav-link text-gray-700 hover:text-orange-action font-medium transition-colors relative group">
                        Inicio
                        <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-action transition-all group-hover:w-full"></span>
                    </a>
                    <a href="companies.html" class="nav-link text-gray-700 hover:text-orange-action font-medium transition-colors relative group">
                        Empresas
                        <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-action transition-all group-hover:w-full"></span>
                    </a>
                    <a href="drivers.html" class="nav-link text-gray-700 hover:text-orange-action font-medium transition-colors relative group">
                        Conductores
                        <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-action transition-all group-hover:w-full"></span>
                    </a>
                    <a href="process.html" class="nav-link text-gray-700 hover:text-orange-action font-medium transition-colors relative group">
                        Proceso
                        <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-action transition-all group-hover:w-full"></span>
                    </a>
                    <a href="guarantees.html" class="nav-link text-gray-700 hover:text-orange-action font-medium transition-colors relative group">
                        Garantías
                        <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-action transition-all group-hover:w-full"></span>
                    </a>
                    <a href="faq.html" class="nav-link text-gray-700 hover:text-orange-action font-medium transition-colors relative group">
                        FAQ
                        <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-action transition-all group-hover:w-full"></span>
                    </a>
                    <a href="contact.html" class="nav-link text-gray-700 hover:text-orange-action font-medium transition-colors relative group">
                        Contacto
                        <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-action transition-all group-hover:w-full"></span>
                    </a>
                </div>
                
                <!-- Language & CTA Desktop -->
                <div class="hidden md:flex items-center gap-4">
                    <div class="flex bg-gray-100 rounded-lg p-1 items-center notranslate" translate="no">
                        <button onclick="changeLanguage('es')" class="px-2 py-1 rounded text-xs font-bold text-gray-600 hover:bg-white hover:text-blue-primary transition-all">ES</button>
                        <span class="text-gray-400 text-xs font-bold mx-1">|</span>
                        <button onclick="changeLanguage('en')" class="px-2 py-1 rounded text-xs font-bold text-gray-600 hover:bg-white hover:text-blue-primary transition-all">EN</button>
                    </div>
                    <a href="contact.html" class="bg-orange-action text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-all hover:shadow-lg transform hover:-translate-y-0.5 font-bold">
                        Contactar
                    </a>
                </div>
                
                <!-- Hamburger Menu -->
                <button class="md:hidden text-gray-700 focus:outline-none" onclick="toggleMobileMenu()" aria-label="Menu">
                    <i class="fas fa-bars text-2xl"></i>
                </button>
            </div>
            
            <!-- Mobile Menu -->
            <div id="mobileMenu" class="hidden md:hidden mt-4 pb-4 bg-white rounded-lg shadow-inner absolute left-0 right-0 px-6 top-full border-t border-gray-100">
                <div class="flex flex-col space-y-4 py-4">
                    <a href="index.html" class="text-gray-700 hover:text-orange-action font-medium transition-colors">Inicio</a>
                    <a href="companies.html" class="text-gray-700 hover:text-orange-action font-medium transition-colors">Empresas</a>
                    <a href="drivers.html" class="text-gray-700 hover:text-orange-action font-medium transition-colors">Conductores</a>
                    <a href="process.html" class="text-gray-700 hover:text-orange-action font-medium transition-colors">Proceso</a>
                    <a href="guarantees.html" class="text-gray-700 hover:text-orange-action font-medium transition-colors">Garantías</a>
                    <a href="faq.html" class="text-gray-700 hover:text-orange-action font-medium transition-colors">FAQ</a>
                    <a href="contact.html" class="text-gray-700 hover:text-orange-action font-medium transition-colors bg-orange-50 p-2 rounded text-center text-orange-action font-bold">Contacto</a>
                </div>
            </div>
        </nav>
    </header>
    `;

    const footerContent = `
    <!-- Footer -->
    <footer class="bg-gray-900 text-white pt-16 pb-8">
        <div class="container mx-auto px-6">
            <div class="grid md:grid-cols-4 gap-12 mb-12">
                <!-- Logo y descripción -->
                <div class="md:col-span-2">
                    <div class="flex items-center space-x-3 mb-6">
                        <a href="index.html" class="transition-opacity hover:opacity-80">
                            <img src="images/logo-selectdriver.png" alt="SelectDriver Logo" class="h-32 w-auto" style="image-rendering: -webkit-optimize-contrast; transform: translateZ(0);">
                        </a>
                    </div>
                    <p class="text-gray-400 mb-6 leading-relaxed max-w-sm">
                        Conectamos empresas de transporte en España con conductores profesionales previamente seleccionados.<br>
                        <span class="text-gray-500 text-sm">SelectDriver &mdash; estabilidad operativa desde el inicio.</span>
                    </p>
                    <div class="space-y-2 text-gray-400 text-sm">
                        <p class="flex items-center"><i class="fas fa-envelope w-6 text-orange-action"></i> <a href="mailto:info@selectdriver.es" class="hover:text-orange-action transition-colors">info@selectdriver.es</a></p>
                        <p class="flex items-center"><i class="fas fa-phone w-6 text-orange-action"></i> <a href="tel:+34603293679" class="hover:text-orange-action transition-colors">+34 603293679</a></p>
                        <p class="flex items-center"><i class="fas fa-map-marker-alt w-6 text-orange-action"></i> Madrid, España (operativa remota)</p>
                    </div>
                </div>
                
                <!-- Enlaces Rápidos -->
                <div>
                    <h3 class="text-lg font-bold mb-6 text-white border-b-2 border-orange-action inline-block pb-1">Enlaces</h3>
                    <ul class="space-y-3">
                        <li><a href="companies.html" class="text-gray-400 hover:text-orange-action transition-colors">Para Empresas</a></li>
                        <li><a href="drivers.html" class="text-gray-400 hover:text-orange-action transition-colors">Para Conductores</a></li>
                        <li><a href="process.html" class="text-gray-400 hover:text-orange-action transition-colors">Nuestro Proceso</a></li>
                        <li><a href="contact.html" class="text-gray-400 hover:text-orange-action transition-colors">Contacto</a></li>
                    </ul>
                </div>
                
                <!-- Legal y Social -->
                <div>
                    <h3 class="text-lg font-bold mb-6 text-white border-b-2 border-orange-action inline-block pb-1">Legal</h3>
                    <ul class="space-y-3 mb-6">
                        <li><a href="legal-notice.html" class="text-gray-400 hover:text-orange-action transition-colors">Aviso Legal</a></li>
                        <li><a href="privacy-policy.html" class="text-gray-400 hover:text-orange-action transition-colors">Política de Privacidad</a></li>
                        <li><a href="cookies.html" class="text-gray-400 hover:text-orange-action transition-colors">Cookies</a></li>
                    </ul>
                    <div class="flex space-x-4">
                        <a href="https://www.linkedin.com/company/selectdriver-espana" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-blue-600 transition-colors transform hover:-translate-y-1" aria-label="LinkedIn">
                            <i class="fab fa-linkedin-in"></i>
                        </a>
                        <a href="https://www.facebook.com/SelectDriver" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-blue-600 transition-colors transform hover:-translate-y-1" aria-label="Facebook">
                            <i class="fab fa-facebook-f"></i>
                        </a>
                    </div>
                </div>
            </div>
            
            <div class="border-t border-gray-800 pt-8 text-center">
                <p class="text-gray-500 text-sm">
                    &copy; ${year} SelectDriver. Todos los derechos reservados.
                </p>
            </div>
        </div>
    </footer>
    `;

    if (headerPlaceholder) headerPlaceholder.innerHTML = headerContent;
    if (footerPlaceholder) footerPlaceholder.innerHTML = footerContent;

    // Highlight active link
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('text-orange-action', 'font-bold');
            link.classList.remove('text-gray-text');
        }
    });
});

function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('hidden');
}

// Google Translate Integration (Cookie Method)
window.googleTranslateElementInit = function () {
    new google.translate.TranslateElement({
        pageLanguage: 'es',
        includedLanguages: 'en,es',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
    }, 'google_translate_element');
};

(function () {
    // Create hidden div for google translate
    if (!document.getElementById('google_translate_element')) {
        var gtDiv = document.createElement('div');
        gtDiv.id = 'google_translate_element';
        gtDiv.style.display = 'none'; // Can be hidden with cookie method
        document.body.appendChild(gtDiv);
    }

    // Add styles to hide google bar
    var style = document.createElement('style');
    style.innerHTML = `
        .goog-te-banner-frame.skiptranslate { display: none !important; } 
        body { top: 0px !important; } 
        .goog-tooltip { display: none !important; }
        .goog-te-gadget { display: none !important; }
        .goog-text-highlight { background-color: transparent !important; box-shadow: none !important; }
    `;
    document.head.appendChild(style);

    // Inject script
    var googleTranslateScript = document.createElement('script');
    googleTranslateScript.type = 'text/javascript';
    googleTranslateScript.async = true;
    googleTranslateScript.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(googleTranslateScript);
})();

window.changeLanguage = function (lang) {
    // Cookie method: Set googtrans cookie and reload
    // Format: /FROM_LANG/TO_LANG
    // Domain should be root path

    // Clear existing cookies to avoid conflicts
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname;

    if (lang === 'en') {
        document.cookie = "googtrans=/es/en; path=/";
        document.cookie = "googtrans=/es/en; path=/; domain=" + window.location.hostname; // For subdomain coverage
    } else {
        // For Spanish (original), we just clear the cookie or set to /es/es
        document.cookie = "googtrans=/es/es; path=/";
        document.cookie = "googtrans=/es/es; path=/; domain=" + window.location.hostname;
    }

    window.location.reload();
};
