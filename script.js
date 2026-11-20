/* ============ Lightbox Pro: Zoom & Pan ============ */
let scale = 1;
let translateX = 0;
let translateY = 0;
let isDragging = false;
let startX = 0, startY = 0;

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const zoomLabel = document.getElementById('zoom-label');

/* فتح الصورة — مصلح ليعمل مع <img> مباشرة */
function openLightbox(element) {
    const img = element.tagName === 'IMG' ? element : element.querySelector('img');
    if (!img) return;
    lightboxImg.src = img.src;
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    resetZoom();
}

/* إغلاق الصورة */
function closeLightbox() {
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
    lightboxImg.src = '';
}

/* تطبيق التكبير والإزاحة */
function applyTransform() {
    lightboxImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    if (zoomLabel) zoomLabel.textContent = Math.round(scale * 100) + '%';
}
function zoomIn()  { scale = Math.min(scale * 1.25, 8); applyTransform(); }
function zoomOut() { scale = Math.max(scale / 1.25, 0.3); applyTransform(); }
function resetZoom() { scale = 1; translateX = 0; translateY = 0; applyTransform(); }

/* التكبير بعجلة الماوس (مركز على المؤشر) */
if (lightbox) {
    lightbox.addEventListener('wheel', (e) => {
        if (lightbox.style.display !== 'flex') return;
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.min(Math.max(scale * delta, 0.3), 8);
        const rect = lightboxImg.getBoundingClientRect();
        const cx = e.clientX - (rect.left + rect.width / 2);
        const cy = e.clientY - (rect.top + rect.height / 2);
        const ratio = newScale / scale;
        translateX = translateX - cx * (ratio - 1);
        translateY = translateY - cy * (ratio - 1);
        scale = newScale;
        applyTransform();
    }, { passive: false });

    /* النقر على الخلفية فقط يغلق */
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
}

/* السحب بالماوس */
if (lightboxImg) {
    lightboxImg.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        lightboxImg.classList.add('dragging');
    });
}
document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    applyTransform();
});
document.addEventListener('mouseup', () => {
    isDragging = false;
    if (lightboxImg) lightboxImg.classList.remove('dragging');
});

/* اللمس: سحب + pinch zoom */
let touchStartDist = 0;
let touchStartScale = 1;
if (lightboxImg) {
    lightboxImg.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            isDragging = true;
            startX = e.touches[0].clientX - translateX;
            startY = e.touches[0].clientY - translateY;
        } else if (e.touches.length === 2) {
            isDragging = false;
            touchStartDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            touchStartScale = scale;
        }
    }, { passive: true });

    lightboxImg.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1 && isDragging) {
            e.preventDefault();
            translateX = e.touches[0].clientX - startX;
            translateY = e.touches[0].clientY - startY;
            applyTransform();
        } else if (e.touches.length === 2) {
            e.preventDefault();
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            scale = Math.min(Math.max(touchStartScale * (dist / touchStartDist), 0.3), 8);
            applyTransform();
        }
    }, { passive: false });

    lightboxImg.addEventListener('touchend', () => { isDragging = false; });
}

/* اختصارات لوحة المفاتيح */
document.addEventListener('keydown', (e) => {
    if (!lightbox || lightbox.style.display !== 'flex') return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "+" || e.key === "=") zoomIn();
    if (e.key === "-") zoomOut();
    if (e.key === "0") resetZoom();
});

/* ============ ظهور تدريجي للبطاقات ============ */
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
});
document.querySelectorAll('.uml-card').forEach((card) => observer.observe(card));