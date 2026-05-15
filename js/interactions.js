/**
 * Spatial Tech Interactions
 * Smooth Scroll (lerp — mouse/trackpad), Scroll Reveal, Magnetic Buttons, Parallax
 * Touch/tablet devices use native CSS smooth scroll (no interception)
 */

document.addEventListener('DOMContentLoaded', () => {

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isFinePointer  = window.matchMedia('(pointer: fine)').matches;

    // ── 1. Lenis Smooth Scroll ──────────────────────────────────────────────
    let lenis;
    if (!prefersReduced) {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }

    // ── 2. Scroll Reveal Observer ──────────────────────────────────────────
    const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.07, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // ── 3. Magnetic Buttons (30px attraction radius) ───────────────────────
    const MAGNETIC_RADIUS = 30;

    document.querySelectorAll('.btn-magnetic').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width  / 2;
            const y = e.clientY - rect.top  - rect.height / 2;
            const inside = Math.abs(x) < rect.width  / 2 + MAGNETIC_RADIUS &&
                           Math.abs(y) < rect.height / 2 + MAGNETIC_RADIUS;
            btn.style.transform = inside
                ? `translate(${x * 0.22}px, ${y * 0.22}px)`
                : 'translate(0, 0)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    });

    // ── 4. Parallax Orbs — Synchronized with Lenis ─────────────────────────
    if (!prefersReduced) {
        const slowOrbs = document.querySelectorAll('.parallax-slow');
        const fastOrbs = document.querySelectorAll('.parallax-fast');

        const updateParallax = (scrollY) => {
            // Offset intensity 0.02 as requested
            slowOrbs.forEach(o => { o.style.transform = `translateY(${scrollY * 0.02}px)`; });
            fastOrbs.forEach(o => { o.style.transform = `translateY(${scrollY * 0.04}px)`; });
        };

        if (lenis) {
            lenis.on('scroll', (e) => {
                updateParallax(e.scroll);
            });
        } else {
            let scrollRaf = null;
            window.addEventListener('scroll', () => {
                if (scrollRaf) return;
                scrollRaf = requestAnimationFrame(() => {
                    updateParallax(window.scrollY);
                    scrollRaf = null;
                });
            }, { passive: true });
        }
    }

    // ── 5. Copyright year ──────────────────────────────────────────────────
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

});
