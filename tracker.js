/**
 * AI Traffic Tracker v1.0.2
 * A lightweight, privacy-first script to detect and report traffic from AI chatbots.
 * Only tracks visits that originate from ChatGPT, Perplexity, Claude, and similar AI platforms.
 * No cookies. No personal data. GDPR compliant by design.
 * 
 * Usage: <script src="https://cdn.jsdelivr.net/gh/swmohsin/aitraffic-tracker@1.0.2/tracker.js" data-site-id="YOUR_SITE_ID" async></script>
 */

(function() {
    'use strict';

    // --- Configuration ---
    // Replace with your actual backend API endpoint
    const API_ENDPOINT = 'https://api.aitraffic.app/track';
    
    // --- Get Site ID from Script Tag ---
    const scriptTag = document.currentScript;
    const siteId = scriptTag ? scriptTag.getAttribute('data-site-id') : null;
    
    if (!siteId) {
        console.warn('[AI Traffic] Missing data-site-id attribute. Tracking disabled.');
        return;
    }

    // --- AI Source Detection ---
    function detectAISource() {
        // 1. Check UTM parameters (most reliable)
        const params = new URLSearchParams(window.location.search);
        const utmSource = params.get('utm_source');
        
        if (utmSource) {
            const sourceLower = utmSource.toLowerCase();
            if (sourceLower === 'chatgpt' || sourceLower === 'chatgpt.com' || sourceLower.includes('chat.openai')) {
                return 'ChatGPT';
            }
            if (sourceLower === 'perplexity' || sourceLower.includes('perplexity.ai')) {
                return 'Perplexity';
            }
            if (sourceLower === 'claude' || sourceLower.includes('claude.ai')) {
                return 'Claude';
            }
            if (sourceLower === 'gemini' || sourceLower.includes('gemini.google')) {
                return 'Google Gemini';
            }
            if (sourceLower === 'copilot' || sourceLower.includes('copilot.microsoft')) {
                return 'Microsoft Copilot';
            }
        }
        
        // 2. Check referrer header (fallback)
        const referrer = document.referrer;
        if (referrer) {
            const refLower = referrer.toLowerCase();
            if (refLower.includes('chat.openai.com') || refLower.includes('chatgpt.com')) {
                return 'ChatGPT';
            }
            if (refLower.includes('perplexity.ai')) {
                return 'Perplexity';
            }
            if (refLower.includes('claude.ai')) {
                return 'Claude';
            }
            if (refLower.includes('gemini.google.com')) {
                return 'Google Gemini';
            }
            if (refLower.includes('copilot.microsoft.com')) {
                return 'Microsoft Copilot';
            }
        }
        
        return null; // Not AI traffic
    }

    // --- Main Execution ---
    const aiSource = detectAISource();
    
    // Only proceed if this is AI traffic
    if (!aiSource) return;

    // Prepare payload (minimal data only)
    const payload = {
        siteId: siteId,
        source: aiSource,
        page: window.location.pathname,
        timestamp: new Date().toISOString()
    };

    // Optional: Include referrer for debugging (can be removed in production)
    if (document.referrer) {
        payload.referrer = document.referrer;
    }

    // Send to backend using sendBeacon for reliability (doesn't block page unload)
    if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        navigator.sendBeacon(API_ENDPOINT, blob);
    } else {
        // Fallback for older browsers
        fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            keepalive: true
        }).catch(err => console.error('[AI Traffic] Failed to send:', err));
    }
})();