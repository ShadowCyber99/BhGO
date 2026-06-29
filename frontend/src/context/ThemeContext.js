import React, { createContext, useContext, useState, useEffect } from 'react';

const baseColors = {
  // Brand Colors (Premium & Modern)
  primary: '#D4AF37', // Gold accent
  primaryHover: '#F3E5AB',
  secondary: '#3B82F6', // Trust Blue
  secondaryHover: '#60A5FA',
  
  // Service Verticals
  rideColor: '#D4AF37',       // Gold for Ride
  ambulanceColor: '#EF4444',  // Ruby Red
  parcelColor: '#8B5CF6',     // Royal Purple
  foodColor: '#F97316',       // Warm Orange
  
  // Status Colors
  success: '#10B981', // Emerald Green
  danger: '#EF4444', // Ruby Red
  warning: '#F59E0B', // Amber
  info: '#3B82F6', // Sapphire Blue
};

export const themes = {
  dark: {
    name: 'Luxury Dark',
    ...baseColors,
    background: '#0B0C10',
    surface: '#12141A',
    surfaceLight: '#1F222B',
    text: '#F3F4F6',
    textMuted: '#9CA3AF',
    textDim: '#6B7280',
    shadow: 'rgba(0, 0, 0, 0.6)',
    glassBg: 'rgba(18, 20, 26, 0.8)',
    glassBorder: 'rgba(212, 175, 55, 0.15)', // Subtle gold border
  },
  light: {
    name: 'Minimal Light',
    ...baseColors,
    primary: '#0F172A',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    surfaceLight: '#F3F4F6',
    text: '#111827',
    textMuted: '#4B5563',
    textDim: '#9CA3AF',
    shadow: 'rgba(0, 0, 0, 0.08)',
    glassBg: 'rgba(255, 255, 255, 0.85)',
    glassBorder: 'rgba(0, 0, 0, 0.05)',
  },
  ocean: {
    name: 'Royal Sapphire',
    ...baseColors,
    primary: '#38BDF8',
    background: '#041528',
    surface: '#0B213A',
    surfaceLight: '#123052',
    text: '#F0F9FF',
    textMuted: '#BAE6FD',
    textDim: '#7DD3FC',
    shadow: 'rgba(0, 0, 0, 0.5)',
    glassBg: 'rgba(11, 33, 58, 0.75)',
    glassBorder: 'rgba(56, 189, 248, 0.2)',
  },
  sunset: {
    name: 'Twilight Gold',
    ...baseColors,
    primary: '#F59E0B',
    background: '#1F1106',
    surface: '#2D190B',
    surfaceLight: '#432511',
    text: '#FFF7ED',
    textMuted: '#FDE68A',
    textDim: '#FBBF24',
    shadow: 'rgba(0, 0, 0, 0.5)',
    glassBg: 'rgba(45, 25, 11, 0.75)',
    glassBorder: 'rgba(245, 158, 11, 0.2)',
  },
  forest: {
    name: 'Emerald Executive',
    ...baseColors,
    primary: '#10B981',
    background: '#061D13',
    surface: '#0B2F1F',
    surfaceLight: '#12452F',
    text: '#F0FDF4',
    textMuted: '#A7F3D0',
    textDim: '#6EE7B7',
    shadow: 'rgba(0, 0, 0, 0.5)',
    glassBg: 'rgba(11, 47, 31, 0.75)',
    glassBorder: 'rgba(16, 185, 129, 0.2)',
  }
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState('dark');

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('cabride_theme');
      if (savedTheme && themes[savedTheme]) {
        setThemeName(savedTheme);
      } else if (savedTheme === 'light') {
        setThemeName('light');
      }
    } catch (e) {}
  }, []);

  const changeTheme = (name) => {
    setThemeName(name);
    try {
      localStorage.setItem('cabride_theme', name);
    } catch(e) {}
  };

  const toggleTheme = () => {
    const newMode = themeName === 'dark' ? 'light' : 'dark';
    changeTheme(newMode);
  };

  const theme = themes[themeName] || themes.dark;
  const isDarkMode = themeName !== 'light';

  const availableThemes = Object.keys(themes).map(k => ({id: k, name: themes[k].name}));

  return (
    <ThemeContext.Provider value={{ colors: theme, isDarkMode, toggleTheme, themeName, changeTheme, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

// Legacy exports for backward compatibility
export const darkTheme = themes.dark;
export const lightTheme = themes.light;
