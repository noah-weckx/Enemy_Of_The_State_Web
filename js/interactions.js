/**
 * Spatial Tech Interactions
 * Smooth Scroll (lerp — mouse/trackpad), Scroll Reveal, Magnetic Buttons, Parallax
 * Touch/tablet devices use native CSS smooth scroll (no interception)
 */

document.addEventListener('DOMContentLoaded', () => {

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isFinePointer  = window.matchMedia('(pointer: fine)').matches;

    // ── 1. Lerp Smooth Scroll (trackpad + mouse only) ─────────────────────
    // Touch/tablet use native momentum scroll + CSS scroll-behavior: smooth
    if (!prefersReduced && isFinePointer) {
        let currentY = window.scrollY;
        let targetY  = window.scrollY;

        const lerp = (a, b, t) => a + (b - a) * t;

        // Wheel event — trackpad and scroll wheel
        window.addEventListener('wheel', (e) => {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            targetY = Math.max(0, Math.min(maxScroll, targetY + e.deltaY * 1.15));
        }, { passive: true });

        // Sync on large jumps (anchor clicks, keyboard Page Down, etc.)
        window.addEventListener('scroll', () => {
            if (Math.abs(window.scrollY - currentY) > 100) {
                currentY = window.scrollY;
                targetY  = window.scrollY;
            }
        }, { passive: true });

        (function smoothLoop() {
            currentY = lerp(currentY, targetY, 0.09);
            if (Math.abs(currentY - targetY) > 0.4) {
                window.scrollTo(0, currentY);
            }
            requestAnimationFrame(smoothLoop);
        })();
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

    // ── 4. Parallax Orbs — rAF throttled ──────────────────────────────────
    if (!prefersReduced) {
        const slowOrbs = document.querySelectorAll('.parallax-slow');
        const fastOrbs = document.querySelectorAll('.parallax-fast');
        let scrollRaf  = null;

        window.addEventListener('scroll', () => {
            if (scrollRaf) return;
            scrollRaf = requestAnimationFrame(() => {
                const s = window.scrollY;
                slowOrbs.forEach(o => { o.style.transform = `translateY(${s * 0.18}px)`; });
                fastOrbs.forEach(o => { o.style.transform = `translateY(${s * 0.36}px)`; });
                scrollRaf = null;
            });
        }, { passive: true });
    }

    // ── 5. Copyright year ──────────────────────────────────────────────────
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

});
