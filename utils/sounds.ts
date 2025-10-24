// Enhanced sound manager for the gacha machine with ambient sounds and rarity-specific music

// Create audio instances for each sound
const createAudio = (src: string): HTMLAudioElement => {
  const audio = new Audio(src)
  audio.preload = "auto"
  return audio
}

// Enhanced sound URLs with new ambient and music tracks
const SOUND_URLS = {
  // Machine sounds
  leverPull: "/sounds/lever-pull.mp3",
  leverReturn: "/sounds/lever-return.mp3",
  machineHum: "/sounds/machine-hum.mp3",
  coinInsert: "/sounds/coin-insert.mp3",
  coinAdd: "/sounds/coin-add.mp3",

  // Animation sounds
  blinkFast: "/sounds/blink-fast.mp3",
  blinkSlow: "/sounds/blink-slow.mp3",
  blinkLanding: "/sounds/blink-landing.mp3",

  // Box and reveal sounds
  boxOpen: "/sounds/box-open.mp3",
  boxShake: "/sounds/box-shake.mp3",

  // Rarity-specific reveals with music
  itemRevealCommon: "/sounds/reveal-common.mp3",
  itemRevealRare: "/sounds/reveal-rare.mp3",
  itemRevealEpic: "/sounds/reveal-epic.mp3",
  itemRevealLegendary: "/sounds/reveal-legendary.mp3",

  // Rarity-specific music stings
  musicCommon: "/sounds/music-common.mp3",
  musicRare: "/sounds/music-rare.mp3",
  musicEpic: "/sounds/music-epic.mp3",
  musicLegendary: "/sounds/music-legendary.mp3",

  // Celebration and effects
  celebration: "/sounds/celebration.mp3",
  sparkle: "/sounds/sparkle.mp3",
  whoosh: "/sounds/whoosh.mp3",

  // UI sounds
  buttonClick: "/sounds/button-click.mp3",
  themeChange: "/sounds/theme-change.mp3",

  // Theme-specific ambient sounds
  ambientClassic: "/sounds/ambient-classic.mp3",
  ambientCyberpunk: "/sounds/ambient-cyberpunk.mp3",
  ambientPastel: "/sounds/ambient-pastel.mp3",
}

// Create a class to manage enhanced sounds
class SoundManager {
  private sounds: Record<string, HTMLAudioElement> = {}
  private ambientSound: HTMLAudioElement | null = null
  private isMuted = false
  private isInitialized = false
  private blinkInterval: NodeJS.Timeout | null = null
  private lastBlinkTime = 0
  private currentTheme = "classicRed"

  constructor() {
    // We'll initialize on first user interaction to avoid autoplay restrictions
  }

  // Initialize sounds (call this on first user interaction)
  initialize(): void {
    if (this.isInitialized) return

    // Create all audio instances
    Object.entries(SOUND_URLS).forEach(([key, url]) => {
      this.sounds[key] = createAudio(url)
    })

    // Set up looping ambient sounds
    if (this.sounds.machineHum) {
      this.sounds.machineHum.loop = true
      this.sounds.machineHum.volume = 0.3
    }

    // Set up theme ambient sounds
    Object.keys(this.sounds).forEach((key) => {
      if (key.startsWith("ambient")) {
        this.sounds[key].loop = true
        this.sounds[key].volume = 0.2
      }
    })

    // Check for stored mute preference
    const storedMute = localStorage.getItem("gacha-muted")
    this.isMuted = storedMute === "true"

    this.isInitialized = true

    // Start ambient sounds if not muted
    if (!this.isMuted) {
      this.startAmbientSounds()
    }
  }

  // Start ambient machine sounds
  startAmbientSounds(): void {
    if (this.isMuted || !this.isInitialized) return

    // Start machine hum
    if (this.sounds.machineHum) {
      this.sounds.machineHum.play().catch(() => {})
    }

    // Start theme-specific ambient
    this.playThemeAmbient(this.currentTheme)
  }

  // Stop ambient sounds
  stopAmbientSounds(): void {
    if (this.sounds.machineHum) {
      this.sounds.machineHum.pause()
    }
    if (this.ambientSound) {
      this.ambientSound.pause()
    }
  }

  // Play theme-specific ambient sound
  playThemeAmbient(themeId: string): void {
    if (this.isMuted || !this.isInitialized) return

    // Stop current ambient
    if (this.ambientSound) {
      this.ambientSound.pause()
    }

    // Map theme to ambient sound
    const ambientMap: Record<string, string> = {
      classicRed: "ambientClassic",
      cyberpunkNeon: "ambientCyberpunk",
      pastelDream: "ambientPastel",
    }

    const ambientKey = ambientMap[themeId]
    if (ambientKey && this.sounds[ambientKey]) {
      this.ambientSound = this.sounds[ambientKey]
      this.ambientSound.play().catch(() => {})
    }

    this.currentTheme = themeId
  }

  // Play a sound with optional volume and rate adjustments
  play(soundName: keyof typeof SOUND_URLS, options: { volume?: number; rate?: number; loop?: boolean } = {}): void {
    if (!this.isInitialized) this.initialize()
    if (this.isMuted) return

    const sound = this.sounds[soundName]
    if (!sound) return

    // Clone the audio to allow overlapping sounds
    const soundClone = sound.cloneNode() as HTMLAudioElement

    // Apply options
    if (options.volume !== undefined) soundClone.volume = options.volume
    if (options.rate !== undefined) soundClone.playbackRate = options.rate
    if (options.loop !== undefined) soundClone.loop = options.loop

    // Play the sound
    soundClone.play().catch((err) => console.error("Error playing sound:", err))
  }

  // Enhanced lever pull with return sound
  playLeverPull(): void {
    this.play("leverPull", { volume: 0.8 })

    // Play return sound after a delay
    setTimeout(() => {
      this.play("leverReturn", { volume: 0.6 })
    }, 800)
  }

  // Play coin insertion with visual feedback timing
  playCoinInsert(): void {
    this.play("coinInsert", { volume: 0.7 })
  }

  // Start enhanced blinking sounds for the animation
  startBlinkSounds(phase: "fast" | "slowing" | "landing"): void {
    if (this.blinkInterval) clearInterval(this.blinkInterval)

    // Different intervals and sounds based on phase
    const config = {
      fast: { interval: 80, sound: "blinkFast", volume: 0.3, rate: 1.2 },
      slowing: { interval: 200, sound: "blinkSlow", volume: 0.4, rate: 1.0 },
      landing: { interval: 300, sound: "blinkLanding", volume: 0.5, rate: 0.8 },
    }

    const { interval, sound, volume, rate } = config[phase]

    this.blinkInterval = setInterval(() => {
      // Throttle sounds to avoid too many playing at once
      const now = Date.now()
      if (now - this.lastBlinkTime < interval * 0.8) return
      this.lastBlinkTime = now

      this.play(sound as keyof typeof SOUND_URLS, { volume, rate })
    }, interval)
  }

  // Stop blinking sounds
  stopBlinkSounds(): void {
    if (this.blinkInterval) {
      clearInterval(this.blinkInterval)
      this.blinkInterval = null
    }
  }

  // Play collection-specific reveal sound with music after a short delay
  playItemReveal(collection: "toys" | "magic" | "fantasy" | "tech" | "nature" | "space"): void {
    // Play the reveal sound
    const soundMap = {
      toys: "itemRevealCommon",
      magic: "itemRevealRare",
      fantasy: "itemRevealEpic",
      tech: "itemRevealRare",
      nature: "itemRevealCommon",
      space: "itemRevealLegendary",
    }

    this.play(soundMap[collection] as keyof typeof SOUND_URLS)

    // Play collection-specific music sting
    const musicMap = {
      toys: "musicCommon",
      magic: "musicRare",
      fantasy: "musicEpic",
      tech: "musicRare",
      nature: "musicCommon",
      space: "musicLegendary",
    }

    setTimeout(() => {
      this.play(musicMap[collection] as keyof typeof SOUND_URLS, { volume: 0.6 })
    }, 200)

    // For fantasy and space items, add extra effects
    if (collection === "fantasy") {
      setTimeout(() => {
        this.play("sparkle", { volume: 0.4 })
      }, 600)
    }

    if (collection === "space") {
      setTimeout(() => {
        this.play("celebration", { volume: 0.7 })
      }, 300)
      setTimeout(() => {
        this.play("sparkle", { volume: 0.5 })
      }, 600)
      setTimeout(() => {
        this.play("whoosh", { volume: 0.4 })
      }, 900)
    }
  }

  // Play box opening with shake effect
  playBoxOpen(): void {
    // Shake sound first
    this.play("boxShake", { volume: 0.5 })

    // Then opening sound
    setTimeout(() => {
      this.play("boxOpen", { volume: 0.8 })
    }, 300)
  }

  // Play theme change with transition effect
  playThemeChange(newThemeId: string): void {
    this.play("themeChange", { volume: 0.6 })

    // Transition ambient sounds
    setTimeout(() => {
      this.playThemeAmbient(newThemeId)
    }, 500)
  }

  // Toggle mute state
  toggleMute(): boolean {
    this.isMuted = !this.isMuted
    localStorage.setItem("gacha-muted", this.isMuted.toString())

    if (this.isMuted) {
      this.stopAmbientSounds()
    } else {
      this.startAmbientSounds()
    }

    return this.isMuted
  }

  // Get current mute state
  getMuted(): boolean {
    return this.isMuted
  }
}

// Create and export a singleton instance
export const soundManager = new SoundManager()
