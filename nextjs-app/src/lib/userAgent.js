/**
 * Detects if the user is browsing from an in-app browser (e.g., Instagram, Facebook).
 * Google Sign-In is often blocked in these environments.
 *
 * @param {string} userAgent - The user agent string to check
 * @returns {boolean} - True if an in-app browser is detected
 */
export const isInAppBrowser = (userAgent) => {
    if (!userAgent) return false;

    const ua = userAgent.toLowerCase();

    // Common in-app browser identifiers
    const rules = [
        'instagram', // Instagram
        'fbav',      // Facebook App Version
        'fbian',     // Facebook In-App Browser
        'fban',      // Facebook App Name
        'linkedin',  // LinkedIn
        'twitter',   // Twitter
        'slack',     // Slack
        'discord',   // Discord
        'snapchat',  // Snapchat
        'line',      // Line
        'musical_ly', // TikTok
        'gsa',         // Google Search App (often used in Gmail)
        'wv',        // Android WebView
    ];

    return rules.some(rule => ua.includes(rule));
};
