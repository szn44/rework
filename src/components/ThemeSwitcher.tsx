'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600 dark:text-dark-text-secondary">Theme</span>
        <div className="w-12 h-6 bg-gray-200 dark:bg-dark-bg-tertiary rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600 dark:text-dark-text-secondary">Theme</span>
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="relative inline-flex items-center w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 bg-gray-200 dark:bg-dark-bg-tertiary"
      >
        <span
          className={`inline-block w-4 h-4 transform transition-transform duration-200 bg-white dark:bg-dark-text-primary rounded-full shadow-sm ${
            theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
      <span className="text-sm text-gray-900 dark:text-dark-text-primary capitalize">
        {theme}
      </span>
    </div>
  );
} 