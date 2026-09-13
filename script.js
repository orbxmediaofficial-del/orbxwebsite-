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
// VIDEO LIGHTBOX MODAL CONTROLLER
// =========================================
const videoModal = document.getElementById('videoModal');
const videoIframe = document.getElementById('videoIframe');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalBackdrop = document.getElementById('modalBackdrop');
const modalVideoTitle = document.getElementById('modalVideoTitle');
const videoTriggers = document.querySelectorAll('.video-trigger, .video-trigger-btn');

function openVideoModal(videoId, title, isVertical = true) {
    if (!videoModal || !videoIframe) return;
    
    const wrapper = videoModal.querySelector('.video-player-wrapper');
    if (isVertical && wrapper) {
        wrapper.classList.add('vertical-video');
    } else if (wrapper) {
        wrapper.classList.remove('vertical-video');
    }
    
    // Set YouTube Embed URL with Autoplay enabled using youtube-nocookie
    // Avoids third-party cookie restrictions and parameter errors
    videoIframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&enablejsapi=1`;
    if (modalVideoTitle) {
        modalVideoTitle.textContent = title || 'Featured Video';
    }
    
    const externalLink = document.getElementById('modalExternalLink');
    if (externalLink) {
        externalLink.href = `https://youtube.com/shorts/${videoId}`;
    }
    
    videoModal.classList.add('active');
    videoModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeVideoModal() {
    if (!videoModal || !videoIframe) return;
    
    videoModal.classList.remove('active');
    videoModal.setAttribute('aria-hidden', 'true');
    // Clear iframe src to stop video and audio playback immediately
    videoIframe.src = '';
    document.body.style.overflow = '';
}

videoTriggers.forEach(el => {
    el.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const card = el.closest('.project-card');
        const videoId = el.getAttribute('data-video-id') || (card ? card.getAttribute('data-video-id') : 'iwWcWjnj020');
        const title = (card ? card.getAttribute('data-video-title') : null) || 'AI Video Production';
        const isVertical = card ? card.getAttribute('data-vertical') === 'true' : true;
        
        if (videoId) {
            openVideoModal(videoId, title, isVertical);
        }
    });
});

if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeVideoModal);
if (modalBackdrop) modalBackdrop.addEventListener('click', closeVideoModal);

// Close on Escape key press
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoModal && videoModal.classList.contains('active')) {
        closeVideoModal();
    }
});
