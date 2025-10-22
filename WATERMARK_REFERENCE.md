# Watermark Implementation Reference

## MORPHEO IMPLEMENTATION PLAN

### Configuration
- **Text**: "created with Morpheo - morpheo-phi.vercel.app/"
- **Font**: IBM Plex Mono (900 weight)
- **Position**: Bottom-right corner
- **Scaling**: Dynamic based on image dimensions (like reference)
- **Color**: White with black shadow for contrast

### Implementation Steps

#### Step 1: Create Watermark Utility (`/src/lib/watermark.js`)
- Adapt reference implementation
- Use HTML5 Canvas API
- Return Promise<string> (blob URL)
- Handle errors gracefully with fallback

#### Step 2: Integrate into ResultScreen Component
- Import watermark utility
- Apply watermark after API returns generated image
- Show watermarked version to user
- Use watermarked version for share/download
- Cleanup blob URLs to prevent memory leaks

#### Step 3: Test All Scenarios
- Test on desktop and mobile
- Test all 6 filters
- Verify share functionality includes watermark
- Verify download includes watermark
- Test error handling (fallback to non-watermarked)

### Side Effect Mitigations
1. **Performance**: Already have Loader component - extend usage
2. **Memory leaks**: Use useEffect cleanup to revoke blob URLs
3. **Image quality**: Use 0.95 quality + high smoothing
4. **CORS**: API returns base64 (already safe)
5. **Mobile limits**: Cap max canvas size at 4096x4096
6. **Text readability**: Dynamic font sizing with minimum threshold
7. **Browser compatibility**: Use web-safe font fallbacks

---

## Reference Code from Similar Project

To set up the watermark : 

// Utility function to add watermark to images
export async function addWatermark(imageUrl: string, isFrontCamera = false): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      reject(new Error("Could not get canvas context"))
      return
    }

    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      console.log("[v0] Watermark - Image loaded, dimensions:", img.width, "x", img.height)

      const devicePixelRatio = window.devicePixelRatio || 1
      console.log("[v0] Watermark - Device pixel ratio:", devicePixelRatio)

      // Set canvas size to match image with device pixel ratio for sharp rendering
      canvas.width = img.width * devicePixelRatio
      canvas.height = img.height * devicePixelRatio

      // Scale the canvas back down using CSS for proper display
      canvas.style.width = img.width + "px"
      canvas.style.height = img.height + "px"

      // Scale the drawing context so everything draws at the higher resolution
      ctx.scale(devicePixelRatio, devicePixelRatio)

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"
      // ctx.textRenderingOptimization = 'optimizeQuality' // This property is not supported in all browsers

      // Draw the original image without any transformations
      ctx.drawImage(img, 0, 0)

      const watermarkText = "Created with v0.app's BananaCam"

      const minFontSize = 80
      const widthBasedSize = img.width / 2.5
      const heightBasedSize = img.height / 2.5
      const calculatedSize = Math.min(widthBasedSize, heightBasedSize)
      const fontSize = Math.max(minFontSize, calculatedSize)

      console.log("[v0] Watermark - Font size calculation:")
      console.log("  - Minimum font size:", minFontSize)
      console.log("  - Width-based size (width/2.5):", widthBasedSize)
      console.log("  - Height-based size (height/2.5):", heightBasedSize)
      console.log("  - Calculated size (min of width/height):", calculatedSize)
      console.log("  - Final font size (max of min and calculated):", fontSize)

      ctx.font = `900 ${fontSize}px var(--font-geist-mono), ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace`
      ctx.fillStyle = "rgba(255, 255, 255, 1.0)"

      ctx.textAlign = "end"
      ctx.textBaseline = "bottom"

      const padding = Math.max(10, Math.min(img.width / 50, img.height / 50))
      const x = img.width - padding
      const y = img.height - padding

      console.log("[v0] Watermark - Position calculation:")
      console.log("  - Padding:", padding)
      console.log("  - X position:", x)
      console.log("  - Y position:", y)
      console.log("  - Text:", watermarkText)

      ctx.shadowColor = "rgba(0, 0, 0, 0.98)"
      ctx.shadowBlur = 10
      ctx.shadowOffsetX = 5
      ctx.shadowOffsetY = 5

      console.log("[v0] Watermark - Drawing text with font:", ctx.font)
      ctx.fillText(watermarkText, x, y)
      console.log("[v0] Watermark - Text drawn successfully")

      canvas.toBlob(
        (blob) => {
          if (blob) {
            console.log("[v0] Watermark - Blob created successfully, size:", blob.size, "bytes")
            const watermarkedUrl = URL.createObjectURL(blob)
            console.log("[v0] Watermark - Final watermarked URL created")
            resolve(watermarkedUrl)
          } else {
            console.error("[v0] Watermark - Failed to create blob")
            reject(new Error("Failed to create watermarked image"))
          }
        },
        "image/jpeg",
        0.95, // Higher quality
      )
    }

    img.onerror = () => {
      reject(new Error("Failed to load image"))
    }

    img.src = imageUrl
  })
}

// Server-side watermark function using Canvas API
export async function addWatermarkServer(imageBuffer: Buffer): Promise<Buffer> {
  // This would require a server-side canvas library like 'canvas'
  // For now, we'll handle watermarking on the client side
  return imageBuffer
}
---

then the watermak is used here : 
"use client"
import { useState, useCallback } from "react"
import { CameraCapture } from "./camera-capture"
import { ProcessedImage } from "./processed-image"
import { addWatermark } from "../lib/watermark"

export type FilterType =
  | "none"
  | "acid"
  | "vintage"
  | "cyberpunk"
  | "underwater"
  | "medieval"
  | "apocalypse"
  | "steampunk"
  | "tropical"
  | "winter"
  | "neon_tokyo"
  | "wild_west"
  | "art_deco"
  | "fairy_tale"
  | "horror"
  | "desert_mirage"
  | "crystal_cave"
  | "floating_islands"
  | "time_machine"
  | "spy"
  | "gothic"
  | "90s"
  | "disco"

export interface Filter {
  id: FilterType
  name: string
  description: string
  prompt: string
}

const filters: Filter[] = [
  {
    id: "none",
    name: "Original",
    description: "No filter",
    prompt: "",
  },
  {
    id: "art_deco",
    name: "Art Deco",
    description: "1920s glamour",
    prompt:
      "Transform people with elegant 1920s fashion: men in sharp three-piece suits with bow ties, suspenders, and fedora hats; women in drop-waist beaded dresses, long pearl necklaces, feathered headbands, and T-bar shoes. Add Art Deco environment: geometric patterns on walls, gold and black color schemes, elegant curved lines, stylized sunburst designs, ornate mirrors, crystal chandeliers, marble columns, decorative metalwork, vintage automobiles, jazz age accessories. Apply sophisticated golden lighting with luxurious atmosphere.",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    description: "Futuristic",
    prompt:
      "Transform people into cyberpunk characters: futuristic clothing with LED strips, leather jackets with neon accents, cybernetic implants, glowing tattoos, colored contact lenses, punk hairstyles with neon highlights, tech accessories, augmented reality visors, metallic jewelry. Add cyberpunk environment: neon signs with Japanese text, holographic displays, futuristic buildings, flying cars, digital billboards, chrome pipes, circuit patterns on walls, glowing cables, rain effects. Apply purple and cyan neon lighting with digital glitches.",
  },
  {
    id: "wild_west",
    name: "Wild West",
    description: "Cowboy frontier",
    prompt:
      "Transform people into cowboys and frontier folk: men in cowboy hats, leather chaps, boots with spurs, bandanas, sheriff badges, gun holsters; women in prairie dresses, bonnets, leather boots, fringed jackets. Add wild west environment: desert cacti, tumbleweeds, old wooden saloons, horse-drawn wagons, wanted posters on walls, oil lamps, wooden barrels, desert mountains in background, vultures circling, dust storms, rustic fences. Apply warm desert tones with dramatic sunset lighting.",
  },
  {
    id: "vintage",
    name: "Vintage",
    description: "Retro vibes",
    prompt:
      "Transform people with vintage 1950s style: men in high-waisted trousers, suspenders, bow ties, rolled sleeves, pompadour hairstyles; women in circle skirts, petticoats, cardigans, victory rolls, red lipstick, cat-eye glasses. Add vintage environment: classic diners, jukeboxes, vintage cars, checkered floors, neon signs, milkshake bars, drive-in theaters, retro furniture. Apply warm sepia tones with soft vintage lighting.",
  },
  {
    id: "underwater",
    name: "Underwater",
    description: "Ocean depths",
    prompt:
      "Transform people into underwater explorers: diving suits, oxygen masks, flippers, underwater gear, coral accessories, seaweed hair decorations, pearl jewelry, nautical clothing. Add underwater environment: colorful coral reefs, tropical fish swimming around, sea anemones, underwater caves, sunlight filtering through water, bubbles floating up, shipwrecks, treasure chests, dolphins, sea turtles. Apply blue-green aquatic lighting with water ripple effects.",
  },
  {
    id: "medieval",
    name: "Medieval",
    description: "Knights & castles",
    prompt:
      "Transform people into medieval characters: knights in armor with helmets and shields, princesses in flowing gowns with crowns, peasants in simple tunics, monks in robes, blacksmiths with leather aprons. Add medieval environment: stone castles, wooden bridges, torches on walls, banners with heraldic symbols, cobblestone paths, medieval weapons, horse stables, market stalls, gothic architecture. Apply warm candlelight with dramatic shadows.",
  },
  {
    id: "neon_tokyo",
    name: "Neon Tokyo",
    description: "Japanese nightlife",
    prompt:
      "Transform people with Tokyo street fashion: colorful hair, anime-inspired outfits, LED accessories, kawaii elements, street wear, platform shoes, face masks with designs, tech gadgets. Add neon Tokyo environment: Japanese street signs, vending machines, cherry blossoms, paper lanterns, anime billboards, crowded streets, bullet trains, traditional temples mixed with modern buildings, ramen shops, arcade games. Apply vibrant neon pink and blue lighting.",
  },
  {
    id: "steampunk",
    name: "Steampunk",
    description: "Victorian tech",
    prompt:
      "Transform people into steampunk characters: brass goggles, leather corsets, top hats with gears, mechanical arm pieces, pocket watches, steam-powered accessories, Victorian clothing with industrial elements, copper jewelry. Add steampunk environment: brass pipes, steam engines, clockwork mechanisms, airships, industrial machinery, copper and bronze metals, vintage laboratories, mechanical contraptions, steam clouds. Apply warm brass lighting with industrial atmosphere.",
  },
  {
    id: "spy",
    name: "Spy",
    description: "Secret agent",
    prompt:
      "Transform people into sophisticated secret agents: men in tailored black suits, bow ties, cufflinks, sleek sunglasses, leather gloves, spy watches; women in elegant cocktail dresses, pearl earrings, red lipstick, stylish trench coats, high heels. Add spy environment: casino interiors, luxury hotels, city rooftops at night, vintage sports cars, briefcases, surveillance equipment, martini glasses, poker tables, neon city lights, shadowy alleyways, international landmarks. Apply dramatic film noir lighting with high contrast shadows and mysterious atmosphere.",
  },
  {
    id: "gothic",
    name: "Gothic",
    description: "Dark romance",
    prompt:
      "Transform people into gothic characters: men in black Victorian coats, ruffled shirts, dark eyeliner, silver jewelry, leather boots; women in corsets, flowing black dresses, lace gloves, dark makeup, chokers, dramatic eye shadow. Add gothic environment: ancient cathedrals, stone gargoyles, wrought iron gates, candlelit chambers, stained glass windows, fog-covered graveyards, medieval architecture, ravens, thorny roses, ornate mirrors, velvet curtains. Apply moody purple and blue lighting with dramatic shadows and mysterious ambiance.",
  },
  {
    id: "90s",
    name: "90s",
    description: "Retro nostalgia",
    prompt:
      "Transform people with authentic 90s fashion: men in baggy jeans, flannel shirts, backwards baseball caps, sneakers, chain wallets; women in crop tops, high-waisted jeans, chokers, platform shoes, butterfly clips, denim jackets. Add 90s environment: arcade games, neon mall aesthetics, boom boxes, cassette tapes, VHS stores, roller rinks, geometric patterns, bright colors, old computers, pagers, CD players, grunge concert posters. Apply vibrant neon lighting with retro color schemes and nostalgic atmosphere.",
  },
  {
    id: "disco",
    name: "Disco",
    description: "70s dance fever",
    prompt:
      "Transform people into disco dancers: men in wide-collar shirts, bell-bottom pants, gold chains, afro hairstyles, platform shoes; women in sequined dresses, feathered hair, bold makeup, metallic fabrics, go-go boots, large hoop earrings. Add disco environment: mirror balls, colorful dance floors, neon lights, vinyl records, DJ booths, retro furniture, lava lamps, psychedelic patterns, disco balls reflecting light, dance platforms, vintage microphones. Apply dynamic multicolored lighting with sparkles, reflections, and groovy dance floor atmosphere.",
  },
]

export function CameraApp() {
  const [selectedFilterIndex, setSelectedFilterIndex] = useState(0)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [capturedWithFrontCamera, setCapturedWithFrontCamera] = useState(false)

  const selectedFilter = filters[selectedFilterIndex]

  const handleCapture = useCallback(
    async (imageDataUrl: string, facingMode: "user" | "environment") => {
      setCapturedImage(imageDataUrl)
      setProcessedImage(null)
      setCapturedWithFrontCamera(facingMode === "user")

      if (selectedFilter.id === "none") {
        try {
          const watermarkedImage = await addWatermark(imageDataUrl, facingMode === "user")
          setProcessedImage(watermarkedImage)
        } catch (error) {
          console.error("[v0] Error adding watermark to original image:", error)
          setProcessedImage(imageDataUrl)
        }
        return
      }

      setIsProcessing(true)

      try {
        console.log("[v0] Starting image processing with filter:", selectedFilter.id)
        const response = await fetch("/api/process-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageUrl: imageDataUrl,
            filter: selectedFilter.id,
          }),
        })

        console.log("[v0] API response status:", response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.log("[v0] API error response:", errorText)
          throw new Error(`Error processing image: ${response.status} ${errorText}`)
        }

        const data = await response.json()
        console.log("[v0] API response data:", data)

        if (data.processedImageUrl) {
          console.log("[v0] Setting processed image URL:", data.processedImageUrl)

          try {
            console.log("[v0] Adding watermark to processed image")
            const watermarkedImage = await addWatermark(data.processedImageUrl, facingMode === "user")
            console.log("[v0] Watermark applied successfully")
            setProcessedImage(watermarkedImage)
            setIsProcessing(false)
          } catch (watermarkError) {
            console.error("[v0] Error adding watermark:", watermarkError)
            setProcessedImage(data.processedImageUrl)
            setIsProcessing(false)
          }

          const img = new Image()
          img.crossOrigin = "anonymous"
          img.onload = () => {
            console.log("[v0] Processed image loaded successfully")
          }
          img.onerror = (error) => {
            console.log("[v0] Error loading processed image:", error)
            console.log("[v0] Falling back to original image")
            addWatermark(imageDataUrl, facingMode === "user")
              .then((watermarkedFallback) => {
                setProcessedImage(watermarkedFallback)
                setIsProcessing(false)
              })
              .catch(() => {
                setProcessedImage(imageDataUrl)
                setIsProcessing(false)
              })
          }
          img.src = data.processedImageUrl
        } else {
          console.log("[v0] No processed image URL in response, using original with watermark")
          try {
            const watermarkedImage = await addWatermark(imageDataUrl, facingMode === "user")
            setProcessedImage(watermarkedImage)
          } catch (error) {
            console.error("[v0] Error adding watermark to fallback:", error)
            setProcessedImage(imageDataUrl)
          }
          setIsProcessing(false)
        }
      } catch (error) {
        console.error("[v0] Error processing image:", error)
        try {
          const watermarkedImage = await addWatermark(imageDataUrl, facingMode === "user")
          setProcessedImage(watermarkedImage)
        } catch (watermarkError) {
          console.error("[v0] Error adding watermark to error fallback:", watermarkError)
          setProcessedImage(imageDataUrl)
        }
        setIsProcessing(false)
      }
    },
    [selectedFilter],
  )

  const handleReset = () => {
    setCapturedImage(null)
    setProcessedImage(null)
    setIsProcessing(false)
    setCapturedWithFrontCamera(false)
  }

  const handleDownload = () => {
    if (!processedImage) return

    try {
      if (processedImage.startsWith("data:")) {
        const byteCharacters = atob(processedImage.split(",")[1])
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: "image/jpeg" })

        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `filtered-photo-${selectedFilter.id}-${Date.now()}.jpg`
        link.style.display = "none"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        setTimeout(() => URL.revokeObjectURL(url), 100)
      } else {
        const link = document.createElement("a")
        link.href = processedImage
        link.download = `filtered-photo-${selectedFilter.id}-${Date.now()}.jpg`
        link.style.display = "none"
        link.setAttribute("target", "_self")
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error("Download failed:", error)
      window.location.href = processedImage
    }
  }

  const handleFilterSelect = (index: number) => {
    setSelectedFilterIndex(index)
  }

  return (
    <div
      className="h-dvh w-screen bg-black overflow-hidden fixed inset-0 touch-none select-none"
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
    >
      {!capturedImage ? (
        <CameraCapture
          onCapture={handleCapture}
          selectedFilter={selectedFilter}
          onFilterSelect={handleFilterSelect}
          filterIndex={selectedFilterIndex}
          filters={filters}
        />
      ) : (
        <ProcessedImage
          originalImage={capturedImage}
          processedImage={processedImage}
          isProcessing={isProcessing}
          filterName={selectedFilter.name}
          onReset={handleReset}
          onDownload={handleDownload}
          isFrontCamera={capturedWithFrontCamera}
        />
      )}
    </div>
  )
}