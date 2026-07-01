import React, { createContext, useContext, useState, useEffect } from 'react';

const baseColors = {
  // Brand Colors based on BharatOne logo
  primary: '#F97316', // Vibrant Orange from the logo
  primaryHover: '#FB923C',
  secondary: '#0F172A', // Navy Blue from 'bharat' text
  secondaryHover: '#1E293B',
  
  // Service Verticals
  rideColor: '#F97316',       // Orange
  ambulanceColor: '#EF4444',  // Red
  parcelColor: '#3B82F6',     // Blue
  foodColor: '#10B981',       // Green
  
  // Status Colors
  success: '#10B981', // Emerald Green
  danger: '#EF4444', // Ruby Red
  warning: '#F59E0B', // Amber
  info: '#3B82F6', // Sapphire Blue
};

export const themes = {
  dark: {
    name: 'BharatOne Dark',
    ...baseColors,
    background: '#0B0C10',
    surface: '#12141A',
    surfaceLight: '#1F222B',
    text: '#F3F4F6',
    textMuted: '#D1D5DB', 
    textDim: '#9CA3AF',   
    shadow: 'rgba(0, 0, 0, 0.8)',
    glassBg: 'rgba(18, 20, 26, 0.90)', 
    glassBorder: 'rgba(249, 115, 22, 0.2)', // Orange tint
    navGlass: 'rgba(11, 12, 16, 0.75)',
    overlay: 'rgba(255, 255, 255, 0.08)',
    overlayBorder: 'rgba(255, 255, 255, 0.15)'
  },
  light: {
    name: 'BharatOne Light',
    ...baseColors,
    primary: '#0F172A', // Use Navy for primary in light mode for better contrast
    primaryHover: '#1E293B',
    secondary: '#F97316',
    secondaryHover: '#FB923C',
    background: '#F8FAFC', 
    surface: '#FFFFFF',
    surfaceLight: '#E5E7EB', 
    text: '#111827',
    textMuted: '#374151', 
    textDim: '#4B5563',   
    shadow: 'rgba(0, 0, 0, 0.12)',
    glassBg: 'rgba(255, 255, 255, 0.95)', 
    glassBorder: 'rgba(0, 0, 0, 0.15)',
    navGlass: 'rgba(248, 250, 252, 0.75)',
    overlay: 'rgba(0, 0, 0, 0.08)',
    overlayBorder: 'rgba(0, 0, 0, 0.15)'
  }
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState('dark');

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('BharatOne_theme');
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
      localStorage.setItem('BharatOne_theme', name);
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
