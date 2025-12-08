const slides = document.querySelectorAll(".slides");
const slider = document.getElementById("slide-slider");
const thumb = document.getElementById("slider-thumb");

let isDragging = false;

const labels = [
    "title",
    "intro",
    "1980s",
    "1990s",
    "2000s",
    "2010s",
    "2020s",
    "all concerts",
    "greediest artist"
];



const tooltip = document.createElement("div");
tooltip.className = "slider-tooltip";
document.body.appendChild(tooltip);

function positionToSlideIndex(x) {
    const width = slider.clientWidth;
    const ratio = Math.max(0, Math.min(1, x / width));
    return Math.round(ratio * (slides.length));
}

function slideIndexToPosition(index) {
    return (index / (slides.length)) * slider.clientWidth;
}


function goToSlide(index) {
    slides[index].scrollIntoView({ behavior: "smooth" });
}

function showTooltip(text, pageX, pageY) {
    tooltip.textContent = text;
    tooltip.style.left = `${pageX}px`;
    tooltip.style.top = `${pageY}px`;
    tooltip.classList.add("visible");
}

function hideTooltip() {
    tooltip.classList.remove("visible");
}

slider.addEventListener("click", (e) => {
    const rect = slider.getBoundingClientRect();
    const x = e.clientX - rect.left;
    updateSlider(x);

    const index = positionToSlideIndex(x);
    goToSlide(index);

    thumb.style.left = `${x}px`;
});
thumb.addEventListener("mousedown", () => {
    isDragging = true;
    document.body.style.userSelect = "none";

});

document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const rect = slider.getBoundingClientRect();
    let x = e.clientX - rect.left;
    x = Math.max(0, Math.min(x, slider.clientWidth));

    thumb.style.left = `${x}px`;

    const index = positionToSlideIndex(x);
    goToSlide(index);

    showTooltip(labels[index], e.pageX, rect.top - 8);
    updateSlider(x);
});

document.addEventListener("mouseup", () => {
    isDragging = false;
    document.body.style.userSelect = "";
    hideTooltip();
});
thumb.addEventListener("mouseenter", () => {
    const rect = slider.getBoundingClientRect();
    let left = parseFloat(thumb.style.left) || 0;

    const index = positionToSlideIndex(left);
    const pageX = rect.left + left;
    const pageY = rect.top - 8;

    showTooltip(labels[index], pageX, pageY);
});

thumb.addEventListener("mouseleave", () => {
    if (!isDragging) hideTooltip();
});

function updateSlider(x) {
    const rect = slider.getBoundingClientRect();
    x = Math.max(0, Math.min(x, slider.clientWidth));

    thumb.style.left = `${x}px`;

    const progress = document.getElementById("slider-progress");
    progress.style.width = `${x}px`;
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const index = [...slides].indexOf(entry.target);
            const x = slideIndexToPosition(index);
            updateSlider(x);
        }
    });
}, {
    threshold: 0.5
});

slides.forEach(slide => observer.observe(slide));