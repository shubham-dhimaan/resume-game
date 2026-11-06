import { useState, useEffect, useCallback } from "react"
import ResumeGame, { type PersistentGameState } from "./ResumeGame"
import avatarImg from "/shubham-avatar.jpg?url"
import amazonImg from "/shubham-at-amazon.jpg?url"

const resumePdf = `${import.meta.env.BASE_URL}Shubham-Dhiman-Resume.pdf`

const milestones = [
  {
    period: "Dec 2025 — Jul 2026",
    company: "Turing",
    role: "AI Analyst",
    note: "Worked on frontier models including Gemini and ChatGPT, reviewing reasoning and turning failure patterns into useful feedback.",
    accent: "#dbe7d4",
  },
  {
    period: "Sep 2024 — Dec 2025",
    company: "Amazon",
    role: "AI Content Writer / AI Data Associate",
    note: "Worked directly with the Amazon Nova AGI team, building adversarial prompts, benchmarks, and quality workflows for its pre-training pipeline.",
    accent: "#dce5f4",
  },
  {
    period: "2018 — 2023",
    company: "Freelance",
    role: "Writer & strategist",
    note: "Wrote about psychology and human behavior for an audience of more than 55 million readers.",
    accent: "#f0ddd1",
  },
]

const education = [
  {
    period: "2026 — Present",
    company: "BITS Pilani",
    role: "MSc in Data Science & AI",
    note: "Part-time postgraduate study in data science and artificial intelligence.",
    accent: "#dbe7d4",
  },
  {
    period: "2022 — 2024",
    company: "Amity University",
    role: "Master’s in Counselling Psychology",
    note: "Graduate study in counselling psychology in Noida.",
    accent: "#dce5f4",
  },
  {
    period: "2019 — 2022",
    company: "Amity University",
    role: "BA (Honours) in Applied Psychology",
    note: "Undergraduate study in applied psychology in Noida.",
    accent: "#f0ddd1",
  },
]

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={diagonal ? "size-4 -rotate-45" : "size-4"}
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M2.5 8h10M8.5 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.25"
      />
    </svg>
  )
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => {
      const hasTouch =
        window.matchMedia("(pointer: coarse)").matches ||
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0
      const isNarrow = window.innerWidth < 768
      setIsMobile(isNarrow && (hasTouch || window.innerWidth < 640))
    }

    check()
    window.addEventListener("resize", check)
    window.addEventListener("orientationchange", check)
    return () => {
      window.removeEventListener("resize", check)
      window.removeEventListener("orientationchange", check)
    }
  }, [])

  return isMobile
}

function GameFace() {
  return (
    <div className="game-face" aria-hidden="true">
      <span className="game-eye game-eye-left" />
      <span className="game-eye game-eye-right" />
      <span className="game-smile" />
    </div>
  )
}

export default function App() {
  const isMobile = useIsMobile()
  const [menuOpen, setMenuOpen] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [isFullScreenGame, setIsFullScreenGame] = useState(false)
  const [careerView, setCareerView] = useState<"work" | "education">("work")
  const activeTimeline = careerView === "work" ? milestones : education

  const [persistentGameState, setPersistentGameState] = useState<PersistentGameState>({
    levelIdx: 0,
    totalXp: 0,
    collectedSkills: [],
    gameState: "playing",
    knockProgress: 0,
    isPaused: false,
  })

  // Open Fullscreen & push browser history state
  const openFullScreen = useCallback(() => {
    setIsFullScreenGame(true)
    setGameStarted(true)
    setPersistentGameState((prev) => ({ ...prev, isPaused: false }))
    // Push history state so hardware/browser back button closes the game modal instead of exiting the site
    window.history.pushState({ modal: "game" }, "")
    // Try requesting real browser fullscreen on mobile if allowed
    if (isMobile && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {})
    }
  }, [isMobile])

  // Close Fullscreen, exit native fullscreen, and ensure game progress is preserved & paused
  const closeFullScreen = useCallback(() => {
    setIsFullScreenGame(false)
    setPersistentGameState((prev) => ({ ...prev, isPaused: true }))
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {})
    }
    if (window.history.state?.modal === "game") {
      window.history.back()
    }
  }, [])

  // Handle hardware / browser back button (popstate event)
  useEffect(() => {
    const handlePopState = () => {
      if (isFullScreenGame) {
        setIsFullScreenGame(false)
        setPersistentGameState((prev) => ({ ...prev, isPaused: true }))
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {})
        }
      }
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [isFullScreenGame])

  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f4ef] text-[#25231f]">
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
        <nav className="mx-auto flex max-w-[1240px] items-center justify-between rounded-full border border-black/10 bg-[#f6f4ef]/85 px-4 py-3 shadow-[0_8px_30px_rgba(37,35,31,0.04)] backdrop-blur-xl md:px-5">
          <a
            href="#home"
            className="flex items-center gap-2.5"
            aria-label="Shubham Dhiman, home"
          >
            <img
              src={avatarImg}
              alt=""
              className="size-7 rounded-full border border-black/10 object-cover"
            />
            <span className="text-[13px] font-semibold tracking-[-0.01em]">
              Shubham Dhiman
            </span>
          </a>

          <div className="hidden items-center gap-7 text-[13px] text-black/55 md:flex">
            <a className="nav-link" href="#work">
              Experience
            </a>
            <a className="nav-link" href="#about">
              About
            </a>
            <a className="nav-link" href="mailto:sdshubham10@gmail.com">
              Contact
            </a>
            <a className="nav-link" href={resumePdf} download>
              Resume
            </a>
          </div>

          <button
            className="hidden items-center gap-2 rounded-full bg-[#25231f] px-4 py-2 text-[12px] font-medium text-white md:flex cursor-pointer"
            onClick={() => {
              if (isMobile) {
                openFullScreen()
              } else {
                document
                  .querySelector("#game-preview")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            }}
          >
            Play for resume
            <Arrow />
          </button>

          <button
            aria-expanded={menuOpen}
            aria-label="Toggle navigation"
            className="grid size-8 place-items-center rounded-full bg-[#25231f] text-white md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="text-lg leading-none">
              {menuOpen ? "×" : "· ·"}
            </span>
          </button>
        </nav>

        {menuOpen && (
          <div className="mx-auto mt-2 grid max-w-[1240px] rounded-[24px] border border-black/10 bg-[#f6f4ef] p-4 shadow-xl md:hidden">
            <button
              type="button"
              className="flex items-center justify-between border-b border-black/10 px-1 py-3.5 text-sm font-semibold text-[#e06d45] text-left cursor-pointer"
              onClick={() => {
                setMenuOpen(false)
                openFullScreen()
              }}
            >
              <span>🎮 Play Resume Game</span>
              <Arrow />
            </button>
            {[
              ["Experience", "#work"],
              ["About", "#about"],
              ["Contact", "mailto:sdshubham10@gmail.com"],
              ["Download resume", resumePdf],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="flex items-center justify-between border-b border-black/10 px-1 py-3.5 text-sm last:border-0"
                onClick={() => setMenuOpen(false)}
                download={label === "Download resume" ? true : undefined}
              >
                {label}
                <Arrow />
              </a>
            ))}
          </div>
        )}
      </header>

      <section
        id="home"
        className="mx-auto flex min-h-screen max-w-[1240px] flex-col items-center px-5 pb-20 pt-32 text-center md:px-8 md:pt-36"
      >
        <div className="flex max-w-4xl flex-col items-center">
          <p className="mb-7 flex items-center gap-2 text-[12px] text-black/48">
            <span className="size-1.5 rounded-full bg-[#e06d45]" />
            AI Analyst · Content Specialist · Curious Human
          </p>
          <h1 className="font-serif text-[clamp(3.5rem,7vw,6.8rem)] font-normal leading-[0.94] tracking-[-0.055em]">
            A <span className="italic text-[#e06d45]">resume</span> is better
            <br className="hidden sm:block" /> played than read.
          </h1>
          <p className="mt-7 max-w-2xl text-[15px] leading-7 text-black/55 md:text-base">
            Hi, I’m Shubham Dhiman. I study how people think, how content works,
            and how AI models function. Worked directly with Amazon Nova AGI
            team and looking for similar roles.
          </p>

          <div className="mt-9 flex flex-col items-center gap-3">
            <button
              className="group flex items-center gap-3 rounded-full bg-[#25231f] px-5 py-3.5 text-[13px] font-medium text-white cursor-pointer"
              onClick={() => {
                if (isMobile) {
                  openFullScreen()
                } else {
                  document
                    .querySelector("#game-preview")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              }}
            >
              Play for resume
              <span>
                <Arrow />
              </span>
            </button>
            <a
              href={resumePdf}
              download
              className="flex items-center gap-1.5 text-[12px] text-black/38 transition-colors hover:text-black/60"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.5 1v7M3.5 5.5l3 3 3-3M2 11h9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Download resume
            </a>
            <a className="nav-link text-[11px] text-black/35" href="#work">
              Just get the short summary{" "}
              <span className="italic">(no time to play)</span>
            </a>
          </div>
        </div>

        <div id="game-preview" className="relative mt-20 w-full max-w-[680px] scroll-mt-28">
          <span className="absolute -left-1 -top-8 rotate-[-7deg] font-serif text-sm italic text-black/45 sm:-left-7">
            about 90 seconds
          </span>
          <div className="game-window relative mx-auto aspect-[1.3/1] w-full overflow-hidden rounded-[30px] border border-black/10 bg-[#cad8eb] p-3 shadow-[0_30px_80px_rgba(47,54,65,0.13)] sm:p-4">
            <div className="flex h-full flex-col overflow-hidden rounded-[22px] bg-[#f9f8f4]">
              <div className="flex items-center justify-between border-b border-black/8 px-5 py-3">
                <div className="flex gap-1.5">
                  <span className="size-2 rounded-full bg-[#ff8066]" />
                  <span className="size-2 rounded-full bg-[#f2d36b]" />
                  <span className="size-2 rounded-full bg-[#7ed4ab]" />
                </div>
                <span className="text-[10px] tracking-[0.08em] text-black/35">
                  shubham.resume
                </span>
                <span className="text-[10px] text-black/35">01 / 04</span>
              </div>

              {!gameStarted || isFullScreenGame ? (
                <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 text-center">
                  <span className="soft-orbit orbit-one pointer-events-none" />
                  <span className="soft-orbit orbit-two pointer-events-none" />
                  <GameFace />
                  <p className="mt-7 font-serif text-[clamp(2rem,4vw,3.4rem)] leading-[1.02] tracking-[-0.04em] relative z-10">
                    Find the person
                    <br />
                    behind the resume.
                  </p>
                  <button
                    type="button"
                    className="relative z-20 mt-7 flex items-center gap-2 rounded-full bg-[#25231f] px-5 py-3 text-[12px] text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#e06d45] hover:shadow-md cursor-pointer select-none"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (isMobile) {
                        openFullScreen()
                      } else {
                        setGameStarted(true)
                      }
                    }}
                  >
                    {isMobile
                      ? "Play Arcade (Fullscreen)"
                      : persistentGameState.levelIdx > 0 || persistentGameState.totalXp > 0
                      ? "Resume Run ▶"
                      : "Start"}
                    <Arrow />
                  </button>
                </div>
              ) : (
                <ResumeGame
                  onClose={() => setGameStarted(false)}
                  isFullScreen={false}
                  savedState={persistentGameState}
                  onStateChange={setPersistentGameState}
                  onToggleFullScreen={openFullScreen}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      <section
        id="work"
        className="border-t border-black/10 bg-[#efeee8] px-5 py-20 md:px-8 md:py-28"
      >
        <div className="mx-auto max-w-[1240px]">
          <div className="grid gap-8 border-b border-black/10 pb-12 md:grid-cols-[0.7fr_1.3fr] md:items-end">
            <div>
              <p className="section-label">Career</p>
              <div
                className="mt-5 inline-flex rounded-full border border-black/10 bg-[#f6f4ef] p-1"
                role="tablist"
                aria-label="Career timeline"
              >
                {(["work", "education"] as const).map((view) => (
                  <button
                    key={view}
                    type="button"
                    role="tab"
                    aria-selected={careerView === view}
                    className={`rounded-full px-4 py-2 text-[12px] font-medium capitalize transition-colors ${
                      careerView === view
                        ? "bg-[#25231f] text-white"
                        : "text-black/45 hover:text-black"
                    }`}
                    onClick={() => setCareerView(view)}
                  >
                    {view}
                  </button>
                ))}
              </div>
            </div>
            <h2 className="max-w-2xl font-serif text-[clamp(2.5rem,5vw,4.8rem)] font-normal leading-[1.02] tracking-[-0.045em]">
              {careerView === "work"
                ? "From understanding people to AI."
                : "The learning behind the work."}
            </h2>
          </div>

          <div className="divide-y divide-black/10" role="tabpanel">
            {activeTimeline.map((milestone) => (
              <article
                key={`${milestone.company}-${milestone.role}`}
                className="milestone-row group grid gap-5 py-8 md:grid-cols-[0.7fr_0.7fr_1.3fr_auto] md:items-start md:gap-8 md:py-10"
              >
                <p className="text-[12px] text-black/40">{milestone.period}</p>
                <div>
                  <span
                    className="mb-3 block size-2.5 rounded-full transition-transform group-hover:scale-150"
                    style={{ backgroundColor: milestone.accent }}
                  />
                  <h3 className="text-[16px] font-semibold tracking-[-0.02em]">
                    {milestone.company}
                  </h3>
                  <p className="mt-1 text-[13px] text-black/45">
                    {milestone.role}
                  </p>
                </div>
                <p className="max-w-xl text-[14px] leading-6 text-black/58">
                  {milestone.note}
                </p>
                <span className="hidden size-9 place-items-center rounded-full border border-black/10 text-black/35 transition-all group-hover:bg-[#25231f] group-hover:text-white md:grid">
                  <Arrow diagonal />
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
          <figure className="w-full">
            <img
              src={amazonImg}
              alt="Shubham standing beneath the Amazon smile at the Amazon office"
              className="h-auto w-full rounded-[26px] border border-black/10"
            />
            <figcaption className="mt-3 text-[11px] text-black/38">
              A small human under a very large smile · Amazon, Hyderabad
            </figcaption>
          </figure>
          <div>
            <p className="section-label mb-8">A little more</p>
            <p className="font-serif text-[clamp(2.3rem,4.2vw,4.5rem)] leading-[1.1] tracking-[-0.04em]">
              Psychology taught me to notice the nuance. Writing taught me to
              make it clear. AI gave me a place to use both.
            </p>
            <div className="mt-10 flex flex-wrap gap-2">
              {[
                "LLM evaluation",
                "Prompt engineering",
                "Adversarial testing",
                "Python",
                "SQL",
              ].map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-black/10 bg-white px-4 py-2 text-[12px] text-black/55"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#df714c] px-5 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-[1240px]">
          <div className="grid gap-12 border-b border-black/15 pb-16 md:grid-cols-[0.7fr_1.3fr]">
            <p className="section-label">Say hello</p>
            <div>
              <p className="max-w-3xl font-serif text-[clamp(2.6rem,6vw,6rem)] leading-[0.98] tracking-[-0.05em]">
                Have an interesting problem to solve?
              </p>
              <a
                className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#25231f] px-5 py-3.5 text-[13px] text-white transition-transform hover:-translate-y-0.5"
                href="mailto:sdshubham10@gmail.com"
              >
                Write to me
                <Arrow />
              </a>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-5 pt-6 text-[12px] text-black/55 sm:flex-row">
            <span>Shubham Dhiman · Delhi, India</span>
            <div className="flex gap-6">
              <a
                className="nav-link"
                href="https://www.linkedin.com/in/shubham-dhiman-658701178/"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
              <a
                className="nav-link"
                href="https://github.com/shubham-dhimaan"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
              <a
                className="nav-link"
                href={resumePdf}
                download
              >
                Resume
              </a>
            </div>
          </div>
        </div>
      </footer>

      {isFullScreenGame && (
        <div
          className={`fixed inset-0 z-[100] ${
            isMobile
              ? "p-0 bg-[#f9f8f4]"
              : "bg-black/60 backdrop-blur-sm p-4 md:p-8 flex items-center justify-center"
          }`}
        >
          <div
            className={`relative w-full ${
              isMobile
                ? "h-full rounded-none border-none shadow-none"
                : "max-w-5xl h-[85vh] rounded-3xl shadow-2xl border border-black/15"
            } bg-[#f9f8f4] overflow-hidden`}
          >
            <ResumeGame
              isFullScreen={true}
              isMobileMode={isMobile}
              savedState={persistentGameState}
              onStateChange={setPersistentGameState}
              onClose={closeFullScreen}
              onToggleFullScreen={closeFullScreen}
            />
          </div>
        </div>
      )}
    </main>
  )
}
