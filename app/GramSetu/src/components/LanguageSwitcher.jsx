// LanguageSwitcher.js
import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage, languages } from '../context/LanguageContext';

const LanguageSwitcher = () => {
  const { language, toggleLanguage, setLanguage } = useLanguage();

  // Load saved language on component mount
  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('userLanguage');
      if (savedLanguage && setLanguage) {
        setLanguage(savedLanguage);
      }
    } catch (error) {
      console.log('Error loading language:', error);
    }
  };

  const handleLanguageChange = async (selectedLanguage) => {
    try {
      // Save to AsyncStorage
      await AsyncStorage.setItem('userLanguage', selectedLanguage);
      
      // Update context state
      if (setLanguage) {
        setLanguage(selectedLanguage);
      }
    } catch (error) {
      console.log('Error saving language:', error);
      Alert.alert('Error', 'Failed to change language');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.languageButton,
          language === languages.ENGLISH && styles.activeLanguage,
        ]}
        onPress={() => handleLanguageChange(languages.ENGLISH)}
      >
        <Text style={[
          styles.languageText,
          language === languages.ENGLISH && styles.activeLanguageText,
        ]}>
          English
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.languageButton,
          language === languages.GUJARATI && styles.activeLanguage,
        ]}
        onPress={() => handleLanguageChange(languages.GUJARATI)}
      >
        <Text style={[
          styles.languageText,
          language === languages.GUJARATI && styles.activeLanguageText,
        ]}>
          ગુજરાતી
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  languageButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  activeLanguage: {
    backgroundColor: '#38bdf8',
    borderColor: '#0ea5e9',
  },
  languageText: {
    fontSize: 14,
    color: '#64748b',
  },
  activeLanguageText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default LanguageSwitcher;