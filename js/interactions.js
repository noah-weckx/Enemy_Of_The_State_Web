/**
 * Premium Tech/SaaS Interactions
 * Handles Scroll Reveal, Magnetic Buttons, Custom Cursor, and Parallax
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Custom Cursor
    const cursorDot = document.getElementById('cursor-dot');
    
    if (cursorDot && window.matchMedia("(pointer: fine)").matches) {
        document.addEventListener('mousemove', (e) => {
            cursorDot.style.transform = `translate3d(${e.clientX - 4}px, ${e.clientY - 4}px, 0)`;
        });

        const hoverElements = document.querySelectorAll('a, button, .about-card, .team-card, .mv-card, .resource-section, .video-card');
        
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorDot.classList.add('cursor-hover');
            });
            el.addEventListener('mouseleave', () => {
                cursorDot.classList.remove('cursor-hover');
            });
        });
    }

    // 2. Scroll Reveal Observer
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // 3. Magnetic Buttons
    const magneticButtons = document.querySelectorAll('.btn-magnetic');
    const MAGNETIC_RADIUS = 20;

    magneticButtons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            // Only apply effect if within radius
            if (Math.abs(x) < rect.width / 2 + MAGNETIC_RADIUS && Math.abs(y) < rect.height / 2 + MAGNETIC_RADIUS) {
                btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
            } else {
                btn.style.transform = 'translate(0px, 0px)';
            }
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0px, 0px)';
        });
    });

    // 4. Parallax Orbs
    const slowOrbs = document.querySelectorAll('.parallax-slow');
    const fastOrbs = document.querySelectorAll('.parallax-fast');

    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        
        slowOrbs.forEach(orb => {
            orb.style.transform = `translateY(${scrolled * 0.2}px)`;
        });
        
        fastOrbs.forEach(orb => {
            orb.style.transform = `translateY(${scrolled * 0.4}px)`;
        });
    });

});
