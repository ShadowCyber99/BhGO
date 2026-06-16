import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function CustomInput({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  secureTextEntry = false, 
  keyboardType = 'default',
  style,
  autoCapitalize = 'none'
}) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputWrapper,
        isFocused && styles.focusedWrapper
      ]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textDim}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    paddingLeft: 2,
  },
  inputWrapper: {
    height: 52,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1.5,
    borderColor: colors.surfaceLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    transition: 'border-color 0.2s, background-color 0.2s',
  },
  focusedWrapper: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  input: {
    color: colors.text,
    fontSize: 16,
    height: '100%',
    width: '100%',
    outlineStyle: 'none', // Remove default web input ring outline
  },
});
