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
    const elementsToAnimate = document.querySelectorAll('.card, .hero h1, .hero .sub');
    elementsToAnimate.forEach(el => {
        el.classList.add('fade-in-up', 'stagger-delay');
        observer.observe(el);
    });
});

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

        const topProjects = featured.slice(0, 3);
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
