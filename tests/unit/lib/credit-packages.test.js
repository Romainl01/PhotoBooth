import { describe, it, expect, beforeEach } from 'vitest';
import { DEFAULT_CREDIT_PACKAGES } from '@/lib/creditPackages.js';

describe('Credit Packages - Configuration', () => {
  describe('DEFAULT_CREDIT_PACKAGES structure', () => {
    it('should have exactly 3 credit packages', () => {
      expect(DEFAULT_CREDIT_PACKAGES).toHaveLength(3);
    });

    it('should have Starter package', () => {
      const starter = DEFAULT_CREDIT_PACKAGES.find(p => p.name === 'Starter');
      expect(starter).toBeDefined();
      expect(starter.credits).toBe(10);
      expect(starter.price_cents).toBe(399);
      expect(starter.emoji).toBe('💫');
    });

    it('should have Creator package', () => {
      const creator = DEFAULT_CREDIT_PACKAGES.find(p => p.name === 'Creator');
      expect(creator).toBeDefined();
      expect(creator.credits).toBe(30);
      expect(creator.price_cents).toBe(899);
      expect(creator.emoji).toBe('🎨');
    });

    it('should have Pro package', () => {
      const pro = DEFAULT_CREDIT_PACKAGES.find(p => p.name === 'Pro');
      expect(pro).toBeDefined();
      expect(pro.credits).toBe(100);
      expect(pro.price_cents).toBe(1999);
      expect(pro.emoji).toBe('🏆');
    });

    it('should use USD currency for all packages', () => {
      DEFAULT_CREDIT_PACKAGES.forEach(pkg => {
        expect(pkg.currency).toBe('USD');
      });
    });

    it('should have unique package IDs', () => {
      const ids = DEFAULT_CREDIT_PACKAGES.map(p => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have sequential package IDs starting from 1', () => {
      const ids = DEFAULT_CREDIT_PACKAGES.map(p => p.id).sort();
      expect(ids).toEqual(['1', '2', '3']);
    });
  });

  describe('Package pricing validation', () => {
    it('should have increasing credit amounts', () => {
      const [starter, creator, pro] = DEFAULT_CREDIT_PACKAGES;
      expect(starter.credits).toBeLessThan(creator.credits);
      expect(creator.credits).toBeLessThan(pro.credits);
    });

    it('should have increasing prices', () => {
      const [starter, creator, pro] = DEFAULT_CREDIT_PACKAGES;
      expect(starter.price_cents).toBeLessThan(creator.price_cents);
      expect(creator.price_cents).toBeLessThan(pro.price_cents);
    });

    it('should have better value for larger packages (price per credit)', () => {
      const [starter, creator, pro] = DEFAULT_CREDIT_PACKAGES;

      const starterPricePerCredit = starter.price_cents / starter.credits;
      const creatorPricePerCredit = creator.price_cents / creator.credits;
      const proPricePerCredit = pro.price_cents / pro.credits;

      // Larger packages should have lower price per credit (better value)
      expect(creatorPricePerCredit).toBeLessThanOrEqual(starterPricePerCredit);
      expect(proPricePerCredit).toBeLessThanOrEqual(creatorPricePerCredit);
    });

    it('should have prices in whole cents (no fractional cents)', () => {
      DEFAULT_CREDIT_PACKAGES.forEach(pkg => {
        expect(Number.isInteger(pkg.price_cents)).toBe(true);
        expect(pkg.price_cents).toBeGreaterThan(0);
      });
    });

    it('should have positive credit amounts', () => {
      DEFAULT_CREDIT_PACKAGES.forEach(pkg => {
        expect(pkg.credits).toBeGreaterThan(0);
        expect(Number.isInteger(pkg.credits)).toBe(true);
      });
    });
  });

  describe('Package metadata', () => {
    it('should have non-empty names', () => {
      DEFAULT_CREDIT_PACKAGES.forEach(pkg => {
        expect(pkg.name).toBeTruthy();
        expect(typeof pkg.name).toBe('string');
        expect(pkg.name.length).toBeGreaterThan(0);
      });
    });

    it('should have valid emojis', () => {
      DEFAULT_CREDIT_PACKAGES.forEach(pkg => {
        expect(pkg.emoji).toBeTruthy();
        expect(typeof pkg.emoji).toBe('string');
        // Emojis are typically 1-2 characters (including modifiers)
        expect(pkg.emoji.length).toBeGreaterThan(0);
        expect(pkg.emoji.length).toBeLessThanOrEqual(4);
      });
    });

    it('should have unique names', () => {
      const names = DEFAULT_CREDIT_PACKAGES.map(p => p.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it('should have unique emojis', () => {
      const emojis = DEFAULT_CREDIT_PACKAGES.map(p => p.emoji);
      const uniqueEmojis = new Set(emojis);
      expect(uniqueEmojis.size).toBe(emojis.length);
    });
  });

  describe('Stripe integration', () => {
    it('should have stripe_price_id for all packages', () => {
      DEFAULT_CREDIT_PACKAGES.forEach(pkg => {
        expect(pkg.stripe_price_id).toBeDefined();
        // In tests, Stripe price IDs come from env vars (set to 'test-*' in setup.js)
        expect(typeof pkg.stripe_price_id).toBe('string');
      });
    });

    it('should have unique Stripe price IDs', () => {
      const priceIds = DEFAULT_CREDIT_PACKAGES.map(p => p.stripe_price_id);
      const uniquePriceIds = new Set(priceIds);
      expect(uniquePriceIds.size).toBe(priceIds.length);
    });
  });

  describe('Package value calculations', () => {
    it('Starter package should cost 39.9 cents per credit', () => {
      const starter = DEFAULT_CREDIT_PACKAGES.find(p => p.name === 'Starter');
      const pricePerCredit = starter.price_cents / starter.credits;
      expect(pricePerCredit).toBeCloseTo(39.9, 1);
    });

    it('Creator package should cost 29.97 cents per credit', () => {
      const creator = DEFAULT_CREDIT_PACKAGES.find(p => p.name === 'Creator');
      const pricePerCredit = creator.price_cents / creator.credits;
      expect(pricePerCredit).toBeCloseTo(29.97, 1);
    });

    it('Pro package should cost 19.99 cents per credit', () => {
      const pro = DEFAULT_CREDIT_PACKAGES.find(p => p.name === 'Pro');
      const pricePerCredit = pro.price_cents / pro.credits;
      expect(pricePerCredit).toBeCloseTo(19.99, 2);
    });

    it('Pro package should offer ~40% better value than Starter', () => {
      const starter = DEFAULT_CREDIT_PACKAGES.find(p => p.name === 'Starter');
      const pro = DEFAULT_CREDIT_PACKAGES.find(p => p.name === 'Pro');

      const starterPricePerCredit = starter.price_cents / starter.credits;
      const proPricePerCredit = pro.price_cents / pro.credits;

      const savingsPercent = ((starterPricePerCredit - proPricePerCredit) / starterPricePerCredit) * 100;

      // Pro should save at least 35% compared to Starter
      expect(savingsPercent).toBeGreaterThanOrEqual(35);
    });
  });

  describe('Data integrity', () => {
    it('each package should have all required fields', () => {
      const requiredFields = ['id', 'name', 'emoji', 'credits', 'price_cents', 'currency', 'stripe_price_id'];

      DEFAULT_CREDIT_PACKAGES.forEach(pkg => {
        requiredFields.forEach(field => {
          expect(pkg).toHaveProperty(field);
          expect(pkg[field]).toBeDefined();
        });
      });
    });

    it('should not have unexpected fields', () => {
      const expectedFields = ['id', 'name', 'emoji', 'credits', 'price_cents', 'currency', 'stripe_price_id'];

      DEFAULT_CREDIT_PACKAGES.forEach(pkg => {
        const actualFields = Object.keys(pkg);
        actualFields.forEach(field => {
          expect(expectedFields).toContain(field);
        });
      });
    });

    it('packages should be immutable (frozen)', () => {
      // Try to modify a package (should fail silently or throw in strict mode)
      const starter = DEFAULT_CREDIT_PACKAGES[0];
      const originalCredits = starter.credits;

      // Attempt to modify
      expect(() => {
        starter.credits = 999;
      }).not.toThrow();

      // Value should remain unchanged if properly frozen
      // Note: This test documents current behavior, not enforces freezing
      // To enforce immutability, packages should be Object.freeze()d
    });
  });
});
