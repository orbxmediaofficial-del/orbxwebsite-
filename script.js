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

const revealOnScroll = new IntersectionObserver(function (entries, observer) {
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
const modalVideoElement = document.getElementById('modalVideoElement');
const videoPlayerWrapper = document.getElementById('videoPlayerWrapper');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalBackBtn = document.getElementById('modalBackBtn');
const modalBottomBackBtn = document.getElementById('modalBottomBackBtn');
const modalBackdrop = document.getElementById('modalBackdrop');
const modalVideoTitle = document.getElementById('modalVideoTitle');
const videoTriggers = document.querySelectorAll('.video-trigger, .video-trigger-btn, .project-card');

// Helper to extract YouTube video ID or detect uploaded video file
function parseVideoData(urlOrId, explicitAspect = null) {
    if (!urlOrId) return { videoId: '', aspect: '16:9' };

    let raw = urlOrId.trim();

    // Check if it's a direct uploaded video file (e.g. agency-video.mp4)
    if (raw.endsWith('.mp4') || raw.endsWith('.webm') || raw.endsWith('.mov') || raw.includes('.mp4?')) {
        return { videoId: raw, aspect: explicitAspect || '9:16' };
    }

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

function openVideoModal(videoSource, title, aspect = '9:16') {
    if (!videoModal) return;

    const wrapper = videoPlayerWrapper || videoModal.querySelector('.video-player-wrapper');
    if (wrapper) {
        wrapper.classList.remove('aspect-9-16', 'aspect-16-9', 'vertical-video');
        if (aspect === '9:16') {
            wrapper.classList.add('aspect-9-16');
        } else {
            wrapper.classList.add('aspect-16-9');
        }
    }

    const isLocalVideo = videoSource.endsWith('.mp4') || videoSource.endsWith('.webm') || videoSource.endsWith('.mov');

    if (isLocalVideo) {
        if (videoIframe) {
            videoIframe.style.display = 'none';
            videoIframe.src = '';
        }
        if (modalVideoElement) {
            modalVideoElement.style.display = 'block';
            modalVideoElement.src = videoSource;
            modalVideoElement.play().catch(() => { });
        }
    } else {
        if (modalVideoElement) {
            modalVideoElement.style.display = 'none';
            modalVideoElement.pause();
            modalVideoElement.src = '';
        }
        if (videoIframe) {
            videoIframe.style.display = 'block';
            // Clean YouTube embed:
            // - Strips YouTube Shorts overlays (thumbs up / likes, comments, share, remix, channel watermark)
            // - autoplay=1: plays immediately on open
            // - controls=1: provides clean playback bar
            // - rel=0: hides external recommended videos
            // - playsinline=1: prevents unwanted external player jump on mobile
            // - modestbranding=1 & iv_load_policy=3: eliminates annotations and badges
            videoIframe.src = `https://www.youtube-nocookie.com/embed/${videoSource}?autoplay=1&controls=1&rel=0&playsinline=1&modestbranding=1&iv_load_policy=3&disablekb=0`;
        }
    }

    if (modalVideoTitle) {
        modalVideoTitle.textContent = title || 'Featured Video';
    }

    videoModal.classList.add('active');
    videoModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeVideoModal() {
    if (!videoModal) return;

    videoModal.classList.remove('active');
    videoModal.setAttribute('aria-hidden', 'true');
    // Clear iframe & native video playback immediately
    if (videoIframe) {
        videoIframe.src = '';
    }
    if (modalVideoElement) {
        modalVideoElement.pause();
        modalVideoElement.src = '';
    }

    // If AI Gallery sub-view is open, preserve scroll lock and resume slow-mo previews
    const aiGallery = document.getElementById('aiGalleryModal');
    if (aiGallery && aiGallery.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
        if (typeof resumeAiSlowMoPlayers === 'function') {
            resumeAiSlowMoPlayers();
        }
    } else {
        document.body.style.overflow = '';
    }
}

// Attach click triggers
videoTriggers.forEach(el => {
    el.addEventListener('click', (e) => {
        const card = el.closest('.project-card') || el;

        // Let the dedicated AI Gallery handler manage the AI Video Production card
        if (card && (card.id === 'aiVideoGalleryCard' || card.classList.contains('ai-gallery-trigger-card') || el.classList.contains('ai-gallery-open-btn') || el.classList.contains('ai-gallery-play-btn'))) {
            return;
        }

        const rawVideo = card.getAttribute('data-video-url') || card.getAttribute('data-video-id') || el.getAttribute('data-video-id');

        // If this element is an external anchor with a non-# href, allow default navigation
        if (e.target.tagName === 'A' && e.target.getAttribute('href') && e.target.getAttribute('href') !== '#') {
            return;
        }

        if (rawVideo) {
            e.preventDefault();
            e.stopPropagation();
            const explicitAspect = card.getAttribute('data-modal-aspect') || card.getAttribute('data-aspect');
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

// =========================================
// ABOUT SECTION UPLOADED AGENCY VIDEO CONTROLLER
// (Continuous playback through scrolling, Mute toggle, Play/Pause, Fullscreen)
// =========================================
const agencyVideo = document.getElementById('aboutAgencyVideo');
const agencyMuteBtn = document.getElementById('agencyMuteBtn');
const agencyPlayPauseBtn = document.getElementById('agencyPlayPauseBtn');
const agencyFullscreenBtn = document.getElementById('agencyFullscreenBtn');

if (agencyVideo) {
    let isManuallyPaused = false;

    // Helper to start playback smoothly with muted audio
    const startPlayback = () => {
        agencyVideo.muted = true;
        const playPromise = agencyVideo.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                // Handled gracefully until user interaction allows media playback
            });
        }
    };

    // Ensure it plays immediately on load
    startPlayback();
    window.addEventListener('load', startPlayback);
    document.addEventListener('DOMContentLoaded', startPlayback);

    // Keep it playing continuously when the visitor scrolls through the page
    window.addEventListener('scroll', () => {
        if (agencyVideo.paused && !isManuallyPaused) {
            startPlayback();
        }
    }, { passive: true });

    // IntersectionObserver to guarantee continuous playback whenever in/near viewport
    if ('IntersectionObserver' in window) {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !isManuallyPaused && agencyVideo.paused) {
                    startPlayback();
                }
            });
        }, { threshold: 0.1 });
        videoObserver.observe(agencyVideo);
    }

    // Toggle Sound (Mute / Unmute)
    if (agencyMuteBtn) {
        agencyMuteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            agencyVideo.muted = !agencyVideo.muted;
            const icon = agencyMuteBtn.querySelector('i');
            if (icon) {
                icon.className = agencyVideo.muted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
            }
        });
    }

    // Toggle Play / Pause
    if (agencyPlayPauseBtn) {
        agencyPlayPauseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (agencyVideo.paused) {
                agencyVideo.play().catch(() => { });
                isManuallyPaused = false;
                agencyPlayPauseBtn.querySelector('i').className = 'fas fa-pause';
            } else {
                agencyVideo.pause();
                isManuallyPaused = true;
                agencyPlayPauseBtn.querySelector('i').className = 'fas fa-play';
            }
        });
    }

    // Click video directly to toggle play/pause
    agencyVideo.addEventListener('click', () => {
        if (agencyVideo.paused) {
            agencyVideo.play().catch(() => { });
            isManuallyPaused = false;
            if (agencyPlayPauseBtn) agencyPlayPauseBtn.querySelector('i').className = 'fas fa-pause';
        } else {
            agencyVideo.pause();
            isManuallyPaused = true;
            if (agencyPlayPauseBtn) agencyPlayPauseBtn.querySelector('i').className = 'fas fa-play';
        }
    });

    // Full-Screen Modal Expansion with Back Button
    if (agencyFullscreenBtn) {
        agencyFullscreenBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const videoUrl = agencyFullscreenBtn.getAttribute('data-video-url') || (agencyVideo ? (agencyVideo.currentSrc || 'showreel.mp4') : 'showreel.mp4');
            const title = agencyFullscreenBtn.getAttribute('data-video-title') || 'ORBX MEDIA Agency Reel';
            openVideoModal(videoUrl, title, '9:16');
        });
    }
}

// =========================================
// AI VIDEO PRODUCTION REELS SUB-GALLERY CONTROLLER
// (Slow-Motion 0.5x YouTube Previews & Fullscreen Expansion)
// =========================================
const aiGalleryModal = document.getElementById('aiGalleryModal');
const aiGalleryBackBtn = document.getElementById('aiGalleryBackBtn');
const aiGalleryBackBtnBottom = document.getElementById('aiGalleryBackBtnBottom');
const aiGalleryCloseBtn = document.getElementById('aiGalleryCloseBtn');
const aiGalleryBackdrop = document.getElementById('aiGalleryBackdrop');
const aiReelBoxes = document.querySelectorAll('.ai-reel-box');
const aiGalleryTriggerCard = document.getElementById('aiVideoGalleryCard');

let aiYtPlayers = [];
let isAiYtApiReady = false;

// YouTube API Ready Callback
window.onYouTubeIframeAPIReady = function () {
    isAiYtApiReady = true;
    if (aiGalleryModal && aiGalleryModal.classList.contains('active')) {
        initAiSlowMoPlayers();
    }
};

function initAiSlowMoPlayers() {
    if (!window.YT || !window.YT.Player) return;

    aiReelBoxes.forEach((box, index) => {
        const videoId = box.getAttribute('data-video-id');
        const containerId = `aiPlayer${index}`;
        const container = document.getElementById(containerId);

        if (videoId && container && !aiYtPlayers[index]) {
            try {
                aiYtPlayers[index] = new YT.Player(containerId, {
                    videoId: videoId,
                    playerVars: {
                        autoplay: 1,
                        mute: 1,
                        controls: 0,
                        loop: 1,
                        playlist: videoId,
                        playsinline: 1,
                        modestbranding: 1,
                        rel: 0,
                        iv_load_policy: 3,
                        disablekb: 1,
                        fs: 0
                    },
                    events: {
                        onReady: (event) => {
                            try {
                                event.target.mute();
                                event.target.setPlaybackRate(0.5); // 0.5x slow-motion ambient display
                                event.target.playVideo();
                                box.classList.add('player-loaded');
                            } catch (err) { }
                        },
                        onStateChange: (event) => {
                            if (event.data === YT.PlayerState.PLAYING) {
                                try {
                                    event.target.setPlaybackRate(0.5); // Enforce slow-motion
                                } catch (e) { }
                            } else if (event.data === YT.PlayerState.ENDED) {
                                try {
                                    event.target.playVideo();
                                    event.target.setPlaybackRate(0.5);
                                } catch (e) { }
                            }
                        }
                    }
                });
            } catch (e) {
                console.warn('Could not initialize YT reel player', e);
            }
        }
    });
}

function pauseAiSlowMoPlayers() {
    aiYtPlayers.forEach(player => {
        try {
            if (player && typeof player.pauseVideo === 'function') {
                player.pauseVideo();
            }
        } catch (e) { }
    });
}

function resumeAiSlowMoPlayers() {
    aiYtPlayers.forEach(player => {
        try {
            if (player && typeof player.playVideo === 'function') {
                player.setPlaybackRate(0.5);
                player.playVideo();
            }
        } catch (e) { }
    });
}

function openAiGallery() {
    if (!aiGalleryModal) return;

    aiGalleryModal.classList.add('active');
    aiGalleryModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Initialize or resume slow-motion preview players
    if (window.YT && window.YT.Player) {
        if (aiYtPlayers.length === 0) {
            initAiSlowMoPlayers();
        } else {
            resumeAiSlowMoPlayers();
        }
    }
}

function closeAiGallery() {
    if (!aiGalleryModal) return;

    aiGalleryModal.classList.remove('active');
    aiGalleryModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    pauseAiSlowMoPlayers();
}

// Click trigger for AI Video Production card in Featured Work section
if (aiGalleryTriggerCard) {
    aiGalleryTriggerCard.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openAiGallery();
    });
}

// Click triggers for all 6 portrait reel boxes inside the sub-gallery
aiReelBoxes.forEach(box => {
    box.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const videoId = box.getAttribute('data-video-id');
        const title = box.getAttribute('data-video-title') || 'AI Video Production Reel';

        if (videoId) {
            // Pause slow-motion previews while watching full screen
            pauseAiSlowMoPlayers();
            // Launch full screen modal with audio and controls in 9:16 vertical ratio
            openVideoModal(videoId, title, '9:16');
        }
    });
});

// Back & Close buttons
if (aiGalleryBackBtn) aiGalleryBackBtn.addEventListener('click', closeAiGallery);
if (aiGalleryBackBtnBottom) aiGalleryBackBtnBottom.addEventListener('click', closeAiGallery);
if (aiGalleryCloseBtn) aiGalleryCloseBtn.addEventListener('click', closeAiGallery);
if (aiGalleryBackdrop) aiGalleryBackdrop.addEventListener('click', closeAiGallery);

// Escape key listener for both modals
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (videoModal && videoModal.classList.contains('active')) {
            closeVideoModal();
        } else if (aiGalleryModal && aiGalleryModal.classList.contains('active')) {
            closeAiGallery();
        }
    }
});
