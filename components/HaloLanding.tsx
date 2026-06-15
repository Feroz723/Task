"use client";

import {
  ArrowRight,
  CheckCircle2,
  Download,
  Flame,
  Palette,
  Play,
  Smartphone,
  Sparkles,
  Paintbrush,
  Timer,
  Vibrate,
  Zap,
  Shield,
  Wifi,
  WifiOff,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { THEMES } from "@/lib/halo-data";

const THEME_IMAGES: Record<string, string> = {
  cloud: "/theme-cloud.png",
  midnight: "/theme-midnight.png",
  sakura: "/theme-sakura.png",
  forest: "/theme-forest.png",
  sand: "/theme-sand.png",
};

const FEATURES = [
  {
    Icon: Sparkles,
    title: "Halo Bloom Animation",
    description:
      "A soft violet glow radiates outward when you complete a task — the most satisfying checkbox in any task app.",
  },
  {
    Icon: Palette,
    title: "5 Hand-Crafted Themes",
    description:
      "Cloud, Midnight, Sakura, Forest, Sand — each with its own curated palette, not just a colour swap.",
  },
  {
    Icon: Vibrate,
    title: "Haptic Feedback",
    description:
      "A gentle pulse on task completion makes every checkmark feel physical and rewarding.",
  },
  {
    Icon: Zap,
    title: "Swipe Gestures",
    description:
      "Swipe right to complete, swipe left to delete. Fluid, spring-physics animations throughout.",
  },
  {
    Icon: Flame,
    title: "Streak Counter",
    description:
      "Stay consistent — milestone confetti bursts at 7, 30, and 100 day streaks.",
  },
  {
    Icon: WifiOff,
    title: "Offline-First",
    description:
      "Your data never leaves your device. No login, no cloud, no account required. Ever.",
  },
];

const DEMO_STEPS = [
  { step: "01", label: "Add a task", sublabel: "Tap the + button" },
  { step: "02", label: "Complete it", sublabel: "Watch the halo bloom" },
  { step: "03", label: "Switch themes", sublabel: "Find your favourite" },
];

const STATS = [
  { value: "5", label: "Themes" },
  { value: "400ms", label: "Halo bloom" },
  { value: "0", label: "Logins needed" },
  { value: "∞", label: "Free forever" },
];

export function HaloLanding() {
  const [activeTheme, setActiveTheme] = useState(0);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTheme((prev) => (prev + 1) % THEMES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="landing-page" data-theme="dark">
      {/* ───── HERO ───── */}
      <section className="landing-hero">
        <div className={`hero-glow ${heroVisible ? "visible" : ""}`} aria-hidden="true" />

        <nav className="landing-nav" aria-label="Landing navigation">
          <Link href="/" className="nav-link">
            Open app
          </Link>
          <a href="#download" className="nav-link">
            Download
          </a>
        </nav>

        <div className="hero-layout">
          <div className={`hero-copy ${heroVisible ? "visible" : ""}`}>
            <p className="hero-eyebrow">Free forever · No login · Works offline</p>
            <h1>Halo</h1>
            <h2>The task manager that actually feels good to use.</h2>
            <p className="hero-subtitle">
              Five hand-crafted themes, a satisfying completion animation, swipe
              gestures, and offline-first privacy — in a single beautiful app.
            </p>
            <div className="hero-actions">
              <Link className="landing-primary" href="/">
                <Smartphone size={18} />
                Try the PWA
              </Link>
              <a className="landing-secondary" href="#demo">
                <Play size={18} />
                See the demo
              </a>
            </div>
          </div>

          <div className={`hero-image-wrap ${heroVisible ? "visible" : ""}`}>
            <Image
              alt="Halo task manager app showing the completion animation with a violet halo bloom effect"
              className="hero-image"
              height={700}
              priority
              src="/hero-mockup.png"
              width={600}
            />
          </div>
        </div>
      </section>

      {/* ───── STATS BAR ───── */}
      <section className="stats-bar" aria-label="Key stats">
        {STATS.map((stat) => (
          <div className="stat-item" key={stat.label}>
            <span className="stat-value">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </section>

      {/* ───── FEATURES ───── */}
      <section className="features-section" id="features" aria-label="Features">
        <div className="section-header">
          <p className="eyebrow">Why Halo?</p>
          <h2>Design is the differentiator.</h2>
          <p className="section-subtitle">
            Every interaction is crafted to feel satisfying. Beautiful design
            isn't a nice-to-have — it's the reason you'll open Halo every
            morning.
          </p>
        </div>
        <div className="features-grid">
          {FEATURES.map(({ Icon, title, description }) => (
            <article className="feature-card" key={title}>
              <div className="feature-icon">
                <Icon size={22} />
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ───── DEMO ───── */}
      <section className="demo-section" id="demo" aria-label="Demo workflow">
        <div className="section-header">
          <p className="eyebrow">Demo-first marketing</p>
          <h2>One clip carries the launch.</h2>
          <p className="section-subtitle">
            A 15-second screen recording is more effective than any written
            description. Here's the flow:
          </p>
        </div>
        <div className="demo-flow">
          {DEMO_STEPS.map((item, idx) => (
            <div className="demo-step" key={item.step}>
              <span className="step-number">{item.step}</span>
              <div>
                <strong>{item.label}</strong>
                <small>{item.sublabel}</small>
              </div>
              {idx < DEMO_STEPS.length - 1 && (
                <ArrowRight className="step-arrow" size={20} />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ───── THEMES ───── */}
      <section className="themes-section" id="themes" aria-label="Theme gallery">
        <div className="section-header">
          <p className="eyebrow">5 hand-crafted themes</p>
          <h2>Pick the palette that matches your energy.</h2>
          <p className="section-subtitle">
            Each theme has its own curated colours, surface tones, and accent
            pairings — not just a hue-rotate.
          </p>
        </div>

        <div className="theme-selector">
          {THEMES.map((theme, idx) => (
            <button
              className={`theme-pill ${activeTheme === idx ? "active" : ""}`}
              key={theme.id}
              onClick={() => setActiveTheme(idx)}
              style={{
                "--pill-accent": theme.accent,
                "--pill-bg": theme.bg,
              } as React.CSSProperties}
              type="button"
            >
              <span className="pill-dot" />
              {theme.name}
            </button>
          ))}
        </div>

        <div className="theme-showcase">
          {THEMES.map((theme, idx) => (
            <div
              className={`theme-slide ${activeTheme === idx ? "active" : ""}`}
              key={theme.id}
            >
              <Image
                alt={`Halo app in ${theme.name} theme — ${theme.description}`}
                className="theme-screenshot"
                height={800}
                src={THEME_IMAGES[theme.id]}
                width={400}
              />
              <div className="theme-info">
                <h3>{theme.name}</h3>
                <p>{theme.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="theme-strip-landing" aria-label="All theme previews">
          {THEMES.map((theme, idx) => (
            <button
              className={`strip-card ${activeTheme === idx ? "active" : ""}`}
              key={theme.id}
              onClick={() => setActiveTheme(idx)}
              style={{ background: theme.bg }}
              type="button"
            >
              <div className="strip-header" style={{ color: theme.id === "midnight" ? "#F8FAFC" : "#111827" }}>
                <strong>{theme.name}</strong>
                <span className="strip-accent" style={{ background: theme.accent }} />
              </div>
              <div
                className="strip-task"
                style={{
                  background: theme.surface,
                  borderColor: theme.accent,
                }}
              >
                <CheckCircle2 size={16} color={theme.accent} />
                <span style={{ color: theme.id === "midnight" ? "#cbd5e1" : "#374151" }}>Finish today cleanly</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ───── DOWNLOAD ───── */}
      <section className="download-section" id="download" aria-label="Download Halo">
        <div className="download-content">
          <div>
            <p className="eyebrow">Zero-cost distribution</p>
            <h2>PWA instantly. APK for Android.</h2>
            <p>
              Install the PWA on any device in one tap, or grab the signed
              Android APK from GitHub Releases. No account, no tracking,
              no strings attached.
            </p>
          </div>
          <div className="download-actions">
            <Link className="landing-primary" href="/">
              <Smartphone size={18} />
              Open Halo PWA
            </Link>
            <a
              className="landing-secondary"
              href="https://github.com/Feroz723/Task/releases/latest/download/app-release.apk"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download size={18} />
              Download APK
            </a>
          </div>
        </div>
        <div className="download-features">
          <div className="dl-feature">
            <Shield size={18} />
            <span>No login required</span>
          </div>
          <div className="dl-feature">
            <WifiOff size={18} />
            <span>Works offline</span>
          </div>
          <div className="dl-feature">
            <Timer size={18} />
            <span>Under 160 KB JS</span>
          </div>
          <div className="dl-feature">
            <Paintbrush size={18} />
            <span>5 premium themes</span>
          </div>
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <h3>Halo</h3>
            <p>
              The task manager that actually feels good to use. Built with love,
              shipped for free.
            </p>
          </div>
          <div className="footer-links">
            <Link href="/">Open App</Link>
            <a href="#features">Features</a>
            <a href="#themes">Themes</a>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <a href="mailto:amf369786@gmail.com">Support</a>
          </div>
          <p className="footer-copy">
            &copy; {new Date().getFullYear()} Halo Task Manager. Free forever.
          </p>
        </div>
      </footer>
    </main>
  );
}
