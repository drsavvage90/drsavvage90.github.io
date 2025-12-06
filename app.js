// Performance-optimized theme management with preconnect hints
const body = document.body;
const html = document.documentElement;
const yearElement = document.getElementById("y");
const THEME_KEY = "theme";
const saved = localStorage.getItem(THEME_KEY);

// Performance: Throttle utility for scroll events
function throttle(fn, wait) {
    let lastTime = 0;
    return function(...args) {
        const now = Date.now();
        if (now - lastTime >= wait) {
            lastTime = now;
            fn.apply(this, args);
        }
    };
}

// Available themes with their configurations
const THEMES = {
    'modern-light': {
        name: 'Modern Light',
        description: 'Clean glassmorphism',
        icon: '☀️',
        themeColor: '#667eea',
        bodyClass: ''
    },
    'modern-dark': {
        name: 'Modern Dark',
        description: 'Sleek dark mode',
        icon: '🌙',
        themeColor: '#0f1419',
        bodyClass: 'theme-tron'
    },
    'rustic': {
        name: 'Holmes',
        description: 'Victorian elegance',
        icon: '🔍',
        themeColor: '#8b4513',
        bodyClass: 'theme-holmes'
    }
};

const normalizeTheme = (theme) => {
    const t = (theme || "").toLowerCase();
    // Map legacy values to new theme names
    if (t === 'dark' || t === 'tron') return 'modern-dark';
    if (t === 'light' || t === 'liquid') return 'modern-light';
    if (t === 'rustic') return 'rustic';
    // Check if it's already a valid theme
    if (THEMES[t]) return t;
    return 'modern-light';
};

// Get current theme
function getCurrentTheme() {
    return html.getAttribute('data-theme') || 'modern-light';
}

// Optimized theme application with requestAnimationFrame
function applyTheme(theme, announce = false) {
    const active = normalizeTheme(theme);
    const config = THEMES[active];

    requestAnimationFrame(() => {
        // Use data-theme attribute on html element
        html.setAttribute('data-theme', active);
        
        // Remove all theme body classes, then add the correct one
        body.classList.remove('theme-tron');
        if (config.bodyClass) {
            body.classList.add(config.bodyClass);
        }
        
        localStorage.setItem(THEME_KEY, active);
        
        // Update theme-color meta tag
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.setAttribute('content', config.themeColor);
        }
        
        // Update theme selector UI if present
        updateThemeSelectorUI(active);
    });
    
    // Announce theme change for screen readers
    if (announce) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0;';
        announcement.textContent = `Theme changed to ${config.name}`;
        document.body.appendChild(announcement);
        setTimeout(() => announcement.remove(), 1000);
    }

    return active;
}

// Update theme selector UI
function updateThemeSelectorUI(activeTheme) {
    const selectors = document.querySelectorAll('.theme-selector');
    selectors.forEach(selector => {
        const btn = selector.querySelector('.theme-selector-btn');
        const options = selector.querySelectorAll('.theme-option');
        const config = THEMES[activeTheme];
        
        if (btn) {
            const iconEl = btn.querySelector('.theme-icon');
            const nameEl = btn.querySelector('.theme-name');
            if (iconEl) iconEl.textContent = config.icon;
            if (nameEl) nameEl.textContent = config.name;
        }
        
        options.forEach(opt => {
            const isActive = opt.dataset.theme === activeTheme;
            opt.classList.toggle('active', isActive);
        });
    });
}

// Initialize theme selector functionality
function initThemeSelector() {
    const selectors = document.querySelectorAll('.theme-selector');
    
    selectors.forEach(selector => {
        const btn = selector.querySelector('.theme-selector-btn');
        const dropdown = selector.querySelector('.theme-dropdown');
        const options = selector.querySelectorAll('.theme-option');
        
        // Toggle dropdown
        btn?.addEventListener('click', (e) => {
            e.stopPropagation();
            selector.classList.toggle('open');
        });
        
        // Handle theme selection
        options.forEach(opt => {
            opt.addEventListener('click', () => {
                const theme = opt.dataset.theme;
                applyTheme(theme, true);
                selector.classList.remove('open');
            });
        });
        
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!selector.contains(e.target)) {
                selector.classList.remove('open');
            }
        });
        
        // Keyboard navigation
        btn?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selector.classList.toggle('open');
            } else if (e.key === 'Escape') {
                selector.classList.remove('open');
            }
        });
    });
}

// Apply saved theme on load
if (saved) {
    applyTheme(saved, false);
} else {
    // Check system preference for initial theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'modern-dark' : 'modern-light', false);
}

// Listen for system theme changes (only if user hasn't set a preference)
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const current = getCurrentTheme();
    // Only auto-switch if user is on a modern theme
    if (current === 'modern-light' || current === 'modern-dark') {
        if (!localStorage.getItem(THEME_KEY)) {
            applyTheme(e.matches ? 'modern-dark' : 'modern-light', false);
        }
    }
});

// Global theme API
globalThis.setTheme = (theme) => applyTheme(theme, true);
globalThis.getTheme = getCurrentTheme;
globalThis.THEMES = THEMES;

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
    // Initialize theme selector
    initThemeSelector();
    
    const elementsToAnimate = document.querySelectorAll('.card, .hero h1, .hero .sub, .stat-item');
    elementsToAnimate.forEach(el => {
        el.classList.add('fade-in-up', 'stagger-delay');
        observer.observe(el);
    });
    
    // Initialize all interactive features
    initStatsCounter();
    initSkillBars();
    initProjectFilters();
    initTestimonials();
    initContactForm();
    initActiveNavigation();
    initResumeButton();
    initTypingAnimation();
    initScrollProgress();
    initBackToTop();
    initMobileMenu();
});

// -------------------------------------------------------
// Typing Animation
// -------------------------------------------------------
function initTypingAnimation() {
    const typingElement = document.getElementById('typing-text');
    if (!typingElement) return;
    
    const phrases = [
        'BCBA-D',
        'College Professor',
        'iOS Developer',
        'Web Developer',
        'Behavior Scientist',
        'EdTech Innovator'
    ];
    
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    
    function type() {
        const currentPhrase = phrases[phraseIndex];
        
        if (isDeleting) {
            typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }
        
        if (!isDeleting && charIndex === currentPhrase.length) {
            // Pause at end of phrase
            typingSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typingSpeed = 500;
        }
        
        setTimeout(type, typingSpeed);
    }
    
    // Start typing after a short delay
    setTimeout(type, 1000);
}

// -------------------------------------------------------
// Scroll Progress Bar
// -------------------------------------------------------
function initScrollProgress() {
    const progressBar = document.getElementById('scroll-progress');
    if (!progressBar) return;
    
    function updateProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        progressBar.style.width = `${progress}%`;
    }
    
    // Use throttled scroll for better performance
    window.addEventListener('scroll', throttle(updateProgress, 16), { passive: true });
    updateProgress();
}

// -------------------------------------------------------
// Back to Top Button
// -------------------------------------------------------
function initBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    if (!backToTopBtn) return;
    
    function toggleButton() {
        if (window.scrollY > 400) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }
    
    window.addEventListener('scroll', toggleButton, { passive: true });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    toggleButton();
}

// -------------------------------------------------------
// Mobile Hamburger Menu
// -------------------------------------------------------
function initMobileMenu() {
    const hamburger = document.getElementById('hamburger-btn');
    const nav = document.getElementById('main-nav');
    
    if (!hamburger || !nav) return;
    
    function toggleMenu() {
        const isOpen = nav.classList.toggle('open');
        hamburger.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', isOpen);
        document.body.classList.toggle('menu-open', isOpen);
    }
    
    function closeMenu() {
        nav.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
    }
    
    hamburger.addEventListener('click', toggleMenu);
    
    // Close menu when clicking a link
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (nav.classList.contains('open') && 
            !nav.contains(e.target) && 
            !hamburger.contains(e.target)) {
            closeMenu();
        }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('open')) {
            closeMenu();
            hamburger.focus();
        }
    });
}

// -------------------------------------------------------
// Stats Counter Animation
// -------------------------------------------------------
function initStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.target);
                animateCounter(entry.target, target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => counterObserver.observe(stat));
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const duration = 2000;
    const stepTime = duration / 50;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, stepTime);
}

// -------------------------------------------------------
// Skill Bars Animation
// -------------------------------------------------------
function initSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progress = entry.target.dataset.progress;
                entry.target.style.setProperty('--progress', `${progress}%`);
                entry.target.classList.add('animated');
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    
    skillBars.forEach(bar => skillObserver.observe(bar));
}

// -------------------------------------------------------
// Project Filtering
// -------------------------------------------------------
function initProjectFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectGrid = document.getElementById('project-grid');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.dataset.filter;
            filterProjects(filter);
        });
    });
}

function filterProjects(filter) {
    const projects = document.querySelectorAll('#project-grid .project');
    
    projects.forEach(project => {
        const language = project.dataset.language?.toLowerCase() || '';
        const shouldShow = filter === 'all' || 
            (filter === 'javascript' && (language.includes('javascript') || language.includes('typescript'))) ||
            (filter === 'swift' && language.includes('swift')) ||
            (filter === 'python' && language.includes('python')) ||
            (filter === 'html' && (language.includes('html') || language.includes('css'))) ||
            (filter === 'other' && !['javascript', 'typescript', 'swift', 'python', 'html', 'css'].some(l => language.includes(l)));
        
        if (shouldShow) {
            project.style.display = '';
            project.style.animation = 'fadeIn 0.3s ease forwards';
        } else {
            project.style.display = 'none';
        }
    });
}

// -------------------------------------------------------
// Testimonials Slider
// -------------------------------------------------------
function initTestimonials() {
    const track = document.querySelector('.testimonial-track');
    const cards = document.querySelectorAll('.testimonial-card');
    const prevBtn = document.querySelector('.testimonial-btn.prev');
    const nextBtn = document.querySelector('.testimonial-btn.next');
    const dotsContainer = document.querySelector('.testimonial-dots');
    
    if (!track || cards.length === 0) return;
    
    let currentIndex = 0;
    let cardsPerView = getCardsPerView();
    const totalSlides = Math.ceil(cards.length / cardsPerView);
    
    // Create dots
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.className = `testimonial-dot${i === 0 ? ' active' : ''}`;
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }
    
    function getCardsPerView() {
        if (window.innerWidth >= 1024) return 3;
        if (window.innerWidth >= 768) return 2;
        return 1;
    }
    
    function updateSlider() {
        const cardWidth = cards[0].offsetWidth + 24; // Include gap
        track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
        
        // Update dots
        document.querySelectorAll('.testimonial-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    }
    
    function goToSlide(index) {
        currentIndex = Math.max(0, Math.min(index, cards.length - cardsPerView));
        updateSlider();
    }
    
    prevBtn?.addEventListener('click', () => {
        goToSlide(currentIndex - 1);
    });
    
    nextBtn?.addEventListener('click', () => {
        goToSlide(currentIndex + 1);
    });
    
    // Update on resize (throttled)
    window.addEventListener('resize', throttle(() => {
        cardsPerView = getCardsPerView();
        currentIndex = Math.min(currentIndex, cards.length - cardsPerView);
        updateSlider();
    }, 100));
    
    // Auto-advance with visibility-aware pause
    let autoAdvanceInterval;
    function startAutoAdvance() {
        autoAdvanceInterval = setInterval(() => {
            if (currentIndex >= cards.length - cardsPerView) {
                goToSlide(0);
            } else {
                goToSlide(currentIndex + 1);
            }
        }, 5000);
    }
    
    function stopAutoAdvance() {
        clearInterval(autoAdvanceInterval);
    }
    
    // Pause when page not visible (performance optimization)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoAdvance();
        } else {
            startAutoAdvance();
        }
    });
    
    startAutoAdvance();
}

// -------------------------------------------------------
// Contact Form with Formspree
// -------------------------------------------------------
function initContactForm() {
    const form = document.getElementById('contact-form');
    const successMessage = document.getElementById('form-success');
    
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        
        // Show loading state
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
        submitBtn.disabled = true;
        
        try {
            // Submit to Formspree
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                // Show success message
                form.style.display = 'none';
                successMessage.style.display = 'block';
                
                // Reset form after 5 seconds
                setTimeout(() => {
                    form.reset();
                    form.style.display = 'flex';
                    successMessage.style.display = 'none';
                    btnText.style.display = 'inline';
                    btnLoading.style.display = 'none';
                    submitBtn.disabled = false;
                }, 5000);
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            // Show error state
            alert('Sorry, there was an error sending your message. Please try emailing directly.');
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            submitBtn.disabled = false;
        }
    });
}

// -------------------------------------------------------
// Active Navigation on Scroll
// -------------------------------------------------------
function initActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a[data-scroll]');
    
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, { 
        threshold: 0.3,
        rootMargin: '-100px 0px -66%'
    });
    
    sections.forEach(section => navObserver.observe(section));
}

// -------------------------------------------------------
// Resume Download Button
// -------------------------------------------------------
function initResumeButton() {
    const resumeBtn = document.getElementById('resume-btn');
    
    if (!resumeBtn) return;
    
    resumeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // You can replace this with an actual PDF download link
        alert('Resume download feature - add your CV PDF file and update the link!');
        // Example: window.open('path/to/resume.pdf', '_blank');
    });
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

// GitHub projects loader
const projectGrid = document.getElementById("project-grid");
const projectStatus = document.getElementById("project-status");

// Skeleton Loading for Projects
function showSkeletonLoading() {
    if (!projectGrid) return;
    
    projectGrid.innerHTML = '';
    
    for (let i = 0; i < 3; i++) {
        const skeleton = document.createElement('article');
        skeleton.className = 'card project skeleton-card';
        skeleton.innerHTML = `
            <div class="skeleton skeleton-thumb"></div>
            <div>
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text short"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text"></div>
            </div>
            <div class="flex justify-between items-center">
                <div class="skeleton" style="width: 60px; height: 24px; border-radius: 999px;"></div>
                <div class="skeleton" style="width: 100px; height: 36px;"></div>
            </div>
        `;
        projectGrid.appendChild(skeleton);
    }
}

const formatRepoName = (name = "") =>
    name
        .replace(/[-_]+/g, " ")
        .replace(/\s+/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

const parseNextLink = (linkHeader) => {
    if (!linkHeader) return null;
    const parts = linkHeader.split(",");
    for (const part of parts) {
        const section = part.split(";");
        if (section.length !== 2) continue;
        const url = section[0].trim().replace(/^<|>$/g, "");
        const rel = section[1].trim();
        if (rel === 'rel="next"') {
            return url;
        }
    }
    return null;
};

async function fetchAllRepos(url, collected = []) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`GitHub responded with ${response.status}`);
    }

    const pageItems = await response.json();
    const merged = collected.concat(pageItems);

    const nextLink = parseNextLink(response.headers.get("Link"));
    if (nextLink) {
        return fetchAllRepos(nextLink, merged);
    }

    return merged;
}

async function loadProjects() {
    if (!projectGrid || !("fetch" in window)) return;

    // Show skeleton loading
    showSkeletonLoading();

    try {
        const allRepos = await fetchAllRepos(
            "https://api.github.com/users/drsavvage90/repos?per_page=100&sort=updated"
        );
        const featured = allRepos
            .filter((repo) => !repo.fork)
            .sort(
                (a, b) =>
                    new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
            );

        if (!featured.length) {
            if (projectStatus) {
                projectStatus.textContent =
                    "Add public repositories to GitHub to showcase them here.";
            }
            return;
        }

        projectGrid.innerHTML = "";

        const topProjects = featured.slice(0, 6);
        const placeholderProjects = [
            {
                placeholder: true,
                title: "Behavior Analytics Toolkit",
                description:
                    "Dashboard for ethics logs, practice modules, and compliance resources.",
                meta: "Research · Data Viz",
                link: "https://github.com/drsavvage90?tab=repositories",
                linkLabel: "View Profile",
                badge: "Planning",
            },
            {
                placeholder: true,
                title: "Inclusive Classroom Engine",
                description:
                    "Adaptive supports for educators to track goals and differentiated instruction.",
                meta: "Accessibility · Web",
                link: "https://github.com/drsavvage90?tab=repositories",
                linkLabel: "View Profile",
                badge: "Designing",
            },
        ];

        const cards = [...topProjects];
        if (cards.length < 3) {
            placeholderProjects.slice(0, 3 - cards.length).forEach((item) => {
                cards.push(item);
            });
        }

        cards.forEach((project, index) => {
            const isPlaceholder = Boolean(project.placeholder);
            const repo = isPlaceholder ? null : project;
            const article = document.createElement("article");
            article.className = "card project fade-in-up stagger-delay";
            article.style.setProperty("--delay", `${index * 60}ms`);
            
            // Add language data for filtering
            if (!isPlaceholder && repo.language) {
                article.dataset.language = repo.language.toLowerCase();
            } else {
                article.dataset.language = "other";
            }

            const thumb = document.createElement("div");
            thumb.className = "thumb";

            if (!isPlaceholder) {
                const image = document.createElement("img");
                image.className = "thumb-img lazy";
                image.loading = "lazy";
                image.alt = `${formatRepoName(repo.name)} preview image`;
                image.dataset.src = `https://opengraph.githubassets.com/1/${repo.owner.login}/${repo.name}`;
                thumb.classList.add("has-image");
                thumb.append(image);
            }

            const details = document.createElement("div");

            const title = document.createElement("h3");
            title.textContent = isPlaceholder
                ? project.title
                : formatRepoName(repo.name);

            const meta = document.createElement("p");
            meta.className = "meta";
            meta.textContent = isPlaceholder
                ? project.meta || "Project"
                : repo.language || "Multiple";

            const description = document.createElement("p");
            description.textContent =
                (isPlaceholder
                    ? project.description
                    : repo.description?.trim()) ||
                "Recently updated project on GitHub.";

            details.append(title, meta, description);

            const footer = document.createElement("div");
            footer.className = "flex justify-between items-center";

            const badge = document.createElement("span");
            badge.className = "badge";
            badge.textContent = isPlaceholder
                ? project.badge || "Soon"
                : new Date(repo.pushed_at).getFullYear().toString();

            const link = document.createElement("a");
            link.className = "btn";
            link.href = isPlaceholder
                ? project.link
                : repo.html_url;
            link.textContent = isPlaceholder
                ? project.linkLabel || "Learn More"
                : "Open Repo";
            link.target = "_blank";
            link.rel = "noreferrer noopener";

            footer.append(badge, link);
            article.append(thumb, details, footer);
            projectGrid.append(article);

            if (observer) {
                observer.observe(article);
            }
        });

        if (projectStatus) {
            const realCount = topProjects.length;
            if (!realCount) {
                projectStatus.textContent =
                    "Showcasing planned projects — add public repositories to replace them.";
            } else if (realCount < 3) {
                projectStatus.textContent = `Loaded ${realCount} project${
                    realCount === 1 ? "" : "s"
                } from GitHub. Showing planned work for the rest.`;
            } else {
                projectStatus.textContent = "Loaded top 3 projects from GitHub.";
            }
        }
    } catch (error) {
        console.error("Failed to load GitHub projects", error);
        if (projectStatus) {
            projectStatus.textContent =
                "Unable to load GitHub projects right now. View them on GitHub.";
        }
    }
}

if (projectGrid) {
    loadProjects();
}

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
