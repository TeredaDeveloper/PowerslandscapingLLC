/* ========================================
   Powers Landscaping LLC - Main JavaScript
   Kozeny-style animations, infinite carousel, working lightbox
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
    initNavbar();
    initSmoothScroll();
    initBackToTop();
    initInfiniteCarousel();
    initLightbox();
    initContactForm();
    initScrollAnimations();
});

/* ========================================
   NAVBAR
   ======================================== */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        });
        if (window.scrollY > 50) navbar.classList.add('scrolled');
    }
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
        
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
    }
}

/* ========================================
   SMOOTH SCROLL
   ======================================== */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 80;
                window.scrollTo({
                    top: target.getBoundingClientRect().top + window.scrollY - navbarHeight,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ========================================
   BACK TO TOP
   ======================================== */
function initBackToTop() {
    const backToTop = document.getElementById('backToTop');
    if (!backToTop) return;
    
    window.addEventListener('scroll', () => {
        backToTop.classList.toggle('visible', window.scrollY > 500);
    });
    
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ========================================
   INFINITE CAROUSEL - Smooth auto-rotating
   ======================================== */
function initInfiniteCarousel() {
    const carousel = document.getElementById('reviewsCarousel');
    if (!carousel) return;
    
    const track = carousel.querySelector('.reviews-track');
    const originalCards = carousel.querySelectorAll('.review-card');
    if (!track || originalCards.length === 0) return;
    
    // Clone cards for infinite effect
    originalCards.forEach(card => {
        const clone = card.cloneNode(true);
        track.appendChild(clone);
    });
    
    const allCards = track.querySelectorAll('.review-card');
    const cardCount = originalCards.length;
    let position = 0;
    let isAnimating = false;
    
    // Get card width including gap
    function getCardWidth() {
        const card = allCards[0];
        const style = getComputedStyle(card);
        const width = card.offsetWidth;
        const marginRight = parseInt(style.marginRight) || 20;
        return width + marginRight;
    }
    
    // Smooth slide to position
    function slideTo(pos, animate = true) {
        const cardWidth = getCardWidth();
        track.style.transition = animate ? 'transform 0.5s ease' : 'none';
        track.style.transform = `translateX(-${pos * cardWidth}px)`;
    }
    
    // Move to next card
    function nextCard() {
        if (isAnimating) return;
        isAnimating = true;
        position++;
        slideTo(position);
        
        setTimeout(() => {
            // If we've gone past original cards, jump back seamlessly
            if (position >= cardCount) {
                position = 0;
                slideTo(position, false);
            }
            isAnimating = false;
        }, 500);
    }
    
    // Move to previous card
    function prevCard() {
        if (isAnimating) return;
        isAnimating = true;
        
        if (position === 0) {
            // Jump to end instantly, then animate back
            position = cardCount;
            slideTo(position, false);
            setTimeout(() => {
                position--;
                slideTo(position);
                setTimeout(() => { isAnimating = false; }, 500);
            }, 50);
        } else {
            position--;
            slideTo(position);
            setTimeout(() => { isAnimating = false; }, 500);
        }
    }
    
    // Button controls
    const prevBtn = carousel.querySelector('.carousel-prev');
    const nextBtn = carousel.querySelector('.carousel-next');
    if (prevBtn) prevBtn.addEventListener('click', prevCard);
    if (nextBtn) nextBtn.addEventListener('click', nextCard);
    
    // Touch/swipe support
    let startX = 0, currentX = 0, isDragging = false;
    
    track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
    }, { passive: true });
    
    track.addEventListener('touchmove', (e) => {
        if (isDragging) currentX = e.touches[0].clientX;
    }, { passive: true });
    
    track.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        const diff = startX - currentX;
        if (diff > 50) nextCard();
        else if (diff < -50) prevCard();
    });
    
    // Auto-rotate every 4 seconds
    let autoPlay = setInterval(nextCard, 4000);
    
    carousel.addEventListener('mouseenter', () => clearInterval(autoPlay));
    carousel.addEventListener('mouseleave', () => {
        autoPlay = setInterval(nextCard, 4000);
    });
    
    // Touch pause
    carousel.addEventListener('touchstart', () => clearInterval(autoPlay), { passive: true });
    carousel.addEventListener('touchend', () => {
        autoPlay = setInterval(nextCard, 4000);
    }, { passive: true });
    
    // Initial position
    slideTo(0, false);
}

/* ========================================
   LIGHTBOX - Click photos to expand
   ======================================== */
function initLightbox() {
    // Create lightbox element
    let lightbox = document.getElementById('lightbox');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'lightbox';
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-backdrop"></div>
            <div class="lightbox-container">
                <img src="" alt="Full size image" class="lightbox-image">
                <button class="lightbox-nav lightbox-prev"><i class="fas fa-chevron-left"></i></button>
                <button class="lightbox-nav lightbox-next"><i class="fas fa-chevron-right"></i></button>
            </div>
        `;
        document.body.appendChild(lightbox);
    }
    
    const backdrop = lightbox.querySelector('.lightbox-backdrop');
    const container = lightbox.querySelector('.lightbox-container');
    const img = lightbox.querySelector('.lightbox-image');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    
    // Get ALL clickable images
    const triggers = document.querySelectorAll('.lightbox-trigger, .portfolio-item img, .gallery-item img, .service-image img, .about-image-main img');
    
    if (triggers.length === 0) return;
    
    let images = [];
    let currentIndex = 0;
    
    // Collect unique image sources
    triggers.forEach(trigger => {
        const src = trigger.src || trigger.querySelector('img')?.src;
        if (src && !images.includes(src)) {
            images.push(src);
        }
    });
    
    function openLightbox(src) {
        currentIndex = images.indexOf(src);
        if (currentIndex === -1) currentIndex = 0;
        img.src = images[currentIndex];
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    function showNext(e) {
        if (e) e.stopPropagation();
        currentIndex = (currentIndex + 1) % images.length;
        img.src = images[currentIndex];
    }
    
    function showPrev(e) {
        if (e) e.stopPropagation();
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        img.src = images[currentIndex];
    }
    
    // Click handlers for all images
    triggers.forEach(trigger => {
        trigger.style.cursor = 'pointer';
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const src = trigger.src || trigger.querySelector('img')?.src;
            if (src) openLightbox(src);
        });
    });
    
    // Also handle clicks on parent elements (portfolio-item, gallery-item)
    document.querySelectorAll('.portfolio-item, .gallery-item').forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', (e) => {
            const img = item.querySelector('img');
            if (img && img.src) {
                e.preventDefault();
                openLightbox(img.src);
            }
        });
    });
    
    // Close on backdrop click
    backdrop.addEventListener('click', closeLightbox);
    container.addEventListener('click', (e) => {
        if (e.target === container) closeLightbox();
    });
    
    // Nav buttons
    prevBtn.addEventListener('click', showPrev);
    nextBtn.addEventListener('click', showNext);
    
    // Keyboard
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') showNext();
        if (e.key === 'ArrowLeft') showPrev();
    });
    
    // Touch swipe
    let touchStartX = 0;
    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    lightbox.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) showNext();
            else showPrev();
        } else if (Math.abs(diff) < 10) {
            closeLightbox();
        }
    }, { passive: true });
}

/* ========================================
   SCROLL ANIMATIONS - Kozeny style slide-ins
   ======================================== */
function initScrollAnimations() {
    // Add animation classes to elements
    const animateElements = [
        { selector: '.hero-content', animation: 'fade-up' },
        { selector: '.hero-badge', animation: 'fade-down' },
        { selector: '.hero-stats .stat', animation: 'fade-up', stagger: true },
        { selector: '.section-header', animation: 'fade-up' },
        { selector: '.section-tag', animation: 'fade-down' },
        { selector: '.about-images', animation: 'slide-right' },
        { selector: '.about-content', animation: 'slide-left' },
        { selector: '.service-card', animation: 'fade-up', stagger: true },
        { selector: '.service-detail-image', animation: 'slide-right' },
        { selector: '.service-detail-content', animation: 'slide-left' },
        { selector: '.service-detail.reverse .service-detail-image', animation: 'slide-left' },
        { selector: '.service-detail.reverse .service-detail-content', animation: 'slide-right' },
        { selector: '.review-card', animation: 'fade-up', stagger: true },
        { selector: '.portfolio-item', animation: 'fade-up', stagger: true },
        { selector: '.gallery-item', animation: 'fade-up', stagger: true },
        { selector: '.area-content', animation: 'slide-right' },
        { selector: '.area-map', animation: 'slide-left' },
        { selector: '.contact-info', animation: 'slide-right' },
        { selector: '.contact-form-wrapper', animation: 'slide-left' },
        { selector: '.cta-content', animation: 'fade-up' },
        { selector: '.quick-contact-item', animation: 'fade-up', stagger: true },
        { selector: '.footer-grid > div', animation: 'fade-up', stagger: true },
    ];
    
    // Apply initial hidden state
    animateElements.forEach(({ selector, animation, stagger }) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el, index) => {
            el.classList.add('animate-on-scroll', animation);
            if (stagger) {
                el.style.transitionDelay = `${index * 0.1}s`;
            }
        });
    });
    
    // Intersection Observer for triggering animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe all animated elements
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
    
    // Trigger hero animations immediately
    setTimeout(() => {
        document.querySelectorAll('.hero-content, .hero-badge, .hero-stats .stat').forEach(el => {
            el.classList.add('animated');
        });
    }, 100);
}

/* ========================================
   CONTACT FORM - NETLIFY
   ======================================== */
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');
    
    if (!dropzone || !fileInput) return;
    
    let uploadedFiles = [];
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => {
        dropzone.addEventListener(evt, (e) => { e.preventDefault(); e.stopPropagation(); }, false);
    });
    
    ['dragenter', 'dragover'].forEach(evt => {
        dropzone.addEventListener(evt, () => dropzone.classList.add('dragover'));
    });
    
    ['dragleave', 'drop'].forEach(evt => {
        dropzone.addEventListener(evt, () => dropzone.classList.remove('dragover'));
    });
    
    dropzone.addEventListener('drop', (e) => handleFiles(e.dataTransfer.files));
    dropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => handleFiles(fileInput.files));
    
    function handleFiles(files) {
        [...files].forEach(file => {
            if (file.size > 10 * 1024 * 1024) { alert(`${file.name} is too large. Max 10MB.`); return; }
            if (!file.type.startsWith('image/')) { alert(`${file.name} is not an image.`); return; }
            uploadedFiles.push(file);
            displayFile(file);
        });
    }
    
    function displayFile(file) {
        const item = document.createElement('div');
        item.classList.add('file-item');
        item.innerHTML = `<i class="fas fa-image"></i><span class="file-name">${file.name}</span><span class="file-size">(${(file.size / 1024 / 1024).toFixed(1)} MB)</span><button type="button" class="file-remove"><i class="fas fa-times"></i></button>`;
        item.querySelector('.file-remove').addEventListener('click', () => { uploadedFiles = uploadedFiles.filter(f => f !== file); item.remove(); });
        fileList.appendChild(item);
    }
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const orig = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        btn.disabled = true;
        
        try {
            const formData = new FormData(form);
            uploadedFiles.forEach((file, i) => formData.append(`photo_${i}`, file));
            const res = await fetch('/', { method: 'POST', headers: { 'Accept': 'application/json' }, body: formData });
            if (res.ok) {
                form.innerHTML = `<div class="form-success"><i class="fas fa-check-circle"></i><h3>Message Sent!</h3><p>We'll get back to you within 24 hours.</p></div>`;
            } else throw new Error('Failed');
        } catch (err) {
            alert('Error sending message. Please call us directly.');
            btn.innerHTML = orig;
            btn.disabled = false;
        }
    });
}
