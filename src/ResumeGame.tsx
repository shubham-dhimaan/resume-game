import React, { useEffect, useRef, useState, useCallback } from "react"
import confetti from "canvas-confetti"

export interface GameLevel {
  id: number
  title: string
  shortTitle: string
  subtitle: string
  themeColor: string
  bgColor: string
  accentColor: string
  skillsToCollect: { name: string; category: string; icon: string; xp: number }[]
  minions: { name: string; color: string; dialogue: string }[]
  villain: {
    name: string
    title: string
    color: string
    maxHp: number
    attackType: "beam" | "projectiles" | "shockwave"
    quote: string
    defeatNote: string
  }
  lore: string
}

const LEVELS: GameLevel[] = [
  {
    id: 1,
    title: "Milestone 1: Psychology & Behavioral Foundations",
    shortTitle: "Psychology",
    subtitle: "Amity University · BA & MA in Applied & Counselling Psychology",
    themeColor: "#e06d45",
    bgColor: "#f5eee6",
    accentColor: "#dbe7d4",
    skillsToCollect: [
      { name: "Cognitive Empathy", category: "Psychology", icon: "🧠", xp: 120 },
      { name: "Nuance Detection", category: "Analysis", icon: "🔍", xp: 150 },
      { name: "Behavioral Modeling", category: "Research", icon: "📐", xp: 130 },
    ],
    minions: [
      { name: "Self-Doubt", color: "#8a7575", dialogue: "Can psychology bridge to tech?" },
      { name: "Overthinking", color: "#6a7b82", dialogue: "Over-analyzing every thought!" },
      { name: "Perfectionism", color: "#786982", dialogue: "Draft must be flawless!" },
    ],
    villain: {
      name: "The First Job Wall",
      title: "Guardian of Career Transition",
      color: "#854836",
      maxHp: 5,
      attackType: "shockwave",
      quote: "\"Degrees in psychology don't belong in cutting-edge AI!\"",
      defeatNote: "Broke through! Transitioned psychological precision directly into frontier AI systems.",
    },
    lore: "Understanding human thought, cognitive architecture, and behavioral nuance became the secret superpower.",
  },
  {
    id: 2,
    title: "Milestone 2: Pre-Training & Frontier LLMs",
    shortTitle: "Amazon Nova",
    subtitle: "Amazon · AI Content Writer & Data Associate (Nova AGI Team)",
    themeColor: "#2a70b8",
    bgColor: "#ebf2fa",
    accentColor: "#dce5f4",
    skillsToCollect: [
      { name: "Nova AGI Adversarial Prompts", category: "LLM Eng", icon: "⚡", xp: 220 },
      { name: "Pre-training Benchmarks", category: "Evaluation", icon: "📊", xp: 200 },
      { name: "Quality Pipeline Workflows", category: "Data Architecture", icon: "🛡️", xp: 240 },
    ],
    minions: [
      { name: "Night Shifts", color: "#2d3748", dialogue: "3 AM pre-training pipeline alert!" },
      { name: "Ambiguous Data", color: "#4a5568", dialogue: "Edge cases with no labels!" },
      { name: "Hallucinations", color: "#718096", dialogue: "Fabricated outputs!" },
    ],
    villain: {
      name: "The Night Shift & Pre-train Drift",
      title: "Colossus of High-Stakes AGI Deadlines",
      color: "#1e293b",
      maxHp: 6,
      attackType: "projectiles",
      quote: "\"Endless benchmark suites and 24/7 pre-training cycles will wear you down!\"",
      defeatNote: "Vanquished! Mastered high-velocity data pipelines and robust adversarial evaluation.",
    },
    lore: "Crafted core prompts and evaluation harnesses for the Amazon Nova foundational model.",
  },
  {
    id: 3,
    title: "Milestone 3: Frontier Reasoning & AI Evaluation",
    shortTitle: "Turing & AI",
    subtitle: "Turing · AI Analyst (Gemini & ChatGPT Evaluations) + BITS Pilani MSc",
    themeColor: "#228b5a",
    bgColor: "#eef7f0",
    accentColor: "#d2eed9",
    skillsToCollect: [
      { name: "Gemini Reasoning Review", category: "Reasoning", icon: "✨", xp: 260 },
      { name: "RLHF Failure Feedback", category: "Post-training", icon: "🎯", xp: 250 },
      { name: "MSc AI & Data Science", category: "BITS Pilani", icon: "🎓", xp: 300 },
    ],
    minions: [
      { name: "Remote Isolation", color: "#4c6054", dialogue: "Async global timezone fatigue!" },
      { name: "Logic Traps", color: "#386641", dialogue: "Multi-step reasoning illusions!" },
      { name: "Prompt Jailbreaks", color: "#2b4a3f", dialogue: "Safety policy stress testing!" },
    ],
    villain: {
      name: "Remote Isolation & Cognitive Traps",
      title: "Master of Complex Multi-Hop Reasoning",
      color: "#1d4432",
      maxHp: 7,
      attackType: "beam",
      quote: "\"Can your reasoning audits keep up with evolving frontier LLM parameters?\"",
      defeatNote: "Mastered! Turned complex failure modes into systematic alignment improvements.",
    },
    lore: "Evaluating frontier reasoning, multi-turn logic, and aligning intelligent systems.",
  },
]

// Safe rounded rectangle fallback for all browsers
function drawSafeRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  const r = Math.min(radius, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  radius: number
  alpha: number
  life: number
}

interface Orb {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
}

interface SkillEntity {
  x: number
  y: number
  name: string
  icon: string
  category: string
  xp: number
  collected: boolean
  bobOffset: number
}

interface MinionEntity {
  x: number
  y: number
  width: number
  height: number
  name: string
  dialogue: string
  color: string
  hp: number
  maxHp: number
  defeated: boolean
}

interface VillainState {
  x: number
  y: number
  width: number
  height: number
  hp: number
  maxHp: number
  name: string
  title: string
  color: string
  attackCooldown: number
  projectiles: { x: number; y: number; vx: number; vy: number; radius: number }[]
}

interface ResumeGameProps {
  onClose?: () => void
  isFullScreen?: boolean
  onToggleFullScreen?: () => void
}

export default function ResumeGame({ onClose, isFullScreen = false, onToggleFullScreen }: ResumeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Game state
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0)
  const [gameState, setGameState] = useState<"playing" | "level_clear" | "wispr_knock">("playing")
  const [isPaused, setIsPaused] = useState(false)
  const [collectedSkills, setCollectedSkills] = useState<{ name: string; category: string; icon: string; xp: number }[]>([])
  const [totalXp, setTotalXp] = useState(0)
  const [activeNotification, setActiveNotification] = useState<string | null>(null)
  const [knockProgress, setKnockProgress] = useState(0)
  const [autoShoot, setAutoShoot] = useState(true)

  // Engine references (to avoid re-renders during 60FPS loop)
  const engineRef = useRef({
    player: {
      x: 80,
      y: 270,
      width: 44,
      height: 44,
      vy: 0,
      isGrounded: true,
      jumpCount: 0,
      invulnerableTimer: 0,
      squash: 1,
      stretch: 1,
    },
    cameraX: 0,
    speed: 2.1, // Comfortable, readable pace (not rushed, not sluggish)
    groundY: 330,
    orbs: [] as Orb[],
    particles: [] as Particle[],
    skills: [] as SkillEntity[],
    minions: [] as MinionEntity[],
    villain: null as VillainState | null,
    bossDefeated: false,
    lastShotTime: 0,
    isPaused: false,
    audioCtx: null as AudioContext | null,
  })

  // Sync pause state to engine ref
  useEffect(() => {
    engineRef.current.isPaused = isPaused
  }, [isPaused])

  // Sound generator using Web Audio API
  const playSfx = useCallback((type: "jump" | "shoot" | "collect" | "hit" | "bossHit" | "bossDefeat" | "knock" | "victory") => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioCtx) return
      if (!engineRef.current.audioCtx) {
        engineRef.current.audioCtx = new AudioCtx()
      }
      const ctx = engineRef.current.audioCtx
      if (ctx.state === "suspended") {
        ctx.resume()
      }

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      const now = ctx.currentTime

      if (type === "jump") {
        osc.type = "sine"
        osc.frequency.setValueAtTime(260, now)
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.16)
        gain.gain.setValueAtTime(0.12, now)
        gain.gain.linearRampToValueAtTime(0, now + 0.16)
        osc.start(now)
        osc.stop(now + 0.16)
      } else if (type === "shoot") {
        osc.type = "triangle"
        osc.frequency.setValueAtTime(680, now)
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.1)
        gain.gain.setValueAtTime(0.1, now)
        gain.gain.linearRampToValueAtTime(0, now + 0.1)
        osc.start(now)
        osc.stop(now + 0.1)
      } else if (type === "collect") {
        osc.type = "sine"
        osc.frequency.setValueAtTime(523, now)
        osc.frequency.setValueAtTime(659, now + 0.07)
        osc.frequency.setValueAtTime(784, now + 0.14)
        osc.frequency.setValueAtTime(1046, now + 0.21)
        gain.gain.setValueAtTime(0.18, now)
        gain.gain.linearRampToValueAtTime(0, now + 0.3)
        osc.start(now)
        osc.stop(now + 0.3)
      } else if (type === "hit") {
        osc.type = "sawtooth"
        osc.frequency.setValueAtTime(180, now)
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.18)
        gain.gain.setValueAtTime(0.18, now)
        gain.gain.linearRampToValueAtTime(0, now + 0.18)
        osc.start(now)
        osc.stop(now + 0.18)
      } else if (type === "bossHit") {
        osc.type = "square"
        osc.frequency.setValueAtTime(360, now)
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.1)
        gain.gain.setValueAtTime(0.14, now)
        gain.gain.linearRampToValueAtTime(0, now + 0.1)
        osc.start(now)
        osc.stop(now + 0.1)
      } else if (type === "bossDefeat") {
        osc.type = "triangle"
        osc.frequency.setValueAtTime(440, now)
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.4)
        gain.gain.setValueAtTime(0.25, now)
        gain.gain.linearRampToValueAtTime(0, now + 0.5)
        osc.start(now)
        osc.stop(now + 0.5)
      } else if (type === "knock") {
        osc.type = "square"
        osc.frequency.setValueAtTime(140, now)
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.12)
        gain.gain.setValueAtTime(0.35, now)
        gain.gain.linearRampToValueAtTime(0, now + 0.12)
        osc.start(now)
        osc.stop(now + 0.12)
      } else if (type === "victory") {
        const notes = [523, 659, 784, 1046, 1318]
        notes.forEach((freq, idx) => {
          const subOsc = ctx.createOscillator()
          const subGain = ctx.createGain()
          subOsc.connect(subGain)
          subGain.connect(ctx.destination)
          subOsc.frequency.value = freq
          subGain.gain.setValueAtTime(0.12, now + idx * 0.09)
          subGain.gain.linearRampToValueAtTime(0, now + idx * 0.09 + 0.25)
          subOsc.start(now + idx * 0.09)
          subOsc.stop(now + idx * 0.09 + 0.25)
        })
      }
    } catch {
      // Audio autoplay policy fallback
    }
  }, [])

  const triggerNotification = (msg: string) => {
    setActiveNotification(msg)
    setTimeout(() => {
      setActiveNotification((prev) => (prev === msg ? null : prev))
    }, 2400)
  }

  // Init Level
  const initLevel = useCallback((lvlIndex: number) => {
    const level = LEVELS[lvlIndex]
    const eng = engineRef.current
    eng.cameraX = 0
    eng.bossDefeated = false
    eng.orbs = []
    eng.particles = []
    eng.player.x = 80
    eng.player.y = 270
    eng.player.vy = 0
    eng.player.isGrounded = true
    eng.player.jumpCount = 0

    // Spawn skills with generous spacing so player can easily read text
    const skillsList: SkillEntity[] = []
    const spacing = 520
    level.skillsToCollect.forEach((sk, i) => {
      skillsList.push({
        x: 460 + i * spacing,
        y: 200 - (i % 2 === 0 ? 25 : 60),
        name: sk.name,
        icon: sk.icon,
        category: sk.category,
        xp: sk.xp,
        collected: false,
        bobOffset: Math.random() * Math.PI * 2,
      })
    })
    eng.skills = skillsList

    // Spawn minions with comfortable distance
    const minionsList: MinionEntity[] = []
    level.minions.forEach((mn, i) => {
      minionsList.push({
        x: 640 + i * spacing + (i % 2 === 0 ? 50 : -30),
        y: eng.groundY - 36,
        width: 36,
        height: 36,
        name: mn.name,
        dialogue: mn.dialogue,
        color: mn.color,
        hp: 2,
        maxHp: 2,
        defeated: false,
      })
    })
    eng.minions = minionsList

    // Setup Boss at end of milestone (~2150px)
    eng.villain = {
      x: 2150,
      y: eng.groundY - 85,
      width: 70,
      height: 85,
      hp: level.villain.maxHp,
      maxHp: level.villain.maxHp,
      name: level.villain.name,
      title: level.villain.title,
      color: level.villain.color,
      attackCooldown: 120,
      projectiles: [],
    }

    setGameState("playing")
    setIsPaused(false)
    triggerNotification(`Level ${lvlIndex + 1}: ${level.shortTitle}`)
  }, [])

  // Jump action
  const handleJump = useCallback(() => {
    if (engineRef.current.isPaused) return
    const p = engineRef.current.player
    if (p.isGrounded || p.jumpCount < 2) {
      p.vy = -12.0
      p.isGrounded = false
      p.jumpCount++
      p.stretch = 1.3
      p.squash = 0.75
      playSfx("jump")

      for (let i = 0; i < 5; i++) {
        engineRef.current.particles.push({
          x: p.x + p.width / 2,
          y: p.y + p.height,
          vx: (Math.random() - 0.5) * 4,
          vy: Math.random() * 2 + 1,
          color: "#cad8eb",
          radius: Math.random() * 3 + 2,
          alpha: 1,
          life: 18,
        })
      }
    }
  }, [playSfx])

  // Shoot insight orb
  const handleShoot = useCallback(() => {
    if (engineRef.current.isPaused) return
    const now = Date.now()
    if (now - engineRef.current.lastShotTime < 160) return
    engineRef.current.lastShotTime = now

    const p = engineRef.current.player
    const lvl = LEVELS[currentLevelIdx]
    const orbColor = lvl ? lvl.themeColor : "#e06d45"

    engineRef.current.orbs.push({
      x: p.x + p.width,
      y: p.y + p.height / 2,
      vx: 12,
      vy: (Math.random() - 0.5) * 1.5,
      radius: 7,
      color: orbColor,
    })

    playSfx("shoot")
    p.squash = 1.15
    p.stretch = 0.88
  }, [currentLevelIdx, playSfx])

  // Key listeners (Space/Up to jump, F/Enter to shoot, P/Escape to toggle pause)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyP") {
        e.preventDefault()
        setIsPaused((prev) => !prev)
        return
      }

      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault()
        handleJump()
      } else if (e.code === "KeyF" || e.code === "KeyX" || e.code === "Enter") {
        e.preventDefault()
        handleShoot()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [handleJump, handleShoot])

  // Init first level
  useEffect(() => {
    initLevel(0)
  }, [initLevel])

  // Main 60 FPS Canvas Game Loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number

    const render = () => {
      const eng = engineRef.current
      const lvl = LEVELS[currentLevelIdx]
      const width = canvas.width
      const height = canvas.height
      const groundY = eng.groundY
      const isPausedNow = eng.isPaused

      // Clear & Background Sky
      ctx.clearRect(0, 0, width, height)

      const skyGrad = ctx.createLinearGradient(0, 0, 0, height)
      skyGrad.addColorStop(0, lvl ? lvl.bgColor : "#f5eee6")
      skyGrad.addColorStop(1, "#f9f8f4")
      ctx.fillStyle = skyGrad
      ctx.fillRect(0, 0, width, height)

      // Parallax Orbits / Decorative Background
      ctx.save()
      ctx.strokeStyle = "rgba(37, 35, 31, 0.05)"
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(width * 0.7 - ((eng.cameraX * 0.15) % (width * 1.5)), 85, 75, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(width * 0.25 - ((eng.cameraX * 0.1) % (width * 1.5)), 130, 110, 0, Math.PI * 2)
      ctx.stroke()

      // Rolling hills (parallax)
      ctx.fillStyle = "rgba(202, 216, 235, 0.3)"
      ctx.beginPath()
      ctx.moveTo(0, groundY)
      for (let x = 0; x <= width; x += 30) {
        const worldX = x + eng.cameraX * 0.2
        const y = groundY - 50 - Math.sin(worldX * 0.005) * 30 - Math.cos(worldX * 0.012) * 12
        ctx.lineTo(x, y)
      }
      ctx.lineTo(width, height)
      ctx.lineTo(0, height)
      ctx.fill()

      ctx.fillStyle = "rgba(219, 231, 212, 0.4)"
      ctx.beginPath()
      ctx.moveTo(0, groundY)
      for (let x = 0; x <= width; x += 25) {
        const worldX = x + eng.cameraX * 0.5
        const y = groundY - 25 - Math.sin(worldX * 0.009) * 18
        ctx.lineTo(x, y)
      }
      ctx.lineTo(width, height)
      ctx.lineTo(0, height)
      ctx.fill()
      ctx.restore()

      // Ground Floor
      ctx.fillStyle = "#25231f"
      ctx.fillRect(0, groundY, width, height - groundY)
      ctx.fillStyle = lvl ? lvl.themeColor : "#e06d45"
      ctx.fillRect(0, groundY, width, 4)

      // Distance markers on ground
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)"
      for (let gx = 0; gx < width + 100; gx += 80) {
        const offset = gx - (eng.cameraX % 80)
        ctx.fillRect(offset, groundY + 12, 30, 2)
      }

      // -------------------------------------------------------------
      // GAMEPLAY LOGIC (Auto-runner at comfortable reading pace)
      // -------------------------------------------------------------
      if (gameState === "playing" && !isPausedNow) {
        const isNearBoss = eng.villain && eng.player.x >= eng.villain.x - 420
        const isBossActive = isNearBoss && !eng.bossDefeated

        if (!isBossActive) {
          eng.player.x += eng.speed
        } else {
          if (eng.player.x < eng.villain!.x - 280) {
            eng.player.x += 1.4
          }
        }

        // Camera follow smoothly
        const targetCamX = eng.player.x - 140
        eng.cameraX += (targetCamX - eng.cameraX) * 0.08

        // Gravity & Jump Physics
        eng.player.vy += 0.65
        eng.player.y += eng.player.vy

        if (eng.player.y + eng.player.height >= groundY) {
          eng.player.y = groundY - eng.player.height
          eng.player.vy = 0
          eng.player.isGrounded = true
          eng.player.jumpCount = 0
          eng.player.squash += (1 - eng.player.squash) * 0.2
          eng.player.stretch += (1 - eng.player.stretch) * 0.2
        } else {
          eng.player.isGrounded = false
        }

        if (eng.player.invulnerableTimer > 0) {
          eng.player.invulnerableTimer--
        }

        // Auto-shoot periodic if enemy in sight
        if (autoShoot && (isBossActive || eng.minions.some((m) => !m.defeated && Math.abs(m.x - eng.player.x) < 400))) {
          const now = Date.now()
          if (now - eng.lastShotTime > 380) {
            handleShoot()
          }
        }
      }

      // Camera Offset
      ctx.save()
      ctx.translate(-eng.cameraX, 0)

      // -------------------------------------------------------------
      // PARTICLES
      // -------------------------------------------------------------
      for (let i = eng.particles.length - 1; i >= 0; i--) {
        const p = eng.particles[i]
        if (!isPausedNow) {
          p.x += p.vx
          p.y += p.vy
          p.life--
          p.alpha = p.life / 25
        }
        if (p.life <= 0) {
          eng.particles.splice(i, 1)
          continue
        }
        ctx.save()
        ctx.globalAlpha = Math.max(0, p.alpha)
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // -------------------------------------------------------------
      // SKILL COLLECTIBLES (Clear, readable pill labels)
      // -------------------------------------------------------------
      eng.skills.forEach((sk) => {
        if (!sk.collected) {
          if (!isPausedNow) {
            sk.bobOffset += 0.04
          }
          const renderY = sk.y + Math.sin(sk.bobOffset) * 6

          ctx.save()
          // Glowing radial gradient
          try {
            const auraGrad = ctx.createRadialGradient(sk.x, renderY, 4, sk.x, renderY, 26)
            auraGrad.addColorStop(0, "rgba(224, 109, 69, 0.4)")
            auraGrad.addColorStop(1, "rgba(224, 109, 69, 0)")
            ctx.fillStyle = auraGrad
            ctx.beginPath()
            ctx.arc(sk.x, renderY, 26, 0, Math.PI * 2)
            ctx.fill()
          } catch {
            // fallback
          }

          // Icon capsule
          ctx.fillStyle = "#ffffff"
          ctx.strokeStyle = "#25231f"
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(sk.x, renderY, 19, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()

          // Emoji icon
          ctx.font = "17px serif"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(sk.icon, sk.x, renderY + 1)

          // Readable skill tag above with clean white pill background
          ctx.font = "600 11px 'DM Sans', sans-serif"
          const skillLabel = `+ ${sk.name}`
          const labelW = ctx.measureText(skillLabel).width + 16
          ctx.fillStyle = "#ffffff"
          ctx.strokeStyle = "#25231f"
          ctx.lineWidth = 1.5
          drawSafeRoundRect(ctx, sk.x - labelW / 2, renderY - 36, labelW, 20, 10)
          ctx.fill()
          ctx.stroke()
          ctx.fillStyle = "#25231f"
          ctx.fillText(skillLabel, sk.x, renderY - 22)
          ctx.restore()

          // Collision check
          if (!isPausedNow) {
            const p = eng.player
            const dist = Math.hypot(p.x + p.width / 2 - sk.x, p.y + p.height / 2 - renderY)
            if (dist < p.width / 2 + 19) {
              sk.collected = true
              setCollectedSkills((prev) => [...prev, { name: sk.name, category: sk.category, icon: sk.icon, xp: sk.xp }])
              setTotalXp((prev) => prev + sk.xp)
              playSfx("collect")
              triggerNotification(`Skill unlocked: ${sk.name} (+${sk.xp} XP)`)

              for (let k = 0; k < 12; k++) {
                eng.particles.push({
                  x: sk.x,
                  y: renderY,
                  vx: (Math.random() - 0.5) * 6,
                  vy: (Math.random() - 0.5) * 6,
                  color: lvl.themeColor,
                  radius: Math.random() * 4 + 2,
                  alpha: 1,
                  life: 20,
                })
              }
            }
          }
        }
      })

      // -------------------------------------------------------------
      // MINIONS (Obstacles: Self-Doubt, Overthinking, Night Shifts)
      // -------------------------------------------------------------
      eng.minions.forEach((m) => {
        if (!m.defeated) {
          ctx.save()
          const wobble = Math.sin(Date.now() * 0.006 + m.x) * 3
          const my = m.y + wobble

          // Minion Body
          ctx.fillStyle = m.color
          ctx.strokeStyle = "#25231f"
          ctx.lineWidth = 2
          drawSafeRoundRect(ctx, m.x - m.width / 2, my, m.width, m.height, 10)
          ctx.fill()
          ctx.stroke()

          // Minion Eyes
          ctx.fillStyle = "#ffffff"
          ctx.beginPath()
          ctx.arc(m.x - 7, my + 13, 5, 0, Math.PI * 2)
          ctx.arc(m.x + 7, my + 13, 5, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = "#25231f"
          ctx.beginPath()
          ctx.arc(m.x - 7, my + 13, 2.5, 0, Math.PI * 2)
          ctx.arc(m.x + 7, my + 13, 2.5, 0, Math.PI * 2)
          ctx.fill()

          // Minion Dialogue Tag - Crisp and easy to read
          ctx.font = "bold 10px 'DM Sans', sans-serif"
          ctx.textAlign = "center"
          const bubbleWidth = ctx.measureText(m.name).width + 14
          ctx.fillStyle = "rgba(255, 255, 255, 0.95)"
          drawSafeRoundRect(ctx, m.x - bubbleWidth / 2, my - 24, bubbleWidth, 17, 6)
          ctx.fill()
          ctx.stroke()
          ctx.fillStyle = "#25231f"
          ctx.fillText(m.name, m.x, my - 12)

          ctx.restore()

          // Stomp or collision
          if (!isPausedNow) {
            const p = eng.player
            const isStomp = p.vy > 0 && p.y + p.height - 10 <= my && p.x + p.width > m.x - m.width / 2 && p.x < m.x + m.width / 2
            if (isStomp) {
              m.defeated = true
              p.vy = -10
              playSfx("bossHit")
              setTotalXp((x) => x + 80)
              triggerNotification(`Overcame obstacle: ${m.name}! (+80 XP)`)
              for (let k = 0; k < 10; k++) {
                eng.particles.push({
                  x: m.x,
                  y: my + 10,
                  vx: (Math.random() - 0.5) * 5,
                  vy: (Math.random() - 0.5) * 5,
                  color: m.color,
                  radius: 3,
                  alpha: 1,
                  life: 18,
                })
              }
            } else if (
              p.x + p.width > m.x - m.width / 2 &&
              p.x < m.x + m.width / 2 &&
              p.y + p.height > my &&
              p.y < my + m.height
            ) {
              if (p.invulnerableTimer === 0) {
                p.invulnerableTimer = 40
                setTotalXp((x) => Math.max(0, x - 20))
                playSfx("hit")
                triggerNotification(`Encountered ${m.name}! Refocusing... (-20 XP)`)
                p.vy = -4
              }
            }
          }
        }
      })

      // -------------------------------------------------------------
      // PROJECTILE ORBS (Insight Weapon)
      // -------------------------------------------------------------
      for (let i = eng.orbs.length - 1; i >= 0; i--) {
        const orb = eng.orbs[i]
        if (!isPausedNow) {
          orb.x += orb.vx
          orb.y += orb.vy
        }

        // Trail particle
        if (!isPausedNow && Math.random() > 0.5) {
          eng.particles.push({
            x: orb.x - 3,
            y: orb.y,
            vx: -2 + Math.random(),
            vy: (Math.random() - 0.5) * 1.5,
            color: orb.color,
            radius: orb.radius * 0.6,
            alpha: 0.8,
            life: 12,
          })
        }

        ctx.save()
        ctx.fillStyle = orb.color
        ctx.beginPath()
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        if (!isPausedNow) {
          let orbConsumed = false
          // Minion hit
          for (const m of eng.minions) {
            if (!m.defeated && Math.hypot(orb.x - m.x, orb.y - (m.y + m.height / 2)) < m.width) {
              m.defeated = true
              orbConsumed = true
              playSfx("bossHit")
              setTotalXp((x) => x + 80)
              triggerNotification(`Overcame: ${m.name}! (+80 XP)`)
              break
            }
          }

          // Boss hit
          if (!orbConsumed && eng.villain && !eng.bossDefeated && eng.villain.hp > 0) {
            const v = eng.villain
            if (
              orb.x >= v.x &&
              orb.x <= v.x + v.width &&
              orb.y >= v.y &&
              orb.y <= v.y + v.height
            ) {
              orbConsumed = true
              v.hp = Math.max(0, v.hp - 1)
              playSfx("bossHit")

              for (let k = 0; k < 8; k++) {
                eng.particles.push({
                  x: orb.x,
                  y: orb.y,
                  vx: (Math.random() - 0.3) * 6,
                  vy: (Math.random() - 0.5) * 5,
                  color: "#e06d45",
                  radius: 4,
                  alpha: 1,
                  life: 18,
                })
              }

              if (v.hp <= 0) {
                eng.bossDefeated = true
                playSfx("bossDefeat")
                setTotalXp((x) => x + 500)
                triggerNotification(`Victory: ${v.name} defeated! (+500 XP)`)
                confetti({ particleCount: 70, spread: 65, origin: { y: 0.6 } })

                setTimeout(() => {
                  if (currentLevelIdx < LEVELS.length - 1) {
                    setGameState("level_clear")
                  } else {
                    setGameState("wispr_knock")
                    playSfx("victory")
                  }
                }, 1100)
              }
            }
          }

          if (orbConsumed || orb.x - eng.cameraX > width + 200) {
            eng.orbs.splice(i, 1)
          }
        }
      }

      // -------------------------------------------------------------
      // VILLAIN / BOSS
      // -------------------------------------------------------------
      if (eng.villain) {
        const v = eng.villain
        const vy = v.y + Math.sin(Date.now() * 0.003) * 6

        ctx.save()
        if (v.hp <= 0) {
          ctx.globalAlpha = 0.35
        }

        // Ground shadow
        ctx.fillStyle = "rgba(0,0,0,0.12)"
        ctx.beginPath()
        ctx.ellipse(v.x + v.width / 2, groundY, v.width / 2, 7, 0, 0, Math.PI * 2)
        ctx.fill()

        // Boss Armor Body
        ctx.fillStyle = v.color
        ctx.strokeStyle = "#25231f"
        ctx.lineWidth = 3
        drawSafeRoundRect(ctx, v.x, vy, v.width, v.height, 16)
        ctx.fill()
        ctx.stroke()

        // Boss Crest / Horns
        ctx.fillStyle = lvl ? lvl.themeColor : "#e06d45"
        ctx.beginPath()
        ctx.moveTo(v.x + 10, vy)
        ctx.lineTo(v.x + 20, vy - 16)
        ctx.lineTo(v.x + 30, vy)
        ctx.fill()
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(v.x + v.width - 30, vy)
        ctx.lineTo(v.x + v.width - 20, vy - 16)
        ctx.lineTo(v.x + v.width - 10, vy)
        ctx.fill()
        ctx.stroke()

        // Boss Eyes
        const eyeColor = v.hp > 0 ? "#ffdd55" : "#777777"
        ctx.fillStyle = eyeColor
        ctx.beginPath()
        ctx.ellipse(v.x + 22, vy + 30, 6, 8, 0.2, 0, Math.PI * 2)
        ctx.ellipse(v.x + v.width - 22, vy + 30, 6, 8, -0.2, 0, Math.PI * 2)
        ctx.fill()

        // Boss Name & HP Bar
        ctx.font = "bold 13px 'Newsreader', serif"
        ctx.textAlign = "center"
        ctx.fillStyle = "#25231f"
        ctx.fillText(v.name, v.x + v.width / 2, vy - 34)

        const hpBarW = 110
        ctx.fillStyle = "rgba(0,0,0,0.1)"
        drawSafeRoundRect(ctx, v.x + v.width / 2 - hpBarW / 2, vy - 16, hpBarW, 7, 3)
        ctx.fill()

        const hpRatio = Math.max(0, v.hp / v.maxHp)
        ctx.fillStyle = hpRatio > 0.4 ? "#e06d45" : "#e53e3e"
        drawSafeRoundRect(ctx, v.x + v.width / 2 - hpBarW / 2, vy - 16, hpBarW * hpRatio, 7, 3)
        ctx.fill()

        // Quote bubble
        if (v.hp > 0 && Math.abs(eng.player.x - v.x) < 520) {
          ctx.font = "italic 11px 'Newsreader', serif"
          const quoteW = ctx.measureText(v.quote).width + 18
          ctx.fillStyle = "#ffffff"
          ctx.strokeStyle = "#25231f"
          ctx.lineWidth = 1.5
          drawSafeRoundRect(ctx, v.x + v.width / 2 - quoteW / 2, vy - 64, quoteW, 21, 6)
          ctx.fill()
          ctx.stroke()
          ctx.fillStyle = "#25231f"
          ctx.fillText(v.quote, v.x + v.width / 2, vy - 50)
        }

        ctx.restore()

        // Boss attacks
        if (!isPausedNow && v.hp > 0 && Math.abs(eng.player.x - v.x) < 460) {
          v.attackCooldown--
          if (v.attackCooldown <= 0) {
            v.attackCooldown = 140
            v.projectiles.push({
              x: v.x - 8,
              y: vy + 32,
              vx: -3.8,
              vy: (Math.random() - 0.5) * 1.5,
              radius: 8,
            })
          }
        }

        // Update Boss Projectiles
        for (let b = v.projectiles.length - 1; b >= 0; b--) {
          const bp = v.projectiles[b]
          if (!isPausedNow) {
            bp.x += bp.vx
            bp.y += bp.vy
          }

          ctx.save()
          ctx.fillStyle = "#e06d45"
          ctx.beginPath()
          ctx.arc(bp.x, bp.y, bp.radius, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()

          if (!isPausedNow) {
            const p = eng.player
            if (
              Math.hypot(p.x + p.width / 2 - bp.x, p.y + p.height / 2 - bp.y) < p.width / 2 + bp.radius &&
              p.invulnerableTimer === 0
            ) {
              p.invulnerableTimer = 45
              setTotalXp((x) => Math.max(0, x - 25))
              playSfx("hit")
              triggerNotification("Dodged blast! (-25 XP)")
              v.projectiles.splice(b, 1)
            } else if (bp.x < eng.cameraX - 100) {
              v.projectiles.splice(b, 1)
            }
          }
        }
      }

      // -------------------------------------------------------------
      // PLAYER HERO CHARACTER (Terracotta smiling hero)
      // -------------------------------------------------------------
      const p = eng.player
      ctx.save()

      if (p.invulnerableTimer > 0 && Math.floor(Date.now() / 60) % 2 === 0) {
        ctx.globalAlpha = 0.4
      }

      // Ground Shadow
      const shadowScale = Math.max(0.3, 1 - (groundY - (p.y + p.height)) / 180)
      ctx.fillStyle = "rgba(0, 0, 0, 0.12)"
      ctx.beginPath()
      ctx.ellipse(p.x + p.width / 2, groundY, (p.width / 2) * shadowScale, 5 * shadowScale, 0, 0, Math.PI * 2)
      ctx.fill()

      // Squish & Stretch transform
      const centerX = p.x + p.width / 2
      const centerY = p.y + p.height / 2
      ctx.translate(centerX, centerY)
      ctx.scale(p.squash, p.stretch)
      ctx.translate(-centerX, -centerY)

      // Character body with website's pastel layered shadows
      ctx.fillStyle = "#dbe7d4"
      drawSafeRoundRect(ctx, p.x + 6, p.y + 6, p.width, p.height, 14)
      ctx.fill()

      ctx.fillStyle = "#e7c766"
      drawSafeRoundRect(ctx, p.x + 3, p.y + 3, p.width, p.height, 14)
      ctx.fill()

      // Main Face Body
      ctx.fillStyle = "#e06d45"
      ctx.strokeStyle = "#25231f"
      ctx.lineWidth = 1.5
      drawSafeRoundRect(ctx, p.x, p.y, p.width, p.height, 14)
      ctx.fill()
      ctx.stroke()

      // Eyes
      const eyeBlink = Math.sin(Date.now() * 0.004) > 0.95 ? 0.2 : 1
      ctx.fillStyle = "#25231f"
      ctx.beginPath()
      ctx.ellipse(p.x + 13, p.y + 17, 2.5, 4 * eyeBlink, 0, 0, Math.PI * 2)
      ctx.ellipse(p.x + 31, p.y + 17, 2.5, 4 * eyeBlink, 0, 0, Math.PI * 2)
      ctx.fill()

      // Smile
      ctx.beginPath()
      ctx.arc(p.x + 22, p.y + 24, 7, 0.2, Math.PI - 0.2, false)
      ctx.lineWidth = 1.8
      ctx.strokeStyle = "#25231f"
      ctx.stroke()

      // Wand
      const wandAngle = Math.sin(Date.now() * 0.01) * 0.2
      ctx.save()
      ctx.translate(p.x + p.width + 2, p.y + 24)
      ctx.rotate(wandAngle)
      ctx.strokeStyle = "#25231f"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(-3, 0)
      ctx.lineTo(11, -3)
      ctx.stroke()

      ctx.fillStyle = lvl ? lvl.themeColor : "#e06d45"
      ctx.beginPath()
      ctx.arc(13, -4, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      ctx.restore() // Restore squash
      ctx.restore() // Restore camera translate

      animationId = requestAnimationFrame(render)
    }

    animationId = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animationId)
  }, [currentLevelIdx, gameState, autoShoot, handleShoot, playSfx])

  const handleNextLevel = () => {
    if (currentLevelIdx < LEVELS.length - 1) {
      const nextIdx = currentLevelIdx + 1
      setCurrentLevelIdx(nextIdx)
      initLevel(nextIdx)
    } else {
      setGameState("wispr_knock")
    }
  }

  const handleKnockAtWisprDoor = () => {
    playSfx("knock")
    const nextKnock = knockProgress + 1
    setKnockProgress(nextKnock)

    confetti({
      particleCount: 25 * nextKnock,
      spread: 45 + nextKnock * 15,
      origin: { y: 0.5 },
    })

    if (nextKnock >= 3) {
      playSfx("victory")
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.4 },
      })
    }
  }

  const currentLevel = LEVELS[currentLevelIdx]

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col w-full h-full select-none overflow-hidden ${
        isFullScreen ? "bg-[#f6f4ef]" : ""
      }`}
    >
      {/* Top Header - Compact in Preview, Rich in Fullscreen */}
      <div className="flex items-center justify-between border-b border-black/8 bg-[#f9f8f4]/95 px-3 py-2 z-20">
        <div className="flex items-center gap-2">
          {/* Milestone Badges */}
          <div className="flex items-center gap-1">
            {LEVELS.map((lvl, idx) => (
              <span
                key={lvl.id}
                className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                  idx === currentLevelIdx
                    ? "bg-[#25231f] text-white"
                    : idx < currentLevelIdx
                    ? "bg-[#cad8eb] text-[#25231f] line-through opacity-70"
                    : "bg-black/5 text-black/40"
                }`}
              >
                {idx + 1}
                {isFullScreen && (
                  <span className="ml-1 text-[10px] hidden sm:inline">
                    · {lvl.shortTitle}
                  </span>
                )}
                {idx < currentLevelIdx && " ✓"}
              </span>
            ))}
          </div>

          {/* Additional text shown in FullScreen mode */}
          {isFullScreen ? (
            <span className="text-[12px] text-black/60 hidden md:inline ml-2 font-serif italic">
              {currentLevel.title}
            </span>
          ) : (
            <span className="text-[11px] text-black/45 font-mono ml-1">
              {currentLevel.shortTitle}
            </span>
          )}
        </div>

        {/* Right side stats & controls */}
        <div className="flex items-center gap-2">
          {/* Minimalist Pause / Resume Button */}
          <button
            onClick={() => setIsPaused((p) => !p)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 font-medium ${
              isPaused
                ? "bg-[#e06d45] text-white border-transparent shadow-sm"
                : "bg-white/80 border-black/10 text-black/70 hover:bg-black/5"
            }`}
            title={isPaused ? "Resume game (P)" : "Pause game (P)"}
          >
            <span>{isPaused ? "▶" : "⏸"}</span>
            <span className="text-[10px]">{isPaused ? "Resume" : "Pause"}</span>
          </button>

          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#cad8eb]/60 border border-black/10">
            <span className="text-[11px]">⚡</span>
            <span className="text-[11px] font-bold text-[#25231f]">{totalXp} XP</span>
          </div>

          {/* Auto-Cast button */}
          <button
            onClick={() => setAutoShoot((prev) => !prev)}
            title="Toggle Auto-Cast Orbs"
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium border hidden sm:block ${
              autoShoot ? "bg-[#e06d45] text-white border-transparent" : "bg-black/5 text-black/50 border-black/10"
            }`}
          >
            Auto: {autoShoot ? "ON" : "OFF"}
          </button>

          {onToggleFullScreen && (
            <button
              onClick={onToggleFullScreen}
              className="text-xs px-2 py-1 rounded-md hover:bg-black/5 text-black/60 transition-colors"
              title={isFullScreen ? "Exit Fullscreen" : "Fullscreen Game"}
            >
              {isFullScreen ? "Exit 🗗" : "Full ⛶"}
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="text-xs px-1.5 py-0.5 rounded-md hover:bg-black/10 text-black/50 transition-colors"
              title="Close"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Expanded contextual banner ONLY in Fullscreen mode */}
      {isFullScreen && (
        <div className="px-4 py-1.5 bg-[#f6f4ef] border-b border-black/5 flex items-center justify-between text-xs text-black/70">
          <span className="font-serif italic text-black/80">{currentLevel.subtitle}</span>
          <span className="text-[11px] text-black/50">{currentLevel.lore}</span>
        </div>
      )}

      {/* Main Canvas Area */}
      <div className="relative flex-1 w-full h-full bg-[#f9f8f4] overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={380}
          className="w-full h-full block touch-none"
          onClick={handleJump}
        />

        {/* Transient Notifications */}
        {activeNotification && !isPaused && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-[#25231f]/90 text-white text-[11px] px-3.5 py-1.5 rounded-full shadow-lg backdrop-blur-md animate-bounce flex items-center gap-1.5 pointer-events-none z-30">
            <span>💡</span>
            <span>{activeNotification}</span>
          </div>
        )}

        {/* Minimalist Pause Overlay */}
        {isPaused && (
          <div className="absolute inset-0 bg-[#f6f4ef]/80 backdrop-blur-sm flex flex-col items-center justify-center z-35 animate-fade-in pointer-events-auto">
            <div className="bg-white/95 border border-black/10 rounded-2xl p-6 shadow-xl text-center max-w-xs">
              <span className="text-2xl mb-1 block">⏸</span>
              <h4 className="font-serif text-lg text-[#25231f]">Game Paused</h4>
              <p className="text-[11px] text-black/50 mt-1 mb-4">
                Take your time to read the skills and milestones. Press Resume or hit <kbd className="px-1.5 py-0.5 bg-black/5 rounded font-mono">P</kbd> to continue.
              </p>
              <button
                onClick={() => setIsPaused(false)}
                className="px-5 py-2 rounded-full bg-[#25231f] text-white text-xs font-medium hover:bg-[#e06d45] transition-all shadow-md"
              >
                Resume Run ▶
              </button>
            </div>
          </div>
        )}

        {/* Collected Skills Tray */}
        <div className="absolute bottom-2.5 left-2.5 flex flex-wrap gap-1 max-w-[65%] pointer-events-none z-10">
          {collectedSkills.map((sk, idx) => (
            <span
              key={`${sk.name}-${idx}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/95 border border-black/10 text-[10px] text-[#25231f] shadow-sm font-medium"
            >
              <span>{sk.icon}</span>
              <span>{sk.name}</span>
            </span>
          ))}
        </div>

        {/* Jump & Shoot Controls */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 z-20">
          <button
            onPointerDown={(e) => {
              e.preventDefault()
              handleShoot()
            }}
            className="flex items-center justify-center size-10 rounded-full bg-[#e06d45] text-white shadow-md active:scale-90 transition-transform"
            title="Shoot Insight Orb (F / Enter)"
          >
            ⚡
          </button>
          <button
            onPointerDown={(e) => {
              e.preventDefault()
              handleJump()
            }}
            className="flex items-center justify-center size-12 rounded-full bg-[#25231f] text-white shadow-lg active:scale-90 transition-transform font-bold text-[11px]"
            title="Jump (Space / Up)"
          >
            JUMP
          </button>
        </div>

        {/* LEVEL CLEAR MODAL */}
        {gameState === "level_clear" && (
          <div className="absolute inset-0 bg-[#f6f4ef]/92 backdrop-blur-md flex flex-col items-center justify-center p-5 text-center z-40 animate-fade-in">
            <span className="text-2xl mb-1">🎉</span>
            <span className="text-[10px] font-mono tracking-widest uppercase text-black/50">
              Milestone Accomplished
            </span>
            <h3 className="font-serif text-xl md:text-2xl font-normal mt-1 text-[#25231f]">
              {currentLevel.villain.defeatNote}
            </h3>
            <p className="mt-2 text-xs text-black/60 max-w-md">
              {currentLevel.lore}
            </p>

            <div className="mt-5 flex flex-col items-center gap-1.5">
              <button
                onClick={handleNextLevel}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25231f] text-white text-xs font-medium hover:bg-[#e06d45] transition-all hover:scale-105 shadow-md"
              >
                Next Milestone →
              </button>
              <span className="text-[10px] text-black/40">Career XP: {totalXp}</span>
            </div>
          </div>
        )}

        {/* FINAL WISPR FLOW CLIMAX */}
        {gameState === "wispr_knock" && (
          <div className="absolute inset-0 bg-[#f6f4ef]/95 backdrop-blur-lg flex flex-col items-center justify-center p-5 text-center z-50 overflow-y-auto">
            {knockProgress < 3 ? (
              <div className="flex flex-col items-center max-w-sm">
                <div
                  className="w-32 h-44 bg-[#e8ded3] rounded-t-3xl border-4 border-[#25231f] shadow-2xl relative flex flex-col items-center justify-center transition-all hover:scale-105 cursor-pointer mb-4"
                  onClick={handleKnockAtWisprDoor}
                >
                  <div className="absolute top-3 border-b-2 border-black/20 w-20 text-center pb-1 text-[10px] font-serif font-bold text-[#25231f]">
                    WISPR FLOW
                  </div>
                  <div className="size-12 rounded-full border-4 border-[#e06d45] flex items-center justify-center shadow-md bg-white hover:bg-[#cad8eb] transition-colors">
                    <span className="text-lg">🚪</span>
                  </div>
                  <span className="absolute bottom-3 text-[10px] text-black/50 font-mono">
                    Knock {knockProgress}/3
                  </span>
                </div>

                <h2 className="font-serif text-xl md:text-2xl text-[#25231f]">
                  Knock at the Door of Wispr Flow
                </h2>
                <p className="mt-1 text-xs text-black/60">
                  Tap the knocker 3 times to present Shubham Dhiman's career journey!
                </p>

                <button
                  onClick={handleKnockAtWisprDoor}
                  className="mt-4 flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#e06d45] text-white text-xs font-medium shadow-md hover:scale-105 active:scale-95 transition-all"
                >
                  ✊ Knock ({knockProgress}/3)
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center max-w-md w-full py-2 animate-fade-in">
                <span className="text-3xl mb-1">🌟</span>
                <span className="text-[11px] font-mono tracking-widest text-[#e06d45] uppercase font-bold">
                  Hiring Challenge Completed
                </span>
                <h2 className="font-serif text-2xl md:text-3xl text-[#25231f] mt-1">
                  Welcome to Wispr Flow
                </h2>

                <div className="mt-4 w-full bg-white/80 border border-black/10 rounded-xl p-3.5 shadow-sm text-left">
                  <div className="flex justify-between items-center border-b border-black/10 pb-2">
                    <div>
                      <p className="text-[10px] text-black/40">CANDIDATE</p>
                      <p className="font-bold text-xs text-[#25231f]">Shubham Dhiman</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-black/40">SCORE</p>
                      <p className="font-bold text-xs text-[#e06d45]">{totalXp} XP (100% Cleared)</p>
                    </div>
                  </div>

                  <div className="mt-2.5">
                    <p className="text-[10px] text-black/40 mb-1">UNLOCKED COMPETENCIES:</p>
                    <div className="flex flex-wrap gap-1">
                      {collectedSkills.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-full bg-[#f6f4ef] border border-black/8 text-[10px] text-[#25231f]"
                        >
                          {s.icon} {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                  <a
                    href={`${import.meta.env.BASE_URL}Shubham-Dhiman-Resume.pdf`}
                    download="Shubham-Dhiman-Resume.pdf"
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#25231f] text-white text-xs font-medium hover:bg-[#e06d45] transition-all shadow-md"
                  >
                    <span>📄</span>
                    Download Resume (PDF)
                  </a>

                  <a
                    href="mailto:sdshubham10@gmail.com?subject=Wispr%20Flow%20Hiring%20Challenge%20-%20Shubham%20Dhiman"
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-black/15 bg-white text-black/80 text-xs font-medium hover:bg-black/5 transition-all"
                  >
                    <span>✉️</span>
                    Contact
                  </a>

                  <button
                    onClick={() => {
                      setKnockProgress(0)
                      setCurrentLevelIdx(0)
                      initLevel(0)
                    }}
                    className="text-[11px] text-black/45 underline decoration-black/20 underline-offset-4 px-2 py-1"
                  >
                    Play Again
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer controls guide */}
      <div className="bg-[#f6f4ef] border-t border-black/8 px-3 py-1 flex items-center justify-between text-[10px] text-black/50">
        <div className="flex items-center gap-2">
          <span><kbd className="px-1 py-0.5 rounded bg-black/5 font-mono">SPACE</kbd> Jump</span>
          <span><kbd className="px-1 py-0.5 rounded bg-black/5 font-mono">F</kbd> / <kbd className="px-1 py-0.5 rounded bg-black/5 font-mono">⚡</kbd> Orb</span>
          <span><kbd className="px-1 py-0.5 rounded bg-black/5 font-mono">P</kbd> Pause</span>
        </div>
        <span>~60–90s run</span>
      </div>
    </div>
  )
}
