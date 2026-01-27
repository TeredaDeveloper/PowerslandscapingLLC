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
    // New iOS-style nav controls
    const navControls = document.getElementById('pageNavControls');
    const scrollUp = document.getElementById('scrollUp');
    const scrollDown = document.getElementById('scrollDown');
    
    // Fallback for old button
    const backToTop = document.getElementById('backToTop');
    
    if (navControls && scrollUp && scrollDown) {
        window.addEventListener('scroll', () => {
            navControls.classList.toggle('visible', window.scrollY > 300);
        });
        
        scrollUp.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        scrollDown.addEventListener('click', () => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        });
    } else if (backToTop) {
        // Fallback for pages with old button
        window.addEventListener('scroll', () => {
            backToTop.classList.toggle('visible', window.scrollY > 500);
        });
        
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
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
        lightbox.innerHTML = `
            <div class="lightbox-backdrop"></div>
            <div class="lightbox-container">
                <img src="" alt="Full size image" class="lightbox-image">
            </div>
            <button class="lightbox-nav lightbox-prev"><i class="fas fa-chevron-left"></i></button>
            <button class="lightbox-nav lightbox-next"><i class="fas fa-chevron-right"></i></button>
            <div class="lightbox-swipe-hint">
                <span class="swipe-arrow swipe-left"><i class="fas fa-chevron-left"></i></span>
                <span class="swipe-text">Swipe</span>
                <span class="swipe-arrow swipe-right"><i class="fas fa-chevron-right"></i></span>
            </div>
            <div class="lightbox-close-hint">Tap to close</div>
        `;
        document.body.appendChild(lightbox);
    }
    
    const backdrop = lightbox.querySelector('.lightbox-backdrop');
    const container = lightbox.querySelector('.lightbox-container');
    const img = lightbox.querySelector('.lightbox-image');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    
    // Get ALL clickable images including carousel slides
    const triggers = document.querySelectorAll('.lightbox-trigger, .portfolio-item img, .gallery-item img, .service-image img, .about-image-main img, .carousel-slide img');
    
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
    
    // Listen for custom event from carousel
    document.addEventListener('openLightbox', (e) => {
        if (e.detail && e.detail.src) {
            openLightbox(e.detail.src);
        }
    });
    
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
    
    // Also handle clicks on parent elements (portfolio-item, gallery-item, carousel-slide)
    document.querySelectorAll('.portfolio-item, .gallery-item, .carousel-slide').forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', (e) => {
            const img = item.querySelector('img');
            if (img && img.src) {
                e.preventDefault();
                e.stopPropagation();
                openLightbox(img.src);
            }
        });
    });
    
    // Close on backdrop click only - not on buttons
    backdrop.addEventListener('click', (e) => {
        if (!e.target.closest('.lightbox-nav')) {
            closeLightbox();
        }
    });
    container.addEventListener('click', (e) => {
        // Only close if clicking directly on container or image, not buttons
        if ((e.target === container || e.target === img) && !e.target.closest('.lightbox-nav')) {
            closeLightbox();
        }
    });
    
    // Also prevent lightbox itself from closing when clicking buttons
    lightbox.addEventListener('click', (e) => {
        if (e.target.closest('.lightbox-nav')) {
            e.stopPropagation();
            return;
        }
    });
    
    // Desktop nav buttons - stop propagation to prevent close
    prevBtn.addEventListener('click', (e) => {
        console.log('PREV CLICKED');
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        showPrev(e);
        return false;
    });
    nextBtn.addEventListener('click', (e) => {
        console.log('NEXT CLICKED');
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        showNext(e);
        return false;
    });
    
    // Keyboard
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') showNext();
        if (e.key === 'ArrowLeft') showPrev();
    });
    
    // Mobile swipe on entire lightbox
    let touchStartX = 0;
    let touchStartY = 0;
    
    function handleTouchStart(e) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }
    
    function handleTouchEnd(e) {
        // Don't close if touching a nav button
        if (e.target.closest('.lightbox-nav')) {
            return;
        }
        
        const touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;
        const diffX = touchStartX - touchEndX;
        const diffY = touchStartY - touchEndY;
        
        // Horizontal swipe - works anywhere
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            e.preventDefault();
            if (diffX > 0) showNext();
            else showPrev();
        } 
        // Tap to close (minimal movement)
        else if (Math.abs(diffX) < 15 && Math.abs(diffY) < 15) {
            closeLightbox();
        }
    }
    
    // Add swipe to all lightbox elements
    lightbox.addEventListener('touchstart', handleTouchStart, { passive: true });
    lightbox.addEventListener('touchend', handleTouchEnd, { passive: false });
    backdrop.addEventListener('touchstart', handleTouchStart, { passive: true });
    backdrop.addEventListener('touchend', handleTouchEnd, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });
    img.addEventListener('touchstart', handleTouchStart, { passive: true });
    img.addEventListener('touchend', handleTouchEnd, { passive: false });
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


/* ========================================
   PORTFOLIO CAROUSEL - Auto-scroll + Physics swipe
   ======================================== */
function initPortfolioCarousel() {
    const carousel = document.querySelector('.portfolio-carousel');
    const track = document.getElementById('portfolioTrack');
    if (!track || !carousel) return;
    
    const slides = Array.from(track.querySelectorAll('.carousel-slide'));
    if (slides.length === 0) return;
    
    // Clone slides for infinite loop
    slides.forEach(slide => {
        const clone = slide.cloneNode(true);
        track.appendChild(clone);
    });
    
    // Variables
    let scrollPos = 0;
    let velocity = 0;
    let isHovering = false;
    let isTouching = false;
    let touchStartX = 0;
    let touchStartScroll = 0;
    let lastTouchX = 0;
    let lastTouchTime = 0;
    const autoSpeed = 0.8; // Auto-scroll speed (slower)
    const friction = 0.95; // Momentum decay
    const minVelocity = 0.1;
    
    // Get total width of original slides
    function getLoopWidth() {
        let width = 0;
        for (let i = 0; i < slides.length; i++) {
            width += slides[i].offsetWidth + 20;
        }
        return width;
    }
    
    // Main animation loop
    function animate() {
        const loopWidth = getLoopWidth();
        
        // Apply velocity (from swipe momentum)
        if (Math.abs(velocity) > minVelocity) {
            scrollPos += velocity;
            velocity *= friction;
        } else if (!isHovering && !isTouching) {
            // Auto-scroll when not interacting
            scrollPos += autoSpeed;
        }
        
        // Loop back seamlessly
        if (scrollPos >= loopWidth) {
            scrollPos -= loopWidth;
        } else if (scrollPos < 0) {
            scrollPos += loopWidth;
        }
        
        track.style.transform = `translateX(-${scrollPos}px)`;
        requestAnimationFrame(animate);
    }
    
    // Desktop: pause on hover
    carousel.addEventListener('mouseenter', () => {
        isHovering = true;
        velocity = 0;
    });
    carousel.addEventListener('mouseleave', () => {
        isHovering = false;
    });
    
    // Mobile touch with physics
    carousel.addEventListener('touchstart', (e) => {
        isTouching = true;
        velocity = 0;
        touchStartX = e.touches[0].clientX;
        touchStartScroll = scrollPos;
        lastTouchX = touchStartX;
        lastTouchTime = Date.now();
    }, { passive: true });
    
    carousel.addEventListener('touchmove', (e) => {
        if (!isTouching) return;
        const touchX = e.touches[0].clientX;
        const diff = touchStartX - touchX;
        scrollPos = touchStartScroll + diff;
        
        // Track velocity for momentum
        const now = Date.now();
        const dt = now - lastTouchTime;
        if (dt > 0) {
            velocity = (lastTouchX - touchX) / dt * 16; // Normalize to ~60fps
        }
        lastTouchX = touchX;
        lastTouchTime = now;
    }, { passive: true });
    
    carousel.addEventListener('touchend', (e) => {
        isTouching = false;
        // Velocity already set from touchmove, momentum continues in animate()
    }, { passive: true });
    
    // Click to open lightbox
    track.querySelectorAll('.carousel-slide').forEach(slide => {
        slide.style.cursor = 'pointer';
        let touchMoved = false;
        
        slide.addEventListener('touchstart', () => {
            touchMoved = false;
        }, { passive: true });
        
        slide.addEventListener('touchmove', () => {
            touchMoved = true;
        }, { passive: true });
        
        slide.addEventListener('click', (e) => {
            if (touchMoved) return; // Don't open if it was a swipe
            const img = slide.querySelector('img');
            if (img && img.src) {
                e.preventDefault();
                e.stopPropagation();
                document.dispatchEvent(new CustomEvent('openLightbox', { detail: { src: img.src } }));
            }
        });
    });
    
    // Start
    animate();
}

// Add to DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    initPortfolioCarousel();
});
