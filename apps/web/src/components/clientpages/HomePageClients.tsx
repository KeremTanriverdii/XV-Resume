"use client"

import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { gsap } from "gsap";
import { 
  Sparkles, 
  ArrowRight, 
  Search, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Briefcase, 
  Mail, 
  Send, 
  Plus, 
  Minus, 
  HelpCircle,
  FileText,
  AlertCircle,
  Target
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getLandingData } from "./landingData";
import { LandingContent } from "@/types";


export default function HomePageClient() {
  const locale = useLocale();
  const c: LandingContent = getLandingData(locale);

  // States
  const [activeStep, setActiveStep] = useState(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [heroScanState, setHeroScanState] = useState<'idle' | 'scanning' | 'complete'>('idle');
  const [heroMatchScore, setHeroMatchScore] = useState(32);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactSuccess, setContactSuccess] = useState(false);

  // GSAP Refs
  const heroTextRef = useRef<HTMLDivElement>(null);
  const scannerBeamRef = useRef<HTMLDivElement>(null);
  const resumeCardRef = useRef<HTMLDivElement>(null);
  const proofSectionRef = useRef<HTMLDivElement>(null);
  const ctaGlowRef = useRef<HTMLDivElement>(null);

  // Auto step rotation for storytelling timeline
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % c.howItWorks.steps.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [c.howItWorks.steps.length]);

  // Entrance, Scanner & Floating animations
  useEffect(() => {
    // 1. Text slide-in
    gsap.fromTo(
      heroTextRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );

    // 2. Scanner Beam & Resume transition animation
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 3 });
    
    tl.to({}, { duration: 0.5 }) // delay initial start
      .call(() => {
        setHeroScanState('scanning');
      })
      .fromTo(
        scannerBeamRef.current,
        { top: "0%" },
        { top: "100%", duration: 2.2, ease: "power1.inOut" }
      )
      .call(() => {
        setHeroScanState('complete');
        // Animate match score number
        const scoreObj = { val: 32 };
        gsap.to(scoreObj, {
          val: 98,
          duration: 1.2,
          ease: "power2.out",
          onUpdate: () => setHeroMatchScore(Math.floor(scoreObj.val))
        });
      })
      .to({}, { duration: 4.5 }) // Hold complete state
      .call(() => {
        // Reset back to idle
        setHeroScanState('idle');
        setHeroMatchScore(32);
      });

    // 3. Floating background elements
    const floatAnim = gsap.fromTo(
      ".floating-icon",
      { y: 0, rotation: 0 },
      {
        y: -15,
        rotation: 12,
        duration: 4.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: {
          each: 0.3,
          from: "random"
        }
      }
    );
 
    // 4. Extra bottom CTA glow pulse and floating movement animation
    let ctaGlowAnim: gsap.core.Tween | null = null;
    if (ctaGlowRef.current) {
      ctaGlowAnim = gsap.fromTo(
        ctaGlowRef.current,
        {
          xPercent: -65,
          yPercent: -65,
          scale: 0.8,
          opacity: 0.35,
        },
        {
          xPercent: -35,
          yPercent: -35,
          scale: 1.25,
          opacity: 0.75,
          duration: 9,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        }
      );
    }

    return () => {
      tl.kill();
      floatAnim.kill();
      if (ctaGlowAnim) ctaGlowAnim.kill();
    };
  }, []);


  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactForm.name && contactForm.email && contactForm.message) {
      setContactSuccess(true);
      setContactForm({ name: "", email: "", message: "" });
      setTimeout(() => setContactSuccess(false), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300 transition-colors duration-300">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-20 pb-36 md:py-48 border-b border-zinc-200 dark:border-zinc-900 z-0">
          {/* Subtle brand color accents */}
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-amber-500/5 blur-[100px] rounded-full -z-10 pointer-events-none" />

          {/* Animated Background SVGs (Theme Aware & Visible) */}
          <svg className="absolute top-12 left-10 w-24 h-24 text-zinc-400/30 dark:text-zinc-800/60 floating-icon -z-10 pointer-events-none select-none" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 6" fill="none" />
            <path d="M50 20v60M20 50h60" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          <svg className="absolute bottom-12 right-1/3 w-32 h-32 text-zinc-400/30 dark:text-zinc-800/60 floating-icon -z-10 pointer-events-none select-none" viewBox="0 0 100 100">
            <rect x="20" y="20" width="60" height="60" rx="12" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
            <circle cx="50" cy="50" r="8" stroke="currentColor" strokeWidth="1.2" fill="none" />
          </svg>

          <div className="container mx-auto px-4 md:px-8 max-w-7xl">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left Column: Asymmetrical Typography */}
              <div ref={heroTextRef} className="lg:col-span-7 flex flex-col items-start text-left">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-6 tracking-wide uppercase">
                  <Sparkles className="h-3.5 w-3.5" />
                  {c.hero.badge}
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-8 leading-[1.1] text-zinc-950 dark:text-zinc-100">
                  {c.hero.titleStart}
                  <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-500 dark:from-emerald-400 dark:to-emerald-500">
                    {c.hero.titleHighlight}
                    <span className="absolute bottom-1 left-0 w-full h-[3px] bg-emerald-500/30 rounded-full" />
                  </span>
                  {c.hero.titleEnd}
                </h1>

                <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-400 mb-8 max-w-xl leading-relaxed">
                  {c.hero.subtitle}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <Link
                    href="/dashboard"
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold px-8 py-4 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/25 active:scale-95 text-center"
                  >
                    {c.hero.ctaPrimary}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/dashboard/templates"
                    className="inline-flex items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-semibold px-8 py-4 transition-all duration-300 hover:border-zinc-300 dark:hover:border-zinc-700 active:scale-95 text-center"
                  >
                    {c.hero.ctaSecondary}
                  </Link>
                </div>
              </div>

              {/* Right Column: Theme-Aware Storytelling Scanner Card */}
              <div className="lg:col-span-5 relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-amber-500/10 blur-[80px] -z-10 rounded-3xl" />
                
                {/* Visual Frame */}
                <div 
                  ref={resumeCardRef}
                  className="relative rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 md:p-8 overflow-hidden min-h-[380px] flex flex-col justify-between transition-all duration-500 text-zinc-900 dark:text-zinc-100"
                >
                  {/* Scanner Beam */}
                  <div 
                    ref={scannerBeamRef}
                    className={`absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_12px_rgba(16,185,129,0.3)] z-20 pointer-events-none transition-opacity duration-300 ${
                      heroScanState === 'scanning' ? 'opacity-100' : 'opacity-0'
                    }`}
                  />

                  {/* Header info inside card */}
                  <div className="flex justify-between items-center pb-6 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm tracking-wide">{c.proof.jobTitle}</h4>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500">resume_v1.pdf</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-semibold">{c.proof.matchScore}</p>
                      <span className={`text-2xl font-black transition-colors duration-300 ${
                        heroScanState === 'complete' 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : 'text-amber-600 dark:text-amber-500'
                      }`}>
                        %{heroMatchScore}
                      </span>
                    </div>
                  </div>

                  {/* Skills/Keywords Match visualizer */}
                  <div className="py-6 space-y-3.5">
                    {c.proof.skills.map((skill, index) => {
                      const isMatched = skill.status === 'matched' || heroScanState === 'complete';
                      return (
                        <div 
                          key={index}
                          className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-300 ${
                            isMatched 
                              ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-200/50 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400' 
                              : 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-200/50 dark:border-amber-500/20 text-amber-800 dark:text-amber-400'
                          }`}
                        >
                          <span className="text-xs md:text-sm font-medium">{skill.name}</span>
                          <span className="flex items-center">
                            {isMatched ? (
                              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <XCircle className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" />
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Status Indicator Footer */}
                  <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                      {heroScanState === 'idle' && 'Status: Ready to analyze'}
                      {heroScanState === 'scanning' && c.proof.scanActive}
                      {heroScanState === 'complete' && c.proof.scanComplete}
                    </span>
                    <span className="h-2 w-2 rounded-full relative flex">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        heroScanState === 'scanning' ? 'bg-emerald-400' : 'bg-amber-400'
                      }`} />
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${
                        heroScanState === 'scanning' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PURPOSE SECTION (AMACIMIZ) */}
        <section className="relative overflow-hidden py-36 md:py-48 bg-zinc-50/50 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-900 z-0">
          {/* Animated Grid SVG Background (Theme Aware & Visible) */}
          <svg className="absolute inset-0 w-full h-full stroke-zinc-400/40 dark:stroke-zinc-800/80 [mask-image:radial-gradient(100%_100%_at_top_right,dark:white,transparent)] -z-10 pointer-events-none select-none animate-pulse" aria-hidden="true" >
            <defs>
              <pattern id="purpose-grid" width="48" height="48" patternUnits="userSpaceOnUse" x="-1" y="-1">
                <path d="M.5 48V.5H48" fill="none" strokeDasharray="3 3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#purpose-grid)" />
          </svg>
          <svg className="absolute top-20 right-10 w-20 h-20 text-zinc-400/30 dark:text-zinc-800/60 floating-icon -z-10 pointer-events-none select-none" viewBox="0 0 100 100">
            <polygon points="50,15 90,85 10,85" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
          </svg>

          <div className="container mx-auto px-4 md:px-8 max-w-7xl">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Large Statistic Column */}
              <div className="lg:col-span-5 flex flex-col items-start">
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-4">
                  {c.purpose.sectionTitle}
                </span>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-500 to-amber-600 tracking-tighter">
                    {c.purpose.statValue}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-200 mb-4">{c.purpose.statLabel}</h3>
                <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-md">
                  {c.purpose.statDesc}
                </p>
              </div>

              {/* Detail Cards (Asymmetrical) */}
              <div className="lg:col-span-7 grid md:grid-cols-2 gap-6 lg:gap-8">
                {/* Card 1 */}
                <div className="group rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 p-8 hover:border-emerald-500/20 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all duration-300 shadow-sm">
                  <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
                    <Search className="h-6 w-6" />
                  </div>
                  <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">{c.purpose.card1Title}</h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{c.purpose.card1Desc}</p>
                </div>

                {/* Card 2 (Offset/Broken Symmetry) */}
                <div className="group rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/80 p-8 hover:border-amber-500/20 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all duration-300 md:translate-y-6 shadow-sm">
                  <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">{c.purpose.card2Title}</h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{c.purpose.card2Desc}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROOF SECTION */}
        <section ref={proofSectionRef} className="py-36 md:py-48 border-b border-zinc-200 dark:border-zinc-900 relative overflow-hidden z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none -z-10" />

          {/* Floating abstract target circles (Theme Aware & Visible) */}
          <svg className="absolute bottom-10 left-12 w-28 h-28 text-zinc-400/30 dark:text-zinc-800/60 floating-icon -z-10 pointer-events-none select-none" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <circle cx="50" cy="50" r="25" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
            <circle cx="50" cy="50" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
          <svg className="absolute top-12 right-12 w-24 h-24 text-zinc-400/30 dark:text-zinc-800/60 floating-icon -z-10 pointer-events-none select-none" viewBox="0 0 100 100">
            <path d="M20 20h60v60H20z" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
            <path d="M20 20l60 60M80 20L20 80" stroke="currentColor" strokeWidth="1.2" />
          </svg>

          <div className="container mx-auto px-4 md:px-8 max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-zinc-950 dark:text-zinc-100">{c.proof.title}</h2>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto mb-12 text-sm md:text-base leading-relaxed">
              {c.proof.subtitle}
            </p>

            {/* Keyword simulation dashboard representation */}
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/70 p-6 md:p-8 max-w-2xl mx-auto text-left shadow-lg">
              <div className="flex items-center gap-2 mb-6 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                <Briefcase className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Job Description Keyword Matcher</span>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-3.5 uppercase tracking-wide">Required Skills</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800/40 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> React.js & Next.js
                    </li>
                    <li className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800/40 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> TypeScript
                    </li>
                    <li className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800/40 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> State Management (Redux/Zustand)
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-3.5 uppercase tracking-wide ">Your Optimized Keyword Alignment</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Matched: "Expert Next.js integration"
                    </li>
                    <li className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Matched: "TypeScript architecture"
                    </li>
                    <li className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Rephrased: "Zustand state flows"
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* EXTRA SECTION: DETAILED FEATURES */}
        <section className="py-36 md:py-48 border-b border-zinc-200 dark:border-zinc-900 relative">
          <div className="container mx-auto px-4 md:px-8 max-w-7xl">
            <div className="text-center mb-16 md:mb-24">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-zinc-950 dark:text-zinc-100">
                {c.featuresList.title}
              </h2>
              <p className="text-zinc-605 dark:text-zinc-400 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
                {c.featuresList.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {c.featuresList.items.map((item, index) => (
                <div 
                  key={index}
                  className="p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/5 dark:hover:shadow-none transition-all duration-300"
                >
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
                    {item.icon === "target" && <Target className="h-6 w-6" />}
                    {item.icon === "fileText" && <FileText className="h-6 w-6" />}
                    {item.icon === "shieldCheck" && <ShieldCheck className="h-6 w-6" />}
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">{item.title}</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS TIMELINE SECTION */}
        <section className="py-36 md:py-48 bg-zinc-50/30 dark:bg-zinc-900/20 border-b border-zinc-200 dark:border-zinc-900">
          <div className="container mx-auto px-4 md:px-8 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-zinc-950 dark:text-zinc-100">{c.howItWorks.title}</h2>
              <p className="text-zinc-655 dark:text-zinc-400 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
                {c.howItWorks.subtitle}
              </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
              {/* Steps Navigation list */}
              <div className="lg:col-span-6 space-y-6">
                {c.howItWorks.steps.map((step, index) => {
                  const isActive = activeStep === index;
                  return (
                    <button
                      key={index}
                      onClick={() => setActiveStep(index)}
                      className={`w-full text-left p-6 md:p-8 rounded-2xl border transition-all duration-300 flex gap-6 items-start ${
                        isActive 
                          ? 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700/80 shadow-md dark:shadow-lg dark:shadow-zinc-950/40' 
                          : 'bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-100 dark:border-zinc-900/60 opacity-60 hover:opacity-90 hover:border-zinc-200 dark:hover:border-zinc-800'
                      }`}
                    >
                      <span className={`text-xl font-black ${isActive ? 'text-emerald-500' : 'text-zinc-400 dark:text-zinc-500'}`}>
                        {step.num}
                      </span>
                      <div className="space-y-2">
                        <h4 className={`font-bold text-base md:text-lg transition-colors ${isActive ? 'text-zinc-950 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'}`}>
                          {step.title}
                        </h4>
                        {isActive && (
                          <p className="text-xs md:text-sm text-zinc-655 dark:text-zinc-400 leading-relaxed animate-fadeIn">
                            {step.desc}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Step Visualization */}
              <div className="lg:col-span-6 flex justify-center">
                <div className="relative w-full max-w-[450px] aspect-[4/3] rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 flex flex-col items-center justify-center p-8 overflow-hidden shadow-lg dark:shadow-2xl">
                  {/* Decorative background grid */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 dark:opacity-10" />

                  {/* Active Visual Panel */}
                  <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-xs transition-all duration-500 transform scale-100">
                    <div className="h-16 w-16 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                      {activeStep === 0 && <FileText className="h-8 w-8" />}
                      {activeStep === 1 && <Search className="h-8 w-8 text-amber-500" />}
                      {activeStep === 2 && <ShieldCheck className="h-8 w-8 text-emerald-500" />}
                    </div>
                    <span className="text-xs uppercase tracking-widest text-zinc-500 font-bold">
                      {c.howItWorks.steps[activeStep].visualLabel}
                    </span>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-950 rounded-full h-1.5 overflow-hidden border border-zinc-200 dark:border-zinc-800">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${(activeStep + 1) * 33.3}%` }} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* EXTRA SECTION: TESTIMONIALS */}
        <section className="py-36 md:py-48 border-b border-zinc-200 dark:border-zinc-900 relative">
          <div className="container mx-auto px-4 md:px-8 max-w-7xl">
            <div className="text-center mb-16 md:mb-24">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-zinc-950 dark:text-zinc-100">
                {c.testimonials.title}
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
                {c.testimonials.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {c.testimonials.items.map((item, index) => (
                <div 
                  key={index}
                  className="p-8 md:p-10 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col justify-between"
                >
                  <p className="text-zinc-700 dark:text-zinc-300 italic leading-relaxed text-sm md:text-base mb-8">
                    "{item.quote}"
                  </p>
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm md:text-base">{item.author}</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                      {item.role} @ <span className="font-semibold text-emerald-600 dark:text-emerald-400">{item.company}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ SECTION (SSS) */}
        <section className="py-36 md:py-48 border-b border-zinc-200 dark:border-zinc-900">
          <div className="container mx-auto px-4 md:px-8 max-w-4xl">
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-4">
                <HelpCircle className="h-3.5 w-3.5" />
                FAQ
              </span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-zinc-950 dark:text-zinc-100">{c.faq.title}</h2>
              <p className="text-zinc-655 dark:text-zinc-400 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
                {c.faq.subtitle}
              </p>
            </div>

            <div className="space-y-4 max-w-3xl mx-auto">
              {c.faq.items.map((item, index) => {
                const isOpen = activeFaq === index;
                return (
                  <div 
                    key={index} 
                    className="group rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700/80 transition-all duration-300 overflow-hidden shadow-sm"
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : index)}
                      className="w-full px-6 py-5 md:py-6 flex justify-between items-center text-left text-zinc-800 dark:text-zinc-200 hover:text-zinc-955 dark:hover:text-zinc-100 font-bold text-sm md:text-base"
                    >
                      <span>{item.question}</span>
                      <span className="p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/50 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-850 transition-colors ml-4 flex-shrink-0">
                        {isOpen ? <Minus className="h-4 w-4 text-emerald-500" /> : <Plus className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />}
                      </span>
                    </button>

                    {/* Smooth grid transition for accordion heights */}
                    <div 
                      className={`grid transition-all duration-300 ease-in-out ${
                        isOpen ? 'grid-rows-[1fr] opacity-100 pb-5 md:pb-6' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                      }`}
                    >
                      <div className="overflow-hidden px-6">
                        <p className="text-xs md:text-sm text-zinc-655 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-850/60 pt-4">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* EXTRA BOTTOM CTA BANNER */}
        <section className="py-24 relative overflow-hidden bg-zinc-950 text-white border-b border-zinc-900">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-emerald-500/5 via-zinc-950 to-zinc-950 -z-10" />
          {/* Animated pulsing & moving background light glow */}
          <div 
            ref={ctaGlowRef} 
            className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-500/8 to-amber-500/4 blur-[120px] rounded-full pointer-events-none -z-10"
          />

          <div className="container mx-auto px-4 md:px-8 max-w-5xl text-center">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">
              {c.ctaBanner.title}
            </h2>
            <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto mb-10 leading-relaxed">
              {c.ctaBanner.desc}
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold px-8 py-4 shadow-lg shadow-emerald-500/10 transition-all duration-300 hover:scale-105 active:scale-95 text-center text-sm"
            >
              {c.ctaBanner.button}
              <ArrowRight className="h-4.5 w-4.5" />
            </Link>
          </div>
        </section>

        {/* CONTACT SECTION (İLETİŞİM) */}
        <section className="py-36 md:py-48 relative">
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

          <div className="container mx-auto px-4 md:px-8 max-w-7xl">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start max-w-6xl mx-auto">
              
              {/* Left Side: Contact Information */}
              <div className="lg:col-span-5 space-y-6">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                  CONTACT US
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-100">
                  {c.contact.title}
                </h2>
                <p className="text-zinc-655 dark:text-zinc-400 leading-relaxed text-sm md:text-base max-w-md">
                  {c.contact.subtitle}
                </p>

                <div className="pt-8 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-200 text-sm">{c.contact.infoTitle}</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{c.contact.infoDesc}</p>
                      <a href={`mailto:${c.contact.emailLabel}`} className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 transition-colors mt-2 inline-block">
                        {c.contact.emailLabel}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Form */}
              <div className="lg:col-span-7 w-full">
                <form 
                  onSubmit={handleContactSubmit}
                  className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 md:p-8 space-y-6 shadow-lg dark:shadow-xl"
                >
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="formName" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{c.contact.formName}</label>
                      <input 
                        id="formName" 
                        type="text" 
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/10 text-zinc-900 dark:text-zinc-200 outline-none text-sm transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="formEmail" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{c.contact.formEmail}</label>
                      <input 
                        id="formEmail" 
                        type="email" 
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/10 text-zinc-900 dark:text-zinc-200 outline-none text-sm transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="formMessage" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{c.contact.formMessage}</label>
                    <textarea 
                      id="formMessage" 
                      rows={5}
                      required
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/10 text-zinc-900 dark:text-zinc-200 outline-none text-sm resize-none transition-all"
                      placeholder="Message..."
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold px-6 py-3.5 transition-all duration-300 active:scale-98 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 cursor-pointer"
                  >
                    <span>{c.contact.formSubmit}</span>
                    <Send className="h-4 w-4" />
                  </button>

                  {contactSuccess && (
                    <div className="flex items-center gap-2 text-xs font-medium text-emerald-650 dark:text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 p-3.5 rounded-xl animate-fadeIn">
                      <AlertCircle className="h-4.5 w-4.5" />
                      <span>{c.contact.formSuccess}</span>
                    </div>
                  )}
                </form>
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}