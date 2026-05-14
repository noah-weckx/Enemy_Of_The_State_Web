document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    const yearElem = document.getElementById('year');
    if (yearElem) yearElem.textContent = new Date().getFullYear();

    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Adjust for sticky header
                const headerOffset = 90;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Language Switching Logic
    const langSelects = document.querySelectorAll('.lang-select');
    const defaultLang = 'EN';
    let currentLang = localStorage.getItem('selectedLanguage') || defaultLang;

    function applyLanguage(lang) {
        if (!window.translations || !window.translations[lang]) {
            console.error('Translations not found for language:', lang);
            return;
        }

        console.log('Applying language:', lang);

        // Update text nodes with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (window.translations[lang][key]) {
                el.textContent = window.translations[lang][key];
            }
        });

        // Update select values
        langSelects.forEach(select => {
            select.value = lang;
        });
    }

    // Apply initial language
    applyLanguage(currentLang);

    // Add change events to language selectors
    langSelects.forEach(select => {
        select.addEventListener('change', (e) => {
            const selectedLang = e.target.value;
            console.log('Language selected:', selectedLang);
            localStorage.setItem('selectedLanguage', selectedLang);
            applyLanguage(selectedLang);
        });
    });

});