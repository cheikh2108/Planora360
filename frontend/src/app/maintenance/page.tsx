'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function MaintenancePage() {
  const [message, setMessage] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    // Check if user is super admin
    const userStr = localStorage.getItem('user');
    const isLoggedIn = userStr && localStorage.getItem('accessToken');

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user?.role?.permissions?.includes('*')) {
          router.push('/dashboard');
          return;
        }
      } catch {}
    }

    // Fetch maintenance info
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/maintenance/status`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.maintenanceMode) {
          // Si la maintenance est désactivée, rediriger intelligemment
          if (isLoggedIn) {
            router.push('/dashboard');
          } else {
            router.push('/auth/login');
          }
          return;
        }
        setMessage(
          data.maintenanceMessage ||
            'Nous effectuons actuellement quelques améliorations afin de vous offrir une meilleure expérience. Nous revenons très bientôt.',
        );
      })
      .catch(() => {
        setMessage('Le système est temporairement indisponible.');
      });
  }, [router]);

  const handleRetry = () => {
    window.location.reload();
  };

  // Spring physics config (design-taste-frontend)
  const spring = {
    type: 'spring',
    stiffness: 100,
    damping: 20,
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-geist">

      {/* Header - Logo only */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full px-6 md:px-12 py-6"
      >
        <div className="max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-xl font-semibold text-slate-900">Planora 360</span>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6 md:px-12 py-12 md:py-0 relative overflow-hidden">

        {/* Decorative shape - behind illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-50/40 rounded-full blur-3xl pointer-events-none"
        />

        <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-12 lg:gap-20 items-center relative">

          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, transform: 'translateY(20px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            transition={spring}
            className="space-y-8 text-center lg:text-left order-2 lg:order-1"
          >

            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-sm font-semibold text-slate-500 uppercase tracking-wider"
            >
              Planora 360
            </motion.p>

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, transform: 'translateY(10px)' }}
              animate={{ opacity: 1, transform: 'translateY(0px)' }}
              transition={{ ...spring, delay: 0.15 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.1]"
            >
              Plateforme temporairement{' '}
              <span className="text-[#2563EB]">en maintenance</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, transform: 'translateY(10px)' }}
              animate={{ opacity: 1, transform: 'translateY(0px)' }}
              transition={{ ...spring, delay: 0.25 }}
              className="text-lg text-slate-600 leading-relaxed max-w-lg mx-auto lg:mx-0"
            >
              {message}
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, transform: 'translateY(10px)' }}
              animate={{ opacity: 1, transform: 'translateY(0px)' }}
              transition={{ ...spring, delay: 0.35 }}
              className="pt-4"
            >
              <motion.button
                onClick={handleRetry}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="inline-flex items-center justify-center px-8 py-4 bg-[#2563EB] text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-shadow duration-200"
              >
                Réessayer
              </motion.button>
            </motion.div>

          </motion.div>

          {/* Right Column - Illustration */}
          <motion.div
            initial={{ opacity: 0, transform: 'translateX(30px)' }}
            animate={{ opacity: 1, transform: 'translateX(0px)' }}
            transition={{ ...spring, delay: 0.2 }}
            className="flex items-center justify-center order-1 lg:order-2 relative"
          >
            <img
              src="/maintenance-illustration.svg"
              alt="Maintenance en cours"
              className="w-full max-w-xl h-auto relative z-10"
              style={{
                filter: 'drop-shadow(0 10px 40px rgba(0, 0, 0, 0.08))',
              }}
            />
          </motion.div>

        </div>

      </main>

    </div>
  );
}
