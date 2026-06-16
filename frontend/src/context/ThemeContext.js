import React, { createContext, useContext, useState, useEffect } from 'react';

const baseColors = {
  // Brand Colors (Neon Cyberpunk)
  primary: '#00F0FF',
  primaryHover: '#00D1FF',
  secondary: '#FF007F',
  secondaryHover: '#E60073',
  
  // Service Verticals
  rideColor: '#00F0FF',
  ambulanceColor: '#FF1111',
  parcelColor: '#7000FF',
  foodColor: '#FF5500',
  
  // Status Colors
  success: '#39FF14', // Neon Green
  danger: '#FF003C', // Neon Red
  warning: '#FFEA00', // Neon Yellow
  info: '#00F0FF',
};

export const themes = {
  dark: {
    name: 'Cyber Dark',
    ...baseColors,
    background: '#090A0F',
    surface: '#12141D',
    surfaceLight: '#1C1F2E',
    text: '#FFFFFF',
    textMuted: '#94A3B8',
    textDim: '#64748B',
    shadow: 'rgba(0, 240, 255, 0.4)',
    glassBg: 'rgba(18, 20, 29, 0.75)',
    glassBorder: 'rgba(0, 240, 255, 0.15)', // Neon border
  },
  light: {
    name: 'Clean Light',
    ...baseColors,
    primary: '#84CC16',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceLight: '#E2E8F0',
    text: '#0F172A',
    textMuted: '#475569',
    textDim: '#94A3B8',
    shadow: 'rgba(0, 0, 0, 0.1)',
    glassBg: 'rgba(255, 255, 255, 0.85)',
    glassBorder: 'rgba(0, 0, 0, 0.1)',
  },
  ocean: {
    name: 'Deep Ocean',
    ...baseColors,
    primary: '#0EA5E9',
    background: '#082F49',
    surface: '#0369A1',
    surfaceLight: '#0284C7',
    text: '#F0F9FF',
    textMuted: '#BAE6FD',
    textDim: '#7DD3FC',
    shadow: 'rgba(14, 165, 233, 0.4)',
    glassBg: 'rgba(3, 105, 161, 0.75)',
    glassBorder: 'rgba(14, 165, 233, 0.25)',
  },
  sunset: {
    name: 'Sunset Orange',
    ...baseColors,
    primary: '#F97316',
    background: '#431407',
    surface: '#7C2D12',
    surfaceLight: '#9A3412',
    text: '#FFF7ED',
    textMuted: '#FED7AA',
    textDim: '#FDBA74',
    shadow: 'rgba(249, 115, 22, 0.4)',
    glassBg: 'rgba(124, 45, 18, 0.75)',
    glassBorder: 'rgba(249, 115, 22, 0.25)',
  },
  forest: {
    name: 'Forest Green',
    ...baseColors,
    primary: '#22C55E',
    background: '#052E16',
    surface: '#14532D',
    surfaceLight: '#166534',
    text: '#F0FDF4',
    textMuted: '#BBF7D0',
    textDim: '#86EFAC',
    shadow: 'rgba(34, 197, 94, 0.4)',
    glassBg: 'rgba(20, 83, 45, 0.75)',
    glassBorder: 'rgba(34, 197, 94, 0.25)',
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
