'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Button } from '../ui/button';

export interface TourStep {
  target: string;
  title: string;
  content: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export interface OnboardingTourProps {
  steps: TourStep[];
  onComplete: () => void;
  onSkip: () => void;
  storageKey: string;
}

export function OnboardingTour({
  steps,
  onComplete,
  onSkip,
  storageKey,
}: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const completed = localStorage.getItem(storageKey);
    if (completed === 'true') return;

    const timeout = setTimeout(() => {
      setIsVisible(true);
      updateTargetPosition();
    }, 500);

    return () => clearTimeout(timeout);
  }, [storageKey]);

  useEffect(() => {
    if (isVisible) {
      updateTargetPosition();
      window.addEventListener('resize', updateTargetPosition);
      return () => window.removeEventListener('resize', updateTargetPosition);
    }
  }, [currentStep, isVisible]);

  const updateTargetPosition = () => {
    const target = document.querySelector(steps[currentStep].target);
    if (target) {
      const rect = target.getBoundingClientRect();
      setTargetRect(rect);
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(storageKey, 'true');
    setIsVisible(false);
    onComplete();
  };

  const handleSkipTour = () => {
    localStorage.setItem(storageKey, 'true');
    setIsVisible(false);
    onSkip();
  };

  if (!isVisible || !targetRect) return null;

  const step = steps[currentStep];

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[9998] animate-in fade-in duration-300"
        onClick={handleSkipTour}
      />

      <div
        className="fixed z-[9999] pointer-events-none rounded-lg"
        style={{
          top: targetRect.top - 4,
          left: targetRect.left - 4,
          width: targetRect.width + 8,
          height: targetRect.height + 8,
          boxShadow: '0 0 0 4px var(--color-brand), 0 0 0 9999px rgba(0,0,0,0.5)',
        }}
      />

      <div
        className="fixed z-[10000] bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-sm"
        style={{
          top: targetRect.bottom + 16,
          left: targetRect.left + targetRect.width / 2,
          transform: 'translateX(-50%)',
        }}
      >
        <div className="flex gap-1 mb-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i === currentStep ? 'bg-brand' : i < currentStep ? 'bg-brand/50' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
        <div className="text-sm text-gray-600 dark:text-gray-600 mb-6">{step.content}</div>

        <div className="flex justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={handleSkipTour}>
            Passer
          </Button>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" size="sm" onClick={handlePrevious}>
                Précédent
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={handleNext}>
              {currentStep === steps.length - 1 ? 'Terminer' : 'Suivant'}
            </Button>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Étape {currentStep + 1} sur {steps.length}
        </p>
      </div>
    </>
  );
}
