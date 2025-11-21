import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { addWatermark } from '@/lib/watermark.js';

describe('Watermark - Add Branding to Images', () => {
  let mockCanvas;
  let mockContext;
  let mockImage;
  let createElementSpy;
  let createObjectURLSpy;

  beforeEach(() => {
    // Mock canvas context
    mockContext = {
      drawImage: vi.fn(),
      fillText: vi.fn(),
      scale: vi.fn(),
      getContext: vi.fn(),
      toBlob: vi.fn(),
      imageSmoothingEnabled: false,
      imageSmoothingQuality: '',
      font: '',
      fillStyle: '',
      textAlign: '',
      textBaseline: '',
      shadowColor: '',
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
    };

    // Mock canvas element
    mockCanvas = {
      getContext: vi.fn(() => mockContext),
      width: 0,
      height: 0,
      style: {},
      toBlob: vi.fn((callback) => {
        // Simulate successful blob creation
        const mockBlob = new Blob(['fake image data'], { type: 'image/jpeg' });
        callback(mockBlob);
      }),
    };

    // Mock document.createElement to return our mock canvas
    createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'canvas') {
        return mockCanvas;
      }
      return document.createElement(tag);
    });

    // Mock URL.createObjectURL
    createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-watermarked-url');

    // Mock Image constructor
    // We need to create a class that can be instantiated with 'new'
    global.Image = class {
      constructor() {
        this.width = 1024;
        this.height = 768;
        this.crossOrigin = '';
        this.onload = null;
        this.onerror = null;
        this._src = '';

        // Store instance so tests can trigger onload/onerror
        mockImage = this;
      }

      get src() {
        return this._src;
      }

      set src(value) {
        this._src = value;
      }
    };

    // Mock window.devicePixelRatio
    Object.defineProperty(window, 'devicePixelRatio', {
      writable: true,
      configurable: true,
      value: 2,
    });

    // Mock console methods to suppress logs during tests
    vi.spyOn(console, 'log').mockImplementation(() => { });
    vi.spyOn(console, 'error').mockImplementation(() => { });
  });

  afterEach(() => {
    createElementSpy.mockRestore();
    createObjectURLSpy.mockRestore();
    vi.restoreAllMocks();
  });

  describe('Basic watermark functionality', () => {
    it('should add watermark to an image successfully', async () => {
      const imageUrl = 'data:image/jpeg;base64,fake-image-data';
      const watermarkPromise = addWatermark(imageUrl);

      // Trigger image onload
      mockImage.onload();

      const result = await watermarkPromise;

      expect(result).toBe('blob:mock-watermarked-url');
      expect(mockContext.drawImage).toHaveBeenCalled();
      expect(mockContext.fillText).toHaveBeenCalled();
    });

    it('should create a canvas element', async () => {
      const imageUrl = 'data:image/jpeg;base64,fake-image-data';
      const watermarkPromise = addWatermark(imageUrl);

      mockImage.onload();
      await watermarkPromise;

      expect(document.createElement).toHaveBeenCalledWith('canvas');
      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
    });

    it('should set image crossOrigin to anonymous', async () => {
      const imageUrl = 'https://example.com/image.jpg';
      const watermarkPromise = addWatermark(imageUrl);

      expect(mockImage.crossOrigin).toBe('anonymous');

      mockImage.onload();
      await watermarkPromise;
    });

    it('should load the image from provided URL', async () => {
      const imageUrl = 'data:image/jpeg;base64,test-image';
      const watermarkPromise = addWatermark(imageUrl);

      expect(mockImage.src).toBe(imageUrl);

      mockImage.onload();
      await watermarkPromise;
    });
  });

  describe('Watermark text content', () => {
    it('should use correct watermark text', async () => {
      const imageUrl = 'data:image/jpeg;base64,fake-image-data';
      const watermarkPromise = addWatermark(imageUrl);

      mockImage.onload();
      await watermarkPromise;

      expect(mockContext.fillText).toHaveBeenCalled();
      const fillTextCall = mockContext.fillText.mock.calls[0];
      expect(fillTextCall[0]).toBe('created with Morpheo - morpheo-phi.vercel.app/');
    });

    it('watermark text should include "Morpheo"', async () => {
      const imageUrl = 'data:image/jpeg;base64,fake-image-data';
      const watermarkPromise = addWatermark(imageUrl);

      mockImage.onload();
      await watermarkPromise;

      const watermarkText = mockContext.fillText.mock.calls[0][0];
      expect(watermarkText).toContain('Morpheo');
    });

    it('watermark text should include domain', async () => {
      const imageUrl = 'data:image/jpeg;base64,fake-image-data';
      const watermarkPromise = addWatermark(imageUrl);

      mockImage.onload();
      await watermarkPromise;

      const watermarkText = mockContext.fillText.mock.calls[0][0];
      expect(watermarkText).toContain('morpheo-phi.vercel.app');
    });
  });

  describe('Canvas dimension handling', () => {
    it('should set canvas size to match image dimensions', async () => {
      const imageUrl = 'data:image/jpeg;base64,fake-image-data';
      const watermarkPromise = addWatermark(imageUrl);

      // Set dimensions after Image is created but before onload
      mockImage.width = 1920;
      mockImage.height = 1080;
      mockImage.onload();

      await watermarkPromise;

      // Canvas dimensions should be image size * devicePixelRatio (2)
      expect(mockCanvas.width).toBe(1920 * 2);
      expect(mockCanvas.height).toBe(1080 * 2);
    });

    it('should scale down images larger than MAX_DIMENSION (4096px)', async () => {
      const imageUrl = 'data:image/jpeg;base64,fake-image-data';
      const watermarkPromise = addWatermark(imageUrl);

      mockImage.width = 5000;
      mockImage.height = 4000;
      mockImage.onload();

      await watermarkPromise;

      // Image should be scaled down proportionally
      const MAX_DIMENSION = 4096;
      const scaleFactor = MAX_DIMENSION / 5000; // 0.8192
      const expectedWidth = Math.floor(5000 * scaleFactor);
      const expectedHeight = Math.floor(4000 * scaleFactor);

      expect(mockCanvas.width).toBe(expectedWidth * 2); // * devicePixelRatio
      expect(mockCanvas.height).toBe(expectedHeight * 2);
    });

    it('should not scale down small images', async () => {
      const imageUrl = 'data:image/jpeg;base64,fake-image-data';
      const watermarkPromise = addWatermark(imageUrl);

      mockImage.width = 800;
      mockImage.height = 600;
      mockImage.onload();

      await watermarkPromise;

      // Small images should not be scaled
      expect(mockCanvas.width).toBe(800 * 2); // * devicePixelRatio
      expect(mockCanvas.height).toBe(600 * 2);
    });

    it('should handle device pixel ratio correctly', async () => {
      window.devicePixelRatio = 3; // High DPI display

      const imageUrl = 'data:image/jpeg;base64,fake-image-data';
      const watermarkPromise = addWatermark(imageUrl);

      mockImage.width = 1000;
      mockImage.height = 800;
      mockImage.onload();

      await watermarkPromise;

      expect(mockCanvas.width).toBe(1000 * 3);
      expect(mockCanvas.height).toBe(800 * 3);
      expect(mockContext.scale).toHaveBeenCalledWith(3, 3);
    });

    it('should default to devicePixelRatio of 1 if not available', async () => {
      window.devicePixelRatio = undefined;

      const imageUrl = 'data:image/jpeg;base64,fake-image-data';
      const watermarkPromise = addWatermark(imageUrl);

      mockImage.width = 1000;
      mockImage.height = 800;
      mockImage.onload();

      await watermarkPromise;

      // Should use 1 as default
      expect(mockCanvas.width).toBe(1000 * 1);
      expect(mockCanvas.height).toBe(800 * 1);
    });
  });

  describe('Font sizing calculation', () => {
    it('should use minimum font size of 80px for small images', async () => {
      const imageUrl = 'data:image/jpeg;base64,fake-image-data';
      const watermarkPromise = addWatermark(imageUrl);

      mockImage.width = 100;
      mockImage.height = 100;
      mockImage.onload();

      await watermarkPromise;

      // Font size should be at least 80px (minimum)
      expect(mockContext.font).toContain('80px');
    });

    it('should calculate dynamic font size for medium images', async () => {
      const imageUrl = 'data:image/jpeg;base64,fake-image-data';
      const watermarkPromise = addWatermark(imageUrl);

      mockImage.width = 1000;
      mockImage.height = 1000;
      mockImage.onload();

      await watermarkPromise;

      // Font size should be min(width/2.5, height/2.5) = min(400, 400) = 400
      expect(mockContext.font).toContain('400px');
    });

    it('should use smaller dimension for font size calculation', async () => {
      const imageUrl = 'data:image/jpeg;base64,fake-image-data';
      const watermarkPromise = addWatermark(imageUrl);

      mockImage.width = 2000;
      mockImage.height = 1000;
      mockImage.onload();

      await watermarkPromise;

      // Font size should be min(2000/2.5, 1000/2.5) = min(800, 400) = 400
      expect(mockContext.font).toContain('400px');
    });

    it('should include IBM Plex Mono font family', async () => {
      const imageUrl = 'data:image/jpeg;base64,fake-image-data';
      const watermarkPromise = addWatermark(imageUrl);

      mockImage.onload();
      await watermarkPromise;

      expect(mockContext.font).toContain('IBM Plex Mono');
    });

    it('should use font weight 900 (extra bold)', async () => {
      const imageUrl = 'data:image/jpeg;base64,fake-image-data';
      const watermarkPromise = addWatermark(imageUrl);

      mockImage.onload();
      await watermarkPromise;

      expect(mockContext.font).toContain('900');
    });
  });

  describe('Text positioning and styling', () => {
    it('should position text at bottom-right corner', async () => {
      const imageUrl = 'data:image/jpeg;base64,fake-image-data';
      const watermarkPromise = addWatermark(imageUrl);

      mockImage.width = 1000;
      mockImage.height = 800;
      mockImage.onload();

      await watermarkPromise;

      expect(mockContext.textAlign).toBe('end');
      expect(mockContext.textBaseline).toBe('bottom');

      // X should be near image width, Y near image height
      const fillTextCall = mockContext.fillText.mock.calls[0];
      const x = fillTextCall[1];
      const y = fillTextCall[2];

      expect(x).toBeGreaterThan(900); // Near right edge
      expect(y).toBeGreaterThan(700); // Near bottom edge
    });

    it('should add dynamic padding based on image size', async () => {
      const imageUrl = 'data:image/jpeg;base64,fake-image-data';
      const watermarkPromise = addWatermark(imageUrl);

      mockImage.width = 2000;
      mockImage.height = 1500;
      mockImage.onload();

      await watermarkPromise;

      const fillTextCall = mockContext.fillText.mock.calls[0];
      const x = fillTextCall[1];
      const y = fillTextCall[2];

      // Padding should be max(10, min(width/50, height/50))
      // = max(10, min(40, 30)) = 30
      expect(x).toBe(2000 - 30);
      expect(y).toBe(1500 - 30);
    });

    it('should use minimum padding of 10px for small images', async () => {
      const imageUrl = 'data:image/jpeg;base64,fake-image-data';
      const watermarkPromise = addWatermark(imageUrl);

      mockImage.width = 200;
      mockImage.height = 150;
      mockImage.onload();

      await watermarkPromise;

      const fillTextCall = mockContext.fillText.mock.calls[0];
      const x = fillTextCall[1];
      const y = fillTextCall[2];

      // Padding should be at least 10
      expect(x).toBe(200 - 10);
      expect(y).toBe(150 - 10);
    });

    it('should use white color for text', async () => {
      const imageUrl = 'data:image/jpeg;base64,fake-image-data';
      const watermarkPromise = addWatermark(imageUrl);

      mockImage.onload();
      await watermarkPromise;

      expect(mockContext.fillStyle).toBe('rgba(255, 255, 255, 1.0)');
    });

    it('should add shadow for contrast', async () => {
      const imageUrl = 'data:image/jpeg;base64,fake-image-data';
      const watermarkPromise = addWatermark(imageUrl);

      mockImage.onload();
      await watermarkPromise;

      expect(mockContext.shadowColor).toBe('rgba(0, 0, 0, 0.98)');
      expect(mockContext.shadowBlur).toBe(10);
      expect(mockContext.shadowOffsetX).toBe(5);
      expect(mockContext.shadowOffsetY).toBe(5);
    });
  });

  describe('Canvas rendering quality', () => {
    it('should enable image smoothing', async () => {
      const imageUrl = 'data:image/jpeg;base64,fake-image-data';
      const watermarkPromise = addWatermark(imageUrl);

      mockImage.onload();
      await watermarkPromise;

      expect(mockContext.imageSmoothingEnabled).toBe(true);
    });

    it('should use high quality image smoothing', async () => {
      const imageUrl = 'data:image/jpeg;base64,fake-image-data';
      const watermarkPromise = addWatermark(imageUrl);

      mockImage.onload();
      await watermarkPromise;

      expect(mockContext.imageSmoothingQuality).toBe('high');
    });

    it('should draw the original image on canvas', async () => {
      const imageUrl = 'data:image/jpeg;base64,fake-image-data';
      const watermarkPromise = addWatermark(imageUrl);

      mockImage.width = 1000;
      mockImage.height = 800;
      mockImage.onload();

      await watermarkPromise;

      expect(mockContext.drawImage).toHaveBeenCalledWith(
        mockImage,
        0,
        0,
        1000,
        800
      );
    });
  });

  describe('Blob creation and output', () => {
    it('should convert canvas to blob with JPEG format', async () => {
      const imageUrl = 'data:image/jpeg;base64,fake-image-data';
      const watermarkPromise = addWatermark(imageUrl);

      mockImage.onload();
      await watermarkPromise;

      expect(mockCanvas.toBlob).toHaveBeenCalled();
      const toBlobCall = mockCanvas.toBlob.mock.calls[0];
      const mimeType = toBlobCall[1];
      const quality = toBlobCall[2];

      expect(mimeType).toBe('image/jpeg');
      expect(quality).toBe(0.95); // High quality (95%)
    });

    it('should create object URL from blob', async () => {
      const imageUrl = 'data:image/jpeg;base64,fake-image-data';
      const watermarkPromise = addWatermark(imageUrl);

      mockImage.onload();
      await watermarkPromise;

      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    it('should return blob URL', async () => {
      const imageUrl = 'data:image/jpeg;base64,fake-image-data';
      const watermarkPromise = addWatermark(imageUrl);

      mockImage.onload();
      const result = await watermarkPromise;

      expect(result).toBe('blob:mock-watermarked-url');
      expect(result.startsWith('blob:')).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should reject if canvas context cannot be created', async () => {
      mockCanvas.getContext = vi.fn(() => null);

      const imageUrl = 'data:image/jpeg;base64,fake-image-data';

      await expect(addWatermark(imageUrl)).rejects.toThrow('Could not get canvas context');
    });

    it('should reject if image fails to load', async () => {
      const imageUrl = 'invalid-url';
      const watermarkPromise = addWatermark(imageUrl);

      // Trigger image error
      mockImage.onerror();

      await expect(watermarkPromise).rejects.toThrow('Failed to load image for watermarking');
    });

    it('should reject if blob creation fails', async () => {
      mockCanvas.toBlob = vi.fn((callback) => {
        callback(null); // Simulate blob creation failure
      });

      const imageUrl = 'data:image/jpeg;base64,fake-image-data';
      const watermarkPromise = addWatermark(imageUrl);

      mockImage.onload();

      await expect(watermarkPromise).rejects.toThrow('Failed to create watermarked image');
    });

    it('should handle very large images by scaling', async () => {
      const imageUrl = 'data:image/jpeg;base64,fake-image-data';
      const watermarkPromise = addWatermark(imageUrl);

      mockImage.width = 10000;
      mockImage.height = 8000;
      mockImage.onload();

      await expect(watermarkPromise).resolves.toBeTruthy();

      // Should be scaled down to max 4096
      const MAX_DIMENSION = 4096;
      expect(mockCanvas.width).toBeLessThanOrEqual(MAX_DIMENSION * 2); // * devicePixelRatio
    });
  });

  describe('Different image formats', () => {
    it('should handle data URLs', async () => {
      const imageUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
      const watermarkPromise = addWatermark(imageUrl);

      expect(mockImage.src).toBe(imageUrl);

      mockImage.onload();
      await watermarkPromise;

      expect(mockContext.fillText).toHaveBeenCalled();
    });

    it('should handle blob URLs', async () => {
      const imageUrl = 'blob:http://localhost:3000/abc-123-def';
      const watermarkPromise = addWatermark(imageUrl);

      expect(mockImage.src).toBe(imageUrl);

      mockImage.onload();
      await watermarkPromise;

      expect(mockContext.fillText).toHaveBeenCalled();
    });

    it('should handle HTTPS URLs', async () => {
      const imageUrl = 'https://example.com/image.jpg';
      const watermarkPromise = addWatermark(imageUrl);

      expect(mockImage.src).toBe(imageUrl);

      mockImage.onload();
      await watermarkPromise;

      expect(mockContext.fillText).toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle square images', async () => {
      const imageUrl = 'data:image/jpeg;base64,fake-image-data';
      const watermarkPromise = addWatermark(imageUrl);

      mockImage.width = 1000;
      mockImage.height = 1000;
      mockImage.onload();

      await watermarkPromise;

      expect(mockCanvas.width).toBe(1000 * 2);
      expect(mockCanvas.height).toBe(1000 * 2);
    });

    it('should handle portrait orientation', async () => {
      const imageUrl = 'data:image/jpeg;base64,fake-image-data';
      const watermarkPromise = addWatermark(imageUrl);

      mockImage.width = 600;
      mockImage.height = 1000;
      mockImage.onload();

      await watermarkPromise;

      expect(mockCanvas.width).toBe(600 * 2);
      expect(mockCanvas.height).toBe(1000 * 2);
    });

    it('should handle landscape orientation', async () => {
      const imageUrl = 'data:image/jpeg;base64,fake-image-data';
      const watermarkPromise = addWatermark(imageUrl);

      mockImage.width = 1920;
      mockImage.height = 1080;
      mockImage.onload();

      await watermarkPromise;

      expect(mockCanvas.width).toBe(1920 * 2);
      expect(mockCanvas.height).toBe(1080 * 2);
    });

    it('should handle very small images (thumbnail size)', async () => {
      const imageUrl = 'data:image/jpeg;base64,fake-image-data';
      const watermarkPromise = addWatermark(imageUrl);

      mockImage.width = 50;
      mockImage.height = 50;
      mockImage.onload();

      await watermarkPromise;

      // Should still use minimum font size of 80px
      expect(mockContext.font).toContain('80px');
    });
  });
});
