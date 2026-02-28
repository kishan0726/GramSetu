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

  useEffect(() => {
    loadSavedLanguage();
  }, []);

  // Load Saved Language
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

  // Handle Language Change
  const handleLanguageChange = async (selectedLanguage) => {
    try {
      await AsyncStorage.setItem('userLanguage', selectedLanguage);

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
      {/* English Button */}
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

      {/* Gujarati Button */}
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

// Stylesheet
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