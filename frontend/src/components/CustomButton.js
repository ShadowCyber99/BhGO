import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function CustomButton({ 
  title, 
  onPress, 
  variant = 'primary', 
  loading = false, 
  style, 
  textStyle 
}) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  
  const isOutline = variant === 'outline';
  const isDanger = variant === 'danger';

  const buttonStyle = [
    styles.button,
    variant === 'primary' && styles.primary,
    isOutline && styles.outline,
    isDanger && styles.danger,
    style
  ];

  const textStyles = [
    styles.text,
    variant === 'primary' && styles.primaryText,
    isOutline && styles.outlineText,
    isDanger && styles.dangerText,
    textStyle
  ];

  return (
    <TouchableOpacity 
      style={buttonStyle} 
      onPress={onPress} 
      disabled={loading}
      activeOpacity={0.7}
    >
      {variant === 'primary' && !isOutline && <View style={styles.primaryGlow} />}
      
      {loading ? (
        <ActivityIndicator 
          color={isOutline ? colors.primary : '#000000'} 
          size="small" 
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const getStyles = (colors) => StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 24,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
    position: 'relative'
  },
  primary: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryGlow: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)`,
    transform: [{skewX: '-20deg'}]
  },
  outline: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1.5,
    borderColor: colors.primary,
    backdropFilter: 'blur(10px)'
  },
  danger: {
    backgroundColor: colors.danger,
    shadowColor: colors.danger,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase'
  },
  primaryText: {
    color: '#000000',
  },
  outlineText: {
    color: colors.primary,
  },
  dangerText: {
    color: '#FFFFFF',
  },
});
