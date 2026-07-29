'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function LandingPage() {
  useEffect(() => {

    // Reveal on scroll
    const reveals = document.querySelectorAll('.reveal');
    const textReveals = document.querySelectorAll(
      'main section :is(h1, h2, h3, h4, p, li), footer :is(h2, h3, h4, p, li)'
    );
    const animatedElements = [...new Set([...reveals, ...textReveals])] as HTMLElement[];

    animatedElements.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(18px)';
      el.style.transition = 'opacity 900ms ease-out, transform 900ms ease-out';
      el.style.willChange = 'opacity, transform';
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = animatedElements.indexOf(entry.target as HTMLElement);
            (entry.target as HTMLElement).style.transitionDelay = `${Math.min(index % 5, 4) * 75}ms`;
            (entry.target as HTMLElement).style.opacity = '1';
            (entry.target as HTMLElement).style.transform = 'translateY(0)';
            (entry.target as HTMLElement).style.willChange = 'auto';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    animatedElements.forEach((el) => observer.observe(el));

    // Hero 3D float animation
    const heroObject = document.getElementById('heroObject') as HTMLElement | null;
    const floatingPanels = document.querySelectorAll('.floating-panel');

    let pointerX = 0;
    let pointerY = 0;
    let scrollYVal = 0;
    let rafId: number;

    function animateHero() {
      const time = Date.now() * 0.00035;
      const float = Math.sin(time) * 10;
      const rotateX = pointerY * -4;
      const rotateY = pointerX * 5;
      const scrollFloat = Math.min(scrollYVal * 0.04, 34);

      if (heroObject) {
        heroObject.style.transform = `translateY(${float - scrollFloat}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      }

      floatingPanels.forEach((panel) => {
        (panel as HTMLElement).style.boxShadow = `0 28px 90px rgba(0, 0, 0, 0.48), 0 0 42px rgba(165, 243, 252, ${0.025 + Math.abs(Math.sin(time)) * 0.025})`;
      });

      rafId = requestAnimationFrame(animateHero);
    }

    const onMouseMove = (event: MouseEvent) => {
      pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
      pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    const onScroll = () => {
      scrollYVal = window.scrollY;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('scroll', onScroll);
    animateHero();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* Iconify */}
      <Script src="https://code.iconify.design/iconify-icon/2.1.0/iconify-icon.min.js" strategy="afterInteractive" />

      <div
        className="min-h-screen overflow-x-hidden antialiased text-slate-100 font-sans"
        style={{
          background: '#080c14',
          fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          colorScheme: 'dark',
        }}
      >
        {/* Background */}
        <div
          className="pointer-events-none fixed inset-0 -z-50"
          style={{ background: "radial-gradient(circle at 50% -10%, rgba(88, 166, 255, 0.16), transparent 36%), radial-gradient(circle at 82% 18%, rgba(103, 232, 249, 0.08), transparent 28%), linear-gradient(180deg, #0b1020 0%, #080c14 42%, #0a0d13 100%)" }}
        />
        <div
          className="pointer-events-none fixed inset-0 -z-40 opacity-[0.035]"
          style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.75%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}
        />

        <div className="mx-auto min-h-screen w-full max-w-[1360px] border-x border-white/[0.06]">
          {/* Grid lines */}
          <div className="pointer-events-none fixed left-1/2 top-0 -z-30 hidden h-full w-full max-w-[1360px] -translate-x-1/2 grid-cols-4 md:grid">
            <div className="border-r border-white/[0.045]" />
            <div className="border-r border-white/[0.045]" />
            <div className="border-r border-white/[0.045]" />
            <div />
          </div>

          {/* Header */}
          <header className="sticky border-white/[0.06] z-50 bg-[#080c14]/70 border-b top-0 backdrop-blur-2xl" style={{ animation: 'animationIn 0.8s ease-out 0.1s both' }}>
            <nav className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between px-5 sm:px-8 lg:px-10">
              <a href="#" className="group flex items-center gap-3">
                <span className="text-base font-semibold text-white tracking-[-0.035em] font-geist">ATAABA Pilot</span>
              </a>

              <div className="hidden items-center gap-8 md:flex">
                {['#problem', '#how', '#reviews', '#pricing'].map((href, i) => {
                  const labels = ['Le problème', 'Comment ça marche', 'Avis', 'Tarifs'];
                  return (
                    <a key={href} href={href} className="relative text-sm text-slate-400 transition duration-300 ease-out hover:text-white font-geist">
                      {labels[i]}
                      <span className="absolute -bottom-2 left-0 h-px w-0 bg-cyan-200/70 transition-all duration-300 ease-out hover:w-full" />
                    </a>
                  );
                })}
              </div>

              <a href="/auth/login" className="hidden rounded-full border border-cyan-200/20 bg-cyan-100 px-4 py-2 text-sm font-medium text-slate-950 shadow-lg shadow-cyan-950/20 transition duration-300 ease-out hover:scale-[1.03] hover:border-cyan-200/35 hover:bg-cyan-50 hover:shadow-cyan-900/25 sm:inline-flex font-geist">
                Commencer
              </a>

              <button aria-label="Open menu" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 md:hidden">
                {/* hamburger */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
            </nav>
          </header>

          <main>
            {/* ───── HERO ───── */}
            <section className="overflow-hidden sm:px-8 sm:pb-28 sm:pt-28 lg:px-10 lg:pt-24 lg:pb-24 pt-20 pr-5 pb-24 pl-5 relative" id="blueprint">
              <canvas id="webgl-canvas" className="absolute inset-0 z-0 pointer-events-none opacity-60 mix-blend-screen w-full h-full" />
              <div className="pointer-events-none absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-200/10 blur-3xl" />
              <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12 w-full max-w-[1280px] mr-auto ml-auto gap-x-14 gap-y-14 items-center">

                {/* Left */}
                <div className="reveal z-10 relative" style={{ transition: 'opacity 900ms ease-out, transform 900ms ease-out' }}>
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300 shadow-2xl shadow-black/20 backdrop-blur-xl font-geist">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-200 shadow-lg shadow-cyan-200/40" />
                    Pilotage des plans d&apos;action pour les équipes qui veulent de la clarté
                  </div>

                  <h1 className="sm:text-6xl lg:text-7xl text-5xl font-medium text-white tracking-tighter font-jakarta max-w-4xl">
                    Gérez vos plans d&apos;action sans vous perdre dans la complexité.
                  </h1>

                  <p className="mt-7 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg font-geist">
                    ATAABA Pilot aide les équipes, directions et responsables à organiser les activités, suivre les échéances et garder tout le travail dans un espace de travail clair — sans configuration complexe ni courbe d&apos;apprentissage.
                  </p>

                  <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                    <a href="/auth/login" className="group inline-flex items-center justify-center gap-2 shadow-cyan-950/30 transition duration-300 ease-out hover:scale-[1.03] hover:bg-cyan-50 hover:shadow-cyan-300/10 text-sm font-semibold text-slate-950 bg-cyan-100 rounded-full pt-3 pr-5 pb-3 pl-5 shadow-2xl font-geist">
                      Commencer
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition duration-300 ease-out group-hover:translate-x-0.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </a>
                    <a href="#how" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] px-5 py-3 text-sm font-medium text-slate-200 shadow-2xl shadow-black/20 backdrop-blur-xl transition duration-300 ease-out hover:scale-[1.02] hover:border-white/[0.18] hover:bg-white/[0.07] font-geist">
                      Voir comment ça marche
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                    </a>
                  </div>
                </div>

                {/* Right — Dashboard Visual */}
                <div
                  className="reveal transition-all duration-700 ease-out lg:h-[43rem] group w-full h-[34rem] max-w-[42rem] mr-auto ml-auto relative"
                  style={{ perspective: '1200px' }}
                  id="heroObject"
                >
                  <div aria-hidden="true" className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/[0.08] blur-[100px] transition-all duration-500 group-hover:bg-cyan-400/[0.12]" />
                  <div aria-hidden="true" className="absolute left-[62%] top-[22%] h-44 w-44 -translate-x-1/2 rounded-full bg-emerald-400/[0.06] blur-[80px]" />
                  <div aria-hidden="true" className="absolute left-1/2 top-[68%] h-48 w-[88%] -translate-x-1/2 rounded-full bg-black/60 blur-3xl" />
                  <div aria-hidden="true" className="absolute left-1/2 top-[69%] h-28 w-[78%] -translate-x-1/2 rounded-full bg-cyan-950/30 blur-2xl transition-all duration-700 group-hover:w-[82%]" />

                  <div className="absolute left-1/2 top-1/2 w-[98%] -translate-x-1/2 -translate-y-1/2 transition-transform duration-700 ease-out" style={{ transformStyle: 'preserve-3d' }}>
                    <div className="animate-float-3d floating-panel rounded-[2rem] border border-white/[0.15] bg-slate-950/70 p-3 backdrop-blur-3xl transition duration-500 ease-out hover:border-cyan-200/30" style={{ boxShadow: 'rgba(0,0,0,0.48) 0px 28px 90px, rgba(165,243,252,0.027) 0px 0px 42px' }}>
                      <div className="overflow-hidden rounded-[1.55rem] border border-white/[0.08] bg-[#0b1220]/95">
                        {/* Dashboard header */}
                        <div className="flex items-center justify-between border-b border-white/[0.07] bg-white/[0.02] px-5 py-4">
                          <div>
                            <p className="text-xs text-slate-400 font-geist">Espace ATAABA Pilot</p>
                            <p className="mt-0.5 text-sm font-medium text-slate-100 font-geist">Tableau de bord des plans</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="hidden items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300 sm:flex transition-colors hover:bg-white/[0.08] font-geist">
                              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                              En direct
                            </div>
                            <div className="flex -space-x-2">
                              <span className="h-7 w-7 rounded-full border-2 border-[#0b1220] bg-cyan-200 shadow-sm" />
                              <span className="h-7 w-7 rounded-full border-2 border-[#0b1220] bg-slate-300 shadow-sm" />
                              <span className="h-7 w-7 rounded-full border-2 border-[#0b1220] bg-emerald-300 shadow-sm" />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-[0.28fr_1fr]">
                          {/* Sidebar */}
                          <aside className="hidden border-r border-white/[0.07] bg-white/[0.01] p-4 sm:block">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 rounded-xl bg-cyan-400/[0.1] px-3 py-2.5 text-xs font-medium text-cyan-200 cursor-pointer font-geist">
                                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.8)]" />
                                Vue d&apos;ensemble
                              </div>
                              {['Activités', 'Calendrier', 'Rapports'].map(l => (
                                <div key={l} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs text-slate-400 cursor-pointer transition-colors hover:bg-white/[0.05] hover:text-slate-200 font-geist">
                                  <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                                  {l}
                                </div>
                              ))}
                            </div>

                            <div className="mt-8 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 backdrop-blur-sm">
                              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500 font-semibold font-geist">Avancement</p>
                              <div className="mt-4 space-y-3">
                                <div className="group/progress">
                                  <div className="mb-1.5 flex justify-between text-[10px] text-slate-400">
                                    <span className="font-geist">Axe 1</span>
                                    <span className="text-cyan-200 font-geist">68%</span>
                                  </div>
                                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                                    <div className="h-full w-2/3 rounded-full bg-cyan-300/70" />
                                  </div>
                                </div>
                                <div className="group/progress">
                                  <div className="mb-1.5 flex justify-between text-[10px] text-slate-400">
                                    <span className="font-geist">Axe 2</span>
                                    <span className="text-emerald-200 font-geist">82%</span>
                                  </div>
                                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                                    <div className="h-full w-5/6 rounded-full bg-emerald-300/60" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </aside>

                          {/* Main */}
                          <main className="p-5">
                            <div className="grid gap-3 sm:grid-cols-3">
                              <div className="rounded-2xl border border-cyan-200/20 bg-cyan-400/[0.05] p-4">
                                <p className="text-[10px] uppercase tracking-[0.16em] text-cyan-200/80 font-semibold font-geist">Activités</p>
                                <p className="mt-2 text-2xl text-white tracking-tighter font-jakarta font-medium">24</p>
                                <p className="mt-1 text-xs text-slate-400 font-geist">6 en retard</p>
                              </div>
                              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                                <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500 font-semibold font-geist">Terminées</p>
                                <p className="mt-2 text-2xl text-white tracking-tighter font-jakarta font-medium">38</p>
                                <p className="mt-1 text-xs text-emerald-300/80 font-geist">+12 cette semaine</p>
                              </div>
                              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                                <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500 font-semibold font-geist">Taux</p>
                                <p className="mt-2 text-2xl text-white tracking-tighter font-jakarta font-medium">74%</p>
                                <p className="mt-1 text-xs text-cyan-200/80 font-geist">Dans les temps</p>
                              </div>
                            </div>

                            <div className="mt-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
                              <div className="mb-4 flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-medium text-white font-geist">Priorités du jour</p>
                                  <p className="mt-1 text-[11px] text-slate-400 font-geist">Activités nécessitant attention</p>
                                </div>
                                <span className="rounded-full bg-white/[0.08] px-2.5 py-1 text-[10px] text-slate-300 font-medium font-geist">4 activités</span>
                              </div>
                              <div className="space-y-2.5">
                                {[
                                  { title: 'Finaliser le rapport trimestriel', sub: 'Direction · Aujourd\'hui', badge: 'Haute', badgeColor: 'bg-cyan-400/[0.15] text-cyan-200' },
                                  { title: 'Mise à jour des indicateurs', sub: 'Suivi · Demain', badge: 'Normale', badgeColor: 'bg-white/[0.08] text-slate-300' },
                                ].map(t => (
                                  <div key={t.title} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                                    <div className="flex items-center justify-between gap-3">
                                      <div>
                                        <p className="text-xs font-medium text-white font-geist">{t.title}</p>
                                        <p className="mt-1 text-[10px] text-slate-500 font-geist">{t.sub}</p>
                                      </div>
                                      <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${t.badgeColor} font-geist`}>{t.badge}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </main>
                        </div>
                      </div>
                    </div>

                    {/* Floating card top-right */}
                    <div className="animate-float-3d absolute right-[2%] top-[10%] hidden w-44 rounded-2xl border border-cyan-200/20 bg-[#0b1220]/80 p-4 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-xl sm:block transition-transform hover:-translate-y-2" style={{ animationDelay: '-1s' }}>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-cyan-200/80 font-geist">Focus</p>
                        <span className="h-2 w-2 rounded-full bg-cyan-300 animate-pulse" style={{ boxShadow: '0 0 12px rgba(103,232,249,0.8)' }} />
                      </div>
                      <p className="mt-3 text-2xl tracking-tighter text-white font-jakarta font-medium">92%</p>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                        <div className="h-full w-11/12 rounded-full bg-cyan-300/80" />
                      </div>
                    </div>

                    {/* Floating card bottom-left */}
                    <div className="animate-float-3d absolute left-[-2%] bottom-[10%] hidden w-52 rounded-2xl border border-emerald-300/20 bg-[#0b1220]/80 p-4 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-xl md:block" style={{ animationDelay: '-3s' }}>
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-300/20 bg-emerald-400/[0.1] text-emerald-300" style={{ boxShadow: '0 0 15px rgba(52,211,153,0.15)' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                        </span>
                        <div>
                          <p className="text-xs font-medium text-white font-geist">Plan validé</p>
                          <p className="mt-0.5 text-[10px] text-slate-400 font-geist">3 activités complétées</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ───── PRODUCT PREVIEW ───── */}
            <section className="border-white/[0.06] sm:px-8 lg:px-10 border-t pt-24 pr-5 pb-24 pl-5" id="problem">
              <div className="w-full max-w-[1280px] mr-auto ml-auto">
                <div className="reveal grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-end w-full max-w-[1280px] gap-x-8 gap-y-8">
                  <div className="max-w-3xl">
                    <p className="text-sm font-medium text-cyan-100 font-geist">01 · Aperçu produit</p>
                    <h2 className="mt-4 text-4xl text-white sm:text-5xl lg:text-6xl tracking-tighter leading-[0.95] font-jakarta font-medium">
                      Visualisez chaque plan, activité et échéance dans un espace de travail clair.
                    </h2>
                  </div>
                  <div className="lg:ml-auto lg:max-w-md">
                    <p className="text-base leading-7 text-slate-400 font-geist">
                      Découvrez comment ATAABA Pilot regroupe priorités, responsables, délais et avancement pour que votre équipe comprenne l&apos;état d&apos;avancement en un coup d&apos;œil et fasse avancer le travail avec confiance.
                    </p>
                    <div className="mt-7 flex flex-wrap gap-3">
                      <a href="/auth/login" className="inline-flex items-center justify-center transition hover:bg-cyan-50 text-sm font-medium text-slate-950 font-geist bg-cyan-100 h-11 rounded-full px-5 shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_18px_50px_rgba(0,0,0,0.35)]">Voir le produit</a>
                      <a href="#how" className="inline-flex h-11 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.04] px-5 text-sm font-medium text-white backdrop-blur-xl transition hover:bg-white/[0.08] font-geist">En savoir plus</a>
                    </div>
                  </div>
                </div>

                {/* Full dashboard screenshot mockup */}
                <div className="w-full h-auto pt-12 pb-12 relative" style={{ perspective: '90rem' }}>
                  <div className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/10 blur-3xl" />
                  <div className="absolute bottom-10 left-1/2 h-40 w-[84%] -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />
                  <div className="relative origin-center rounded-[2rem] border border-cyan-100/20 bg-slate-950/65 p-3 shadow-2xl shadow-black/60 backdrop-blur-2xl transition duration-500 hover:border-cyan-200/30" style={{ boxShadow: 'rgba(0,0,0,0.55) 0 2rem 6rem, rgba(34,211,238,0.12) 0 0 4rem' }}>
                    <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#08111f]/95">
                      <div className="grid grid-cols-1 sm:grid-cols-[0.23fr_1fr]">
                        <aside className="hidden border-r border-white/10 bg-white/[0.025] p-4 sm:block">
                          <div className="mb-6 flex items-center gap-2">
                            <span className="text-sm font-medium text-white font-geist">ATAABA Pilot</span>
                          </div>
                          <div className="space-y-2">
                            {[
                              { icon: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z', label: 'Vue d\'ensemble', active: true },
                              { icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11', label: 'Mes activités', active: false },
                              { icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', label: 'Notifications', active: false },
                              { icon: 'M8 2v4M16 2v4M3 10h18M3 6a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6z', label: 'Calendrier', active: false },
                              { icon: 'M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4Z', label: 'Rapports', active: false },
                            ].map(item => (
                              <div key={item.label} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-geist ${item.active ? 'bg-cyan-300/10 text-cyan-100' : 'text-slate-400'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d={item.icon} />
                                </svg>
                                {item.label}
                              </div>
                            ))}
                          </div>
                        </aside>

                        <div className="overflow-hidden p-5">
                          <div className="mb-5 flex items-start justify-between gap-5">
                            <div>
                              <h2 className="text-xl text-white tracking-tighter font-jakarta font-medium">Bienvenue 👋</h2>
                              <p className="mt-1 text-xs text-slate-500 font-geist">Voici l&apos;état de vos projets aujourd&apos;hui.</p>
                            </div>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-4">
                            {[
                              { label: 'Total activités', val: '128', sub: '+12% vs semaine dernière', subColor: 'text-emerald-300' },
                              { label: 'En cours', val: '42', sub: '+8% vs semaine dernière', subColor: 'text-emerald-300', labelColor: 'text-blue-300' },
                              { label: 'Terminées', val: '86', sub: '+18% vs semaine dernière', subColor: 'text-emerald-300' },
                              { label: 'En retard', val: '7', sub: '-5% vs semaine dernière', subColor: 'text-rose-300', labelColor: 'text-rose-300' },
                            ].map(s => (
                              <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                                <p className={`text-xs font-medium uppercase tracking-[0.14rem] font-geist ${s.labelColor ?? 'text-slate-500'}`}>{s.label}</p>
                                <p className="mt-2 text-2xl text-white tracking-tighter font-jakarta font-medium">{s.val}</p>
                                <p className={`mt-1 text-xs font-geist ${s.subColor}`}>{s.sub}</p>
                              </div>
                            ))}
                          </div>

                          <div className="mt-3 grid gap-3 sm:grid-cols-4">
                            {[
                              { label: 'À faire', count: '24', color: '' },
                              { label: 'En cours', count: '8', color: 'border-cyan-300/15 bg-cyan-300/[0.04]', labelColor: 'text-cyan-100' },
                              { label: 'En révision', count: '5', color: '' },
                              { label: 'Terminé', count: '18', color: '' },
                            ].map(col => (
                              <div key={col.label} className={`rounded-2xl border border-white/10 bg-white/[0.035] p-3 ${col.color}`}>
                                <div className="mb-3 flex items-center justify-between">
                                  <p className={`text-xs font-medium font-geist ${col.labelColor ?? 'text-white'}`}>{col.label}</p>
                                  <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-400 font-geist">{col.count}</span>
                                </div>
                                <div className="space-y-2">
                                  <div className="rounded-xl bg-white/[0.05] p-3"><div className="h-1.5 w-full rounded-full bg-slate-700" /></div>
                                  <div className="rounded-xl bg-white/[0.04] p-3"><div className="h-1.5 w-2/3 rounded-full bg-slate-700" /></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ───── THE PROBLEM ───── */}
            <section className="overflow-hidden border-white/[0.06] sm:px-8 lg:px-10 border-t pt-24 pr-5 pb-24 pl-5 relative" id="problem">
              <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: 'radial-gradient(circle at 50% 12%, rgba(56,189,248,0.1), transparent 34%), linear-gradient(180deg, rgba(8,12,20,0.16), rgba(8,12,20,0.56))' }} />
              <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: 'linear-gradient(to right, rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)', backgroundSize: '30rem 30rem' }} />

              <div className="w-full max-w-[1280px] mr-auto ml-auto">
                <div className="reveal grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-end w-full max-w-[1280px] gap-x-8 gap-y-8">
                  <div className="max-w-4xl">
                    <p className="text-base font-medium text-cyan-200 font-geist">02 · Le problème</p>
                    <h2 className="mt-5 text-5xl text-white sm:text-6xl tracking-tighter leading-tight font-jakarta font-medium">
                      La plupart des outils rendent le travail simple inutilement lourd.
                    </h2>
                  </div>
                  <div className="lg:ml-auto lg:max-w-md">
                    <p className="text-lg leading-8 text-slate-400 font-geist">
                      Les équipes n&apos;ont pas besoin d&apos;une configuration sans fin, de tableaux surchargés ni d&apos;une semaine d&apos;intégration. Elles ont besoin d&apos;un endroit clair pour voir ce qui compte et faire avancer le travail.
                    </p>
                    <div className="mt-7 flex flex-wrap gap-3">
                      <a href="/auth/login" className="inline-flex h-11 items-center justify-center rounded-full bg-cyan-100 px-5 text-sm font-medium text-slate-950 transition hover:bg-cyan-50 font-geist">Voir la solution</a>
                      <a href="#how" className="inline-flex h-11 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.04] px-5 text-sm font-medium text-white backdrop-blur-xl transition hover:bg-white/[0.08] font-geist">En savoir plus</a>
                    </div>
                  </div>
                </div>

                {/* Problem cards */}
                <div className="grid gap-6 lg:grid-cols-3 mt-12">
                  {[
                    { title: 'Trop de fonctionnalités', desc: 'Les outils complexes noient les tâches simples sous des vues, paramètres et workflows que personne n\'a demandés.', gradFrom: 'from-blue-500/[0.10]' },
                    { title: 'Difficile à prendre en main', desc: 'Les nouveaux collaborateurs devraient comprendre l\'espace de travail immédiatement, sans attendre une formation.', gradFrom: 'from-cyan-500/[0.10]' },
                    { title: 'Le travail est éparpillé', desc: 'Les tâches, échéances, mises à jour et décisions se dispersent sur trop d\'onglets et de conversations.', gradFrom: 'from-indigo-500/[0.10]' },
                  ].map(card => (
                    <article key={card.title} className="group reveal relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.035] p-8 shadow-2xl shadow-black/50 backdrop-blur-xl transition duration-300 ease-out hover:-translate-y-1 hover:border-blue-400/30">
                      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.gradFrom} via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100`} />
                      <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/40 to-transparent" />
                      <div className="relative z-10 h-48 overflow-hidden rounded-2xl border border-cyan-100/10 bg-[#071323]/90 p-4">
                        <div className="absolute left-1/2 top-1/2 h-32 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
                        <div className="relative h-full flex items-center justify-center">
                          <div className="w-full space-y-2">
                            {[1,2,3].map(i => (
                              <div key={i} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#0b1626] p-2.5">
                                <span className={`h-2 w-2 rounded-full ${i === 1 ? 'bg-cyan-400' : i === 2 ? 'bg-amber-400' : 'bg-slate-500'}`} />
                                <div className={`h-1.5 rounded-full bg-slate-700 ${i === 1 ? 'w-2/3' : i === 2 ? 'w-1/2' : 'w-3/4'}`} />
                                <span className={`ml-auto rounded px-1.5 py-0.5 text-[8px] font-medium font-geist ${i === 1 ? 'bg-rose-500/20 text-rose-300' : i === 2 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                                  {i === 1 ? 'Haute' : i === 2 ? 'Normale' : 'Basse'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <h3 className="relative z-10 mt-8 text-2xl text-white tracking-tight font-jakarta font-medium">{card.title}</h3>
                      <p className="relative z-10 mt-4 text-sm sm:text-base leading-relaxed text-slate-400 font-geist">{card.desc}</p>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            {/* ───── HOW IT WORKS ───── */}
            <section className="relative overflow-hidden border-t border-white/[0.06] px-5 pt-24 pb-24 sm:px-8 lg:px-10" id="how">
              <div className="mx-auto w-full max-w-[1280px]">
                <div className="reveal grid w-full max-w-[1280px] gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-end">
                  <div className="max-w-3xl">
                    <p className="text-sm font-medium text-cyan-100 font-geist">03 · Comment ça marche</p>
                    <h2 className="mt-4 max-w-2xl text-4xl tracking-tighter text-white sm:text-5xl lg:text-6xl font-jakarta font-medium">
                      Créez, planifiez, suivez l&apos;avancement.
                    </h2>
                  </div>
                  <div className="lg:ml-auto lg:max-w-md">
                    <p className="text-base leading-7 text-slate-400 font-geist">
                      ATAABA Pilot maintient le flux de travail clair. Créez le plan, assignez les responsables, choisissez une date, et observez chaque activité progresser de &quot;En cours&quot; à &quot;Terminé&quot;.
                    </p>
                    <div className="mt-7 flex flex-wrap gap-3">
                      <a href="/auth/login" className="inline-flex h-11 items-center justify-center rounded-full bg-cyan-100 px-5 text-sm font-medium text-slate-950 transition hover:bg-cyan-50 font-geist">Explorer le workflow</a>
                      <a href="#" className="inline-flex h-11 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.04] px-5 text-sm font-medium text-white backdrop-blur-xl transition hover:bg-white/[0.08] font-geist">En savoir plus</a>
                    </div>
                  </div>
                </div>

                <div className="reveal mt-14">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {[
                      {
                        step: 'Étape 01', title: 'Créer l\'activité', desc: 'Ajoutez des activités rapidement avec uniquement les détails dont votre équipe a besoin.',
                        preview: (
                          <div className="mt-auto rounded-2xl border border-white/[0.08] bg-[#070d18]/70 p-3">
                            <div className="mb-3 flex items-center justify-between">
                              <p className="text-xs font-medium text-white font-geist">Nouvelle activité</p>
                              <span className="h-2 w-2 rounded-full bg-blue-400" style={{ boxShadow: '0 0 16px rgba(96,165,250,0.8)' }} />
                            </div>
                            <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2">
                              <p className="text-xs text-slate-500 font-geist">Mettre à jour les indicateurs</p>
                            </div>
                            <button className="mt-3 flex w-full items-center justify-between rounded-xl bg-blue-500 px-3 py-2 text-xs font-medium text-white font-geist">
                              Ajouter<span>+</span>
                            </button>
                          </div>
                        )
                      },
                      {
                        step: 'Étape 02', title: 'Fixer l\'échéance', desc: 'Les dates d\'échéance et les marqueurs de priorité rendent la prochaine action évidente.',
                        preview: (
                          <div className="mt-auto rounded-2xl border border-white/[0.08] bg-[#070d18]/70 p-3">
                            <p className="text-xs font-medium text-white font-geist mb-3">Juillet 2026</p>
                            <div className="grid grid-cols-7 gap-1 text-center text-[0.62rem] text-slate-500 font-geist">
                              {['L','M','M','J','V','S','D'].map(d => <span key={d}>{d}</span>)}
                              {[14,15,16,17,18,19,20].map(n => (
                                <span key={n} className={`py-1 ${n === 17 ? 'rounded-full bg-blue-500 text-white' : ''} font-geist`}>{n}</span>
                              ))}
                            </div>
                            <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2">
                              <span className="h-2 w-2 rounded-full bg-amber-400" />
                              <p className="text-xs text-slate-300 font-geist">Priorité haute</p>
                            </div>
                          </div>
                        )
                      },
                      {
                        step: 'Étape 03', title: 'Suivre le statut', desc: 'Utilisez des colonnes simples : Non démarrée, En cours, Terminée.',
                        preview: (
                          <div className="mt-auto grid grid-cols-3 gap-2 rounded-2xl border border-white/[0.08] bg-[#070d18]/70 p-3">
                            {[
                              { label: 'À faire', border: 'border-white/[0.07]', text: 'text-slate-500' },
                              { label: 'En cours', border: 'border-blue-400/20 bg-blue-500/[0.06]', text: 'text-blue-200' },
                              { label: 'Terminé', border: 'border-white/[0.07]', text: 'text-slate-500' },
                            ].map(col => (
                              <div key={col.label} className={`rounded-xl border p-2 ${col.border}`}>
                                <p className={`mb-2 text-[0.55rem] font-semibold uppercase tracking-wide font-geist ${col.text}`}>{col.label}</p>
                                <div className="space-y-1.5">
                                  <div className="h-7 rounded-lg bg-white/[0.05] p-2"><div className="h-1.5 w-full rounded-full bg-slate-700" /></div>
                                  <div className="h-7 rounded-lg bg-white/[0.04] p-2"><div className="h-1.5 w-2/3 rounded-full bg-slate-700" /></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      },
                      {
                        step: 'Étape 04', title: 'Centraliser les mises à jour', desc: 'Assignez des responsables et ajoutez des commentaires sans configuration supplémentaire.',
                        preview: (
                          <div className="mt-auto rounded-2xl border border-white/[0.08] bg-[#070d18]/70 p-3">
                            <div className="mb-3 flex items-center justify-between">
                              <div className="flex -space-x-2">
                                {['from-blue-300 to-indigo-500','from-amber-300 to-rose-500','from-emerald-300 to-cyan-500'].map(g => (
                                  <div key={g} className={`h-7 w-7 rounded-full border-2 border-[#070d18] bg-gradient-to-br ${g}`} />
                                ))}
                              </div>
                              <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.05] text-sm text-slate-300 font-geist">+</div>
                            </div>
                            <div className="space-y-2">
                              {[{name:'Ahmed',time:'2m',msg:'Rapport mis à jour.'},{name:'Fatima',time:'5m',msg:'Validation en cours.'}].map(c => (
                                <div key={c.name} className="rounded-xl border border-white/[0.07] bg-white/[0.04] p-3">
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs font-medium text-white font-geist">{c.name}</p>
                                    <p className="text-[0.65rem] text-slate-500 font-geist">il y a {c.time}</p>
                                  </div>
                                  <p className="mt-1 text-xs leading-5 text-slate-400 font-geist">{c.msg}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      },
                    ].map(card => (
                      <div key={card.step} className="group relative min-h-[280px] overflow-hidden rounded-3xl border border-blue-300/20 bg-white/[0.035] p-5 transition duration-300 hover:-translate-y-1 hover:border-blue-300/40">
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/[0.10] via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                        <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/60 to-transparent" />
                        <div className="relative z-10 flex h-full flex-col">
                          <p className="inline-flex w-fit rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-blue-200 font-geist">{card.step}</p>
                          <h3 className="mt-5 text-lg font-semibold text-white font-geist">{card.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-300 font-geist">{card.desc}</p>
                          {card.preview}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ───── KEY BENEFITS ───── */}
            <section className="border-white/[0.06] overflow-hidden sm:px-8 lg:px-10 border-t pt-24 pr-5 pb-24 pl-5 relative" id="benefits">
              <div className="relative mx-auto w-full max-w-[1280px] z-10">
                <div className="reveal grid w-full max-w-[1280px] gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-end">
                  <div className="max-w-3xl">
                    <p className="text-[13px] font-medium text-slate-400 font-geist">04 · Avantages clés</p>
                    <h2 className="mt-4 text-4xl text-white sm:text-[56px] leading-[1.1] tracking-tight font-jakarta font-medium">
                      Tout ce dont les équipes ont besoin,<br />rien contre quoi se battre.
                    </h2>
                  </div>
                  <div className="lg:ml-auto lg:max-w-md">
                    <p className="text-[17px] leading-relaxed text-slate-400 font-geist">
                      ATAABA Pilot est conçu pour une compréhension rapide, une utilisation quotidienne fluide et une visibilité sereine des projets.
                    </p>
                    <div className="mt-7 flex flex-wrap gap-3">
                      <a href="/auth/login" className="inline-flex h-11 items-center justify-center rounded-full bg-cyan-100 px-5 text-sm font-medium text-slate-950 transition hover:bg-cyan-50 font-geist">Voir les avantages</a>
                      <a href="#" className="inline-flex h-11 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.04] px-5 text-sm font-medium text-white backdrop-blur-xl transition hover:bg-white/[0.08] font-geist">En savoir plus</a>
                    </div>
                  </div>
                </div>

                <div className="mt-16 grid gap-6 lg:grid-cols-4">
                  {[
                    { label: 'Clarté', title: 'Pas de courbe d\'apprentissage', desc: 'Un espace de travail que votre équipe comprend en quelques minutes.', glowColor: 'bg-blue-500/20' },
                    { label: 'Rapidité', title: 'Léger par défaut', desc: 'Créez, mettez à jour et révisez le travail sans workflows lourds.', glowColor: 'bg-blue-500/10' },
                    { label: 'Focus', title: 'Un espace partagé', desc: 'Activités, plans, échéances et mises à jour restent connectés.', glowColor: 'bg-blue-400/20' },
                    { label: 'Confiance', title: 'Responsabilité claire', desc: 'Chacun sait ce qu\'il possède et ce qui nécessite attention.', glowColor: 'bg-blue-500/10' },
                  ].map(card => (
                    <div key={card.label} className="group relative flex flex-col rounded-[2rem] bg-gradient-to-b from-white/[0.05] to-transparent p-8 transition duration-300 ease-out hover:-translate-y-1">
                      <div className="absolute inset-0 rounded-[2rem] border border-white/10 pointer-events-none group-hover:border-white/20 transition-colors" />
                      <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/40 to-transparent" />
                      <div className={`relative h-32 w-full mb-6 flex items-center justify-center`}>
                        <div className={`absolute w-24 h-24 ${card.glowColor} rounded-full blur-3xl`} />
                        <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-300/20 bg-blue-500/10 text-blue-200">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold tracking-widest text-blue-400 uppercase font-geist">{card.label}</span>
                      <h3 className="mt-3 text-[22px] text-white font-jakarta font-medium">{card.title}</h3>
                      <p className="mt-3 text-[15px] leading-relaxed text-slate-400 font-geist">{card.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ───── SOCIAL PROOF ───── */}
            <section className="overflow-hidden border-white/[0.06] sm:px-8 lg:px-10 border-t pt-24 pr-5 pb-24 pl-5 relative" id="reviews">
              <div className="absolute top-1/2 left-[20%] -translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
              <div className="relative z-10 mx-auto grid w-full max-w-[1280px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
                <div className="reveal lg:mt-10">
                  <p className="text-[13px] font-medium text-slate-400 font-geist">05 · Témoignages</p>
                  <h2 className="mt-4 text-4xl text-white sm:text-[56px] leading-[1.1] tracking-tight font-jakarta font-medium">
                    Conçu pour les équipes qui veulent que le travail soit évident.
                  </h2>
                  <p className="mt-6 text-[17px] leading-relaxed text-slate-400 max-w-[400px] font-geist">
                    ATAABA Pilot offre aux équipes en croissance une façon plus calme de coordonner les projets sans adopter un système d&apos;exploitation lourd.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <a href="/auth/login" className="inline-flex h-11 items-center justify-center rounded-full bg-cyan-100 px-5 text-sm font-medium text-slate-950 transition hover:bg-cyan-50 font-geist">Commencer</a>
                    <a href="#" className="inline-flex h-11 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.04] px-5 text-sm font-medium text-white backdrop-blur-xl transition hover:bg-white/[0.08] font-geist">En savoir plus</a>
                  </div>
                </div>

                <div className="flex flex-col gap-5">
                  <div className="group relative flex flex-col sm:flex-row gap-6 rounded-[2rem] bg-gradient-to-b from-white/[0.05] to-transparent p-6 sm:p-8 border border-white/10">
                    <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/40 to-transparent" />
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] text-blue-200">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[22px] text-white font-jakarta font-medium">Déjà utilisé par des directions</h3>
                      <p className="mt-2 text-[15px] leading-relaxed text-slate-400 font-geist">Qui gardent activités, responsables et délais visibles sans complexifier le processus.</p>
                    </div>
                  </div>

                  <div className="group relative flex flex-col sm:flex-row gap-6 rounded-[2rem] bg-gradient-to-b from-white/[0.05] to-transparent p-6 sm:p-8 border border-white/10">
                    <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/40 to-transparent" />
                    <div className="flex flex-col items-center gap-2 shrink-0">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02]">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-blue-400">
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 pt-2">
                      <h3 className="text-[22px] text-white leading-tight font-jakarta font-medium">&quot;Notre équipe a compris dès le premier jour.&quot;</h3>
                      <p className="mt-4 text-[15px] leading-relaxed text-slate-400 font-geist">
                        <span className="text-blue-400 font-medium font-geist">Responsable de programme</span> — un espace de travail léger qui a remplacé trois outils éparpillés.
                      </p>
                    </div>
                  </div>

                  <div className="group relative flex flex-col sm:flex-row gap-6 rounded-[2rem] bg-gradient-to-b from-white/[0.05] to-transparent p-6 sm:p-8 border border-white/10">
                    <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/40 to-transparent" />
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] text-blue-200">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[22px] text-white font-jakarta font-medium">Moins de temps à gérer l&apos;outil</h3>
                      <p className="mt-2 text-[15px] leading-relaxed text-slate-400 font-geist">Les équipes passent plus de temps à faire le travail et moins à maintenir des tableaux compliqués.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ───── PRICING ───── */}
            <section className="border-white/[0.06] overflow-hidden sm:px-8 lg:px-10 border-t pt-24 pr-5 pb-24 pl-5 relative" id="pricing">
              <div className="pointer-events-none absolute left-1/2 top-0 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
              <div className="z-10 w-full max-w-[1280px] mr-auto ml-auto relative">
                <div className="reveal grid w-full max-w-[1280px] gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-end">
                  <div className="max-w-3xl">
                    <p className="text-[13px] font-medium text-slate-400 font-geist">06 · Tarifs</p>
                    <h2 className="mt-4 text-4xl leading-[1.1] tracking-tight text-white sm:text-[56px] font-jakarta font-medium">
                      Des formules simples pour les équipes qui veulent de la clarté.
                    </h2>
                  </div>
                  <div className="lg:ml-auto lg:max-w-md">
                    <p className="text-[17px] leading-relaxed text-slate-400 font-geist">
                      Commencez avec l&apos;essentiel, évoluez quand votre équipe a besoin de plus de plans, de rapports et de contrôles de collaboration.
                    </p>
                  </div>
                </div>

                <div className="mt-16 grid gap-6 lg:grid-cols-3">
                  {[
                    {
                      tier: 'Essentielle', headline: 'Pour démarrer', price: 'Sur devis', badge: 'De base',
                      badgeCls: 'border-white/10 bg-white/[0.04] text-slate-400',
                      cardCls: 'bg-gradient-to-b from-white/[0.05] to-transparent border-white/10',
                      ctaText: 'Commencer', ctaCls: 'border border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.07]',
                      features: ['Jusqu\'à 3 plans d\'action', 'Tableaux d\'activités', 'Échéances et responsables', 'Résumé hebdomadaire'],
                    },
                    {
                      tier: 'Professionnelle', headline: 'Pour les équipes actives', price: 'Sur devis', badge: 'Populaire',
                      badgeCls: 'border-blue-300/20 bg-blue-400/10 text-blue-200',
                      cardCls: 'bg-gradient-to-b from-blue-500/[0.16] via-white/[0.06] to-transparent border-blue-300/30',
                      ctaText: 'Essayer', ctaCls: 'bg-cyan-100 text-slate-950 hover:bg-cyan-50',
                      features: ['Plans illimités', 'Vue calendrier et timeline', 'Étiquettes et filtres de priorité', 'Commentaires d\'équipe', 'Rapports d\'avancement'],
                    },
                    {
                      tier: 'Organisation', headline: 'Pour les grandes structures', price: 'Sur devis', badge: 'Entreprise',
                      badgeCls: 'border-white/10 bg-white/[0.04] text-slate-400',
                      cardCls: 'bg-gradient-to-b from-white/[0.05] to-transparent border-white/10',
                      ctaText: 'Contacter', ctaCls: 'border border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.07]',
                      features: ['Tout en Professionnelle', 'Permissions admin', 'Rapports de portefeuille', 'Support prioritaire', 'Intégration personnalisée'],
                    },
                  ].map(plan => (
                    <article key={plan.tier} className={`group relative flex flex-col rounded-[2rem] p-8 transition duration-300 ease-out hover:-translate-y-1 border ${plan.cardCls}`}>
                      <div className="pointer-events-none absolute inset-0 rounded-[2rem] transition-colors" />
                      <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/40 to-transparent" />
                      <div className="flex items-start justify-between gap-6">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-400 font-geist">{plan.tier}</p>
                          <h3 className="mt-3 text-[24px] tracking-tight text-white font-jakarta font-medium">{plan.headline}</h3>
                        </div>
                        <span className={`rounded-full border px-3 py-1 text-xs font-medium font-geist ${plan.badgeCls}`}>{plan.badge}</span>
                      </div>
                      <div className="mt-8">
                        <div className="flex items-end gap-2">
                          <span className="text-3xl tracking-tight text-white font-jakarta font-medium">{plan.price}</span>
                        </div>
                      </div>
                      <a href="/auth/login" className={`mt-8 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition duration-300 ease-out font-geist ${plan.ctaCls}`}>
                        {plan.ctaText}
                      </a>
                      <div className="mt-8 h-px w-full bg-white/[0.08]" />
                      <ul className="mt-8 space-y-4 text-[15px] leading-6 text-slate-400">
                        {plan.features.map(f => (
                          <li key={f} className="flex gap-3 font-geist">
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-300">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                            </span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>

                <div className="text-center border-white/10 border rounded-[2rem] mt-10 pt-6 pr-6 pb-6 pl-6">
                  <p className="text-[15px] leading-relaxed text-slate-400 font-geist">
                    Toutes les formules incluent des espaces de travail sécurisés, des activités illimitées et une interface que votre équipe maîtrise en quelques minutes.
                  </p>
                </div>
              </div>
            </section>

            {/* ───── CTA ───── */}
            <section className="sm:px-8 lg:px-10 lg:pt-24 pt-24 pr-5 pb-24 pl-5" id="cta">
              <div className="reveal overflow-hidden border-white/[0.08] sm:px-10 sm:py-10 lg:px-12 lg:py-12 bg-[#0d1422]/70 w-full max-w-[1280px] border rounded-[2rem] mr-auto ml-auto pt-8 pr-6 pb-8 pl-6 relative shadow-2xl backdrop-blur-2xl">
                <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-28 left-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
                <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100/10 bg-cyan-100/[0.04] px-3 py-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-200" />
                      <p className="text-xs font-medium tracking-wide text-cyan-100 font-geist">Démarrez en quelques minutes</p>
                    </div>
                    <h2 className="mt-5 text-3xl tracking-tighter text-white sm:text-4xl lg:text-5xl font-jakarta font-medium">
                      Donnez à votre équipe un espace clair pour gérer le travail.
                    </h2>
                    <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base font-geist">
                      Créez votre premier plan, invitez votre équipe et visualisez chaque échéance dans un espace de travail serein.
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                    <a href="/auth/login" className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-100 px-6 py-3 text-sm font-semibold text-slate-950 shadow-2xl transition duration-300 ease-out hover:scale-[1.03] hover:bg-cyan-50 font-geist">
                      Commencer
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </a>
                    <a href="#how" className="inline-flex items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] px-6 py-3 text-sm font-medium text-slate-200 transition duration-300 ease-out hover:bg-white/[0.06] hover:text-white font-geist">
                      Voir comment ça marche
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </main>

          {/* ───── FOOTER ───── */}
          <footer className="overflow-hidden border-white/[0.06] sm:px-8 sm:py-16 lg:pl-10 lg:pr-10 lg:pt-20 lg:pb-10 border-t pt-20 pr-10 pb-10 pl-10 relative">
            <div className="pointer-events-none absolute left-1/2 top-0 h-px w-[70%] -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-100/20 to-transparent" />
            <div className="pointer-events-none absolute -right-32 top-20 h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl" />
            <div className="pointer-events-none absolute -left-32 bottom-10 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative mx-auto w-full max-w-[1280px]">
              <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
                <div>
                  <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-100/10 bg-cyan-100/[0.04] px-3 py-1 text-xs font-medium tracking-wide text-cyan-100 font-geist">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-200" />
                    Démarrez en quelques minutes
                  </p>
                  <h2 className="max-w-5xl text-6xl leading-none tracking-tighter text-white sm:text-7xl lg:text-8xl font-jakarta font-medium">
                    Prenons le contrôle du travail.
                  </h2>
                </div>
                <div className="max-w-xl lg:justify-self-end">
                  <p className="text-2xl leading-tight tracking-tight text-slate-400 sm:text-3xl font-jakarta font-medium">
                    Un espace de travail serein pour les plans, les échéances et la coordination.
                  </p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <a href="/auth/login" className="inline-flex items-center justify-center gap-3 rounded-full bg-cyan-100 px-6 py-4 text-base font-medium text-slate-950 shadow-2xl transition duration-300 ease-out hover:scale-[1.03] hover:bg-cyan-50 font-geist">
                      Commencer
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </a>
                    <a href="#how" className="inline-flex items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] px-6 py-4 text-base font-medium text-slate-200 transition duration-300 ease-out hover:bg-white/[0.06] hover:text-white font-geist">
                      Voir le produit
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-16 grid gap-12 border-t border-white/[0.06] pt-12 sm:mt-20 sm:grid-cols-2 lg:mt-24 lg:grid-cols-[1.2fr_0.6fr_0.6fr_0.6fr] lg:gap-16">
                <div className="max-w-sm">
                  <a href="#" className="inline-flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-100/10 bg-cyan-100/[0.06] text-cyan-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16"/><path d="M4 12h10"/><path d="M4 17h7"/></svg>
                    </span>
                    <span className="text-xl tracking-tight text-white font-jakarta font-medium">ATAABA Pilot</span>
                  </a>
                  <p className="mt-5 text-sm leading-6 text-slate-500 font-geist">
                    Une plateforme de pilotage des plans d&apos;action pour les équipes, directions et organisations qui veulent moins de complexité et plus de clarté.
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-500 font-geist">Pages</p>
                  <nav className="mt-5 flex flex-col gap-3">
                    {[['#how','Produit'],['#pricing','Tarifs'],['#reviews','Clients'],['#problem','À propos']].map(([href, label]) => (
                      <a key={href} href={href} className="text-sm text-slate-300 transition hover:text-cyan-100 font-geist">{label}</a>
                    ))}
                  </nav>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-500 font-geist">Ressources</p>
                  <nav className="mt-5 flex flex-col gap-3">
                    {['Centre d\'aide','Confidentialité','Conditions','Contact'].map(l => (
                      <a key={l} href="#" className="text-sm text-slate-300 transition hover:text-cyan-100 font-geist">{l}</a>
                    ))}
                  </nav>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-500 font-geist">Réseaux</p>
                  <nav className="mt-5 flex flex-col gap-3">
                    {['Twitter (X)','LinkedIn','GitHub'].map(l => (
                      <a key={l} href="#" className="text-sm text-slate-300 transition hover:text-cyan-100 font-geist">{l}</a>
                    ))}
                  </nav>
                </div>
              </div>

              <div className="mt-12 flex flex-col justify-between gap-5 border-t border-white/[0.06] pt-8 text-sm text-slate-500 sm:flex-row sm:items-center">
                <p className="font-geist">© 2026 ATAABA Pilot. Tous droits réservés.</p>
                <div className="flex flex-wrap gap-x-4 gap-y-2 font-geist">
                  <a href="#how" className="transition hover:text-slate-300 font-geist">Conçu pour les équipes</a>
                  <a href="/auth/login" className="transition hover:text-slate-300 font-geist">Commencer</a>
                  <a href="#" className="transition hover:text-slate-300 font-geist">Confidentialité</a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* WebGL Three.js background for hero */}
      <Script id="three-webgl" strategy="afterInteractive" type="module">{`
        import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
        import { EffectComposer } from 'https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js';
        import { RenderPass } from 'https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/RenderPass.js';
        import { UnrealBloomPass } from 'https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/UnrealBloomPass.js';
        import { ShaderPass } from 'https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/ShaderPass.js';
        import { SMAAPass } from 'https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/SMAAPass.js';
        import { OutputPass } from 'https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/OutputPass.js';
        let scene, camera, renderer, composer, bloomPass, blurPass, smaaPass, outputPass;
        let clock = new THREE.Clock();
        let globalTime = 0;
        let floorMesh;
        const trailObjects = [];
        const trailMaterials = [];
        let canvas, container;
        const config = {
          dpr: Math.min(window.devicePixelRatio, 1.5),
          exposure: 3.6505, brightness: 4.0131,
          bloomStrength: 0.2025, bloomRadius: 0.294, bloomThreshold: 0.0,
          speedMultiplier: 0.1, linesCount: 100, dotDensity: 70,
          dotSize: 0.25, dotSpeed: 1.5, blurStrength: 3.5,
          arcRadius: 10.0, bendStartZ: -150.0, floorLength: 132.75, wallHeight: 200.0,
          color0: '#080c14', color1: '#0ea5e9', color2: '#22d3ee', color3: '#ffffff', color4: '#0b1220'
        };
        class CycCurve extends THREE.Curve {
          constructor(x, zStart, zBend, radius, yEnd) {
            super();
            this.x = x; this.zStart = zStart; this.zBend = zBend; this.radius = radius; this.yEnd = yEnd;
            this.L_flat = Math.abs(zStart - (zBend + radius));
            this.L_arc = (Math.PI * radius) * 0.5;
            this.L_up = Math.max(0.1, yEnd - radius);
            this.totalLength = this.L_flat + this.L_arc + this.L_up;
          }
          getPoint(t, optionalTarget = new THREE.Vector3()) {
            const d = t * this.totalLength;
            let py = 0, pz = 0;
            if (d <= this.L_flat) { pz = this.zStart - d; }
            else if (d <= this.L_flat + this.L_arc) {
              const norm = (d - this.L_flat) / this.L_arc;
              const eased = norm * norm * (3.0 - 2.0 * norm);
              const angle = (norm * 0.4 + eased * 0.6) * (Math.PI * 0.5);
              py = this.radius * (1.0 - Math.cos(angle));
              pz = (this.zBend + this.radius) - Math.sin(angle) * this.radius;
            } else { py = this.radius + (d - (this.L_flat + this.L_arc)); pz = this.zBend; }
            return optionalTarget.set(this.x, py, pz);
          }
        }
        function init() {
          canvas = document.querySelector('#webgl-canvas');
          if (!canvas) return;
          container = canvas.parentElement;
          scene = new THREE.Scene();
          scene.background = new THREE.Color(0x000000);
          camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 1, 2000);
          camera.position.set(0, 20, 140);
          renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
          renderer.setSize(container.clientWidth, container.clientHeight);
          renderer.setPixelRatio(config.dpr);
          renderer.toneMapping = THREE.LinearToneMapping;
          renderer.toneMappingExposure = config.exposure;
          camera.lookAt(0, 20, -50);
          const renderTarget = new THREE.WebGLRenderTarget(container.clientWidth * config.dpr, container.clientHeight * config.dpr, { type: THREE.HalfFloatType, format: THREE.RGBAFormat });
          const renderScene = new RenderPass(scene, camera);
          smaaPass = new SMAAPass(container.clientWidth * config.dpr, container.clientHeight * config.dpr);
          bloomPass = new UnrealBloomPass(new THREE.Vector2(container.clientWidth, container.clientHeight), config.bloomStrength, config.bloomRadius, config.bloomThreshold);
          const foregroundBlurShader = {
            uniforms: { 'tDiffuse': { value: null }, 'resolution': { value: new THREE.Vector2(container.clientWidth * config.dpr, container.clientHeight * config.dpr) }, 'blurStrength': { value: config.blurStrength } },
            vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
            fragmentShader: 'uniform sampler2D tDiffuse; uniform vec2 resolution; uniform float blurStrength; varying vec2 vUv; void main() { float mask = 1.0 - smoothstep(0.0, 0.35, vUv.y); float radius = mask * blurStrength; if (radius < 0.1) { gl_FragColor = texture2D(tDiffuse, vUv); } else { vec4 color = vec4(0.0); float total = 0.0; const float GA = 2.3999632; for (int i = 0; i < 32; i++) { float f = float(i); float r = sqrt(f) * radius; float theta = f * GA; vec2 offset = vec2(cos(theta), sin(theta)) * (r / resolution); color += texture2D(tDiffuse, vUv + offset); total += 1.0; } gl_FragColor = color / total; } }'
          };
          blurPass = new ShaderPass(foregroundBlurShader);
          outputPass = new OutputPass();
          composer = new EffectComposer(renderer, renderTarget);
          composer.setPixelRatio(config.dpr);
          composer.addPass(renderScene); composer.addPass(smaaPass); composer.addPass(bloomPass); composer.addPass(blurPass); composer.addPass(outputPass);
          createFloor(); generateTrails(); updateGeometries();
          window.addEventListener('resize', onWindowResize);
        }
        function createFloor() {
          const mat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide });
          floorMesh = new THREE.Mesh(new THREE.BufferGeometry(), mat);
          floorMesh.position.set(0,-0.5,-0.5); floorMesh.renderOrder = 1; scene.add(floorMesh);
        }
        function generateTrails() {
          const group = new THREE.Group(); scene.add(group);
          const vs = 'varying vec2 vUv; varying vec3 vNormal; varying vec3 vViewPosition; void main() { vUv = uv; vNormal = normalMatrix * normal; vec4 mvPosition = modelViewMatrix * vec4(position,1.0); vViewPosition = -mvPosition.xyz; gl_Position = projectionMatrix * mvPosition; }';
          const fs = 'varying vec2 vUv; varying vec3 vNormal; varying vec3 vViewPosition; uniform float uTime; uniform vec3 uColor; uniform float uSpeed; uniform float uOffset; uniform float uTailLength; uniform float uIntensityMultiplier; uniform float uBendUv; uniform float uIsReflection; uniform float uDotDensity; uniform float uDotSize; uniform float uDotSpeed; uniform float uBrightness; float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);} void main(){float t=fract(uTime*uSpeed+uOffset);float dist=fract(t-vUv.x+1.0);float baseAlpha=smoothstep(uTailLength,0.0,dist);baseAlpha=pow(max(0.0,baseAlpha),1.2);vec3 viewDir=normalize(vViewPosition);float fresnel=abs(dot(normalize(vNormal),viewDir));float edgeSoftness=smoothstep(0.0,0.02,fresnel);baseAlpha*=edgeSoftness;float core=pow(max(0.0,baseAlpha),3.0)*1.5;float movingUV=vUv.x-(uTime*uSpeed*uDotSpeed)-uOffset;float signalPos=movingUV*uDotDensity;float dotId=floor(signalPos);float dotLocal=fract(signalPos);float distToCenter=length(vec2((dotLocal-0.5)*2.0,(fract(vUv.y+0.5)-0.5)*6.0));float dotShape=1.0-smoothstep(0.0,max(0.001,uDotSize),distToCenter);float dotFinal=dotShape*step(0.6,hash(vec2(dotId,uOffset)))*(sin(uTime*4.0+hash(vec2(dotId))*6.28)*0.3+0.7)*baseAlpha;if(uIsReflection>0.5){float refFade=1.0-smoothstep(uBendUv-0.015,uBendUv,vUv.x);baseAlpha*=refFade;core*=refFade;dotFinal*=refFade*0.1;baseAlpha=pow(max(0.0,baseAlpha),0.5)*(0.7+hash(vUv*300.0+uTime*0.05)*0.3);core*=0.3;}vec3 trailColor=uColor*(baseAlpha+core*1.5)*uIntensityMultiplier*uBrightness;vec3 rgb=trailColor/max(1.0-clamp(dotFinal*1.8,0.0,0.95),0.001)+uColor*dotFinal*2.5*uIntensityMultiplier*uBrightness;gl_FragColor=vec4(rgb,(baseAlpha+dotFinal)*uIntensityMultiplier);}';
          for (let i = 0; i < config.linesCount; i++) {
            const normIdx = (i / (config.linesCount - 1)) * 2 - 1;
            const linearPos = normIdx;
            const expPos = Math.sign(normIdx) * Math.pow(Math.abs(normIdx), 1.2);
            let startX = (linearPos * 0.5 + expPos * 0.5) * 80 + (Math.random() - 0.5) * 2.0;
            const thickness = Math.random() * 0.2 + 0.1;
            const colorIdx = Math.floor(Math.random() * 5);
            const uniforms = {
              uTime:{value:0}, uColor:{value:new THREE.Color(config['color'+colorIdx])}, uSpeed:{value:Math.random()*0.5+0.2},
              uOffset:{value:Math.random()}, uTailLength:{value:Math.random()*0.4+0.3}, uIntensityMultiplier:{value:1.0},
              uBendUv:{value:0.0}, uIsReflection:{value:0.0}, uDotDensity:{value:config.dotDensity},
              uDotSize:{value:config.dotSize}, uDotSpeed:{value:config.dotSpeed}, uBrightness:{value:config.brightness}
            };
            const mat = new THREE.ShaderMaterial({vertexShader:vs, fragmentShader:fs, uniforms, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending});
            const mesh = new THREE.Mesh(new THREE.BufferGeometry(), mat);
            const refMat = mat.clone();
            refMat.uniforms.uIntensityMultiplier.value = 0.4;
            refMat.uniforms.uIsReflection.value = 1.0;
            const refMesh = new THREE.Mesh(new THREE.BufferGeometry(), refMat);
            refMesh.scale.y = -1; refMesh.position.y = -1.0;
            group.add(mesh, refMesh);
            trailMaterials.push(mat.uniforms, refMat.uniforms);
            trailObjects.push({mesh, refMesh, startX, thickness});
          }
        }
        function updateGeometries() {
          if (floorMesh.geometry) floorMesh.geometry.dispose();
          const floorGeo = new THREE.PlaneGeometry(1000, 1000, 1, 1500);
          floorGeo.rotateX(-Math.PI * 0.5);
          const pos = floorGeo.attributes.position.array;
          for (let i = 0; i < pos.length; i += 3) {
            if (pos[i+2] < config.bendStartZ) {
              let d = config.bendStartZ - pos[i+2];
              let maxA = config.arcRadius * Math.PI * 0.5;
              if (d < maxA) {
                let n = d / maxA;
                let a = (n*0.4 + (n*n*(3.0-2.0*n))*0.6) * (Math.PI*0.5);
                pos[i+1] = config.arcRadius*(1.0-Math.cos(a));
                pos[i+2] = config.bendStartZ - Math.sin(a)*config.arcRadius;
              } else { pos[i+1] = config.arcRadius+(d-maxA); pos[i+2] = config.bendStartZ-config.arcRadius; }
            }
          }
          floorGeo.computeVertexNormals();
          floorMesh.geometry = floorGeo;
          const bendUv = Math.abs(config.floorLength-config.bendStartZ)/(Math.abs(config.floorLength-config.bendStartZ)+(Math.PI*config.arcRadius)*0.5+Math.max(0.1,config.wallHeight-config.arcRadius));
          trailObjects.forEach(obj => {
            const path = new CycCurve(obj.startX, config.floorLength, config.bendStartZ-config.arcRadius, config.arcRadius, config.wallHeight);
            const geo = new THREE.TubeGeometry(path, 200, obj.thickness, 8, false);
            if (obj.mesh.geometry) obj.mesh.geometry.dispose();
            obj.mesh.geometry = obj.refMesh.geometry = geo;
            obj.mesh.material.uniforms.uBendUv.value = obj.refMesh.material.uniforms.uBendUv.value = bendUv;
          });
        }
        function onWindowResize() {
          if(!camera||!renderer||!composer) return;
          camera.aspect = container.clientWidth/container.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(container.clientWidth,container.clientHeight);
          composer.setSize(container.clientWidth,container.clientHeight);
          if(smaaPass) smaaPass.setSize(container.clientWidth*config.dpr,container.clientHeight*config.dpr);
          if(blurPass&&blurPass.uniforms&&blurPass.uniforms.resolution) blurPass.uniforms.resolution.value.set(container.clientWidth*config.dpr,container.clientHeight*config.dpr);
        }
        function animate() {
          requestAnimationFrame(animate);
          if(!composer) return;
          globalTime += clock.getDelta() * config.speedMultiplier;
          trailMaterials.forEach(m => m.uTime.value = globalTime);
          composer.render();
        }
        init(); animate();
      `}</Script>
    </>
  );
}
