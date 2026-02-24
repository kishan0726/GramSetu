// src/context/LanguageContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LanguageContext = createContext();

export const languages = {
  ENGLISH: 'en',
  GUJARATI: 'gu',
};

export const translations = {
  // Welcome Screen
  welcome: {
    en: 'Welcome!',
    gu: 'સ્વાગત છે!',
  },
  appName: {
    en: 'GramSetu',
    gu: 'ગ્રામસેતુ',
  },
  appSubtitle: {
    en: 'Gram Panchayat Management System',
    gu: 'ગ્રામ પંચાયત મેનેજમેન્ટ સિસ્ટમ',
  },
  selectLoginType: {
    en: 'Please select your login type to continue',
    gu: 'ચાલુ રાખવા માટે કૃપા કરીને તમારો લોગિન પ્રકાર પસંદ કરો',
  },
  loginAsCitizen: {
    en: 'Login as Citizen',
    gu: 'નાગરિક તરીકે લોગિન કરો',
  },
  loginAsShopkeeper: {
    en: 'Login as Shopkeeper',
    gu: 'દુકાનદાર તરીકે લોગિન કરો',
  },
  newCitizenInfo: {
    en: 'New citizen? Register at Gram Panchayat office',
    gu: 'નવા નાગરિક? ગ્રામ પંચાયત કચેરીમાં રજીસ્ટર કરાવો',
  },
  newShopkeeperInfo: {
    en: 'New shopkeeper? Click on Shopkeeper login to register',
    gu: 'નવા દુકાનદાર? રજીસ્ટ્રેશન માટે દુકાનદાર લોગિન પર ક્લિક કરો',
  },

  // Common
  back: {
    en: 'Back',
    gu: 'પાછળ',
  },
  backToWelcome: {
    en: 'Back to Welcome',
    gu: 'સ્વાગત પેજ પર પાછા જાઓ',
  },
  password: {
    en: 'Password',
    gu: 'પાસવર્ડ',
  },
  enterPassword: {
    en: 'Enter your password',
    gu: 'તમારો પાસવર્ડ દાખલ કરો',
  },
  forgotPassword: {
    en: 'Forgot Password?',
    gu: 'પાસવર્ડ ભૂલી ગયા?',
  },
  needHelp: {
    en: 'Need Help?',
    gu: 'મદદ જોઈએ છે?',
  },
  contactOfficer: {
    en: 'Contact your village officer for assistance',
    gu: 'સહાય માટે તમારા ગ્રામ અધિકારીનો સંપર્ક કરો',
  },
  contactNumber: {
    en: '📞 1800-123-4567',
    gu: '📞 ૧૮૦૦-૧૨૩-૪૫૬૭',
  },
  allRightsReserved: {
    en: 'All rights reserved',
    gu: 'સર્વાધિકાર સુરક્ષિત',
  },

  // User Login
  citizenLogin: {
    en: 'Citizen Login',
    gu: 'નાગરિક લોગિન',
  },
  userId: {
    en: 'User ID',
    gu: 'વપરાશકર્તા આઈડી',
  },
  enterUserId: {
    en: 'Enter your User ID',
    gu: 'તમારો વપરાશકર્તા આઈડી દાખલ કરો',
  },
  userIdRequired: {
    en: 'User ID is required',
    gu: 'વપરાશકર્તા આઈડી આવશ્યક છે',
  },
  passwordRequired: {
    en: 'Password is required',
    gu: 'પાસવર્ડ આવશ્યક છે',
  },
  newCitizenNote: {
    en: 'New citizens need to register at the Gram Panchayat office to get a User ID.',
    gu: 'નવા નાગરિકોએ વપરાશકર્તા આઈડી મેળવવા ગ્રામ પંચાયત કચેરીમાં રજીસ્ટર કરાવવું જરૂરી છે.',
  },

  // Shopkeeper Login
  shopkeeperLogin: {
    en: 'Shopkeeper Login',
    gu: 'દુકાનદાર લોગિન',
  },
  shopId: {
    en: 'Shop ID',
    gu: 'દુકાન આઈડી',
  },
  enterShopId: {
    en: 'Enter your Shop ID',
    gu: 'તમારો દુકાન આઈડી દાખલ કરો',
  },
  shopIdRequired: {
    en: 'Shop ID is required',
    gu: 'દુકાન આઈડી આવશ્યક છે',
  },
  newShopkeeper: {
    en: 'New shopkeeper?',
    gu: 'નવા દુકાનદાર?',
  },
  registerHere: {
    en: 'Register here',
    gu: 'અહીં રજીસ્ટર કરો',
  },
  shopRegistration: {
    en: 'Contact Gram Panchayat office for shop registration',
    gu: 'દુકાન રજીસ્ટ્રેશન માટે ગ્રામ પંચાયત કચેરીનો સંપર્ક કરો',
  },
  loginToManageShop: {
    en: 'Login to manage your shop',
    gu: 'તમારી દુકાન મેનેજ કરવા માટે લોગિન કરો',
  },
  login: {
    en: 'Login',
    gu: 'લોગિન',
  },
  success: {
    en: 'Success',
    gu: 'સફળ',
  },
  loginSuccess: {
    en: 'Shopkeeper login successful!',
    gu: 'દુકાનદાર લોગિન સફળ!',
  },

  // Shopkeeper Signup
  shopRegistration_title: {
    en: 'Shop Registration',
    gu: 'દુકાન રજીસ્ટ્રેશન',
  },
  registerYourShop: {
    en: 'Register your shop with Gram Panchayat',
    gu: 'ગ્રામ પંચાયત સાથે તમારી દુકાન રજીસ્ટર કરો',
  },
  shopName: {
    en: 'Shop Name',
    gu: 'દુકાનનું નામ',
  },
  enterShopName: {
    en: 'Enter shop name',
    gu: 'દુકાનનું નામ દાખલ કરો',
  },
  shopNameRequired: {
    en: 'Shop name is required',
    gu: 'દુકાનનું નામ આવશ્યક છે',
  },
  ownerName: {
    en: 'Owner Name',
    gu: 'માલિકનું નામ',
  },
  enterOwnerName: {
    en: "Enter owner's full name",
    gu: 'માલિકનું પૂરું નામ દાખલ કરો',
  },
  ownerNameRequired: {
    en: 'Owner name is required',
    gu: 'માલિકનું નામ આવશ્યક છે',
  },
  shopType: {
    en: 'Shop Type',
    gu: 'દુકાનનો પ્રકાર',
  },
  enterShopType: {
    en: 'e.g., Grocery, Hardware, Medical',
    gu: 'દા.ત., કરિયાણું, હાર્ડવેર, મેડિકલ',
  },
  shopTypeRequired: {
    en: 'Shop type is required',
    gu: 'દુકાનનો પ્રકાર આવશ્યક છે',
  },
  mobileNumber: {
    en: 'Mobile Number',
    gu: 'મોબાઈલ નંબર',
  },
  enterMobileNumber: {
    en: '10-digit mobile number',
    gu: '૧૦-અંકનો મોબાઈલ નંબર',
  },
  mobileRequired: {
    en: 'Mobile number is required',
    gu: 'મોબાઈલ નંબર આવશ્યક છે',
  },
  validMobile: {
    en: 'Enter valid 10-digit mobile number',
    gu: 'માન્ય ૧૦-અંકનો મોબાઈલ નંબર દાખલ કરો',
  },
  email: {
    en: 'Email (Optional)',
    gu: 'ઈમેલ (વૈકલ્પિક)',
  },
  enterEmail: {
    en: 'Enter email address',
    gu: 'ઈમેલ સરનામું દાખલ કરો',
  },
  validEmail: {
    en: 'Enter valid email address',
    gu: 'માન્ય ઈમેલ સરનામું દાખલ કરો',
  },
  address: {
    en: 'Shop Address',
    gu: 'દુકાનનું સરનામું',
  },
  enterAddress: {
    en: 'Enter complete address',
    gu: 'સંપૂર્ણ સરનામું દાખલ કરો',
  },
  addressRequired: {
    en: 'Address is required',
    gu: 'સરનામું આવશ્યક છે',
  },
  createPassword: {
    en: 'Create password (min. 6 characters)',
    gu: 'પાસવર્ડ બનાવો (લઘુત્તમ ૬ અક્ષરો)',
  },
  passwordMinLength: {
    en: 'Password must be at least 6 characters',
    gu: 'પાસવર્ડ ઓછામાં ઓછા ૬ અક્ષરોનો હોવો જોઈએ',
  },
  confirmPassword: {
    en: 'Confirm Password',
    gu: 'પાસવર્ડની પુષ્ટિ કરો',
  },
  reenterPassword: {
    en: 'Re-enter password',
    gu: 'પાસવર્ડ ફરીથી દાખલ કરો',
  },
  passwordMismatch: {
    en: 'Passwords do not match',
    gu: 'પાસવર્ડ મેળ ખાતા નથી',
  },
  termsAndConditions: {
    en: 'Terms & Conditions',
    gu: 'નિયમો અને શરતો',
  },
  agreeToTerms: {
    en: 'By registering, you agree to the',
    gu: 'રજીસ્ટ્રેશન કરીને, તમે સહમત થાઓ છો',
  },
  registerShop: {
    en: 'Register Shop',
    gu: 'દુકાન રજીસ્ટર કરો',
  },
  alreadyHaveAccount: {
    en: 'Already have an account?',
    gu: 'પહેલેથી એકાઉન્ટ છે?',
  },
  loginHere: {
    en: 'Login here',
    gu: 'અહીં લોગિન કરો',
  },
  registrationSuccess: {
    en: 'Registration successful! Please login with your credentials.',
    gu: 'રજીસ્ટ્રેશન સફળ! કૃપા કરીને તમારા ઓળખપત્રો સાથે લોગિન કરો.',
  },
  backToLogin: {
    en: 'Back to Login',
    gu: 'લોગિન પર પાછા જાઓ',
  },

  // Dashboard Screen
  dashboard: {
    en: 'Dashboard',
    gu: 'ડેશબોર્ડ',
  },
  welcomeBack: {
    en: 'Welcome back,',
    gu: 'પાછા સ્વાગત છે,',
  },
  quickActions: {
    en: 'Quick Actions',
    gu: 'ઝડપી ક્રિયાઓ',
  },
  map: {
    en: 'Map',
    gu: 'નકશો',
  },
  complaints: {
    en: 'Complaints',
    gu: 'ફરિયાદો',
  },
  shops: {
    en: 'Shops',
    gu: 'દુકાનો',
  },
  publicServices: {
    en: 'Services',
    gu: 'સેવાઓ',
  },
  announcements: {
    en: 'Announcements',
    gu: 'જાહેરાતો',
  },
  myAnimals: {
    en: 'My Animals',
    gu: 'મારા પ્રાણીઓ',
  },
  schemes: {
    en: 'Schemes',
    gu: 'યોજનાઓ',
  },
  profile: {
    en: 'Profile',
    gu: 'પ્રોફાઇલ',
  },
  recentAnnouncements: {
    en: 'Recent Announcements',
    gu: 'તાજેતરની જાહેરાતો',
  },
  seeAll: {
    en: 'See All',
    gu: 'બધા જુઓ',
  },
  gramSabhaMeeting: {
    en: 'Gram Sabha Meeting',
    gu: 'ગ્રામ સભા બેઠક',
  },
  gramSabhaDesc: {
    en: 'Monthly gram sabha meeting at community hall',
    gu: 'સામુદાયિક હોલમાં માસિક ગ્રામ સભા બેઠક',
  },
  waterSupply: {
    en: 'Water Supply',
    gu: 'પાણી પુરવઠો',
  },
  waterSupplyDesc: {
    en: 'Water supply schedule for tomorrow',
    gu: 'કાલે પાણી પુરવઠાનું શેડ્યૂલ',
  },
  servicesStatus: {
    en: 'Services Status',
    gu: 'સેવાઓની સ્થિતિ',
  },
  electricity: {
    en: 'Electricity',
    gu: 'વીજળી',
  },
  roadMaintenance: {
    en: 'Road Maintenance',
    gu: 'રોડ જાળવણી',
  },
  active: {
    en: 'Active',
    gu: 'સક્રિય',
  },
  maintenance: {
    en: 'Maintenance',
    gu: 'જાળવણી',
  },
  inactive: {
    en: 'Inactive',
    gu: 'નિષ્ક્રિય',
  },
  viewDetails: {
    en: 'View Details',
    gu: 'વિગતો જુઓ',
  },
  emergencyContacts: {
    en: 'Emergency Contacts',
    gu: 'આપાતકાલ સંપર્કો',
  },
  police: {
    en: 'Police',
    gu: 'પોલીસ',
  },
  ambulance: {
    en: 'Ambulance',
    gu: 'એમ્બ્યુલન્સ',
  },
  fire: {
    en: 'Fire',
    gu: 'ફાયર',
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(languages.ENGLISH);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved language on mount
  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('userLanguage');
      if (savedLanguage) {
        setLanguage(savedLanguage);
      }
    } catch (error) {
      console.log('Error loading language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLanguage = async () => {
    const newLanguage = language === languages.ENGLISH ? languages.GUJARATI : languages.ENGLISH;

    // Update state
    setLanguage(newLanguage);

    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem('userLanguage', newLanguage);
    } catch (error) {
      console.log('Error saving language:', error);
    }
  };

  const setLanguageDirect = async (newLanguage) => {
    if (newLanguage === language) return;

    // Update state
    setLanguage(newLanguage);

    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem('userLanguage', newLanguage);
    } catch (error) {
      console.log('Error saving language:', error);
    }
  };

  const t = (key) => {
    return translations[key]?.[language] || key;
  };

  if (isLoading) {
    return null; // Or return a loading spinner if you want
  }

  return (
    <LanguageContext.Provider value={{
      language,
      toggleLanguage,
      setLanguage: setLanguageDirect,
      t,
      isLoading
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};