// DOM Elements
const navbar = document.querySelector('.navbar');
const mobileBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');
const navItems = document.querySelectorAll('.nav-link');
const currentYear = document.getElementById('year');

// Set Current Year in Footer
currentYear.textContent = new Date().getFullYear();

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile Menu Toggle
mobileBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    
    // Change icon based on state
    const icon = mobileBtn.querySelector('i');
    if (navLinks.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

// Close mobile menu when clicking a link
navItems.forEach(item => {
    item.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = mobileBtn.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    });
});

// Reveal Animations on Scroll using Intersection Observer
const revealElements = document.querySelectorAll('.reveal, .reveal-right');

const revealOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
};

const revealOnScroll = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) {
            return;
        } else {
            entry.target.classList.add('active');
            observer.unobserve(entry.target); // Only animate once
        }
    });
}, revealOptions);

revealElements.forEach(element => {
    revealOnScroll.observe(element);
});

// Add continuous subtle hover movements for cards using JS
const glassCards = document.querySelectorAll('.glass-card, .project-card');

glassCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Very subtle 3D tilt effect
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const tiltX = (y - centerY) / 20;
        const tiltY = (centerX - x) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-8px)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)`;
        setTimeout(() => {
            card.style.transition = 'var(--transition-normal)'; // Restore original transition overriden by JS inline style
        }, 100);
    });
});

// WhatsApp Form Submission Handler
const whatsappForm = document.getElementById('whatsapp-form');
if (whatsappForm) {
    whatsappForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nameInput = document.getElementById('name');
        const serviceInput = document.getElementById('service');
        const messageInput = document.getElementById('message');
        const btn = whatsappForm.querySelector('.whatsapp-submit-btn');
        
        const name = nameInput ? nameInput.value.trim() : '';
        const service = serviceInput ? serviceInput.value : '';
        const message = messageInput ? messageInput.value.trim() : '';
        
        // Build customized WhatsApp text
        let waText = `*New Project Inquiry - ORBX MEDIA*%0A%0A`;
        waText += `*Name / Studio:* ${encodeURIComponent(name)}%0A`;
        if (service) {
            waText += `*Service:* ${encodeURIComponent(service)}%0A`;
        }
        waText += `*Project Details:* ${encodeURIComponent(message)}`;
        
        const whatsappUrl = `https://wa.me/916238128376?text=${waText}`;
        
        // Visual button feedback
        const originalContent = btn.innerHTML;
        btn.innerHTML = '<i class="fab fa-whatsapp fa-spin"></i> Opening WhatsApp...';
        btn.style.opacity = '0.9';
        
        // Open WhatsApp in a new tab
        window.open(whatsappUrl, '_blank');
        
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-check"></i> Redirected to WhatsApp!';
            btn.style.background = '#25D366';
            btn.style.boxShadow = '0 6px 20px rgba(37, 211, 102, 0.5)';
            
            setTimeout(() => {
                btn.innerHTML = originalContent;
                btn.style.background = '';
                btn.style.boxShadow = '';
                btn.style.opacity = '1';
                whatsappForm.reset();
            }, 3500);
        }, 800);
    });
}

// =========================================
// FULL-SCREEN VIDEO MODAL CONTROLLER
// =========================================
const videoModal = document.getElementById('videoModal');
const videoIframe = document.getElementById('videoIframe');
const videoPlayerWrapper = document.getElementById('videoPlayerWrapper');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalBackBtn = document.getElementById('modalBackBtn');
const modalBottomBackBtn = document.getElementById('modalBottomBackBtn');
const modalBackdrop = document.getElementById('modalBackdrop');
const modalVideoTitle = document.getElementById('modalVideoTitle');
const videoTriggers = document.querySelectorAll('.video-trigger, .video-trigger-btn, .project-card');

// Helper to extract YouTube video ID and detect aspect ratio
function parseVideoData(urlOrId, explicitAspect = null) {
    if (!urlOrId) return { videoId: '', aspect: '16:9' };
    
    let raw = urlOrId.trim();
    let isShort = false;
    let videoId = raw;

    if (raw.includes('youtube.com') || raw.includes('youtu.be')) {
        if (raw.includes('/shorts/')) {
            isShort = true;
            const match = raw.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
            if (match) videoId = match[1];
        } else if (raw.includes('watch?v=')) {
            const match = raw.match(/[?&]v=([a-zA-Z0-9_-]+)/);
            if (match) videoId = match[1];
        } else if (raw.includes('youtu.be/')) {
            const match = raw.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
            if (match) videoId = match[1];
        }
    }

    videoId = videoId.split('?')[0].split('&')[0];
    const aspect = explicitAspect || (isShort ? '9:16' : '16:9');
    
    return { videoId, aspect };
}

function openVideoModal(videoId, title, aspect = '9:16') {
    if (!videoModal || !videoIframe) return;
    
    const wrapper = videoPlayerWrapper || videoModal.querySelector('.video-player-wrapper');
    if (wrapper) {
        wrapper.classList.remove('aspect-9-16', 'aspect-16-9', 'vertical-video');
        if (aspect === '9:16') {
            wrapper.classList.add('aspect-9-16');
        } else {
            wrapper.classList.add('aspect-16-9');
        }
    }
    
    // Clean YouTube embed:
    // - Strips YouTube Shorts overlays (thumbs up / likes, comments, share, remix, channel watermark)
    // - autoplay=1: plays immediately on open
    // - controls=1: provides clean playback bar
    // - rel=0: hides external recommended videos
    // - playsinline=1: prevents unwanted external player jump on mobile
    // - modestbranding=1 & iv_load_policy=3: eliminates annotations and badges
    videoIframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=1&rel=0&playsinline=1&modestbranding=1&iv_load_policy=3&disablekb=0`;
    
    if (modalVideoTitle) {
        modalVideoTitle.textContent = title || 'Featured Video';
    }
    
    videoModal.classList.add('active');
    videoModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeVideoModal() {
    if (!videoModal || !videoIframe) return;
    
    videoModal.classList.remove('active');
    videoModal.setAttribute('aria-hidden', 'true');
    // Clear iframe src immediately to terminate video and audio playback
    videoIframe.src = '';
    document.body.style.overflow = '';
}

// Attach click triggers
videoTriggers.forEach(el => {
    el.addEventListener('click', (e) => {
        const card = el.closest('.project-card') || el;
        const rawVideo = card.getAttribute('data-video-url') || card.getAttribute('data-video-id') || el.getAttribute('data-video-id');
        
        // If this element is an external anchor with a non-# href, allow default navigation
        if (e.target.tagName === 'A' && e.target.getAttribute('href') && e.target.getAttribute('href') !== '#') {
            return;
        }
        
        if (rawVideo) {
            e.preventDefault();
            e.stopPropagation();
            const explicitAspect = card.getAttribute('data-aspect');
            const title = card.getAttribute('data-video-title') || 'Featured Work';
            const { videoId, aspect } = parseVideoData(rawVideo, explicitAspect);
            
            if (videoId) {
                openVideoModal(videoId, title, aspect);
            }
        }
    });
});

// Back & Close buttons
if (modalBackBtn) modalBackBtn.addEventListener('click', closeVideoModal);
if (modalBottomBackBtn) modalBottomBackBtn.addEventListener('click', closeVideoModal);
if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeVideoModal);
if (modalBackdrop) modalBackdrop.addEventListener('click', closeVideoModal);

// Close on Escape key press
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoModal && videoModal.classList.contains('active')) {
        closeVideoModal();
    }
});
