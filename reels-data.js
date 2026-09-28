/**
 * ORBX MEDIA - AI Video Production Reels Central Data & Sync Controller
 * Manages reel videos, local storage persistence, and dynamic grid rendering.
 */

const DEFAULT_REELS = [
    {
        id: "CW33Gn8cU8w",
        title: "Cybernetic Vision",
        category: "Generative Cinema",
        poster: "https://img.youtube.com/vi/CW33Gn8cU8w/hqdefault.jpg"
    },
    {
        id: "bb1mzI0MaPE",
        title: "Neural Worldscapes",
        category: "Virtual Cinematography",
        poster: "https://img.youtube.com/vi/bb1mzI0MaPE/hqdefault.jpg"
    },
    {
        id: "cbFd-xK_hmc",
        title: "Fluid Morphologies",
        category: "Stylized Motion AI",
        poster: "https://img.youtube.com/vi/cbFd-xK_hmc/hqdefault.jpg"
    },
    {
        id: "-NAf_Bth1Q0",
        title: "Synthetic Humanoids",
        category: "Character Concept AI",
        poster: "https://img.youtube.com/vi/-NAf_Bth1Q0/hqdefault.jpg"
    },
    {
        id: "iwWcWjnj020",
        title: "Cinematic AI Showcase",
        category: "Creative Commercial AI",
        poster: "https://img.youtube.com/vi/iwWcWjnj020/hqdefault.jpg"
    },
    {
        id: "WhaOZ298OqI",
        title: "Dimensions of Light",
        category: "Future Film Aesthetics",
        poster: "https://img.youtube.com/vi/WhaOZ298OqI/hqdefault.jpg"
    }
];

// Curated library of presets agents can choose to add/swap into the reels section
const PRESET_REELS = [
    {
        id: "CW33Gn8cU8w",
        title: "Cybernetic Vision",
        category: "Generative Cinema",
        poster: "https://img.youtube.com/vi/CW33Gn8cU8w/hqdefault.jpg"
    },
    {
        id: "bb1mzI0MaPE",
        title: "Neural Worldscapes",
        category: "Virtual Cinematography",
        poster: "https://img.youtube.com/vi/bb1mzI0MaPE/hqdefault.jpg"
    },
    {
        id: "cbFd-xK_hmc",
        title: "Fluid Morphologies",
        category: "Stylized Motion AI",
        poster: "https://img.youtube.com/vi/cbFd-xK_hmc/hqdefault.jpg"
    },
    {
        id: "-NAf_Bth1Q0",
        title: "Synthetic Humanoids",
        category: "Character Concept AI",
        poster: "https://img.youtube.com/vi/-NAf_Bth1Q0/hqdefault.jpg"
    },
    {
        id: "iwWcWjnj020",
        title: "Cinematic AI Showcase",
        category: "Creative Commercial AI",
        poster: "https://img.youtube.com/vi/iwWcWjnj020/hqdefault.jpg"
    },
    {
        id: "WhaOZ298OqI",
        title: "Dimensions of Light",
        category: "Future Film Aesthetics",
        poster: "https://img.youtube.com/vi/WhaOZ298OqI/hqdefault.jpg"
    },
    {
        id: "d96wv11ExBo",
        title: "Neo-Tokyo Cyberpunk",
        category: "Sci-Fi Realism AI",
        poster: "https://img.youtube.com/vi/d96wv11ExBo/hqdefault.jpg"
    },
    {
        id: "YV4r_rCg0e8",
        title: "AI Luxury Commercial",
        category: "Brand Aesthetics",
        poster: "https://img.youtube.com/vi/YV4r_rCg0e8/hqdefault.jpg"
    },
    {
        id: "Sdpv7q2V2sU",
        title: "Cosmic Odyssey",
        category: "Space Exploration AI",
        poster: "https://img.youtube.com/vi/Sdpv7q2V2sU/hqdefault.jpg"
    }
];

const STORAGE_KEY = 'orbx_custom_reels';

/**
 * Extracts a clean YouTube Video ID from any URL format or returns raw input if already an ID.
 */
function extractYouTubeId(urlOrId) {
    if (!urlOrId) return '';
    const trimmed = urlOrId.trim();

    // Check if it's already an 11-char ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
        return trimmed;
    }

    // Handle youtube.com/shorts/VIDEO_ID
    const shortsMatch = trimmed.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (shortsMatch && shortsMatch[1]) return shortsMatch[1];

    // Handle youtu.be/VIDEO_ID
    const youtuMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (youtuMatch && youtuMatch[1]) return youtuMatch[1];

    // Handle watch?v=VIDEO_ID
    const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (watchMatch && watchMatch[1]) return watchMatch[1];

    // Handle embed/VIDEO_ID
    const embedMatch = trimmed.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch && embedMatch[1]) return embedMatch[1];

    return trimmed;
}

/**
 * Gets currently active reels from LocalStorage, falling back to DEFAULT_REELS.
 */
function getActiveReels() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch (e) {
        console.warn('Error reading stored reels:', e);
    }
    return DEFAULT_REELS;
}

/**
 * Saves reels to LocalStorage and triggers sync event.
 */
function saveActiveReels(reels) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reels));
        window.dispatchEvent(new CustomEvent('orbx_reels_updated', { detail: reels }));
        return true;
    } catch (e) {
        console.error('Error saving reels:', e);
        return false;
    }
}

/**
 * Resets reels to original defaults.
 */
function resetActiveReels() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        window.dispatchEvent(new CustomEvent('orbx_reels_updated', { detail: DEFAULT_REELS }));
        return DEFAULT_REELS;
    } catch (e) {
        console.error('Error resetting reels:', e);
        return DEFAULT_REELS;
    }
}

/**
 * Dynamically renders the reels grid without any fullscreen button on video boxes.
 * @param {string} selector CSS selector for container, e.g. '.ai-reels-grid'
 * @param {boolean} isSubgalleryPage true if inside ai-video-production.html
 */
function renderReelsGrid(selector = '.ai-reels-grid', isSubgalleryPage = false) {
    const gridContainer = document.querySelector(selector);
    if (!gridContainer) return;

    const reels = getActiveReels();
    const totalCount = reels.length;

    let html = '';
    reels.forEach((reel, index) => {
        const numStr = String(index + 1).padStart(2, '0');
        const totalStr = String(totalCount).padStart(2, '0');
        const videoId = extractYouTubeId(reel.id);
        const titleSafe = (reel.title || `AI Reel ${numStr}`).replace(/"/g, '&quot;');
        const categorySafe = (reel.category || 'Generative Cinema').replace(/"/g, '&quot;');
        const posterUrl = reel.poster || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        const clickHandler = isSubgalleryPage
            ? `openAiReelModal('${videoId}', '${titleSafe.replace(/'/g, "\\'")}')`
            : `openReelFullscreen('${videoId}', '${titleSafe.replace(/'/g, "\\'")}')`;

        html += `
        <!-- Reel ${index + 1} -->
        <div class="ai-reel-box glass-panel reveal" data-video-id="${videoId}"
            data-video-title="${titleSafe}" data-index="${index}"
            onclick="${clickHandler}">
            <div class="ai-reel-player-container">
                <div class="ai-reel-player-embed" id="aiPlayer${index}">
                    <iframe id="aiReelIframe${index}" loading="lazy"
                        src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&playsinline=1&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&enablejsapi=1"
                        title="${titleSafe}"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen></iframe>
                </div>
                <div class="ai-reel-poster" style="background-image: url('${posterUrl}');"></div>
                <div class="ai-reel-overlay">
                    <div class="ai-reel-top-bar">
                        <span class="ai-reel-num">${numStr} / ${totalStr}</span>
                        <span class="ai-slowmo-pill"><span class="slowmo-pulse"></span> 0.5x Slow-Mo</span>
                    </div>
                    <!-- Full screen button removed from video boxes for unobstructed cinematic view -->
                    <div class="ai-reel-bottom-info">
                        <span class="ai-reel-category">${categorySafe}</span>
                        <h4 class="ai-reel-title">${titleSafe}</h4>
                        <span class="ai-reel-prompt-tag"><i class="fas fa-play"></i> Tap to Play with Sound</span>
                    </div>
                </div>
            </div>
        </div>`;
    });

    gridContainer.innerHTML = html;
}

// Global exposure for all scripts and HTML pages
window.DEFAULT_REELS = DEFAULT_REELS;
window.PRESET_REELS = PRESET_REELS;
window.STORAGE_KEY = STORAGE_KEY;
window.extractYouTubeId = extractYouTubeId;
window.getActiveReels = getActiveReels;
window.saveActiveReels = saveActiveReels;
window.resetActiveReels = resetActiveReels;
window.renderReelsGrid = renderReelsGrid;
