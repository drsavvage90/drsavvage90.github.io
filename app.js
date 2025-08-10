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

function applyTheme(key) {
    if (!fonts[key]) return; // Validate theme key
    body.classList.remove("theme-liquid", "theme-tron", "theme-retro8");
    body.classList.add(`theme-${key}`);
    if (fontLink) fontLink.href = fonts[key];
    if (sel) sel.value = key;
    localStorage.setItem("theme", key);
}

if (saved && fonts[saved]) {
    applyTheme(saved);
}

if (sel) {
    sel.addEventListener("change", (e) => applyTheme(e.target.value));
}

document.querySelectorAll("[data-scroll]").forEach((b) => {
    b.addEventListener("click", () => {
        const target = document.querySelector(b.dataset.scroll);
        if (target) target.scrollIntoView({ behavior: "smooth" });
    });
});

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}