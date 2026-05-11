document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    const yearElem = document.getElementById('year');
    if (yearElem) yearElem.textContent = new Date().getFullYear();

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Adjust for sticky header
                const headerOffset = 80;
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
    const langBtns = document.querySelectorAll('.lang-btn');
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

        // Update active class on buttons
        langBtns.forEach(btn => {
            if (btn.textContent.trim() === lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // Apply initial language
    applyLanguage(currentLang);

    // Add click events to language buttons
    langBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); // Just in case
            const selectedLang = e.target.textContent.trim();
            console.log('Language button clicked:', selectedLang);
            localStorage.setItem('selectedLanguage', selectedLang);
            applyLanguage(selectedLang);
        });
    });
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            // Toggle the 'active' class on both the button (for hamburger animation)
            // and the nav-links (to show the dropdown)
            mobileToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Optional: Close menu when a link is clicked
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }
});