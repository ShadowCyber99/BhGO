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
    textMuted: '#D1D5DB', // Lightened from 9CA3AF for better contrast against dark backgrounds
    textDim: '#9CA3AF',   // Lightened from 6B7280
    shadow: 'rgba(0, 0, 0, 0.8)',
    glassBg: 'rgba(18, 20, 26, 0.90)', // Increased opacity for readability
    glassBorder: 'rgba(212, 175, 55, 0.2)',
    overlay: 'rgba(255, 255, 255, 0.08)',
    overlayBorder: 'rgba(255, 255, 255, 0.15)'
  },
  light: {
    name: 'Minimal Light',
    ...baseColors,
    primary: '#0F172A',
    background: '#F3F4F6', // Slightly darker than F9FAFB for contrast with pure white surface
    surface: '#FFFFFF',
    surfaceLight: '#E5E7EB', // Darkened from F3F4F6
    text: '#111827',
    textMuted: '#374151', // Darkened from 4B5563 for strong readability
    textDim: '#4B5563',   // Darkened from 9CA3AF (which was too light)
    shadow: 'rgba(0, 0, 0, 0.12)',
    glassBg: 'rgba(255, 255, 255, 0.95)', // Increased opacity
    glassBorder: 'rgba(0, 0, 0, 0.15)',
    overlay: 'rgba(0, 0, 0, 0.08)',
    overlayBorder: 'rgba(0, 0, 0, 0.15)'
  },
  ocean: {
    name: 'Royal Sapphire',
    ...baseColors,
    primary: '#38BDF8',
    background: '#041528',
    surface: '#0B213A',
    surfaceLight: '#123052',
    text: '#F0F9FF',
    textMuted: '#E0F2FE', // Lightened from BAE6FD
    textDim: '#BAE6FD',   // Lightened from 7DD3FC
    shadow: 'rgba(0, 0, 0, 0.7)',
    glassBg: 'rgba(11, 33, 58, 0.90)', // Increased opacity
    glassBorder: 'rgba(56, 189, 248, 0.3)',
    overlay: 'rgba(255, 255, 255, 0.08)',
    overlayBorder: 'rgba(255, 255, 255, 0.15)'
  },
  sunset: {
    name: 'Twilight Gold',
    ...baseColors,
    primary: '#F59E0B',
    background: '#1F1106',
    surface: '#2D190B',
    surfaceLight: '#432511',
    text: '#FFF7ED',
    textMuted: '#FEF3C7', // Lightened from FDE68A
    textDim: '#FDE68A',   // Lightened from FBBF24
    shadow: 'rgba(0, 0, 0, 0.7)',
    glassBg: 'rgba(45, 25, 11, 0.90)', // Increased opacity
    glassBorder: 'rgba(245, 158, 11, 0.3)',
    overlay: 'rgba(255, 255, 255, 0.08)',
    overlayBorder: 'rgba(255, 255, 255, 0.15)'
  },
  forest: {
    name: 'Emerald Executive',
    ...baseColors,
    primary: '#10B981',
    background: '#061D13',
    surface: '#0B2F1F',
    surfaceLight: '#12452F',
    text: '#F0FDF4',
    textMuted: '#D1FAE5', // Lightened from A7F3D0
    textDim: '#A7F3D0',   // Lightened from 6EE7B7
    shadow: 'rgba(0, 0, 0, 0.7)',
    glassBg: 'rgba(11, 47, 31, 0.90)', // Increased opacity
    glassBorder: 'rgba(16, 185, 129, 0.3)',
    overlay: 'rgba(255, 255, 255, 0.08)',
    overlayBorder: 'rgba(255, 255, 255, 0.15)'
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
