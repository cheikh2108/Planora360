'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface HelpContextType {
  isOpen: boolean;
  currentPage: string;
  openHelp: (page: string) => void;
  closeHelp: () => void;
  toggleHelp: (page: string) => void;
}

const HelpContext = createContext<HelpContextType | undefined>(undefined);

export function HelpProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('');

  const openHelp = (page: string) => {
    setCurrentPage(page);
    setIsOpen(true);
  };

  const closeHelp = () => {
    setIsOpen(false);
  };

  const toggleHelp = (page: string) => {
    if (isOpen && currentPage === page) {
      setIsOpen(false);
    } else {
      setCurrentPage(page);
      setIsOpen(true);
    }
  };

  return (
    <HelpContext.Provider value={{ isOpen, currentPage, openHelp, closeHelp, toggleHelp }}>
      {children}
    </HelpContext.Provider>
  );
}

export function useHelp() {
  const context = useContext(HelpContext);
  if (!context) {
    throw new Error('useHelp must be used within a HelpProvider');
  }
  return context;
}
