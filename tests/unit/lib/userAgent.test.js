import { describe, it, expect } from 'vitest';
import { isInAppBrowser } from '../../../nextjs-app/src/lib/userAgent';

describe('isInAppBrowser', () => {
    it('should return true for Instagram', () => {
        const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 123.0.0.21.115 (iPhone11,8; iOS 14_1; en_US; en-US; scale=2.00; 828x1792; 165586599)';
        expect(isInAppBrowser(ua)).toBe(true);
    });

    it('should return true for Facebook', () => {
        const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/266.0.0.57.116;FBBV/206864054;FBDV/iPhone11,8;FBMD/iPhone;FBSN/iOS;FBSV/13.3.1;FBSS/2;FBID/phone;FBLC/en_US;FBOP/5;FBCR/]';
        expect(isInAppBrowser(ua)).toBe(true);
    });

    it('should return true for LinkedIn', () => {
        const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [LinkedInApp]';
        expect(isInAppBrowser(ua)).toBe(true);
    });

    it('should return true for TikTok', () => {
        const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 musical_ly_21.1.0';
        expect(isInAppBrowser(ua)).toBe(true);
    });

    it('should return true for Snapchat', () => {
        const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Snapchat/11.24.0.35';
        expect(isInAppBrowser(ua)).toBe(true);
    });

    it('should return true for Gmail', () => {
        const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 GSA/153.0.363883554';
        expect(isInAppBrowser(ua)).toBe(true);
    });

    it('should return false for standard Chrome', () => {
        const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
        expect(isInAppBrowser(ua)).toBe(false);
    });

    it('should return false for standard Safari', () => {
        const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15';
        expect(isInAppBrowser(ua)).toBe(false);
    });

    it('should return false for empty user agent', () => {
        expect(isInAppBrowser('')).toBe(false);
        expect(isInAppBrowser(null)).toBe(false);
        expect(isInAppBrowser(undefined)).toBe(false);
    });
});
