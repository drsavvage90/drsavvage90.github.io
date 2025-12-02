// Performance-optimized theme management with preconnect hints
const body = document.body;
const yearElement = document.getElementById("y");
const THEME_KEY = "theme";
const saved = localStorage.getItem(THEME_KEY);

const normalizeTheme = (theme) => {
    switch ((theme || "").toLowerCase()) {
        case "dark":
        case "tron":
            return "dark";
        case "light":
        case "liquid":
        default:
            return "light";
    }
};

// Optimized theme application with requestAnimationFrame
function applyTheme(theme) {
    const active = normalizeTheme(theme);
    const isDark = active === "dark";

    requestAnimationFrame(() => {
        body.classList.toggle("theme-tron", isDark);
        localStorage.setItem(THEME_KEY, active);
    });

    return active;
}

if (saved) {
    applyTheme(saved);
} else {
    applyTheme("light");
}

globalThis.setTheme = applyTheme;

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
    
    window.addEventListener('scroll', updateProgress, { passive: true });
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
    
    // Update on resize
    window.addEventListener('resize', () => {
        cardsPerView = getCardsPerView();
        currentIndex = Math.min(currentIndex, cards.length - cardsPerView);
        updateSlider();
    });
    
    // Auto-advance every 5 seconds
    setInterval(() => {
        if (currentIndex >= cards.length - cardsPerView) {
            goToSlide(0);
        } else {
            goToSlide(currentIndex + 1);
        }
    }, 5000);
}

// -------------------------------------------------------
// Contact Form
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
        
        // Simulate form submission (replace with actual form handler like Formspree)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
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
