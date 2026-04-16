(function() {
    // Get the site ID from the script tag
    const scriptTag = document.currentScript;
    const siteId = scriptTag.getAttribute('data-site-id');
    
    if (!siteId) {
        console.warn('AI Traffic: Missing data-site-id');
        return;
    }

    // Detect AI source (simplified)
    function getAISource() {
        const params = new URLSearchParams(window.location.search);
        if (params.get('utm_source') === 'chatgpt') return 'ChatGPT';
        if (params.get('utm_source') === 'perplexity') return 'Perplexity';
        
        const ref = document.referrer;
        if (ref.includes('chat.openai.com') || ref.includes('chatgpt.com')) return 'ChatGPT';
        if (ref.includes('perplexity.ai')) return 'Perplexity';
        if (ref.includes('claude.ai')) return 'Claude';
        
        return null; // Not AI traffic
    }

    const aiSource = getAISource();
    if (!aiSource) return; // Only track AI traffic

    // Send to your backend
    fetch('https://api.aitraffic.app/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            siteId: siteId,
            source: aiSource,
            page: window.location.pathname,
            timestamp: new Date().toISOString()
        })
    }).catch(e => console.error('AI Traffic tracking error:', e));
})();