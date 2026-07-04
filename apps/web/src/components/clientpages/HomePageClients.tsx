"use client"

import { useAuth } from "@/providers/AuthProvider";
import { fetchProfile } from "@/services/profileService";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl"

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Link } from "@/i18n/routing";

export default function HomePageClient()
{
    const t = useTranslations("Landing");


    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
          {/* Söktüğümüz Navbar'ı buraya koyduk */}
          <Navbar />

          <main className="flex-1">
            {/* Hero Section */}
            <section className="relative overflow-hidden py-24 lg:py-36 flex flex-col items-center text-center">
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/15 via-background to-background"></div>

              <div className="container px-4 md:px-6 max-w-5xl z-10">
                <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 mb-8 backdrop-blur-sm">
                  <span className="mr-2">✨</span> Vercel AI SDK Powered
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
                  {t('heroTitlePrefix')}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-primary to-cyan-500">
                    {t('heroTitleHighlight')}
                  </span>
                  {t('heroTitleSuffix')}
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
                  {t('heroSubtitle')}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link
                    href="/dashboard"
                    className="rounded-full bg-primary px-8 py-4 text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-1 hover:scale-105 active:scale-95"
                  >
                    {t('ctaCreate')}
                  </Link>
                  <Link
                    href="/dashboard/templates"
                    className="rounded-full border border-input bg-background hover:bg-accent hover:text-accent-foreground px-8 py-4 font-semibold shadow-sm transition-all hover:-translate-y-1 hover:scale-105 active:scale-95"
                  >
                    {t('ctaSecondary')}
                  </Link>
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-muted/30 border-t border-border/40">
              <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{t('featuresTitle')}</h2>
                  <div className="w-20 h-1.5 bg-primary mx-auto rounded-full opacity-80"></div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  {/* Feature 1 */}
                  <div className="group relative overflow-hidden rounded-3xl bg-background p-8 shadow-sm border border-border/50 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
                    <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 transition-transform group-hover:scale-110 duration-300">
                      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold mb-3">{t('feature1Title')}</h3>
                    <p className="text-muted-foreground leading-relaxed">{t('feature1Desc')}</p>
                  </div>

                  {/* Feature 2 */}
                  <div className="group relative overflow-hidden rounded-3xl bg-background p-8 shadow-sm border border-border/50 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
                    <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 transition-transform group-hover:scale-110 duration-300">
                      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold mb-3">{t('feature2Title')}</h3>
                    <p className="text-muted-foreground leading-relaxed">{t('feature2Desc')}</p>
                  </div>

                  {/* Feature 3 */}
                  <div className="group relative overflow-hidden rounded-3xl bg-background p-8 shadow-sm border border-border/50 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300">
                    <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 transition-transform group-hover:scale-110 duration-300">
                      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold mb-3">{t('feature3Title')}</h3>
                    <p className="text-muted-foreground leading-relaxed">{t('feature3Desc')}</p>
                  </div>
                </div>
              </div>
            </section>
          </main>

          {/* Söktüğümüz Footer'ı buraya koyduk */}
          <Footer />
        </div>
    )
}