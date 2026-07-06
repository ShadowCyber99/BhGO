import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function GlassCard({ children, style }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <View style={[styles.card, style]}>
      {/* Premium inner glow effect layer */}
      <View style={styles.glow} />
      {children}
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 40,
    elevation: 8,
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)',
    overflow: 'hidden',
    position: 'relative'
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    opacity: 0.1,
    backgroundImage: `linear-gradient(135deg, ${colors.primary} 0%, transparent 50%, ${colors.secondary} 100%)`
  }
});
