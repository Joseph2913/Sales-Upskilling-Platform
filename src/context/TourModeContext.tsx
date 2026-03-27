import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface TourModeContextValue {
  isTourMode: boolean;
  startTour: () => void;
  endTour: () => void;
}

const TourModeContext = createContext<TourModeContextValue | null>(null);

export function useTourMode(): TourModeContextValue {
  const ctx = useContext(TourModeContext);
  if (!ctx) {
    throw new Error('useTourMode must be used within a TourModeProvider');
  }
  return ctx;
}

export function TourModeProvider({ children }: { children: ReactNode }) {
  const [isTourMode, setIsTourMode] = useState(false);

  const startTour = useCallback(() => setIsTourMode(true), []);
  const endTour = useCallback(() => setIsTourMode(false), []);

  return (
    <TourModeContext.Provider value={{ isTourMode, startTour, endTour }}>
      {children}
    </TourModeContext.Provider>
  );
}
