// Performance-optimized theme management with preconnect hints
const sel = document.getElementById("theme");
const body = document.body;
const fontLink = document.getElementById("theme-font");
const yearElement = document.getElementById("y");
const saved = localStorage.getItem("theme");

const fonts = {
    liquid:
        "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap",
    tron: "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Rajdhani:wght@400;600&display=swap",
    retro8:
        "https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap",
};

// Preload fonts for better performance
function preloadFont(url) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    link.href = url;
    document.head.appendChild(link);
}

// Optimized theme application with requestAnimationFrame
function applyTheme(key) {
    if (!fonts[key]) return;
    
    requestAnimationFrame(() => {
        body.classList.remove("theme-liquid", "theme-tron", "theme-retro8");
        body.classList.add(`theme-${key}`);
        if (fontLink) fontLink.href = fonts[key];
        if (sel) sel.value = key;
        localStorage.setItem("theme", key);
    });
}

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            // Add staggered delay for multiple elements
            const delay = index * 100;
            entry.target.style.setProperty('--delay', `${delay}ms`);
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe elements for scroll animations
document.addEventListener('DOMContentLoaded', () => {
    const elementsToAnimate = document.querySelectorAll('.card, .hero h1, .hero .sub');
    elementsToAnimate.forEach(el => {
        el.classList.add('fade-in-up', 'stagger-delay');
        observer.observe(el);
    });
});

// Initialize theme
if (saved && fonts[saved]) {
    applyTheme(saved);
}

// Theme selector event listener
if (sel) {
    sel.addEventListener("change", (e) => applyTheme(e.target.value));
}

// Optimized smooth scroll with debouncing
let scrollTimeout;
const smoothScrollToElement = (target) => {
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        if (target) {
            target.scrollIntoView({ 
                behavior: "smooth",
                block: "start",
                inline: "nearest"
            });
        }
    }, 10);
};

// Enhanced scroll handlers
document.querySelectorAll("[data-scroll]").forEach((b) => {
    b.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.querySelector(b.dataset.scroll);
        smoothScrollToElement(target);
    });
});

// Update year with caching
if (yearElement) {
    const currentYear = new Date().getFullYear();
    yearElement.textContent = currentYear;
}

// Lazy loading for images (if you add any)
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}