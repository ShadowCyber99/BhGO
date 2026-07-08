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
    marginBottom: 20,
    width: '100%',
  },
  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
    paddingLeft: 4,
  },
  inputWrapper: {
    height: 54,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.overlayBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    transition: 'border-color 0.2s, background-color 0.2s, box-shadow 0.2s',
  },
  focusedWrapper: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    boxShadow: `0 0 0 2px ${colors.primary}33`,
  },
  input: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
    height: '100%',
    width: '100%',
    outlineStyle: 'none', // Remove default web input ring outline
  },
});
