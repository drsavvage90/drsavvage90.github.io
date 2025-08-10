const sel = document.getElementById("theme");
const body = document.body;
const fontLink = document.getElementById("theme-font");
const saved = localStorage.getItem("theme");

const fonts = {
  liquid:
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap",
  tron: "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Rajdhani:wght@400;600&display=swap",
  retro8:
    "https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap",
};

function applyTheme(key) {
  body.classList.remove("theme-liquid", "theme-tron", "theme-retro8");
  body.classList.add(`theme-${key}`);
  fontLink.href = fonts[key];
  sel.value = key;
  localStorage.setItem("theme", key);
}

if (saved) {
  applyTheme(saved);
}
sel.addEventListener("change", (e) => applyTheme(e.target.value));

document.querySelectorAll("[data-scroll]").forEach((b) => {
  b.addEventListener("click", () => {
    const target = document.querySelector(b.dataset.scroll);
    if (target) target.scrollIntoView({ behavior: "smooth" });
  });
});

document.getElementById("y").textContent = new Date().getFullYear();
