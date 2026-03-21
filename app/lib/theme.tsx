'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';

type Mode = 'light' | 'dark';

interface ThemeContextValue {
  mode: Mode;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({ mode: 'dark', toggle: () => {} });

function getAutoMode(): Mode {
  const h = new Date().getHours();
  return h >= 7 && h < 19 ? 'light' : 'dark';
}

function getStoredOrAutoMode(): Mode {
  const stored = localStorage.getItem('theme') as Mode | null;
  return stored ?? getAutoMode();
}

function applyMode(mode: Mode) {
  const el = document.documentElement;
  el.classList.remove('light', 'dark');
  el.classList.add(mode);
  el.style.colorScheme = mode;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>('dark');

  useEffect(() => {
    setMode(getStoredOrAutoMode());
  }, []);

  useEffect(() => {
    applyMode(mode);
  }, [mode]);

  useEffect(() => {
    const hasOverride = () => localStorage.getItem('theme') !== null;
    const id = setInterval(() => {
      if (!hasOverride()) {
        const auto = getAutoMode();
        setMode(auto);
      }
    }, 300_000);
    return () => clearInterval(id);
  }, []);

  const toggle = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ mode, toggle }), [mode, toggle]);

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
