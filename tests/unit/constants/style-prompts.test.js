import { describe, it, expect } from 'vitest';
import { STYLE_PROMPTS } from '@/src/constants/stylePrompts.js';

describe('Style Prompts - Filter Configuration', () => {
  describe('STYLE_PROMPTS structure', () => {
    it('should be defined and not empty', () => {
      expect(STYLE_PROMPTS).toBeDefined();
      expect(Object.keys(STYLE_PROMPTS).length).toBeGreaterThan(0);
    });

    it('should have exactly 13 active styles', () => {
      const activeStyles = Object.keys(STYLE_PROMPTS);
      expect(activeStyles).toHaveLength(13);
    });

    it('should export as an object', () => {
      expect(typeof STYLE_PROMPTS).toBe('object');
      expect(Array.isArray(STYLE_PROMPTS)).toBe(false);
    });
  });

  describe('Active styles - presence and validity', () => {
    const expectedStyles = [
      'Executive',
      'Wes Anderson',
      'Urban',
      'Runway',
      'Lord',
      'Marseille',
      'Halloween',
      'Kill Bill',
      'Chucky',
      'Zombie',
      'Matrix',
      'Star Wars',
      'Harry Potter',
    ];

    expectedStyles.forEach(styleName => {
      it(`should have "${styleName}" style defined`, () => {
        expect(STYLE_PROMPTS).toHaveProperty(styleName);
      });

      it(`"${styleName}" should have a non-empty prompt`, () => {
        expect(STYLE_PROMPTS[styleName]).toBeTruthy();
        expect(typeof STYLE_PROMPTS[styleName]).toBe('string');
        expect(STYLE_PROMPTS[styleName].length).toBeGreaterThan(0);
      });

      it(`"${styleName}" should have a substantial prompt (>100 characters)`, () => {
        // AI prompts should be detailed, not just a few words
        expect(STYLE_PROMPTS[styleName].length).toBeGreaterThan(100);
      });
    });
  });

  describe('Prompt quality checks', () => {
    const allPrompts = Object.entries(STYLE_PROMPTS);

    allPrompts.forEach(([styleName, prompt]) => {
      it(`"${styleName}" prompt should preserve facial identity (contains "preserve" or "maintain")`, () => {
        const lowerPrompt = prompt.toLowerCase();
        const hasPreserve = lowerPrompt.includes('preserve') ||
                           lowerPrompt.includes('maintain') ||
                           lowerPrompt.includes('keep exact') ||
                           lowerPrompt.includes('keep original');
        expect(hasPreserve).toBe(true);
      });

      it(`"${styleName}" prompt should mention facial features`, () => {
        const lowerPrompt = prompt.toLowerCase();
        const hasFacialMention = lowerPrompt.includes('face') ||
                                lowerPrompt.includes('facial') ||
                                lowerPrompt.includes('identity');
        expect(hasFacialMention).toBe(true);
      });

      it(`"${styleName}" prompt should not be excessively long (< 5000 chars)`, () => {
        // Ensure prompts are reasonable length (not accidentally duplicated)
        expect(prompt.length).toBeLessThan(5000);
      });

      it(`"${styleName}" prompt should not have obvious typos in key terms`, () => {
        // Check for common typos that would break generation
        expect(prompt).not.toContain('trasform'); // typo of "transform"
        expect(prompt).not.toContain('perserve'); // typo of "preserve"
        expect(prompt).not.toContain('backround'); // typo of "background"
      });
    });
  });

  describe('Specific style validations', () => {
    it('Executive style should mention black and white', () => {
      expect(STYLE_PROMPTS['Executive'].toLowerCase()).toContain('black and white');
    });

    it('Wes Anderson style should mention pastel colors', () => {
      expect(STYLE_PROMPTS['Wes Anderson'].toLowerCase()).toContain('pastel');
    });

    it('Urban style should mention city or street', () => {
      const urbanPrompt = STYLE_PROMPTS['Urban'].toLowerCase();
      const hasUrbanElements = urbanPrompt.includes('city') || urbanPrompt.includes('street');
      expect(hasUrbanElements).toBe(true);
    });

    it('Runway style should mention fashion or runway', () => {
      const runwayPrompt = STYLE_PROMPTS['Runway'].toLowerCase();
      const hasFashionElements = runwayPrompt.includes('fashion') || runwayPrompt.includes('runway');
      expect(hasFashionElements).toBe(true);
    });

    it('Lord style should mention royal or noble', () => {
      const lordPrompt = STYLE_PROMPTS['Lord'].toLowerCase();
      const hasRoyalElements = lordPrompt.includes('royal') || lordPrompt.includes('noble');
      expect(hasRoyalElements).toBe(true);
    });

    it('Marseille style should mention OM or Marseille', () => {
      const marseillePrompt = STYLE_PROMPTS['Marseille'];
      const hasMarseilleElements = marseillePrompt.includes('Marseille') ||
                                   marseillePrompt.includes('OM') ||
                                   marseillePrompt.includes('Olympique');
      expect(hasMarseilleElements).toBe(true);
    });

    it('Halloween style should mention costume or Halloween', () => {
      const halloweenPrompt = STYLE_PROMPTS['Halloween'].toLowerCase();
      const hasHalloweenElements = halloweenPrompt.includes('halloween') ||
                                   halloweenPrompt.includes('costume');
      expect(hasHalloweenElements).toBe(true);
    });

    it('Kill Bill style should mention yellow tracksuit or katana', () => {
      const killBillPrompt = STYLE_PROMPTS['Kill Bill'].toLowerCase();
      const hasKillBillElements = killBillPrompt.includes('yellow') ||
                                  killBillPrompt.includes('tracksuit') ||
                                  killBillPrompt.includes('katana');
      expect(hasKillBillElements).toBe(true);
    });

    it('Chucky style should mention striped shirt or overalls', () => {
      const chuckyPrompt = STYLE_PROMPTS['Chucky'].toLowerCase();
      const hasChuckyElements = chuckyPrompt.includes('striped') ||
                                chuckyPrompt.includes('overalls');
      expect(hasChuckyElements).toBe(true);
    });

    it('Zombie style should mention makeup or Walking Dead', () => {
      const zombiePrompt = STYLE_PROMPTS['Zombie'].toLowerCase();
      const hasZombieElements = zombiePrompt.includes('zombie') ||
                                zombiePrompt.includes('makeup') ||
                                zombiePrompt.includes('walking dead');
      expect(hasZombieElements).toBe(true);
    });

    it('Matrix style should mention black leather or trench coat', () => {
      const matrixPrompt = STYLE_PROMPTS['Matrix'].toLowerCase();
      const hasMatrixElements = matrixPrompt.includes('black leather') ||
                                matrixPrompt.includes('trench coat') ||
                                matrixPrompt.includes('matrix');
      expect(hasMatrixElements).toBe(true);
    });

    it('Star Wars style should mention Jedi or Sith or lightsaber', () => {
      const starWarsPrompt = STYLE_PROMPTS['Star Wars'].toLowerCase();
      const hasStarWarsElements = starWarsPrompt.includes('jedi') ||
                                  starWarsPrompt.includes('sith') ||
                                  starWarsPrompt.includes('lightsaber');
      expect(hasStarWarsElements).toBe(true);
    });

    it('Harry Potter style should mention Hogwarts or wizard', () => {
      const harryPotterPrompt = STYLE_PROMPTS['Harry Potter'].toLowerCase();
      const hasHPElements = harryPotterPrompt.includes('hogwarts') ||
                           harryPotterPrompt.includes('wizard') ||
                           harryPotterPrompt.includes('wand');
      expect(hasHPElements).toBe(true);
    });
  });

  describe('Critical requirements for all prompts', () => {
    const allPrompts = Object.entries(STYLE_PROMPTS);

    allPrompts.forEach(([styleName, prompt]) => {
      it(`"${styleName}" should instruct to preserve facial identity`, () => {
        const lowerPrompt = prompt.toLowerCase();
        // Must explicitly mention preserving facial identity
        const hasIdentityPreservation = lowerPrompt.includes('exact facial') ||
                                       lowerPrompt.includes('exact face') ||
                                       lowerPrompt.includes('facial identity') ||
                                       lowerPrompt.includes('preserve exact') ||
                                       lowerPrompt.includes('preserve') ||
                                       lowerPrompt.includes('maintain');
        expect(hasIdentityPreservation).toBe(true);
      });

      it(`"${styleName}" should not accidentally request unwanted facial changes`, () => {
        const lowerPrompt = prompt.toLowerCase();
        // Should NOT contain positive commands to alter the face
        // (Note: "do NOT alter" is fine - we check for absence of positive alter commands)
        expect(lowerPrompt).not.toContain('change the face completely');
        expect(lowerPrompt).not.toContain('transform the face into');
        expect(lowerPrompt).not.toContain('modify facial features to');
      });
    });
  });

  describe('Prompt consistency', () => {
    it('should use consistent terminology across prompts', () => {
      const allPrompts = Object.values(STYLE_PROMPTS);

      // Check that key terms are spelled consistently
      allPrompts.forEach(prompt => {
        const lowerPrompt = prompt.toLowerCase();

        // If mentions background, should be spelled correctly
        if (lowerPrompt.includes('backgr')) {
          expect(lowerPrompt).toContain('background');
          expect(lowerPrompt).not.toContain('backround');
        }
      });
    });

    it('should have unique prompts (no duplicates)', () => {
      const prompts = Object.values(STYLE_PROMPTS);
      const uniquePrompts = new Set(prompts);
      expect(uniquePrompts.size).toBe(prompts.length);
    });
  });

  describe('Edge cases and error prevention', () => {
    it('should not have null or undefined prompts', () => {
      Object.values(STYLE_PROMPTS).forEach(prompt => {
        expect(prompt).not.toBeNull();
        expect(prompt).not.toBeUndefined();
      });
    });

    it('should not have prompts that are just whitespace', () => {
      Object.values(STYLE_PROMPTS).forEach(prompt => {
        expect(prompt.trim().length).toBeGreaterThan(0);
      });
    });

    it('should handle style names with special characters', () => {
      // Test that styles with spaces work
      expect(STYLE_PROMPTS['Wes Anderson']).toBeDefined();
      expect(STYLE_PROMPTS['Kill Bill']).toBeDefined();
      expect(STYLE_PROMPTS['Star Wars']).toBeDefined();
      expect(STYLE_PROMPTS['Harry Potter']).toBeDefined();
    });
  });

  describe('API compatibility', () => {
    it('should be compatible with API endpoint expectations', () => {
      // The API expects style names to match exactly
      // Test common variations users might try
      const styleNames = Object.keys(STYLE_PROMPTS);

      styleNames.forEach(styleName => {
        // Style names should be title case or proper nouns
        expect(styleName).not.toBe(styleName.toLowerCase());
      });
    });

    it('should have styles accessible by exact name match', () => {
      // Verify exact name matching works (case-sensitive)
      expect(STYLE_PROMPTS['Executive']).toBeDefined();
      expect(STYLE_PROMPTS['executive']).toBeUndefined(); // lowercase should not work
    });
  });
});
