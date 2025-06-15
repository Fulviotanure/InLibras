import React, { useState } from 'react';
import { TextInput, StyleSheet } from 'react-native';

const TimeInput = ({ value, onChangeText, placeholder = "hh:mm", style }) => {
  const [displayValue, setDisplayValue] = useState('');

  const handleInput = (text) => {
    // Remove any non-digit characters
    let val = text.replace(/[^0-9]/g, '');

    // Format the value
    if (val.length >= 3) {
      val = val.slice(0, 4);
      val = val.slice(0, 2) + ':' + val.slice(2);
    } else if (val.length >= 2) {
      val = val.slice(0, 2) + ':';
    }

    setDisplayValue(val);
    onChangeText?.(val);
  };

  const handleBlur = () => {
    let val = displayValue.replace(/[^0-9]/g, '');
    let h = '00';
    let m = '00';

    if (val.length === 1) {
      h = '0' + val;
    } else if (val.length === 2) {
      h = val;
    } else if (val.length === 3) {
      h = val.slice(0, 1);
      m = val.slice(1);
    } else if (val.length === 4) {
      h = val.slice(0, 2);
      m = val.slice(2);
    }

    const formattedValue = h.padStart(2, '0') + ':' + m.padStart(2, '0');
    setDisplayValue(formattedValue);
    onChangeText?.(formattedValue);
  };

  return (
    <TextInput
      value={displayValue}
      onChangeText={handleInput}
      onBlur={handleBlur}
      placeholder={placeholder}
      maxLength={5}
      keyboardType="numeric"
      style={[styles.input, style]}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: '#fff',
    width: 100,
  },
});

export default TimeInput; 