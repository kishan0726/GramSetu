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
  more: {
    en: 'More',
    gu: 'વધુ',
  },
  electricityMaintenance: {
    en: 'Electricity Maintenance',
    gu: 'વીજળી જાળવણી',
  },
  electricityDesc: {
    en: 'Scheduled maintenance on Wednesday',
    gu: 'બુધવારે સુનિશ્ચિત જાળવણી',
  },
  healthCamp: {
    en: 'Free Health Camp',
    gu: 'મફત આરોગ્ય શિબિર',
  },
  healthCampDesc: {
    en: 'Free health checkup at community center',
    gu: 'સામુદાયિક કેન્દ્રમાં મફત આરોગ્ય તપાસ',
  },
  roadRepair: {
    en: 'Road Repair Work',
    gu: 'રોડ રિપેર કામ',
  },
  roadRepairDesc: {
    en: 'Main road repair starts Monday',
    gu: 'સોમવારથી મુખ્ય માર્ગનું સમારકામ શરૂ થશે',
  },
  disaster: {
    en: 'Disaster',
    gu: 'આપત્તિ',
  },
  callPolice: {
    en: 'Calling Police...',
    gu: 'પોલીસને કૉલ કરી રહ્યા છે...',
  },
  callAmbulance: {
    en: 'Calling Ambulance...',
    gu: 'એમ્બ્યુલન્સને કૉલ કરી રહ્યા છે...',
  },
  callFire: {
    en: 'Calling Fire Department...',
    gu: 'ફાયર વિભાગને કૉલ કરી રહ્યા છે...',
  },
  callElectricity: {
    en: 'Calling Electricity Board...',
    gu: 'વીજળી બોર્ડને કૉલ કરી રહ્યા છે...',
  },
  callDisaster: {
    en: 'Calling Disaster Management...',
    gu: 'આપત્તિ વ્યવસ્થાપનને કૉલ કરી રહ્યા છે...',
  },

  // announcement
  all: {
    en: 'All',
    gu: 'બધા',
  },
  general: {
    en: 'General',
    gu: 'સામાન્ય',
  },
  health: {
    en: 'Health',
    gu: 'આરોગ્ય',
  },
  utility: {
    en: 'Utility',
    gu: 'ઉપયોગિતા',
  },
  agriculture: {
    en: 'Agriculture',
    gu: 'કૃષિ',
  },
  environment: {
    en: 'Environment',
    gu: 'પર્યાવરણ',
  },
  infrastructure: {
    en: 'Infrastructure',
    gu: 'ઈન્ફ્રાસ્ટ્રક્ચર',
  },
  education: {
    en: 'Education',
    gu: 'શિક્ષણ',
  },
  sports: {
    en: 'Sports',
    gu: 'રમતગમત',
  },
  finance: {
    en: 'Finance',
    gu: 'નાણાં',
  },
  urgent: {
    en: 'Urgent',
    gu: 'તાકીદનું',
  },
  high: {
    en: 'High',
    gu: 'ઉચ્ચ',
  },
  normal: {
    en: 'Normal',
    gu: 'સામાન્ય',
  },
  priority: {
    en: 'Priority',
    gu: 'પ્રાથમિકતા',
  },
  today: {
    en: 'Today',
    gu: 'આજે',
  },
  yesterday: {
    en: 'Yesterday',
    gu: 'ગઈકાલે',
  },
  daysAgo: {
    en: 'days ago',
    gu: 'દિવસ પહેલા',
  },
  attachment: {
    en: 'Attachment',
    gu: 'જોડાણ',
  },
  showRecent: {
    en: 'Show Recent',
    gu: 'તાજેતરના બતાવો',
  },
  latestAnnouncements: {
    en: 'Latest Announcements',
    gu: 'તાજેતરની જાહેરાતો',
  },
  allAnnouncements: {
    en: 'All Announcements',
    gu: 'બધી જાહેરાતો',
  },
  announcements: {
    en: 'Announcements',
    gu: 'જાહેરાતો',
  },
  noAnnouncements: {
    en: 'No announcements found',
    gu: 'કોઈ જાહેરાત મળી નથી',
  },
  loadingAnnouncements: {
    en: 'Loading announcements...',
    gu: 'જાહેરાતો લોડ થાય છે...',
  },
  expiresOn: {
    en: 'Expires on',
    gu: 'સમાપ્તિ તારીખ',
  },
  announcementId: {
    en: 'Announcement ID',
    gu: 'જાહેરાત ID',
  },
  createdAt: {
    en: 'Created at',
    gu: 'બનાવવામાં આવી',
  },
  farmers: {
    en: 'Farmers',
    gu: 'ખેડૂતો',
  },
  senior_citizens: {
    en: 'Senior Citizens',
    gu: 'વરિષ્ઠ નાગરિકો',
  },
  youth: {
    en: 'Youth',
    gu: 'યુવાનો',
  },
  women: {
    en: 'Women',
    gu: 'મહિલાઓ',
  },
  all: {
    en: 'All',
    gu: 'બધા',
  },



  // complaints
  complaints: {
    en: 'Complaints',
    gu: 'ફરિયાદો',
  },
  registerNewComplaint: {
    en: 'Register New Complaint',
    gu: 'નવી ફરિયાદ નોંધાવો',
  },
  total: {
    en: 'Total',
    gu: 'કુલ',
  },
  pending: {
    en: 'Pending',
    gu: 'બાકી',
  },
  inProgress: {
    en: 'In Progress',
    gu: 'પ્રગતિમાં',
  },
  resolved: {
    en: 'Resolved',
    gu: 'ઉકેલાયેલ',
  },
  rejected: {
    en: 'Rejected',
    gu: 'નામંજૂર',
  },
  category: {
    en: 'Category',
    gu: 'શ્રેણી',
  },
  status: {
    en: 'Status',
    gu: 'સ્થિતિ',
  },
  water: {
    en: 'Water',
    gu: 'પાણી',
  },
  electricity: {
    en: 'Electricity',
    gu: 'વીજળી',
  },
  road: {
    en: 'Road',
    gu: 'રોડ',
  },
  sanitation: {
    en: 'Sanitation',
    gu: 'સ્વચ્છતા',
  },
  drainage: {
    en: 'Drainage',
    gu: 'ડ્રેનેજ',
  },
  animal: {
    en: 'Animal',
    gu: 'પ્રાણી',
  },
  urgent: {
    en: 'Urgent',
    gu: 'તાકીદનું',
  },
  high: {
    en: 'High',
    gu: 'ઉચ્ચ',
  },
  medium: {
    en: 'Medium',
    gu: 'મધ્યમ',
  },
  low: {
    en: 'Low',
    gu: 'નીચું',
  },
  submitted: {
    en: 'Submitted',
    gu: 'સબમિટ કરેલ',
  },
  lastUpdated: {
    en: 'Last Updated',
    gu: 'છેલ્લે અપડેટ',
  },
  department: {
    en: 'Department',
    gu: 'વિભાગ',
  },
  assignedTo: {
    en: 'Assigned To',
    gu: 'સોંપાયેલ',
  },
  location: {
    en: 'Location',
    gu: 'સ્થળ',
  },
  viewOnMap: {
    en: 'View on Map',
    gu: 'નકશા પર જુઓ',
  },
  attachments: {
    en: 'Attachments',
    gu: 'જોડાણો',
  },
  complaintId: {
    en: 'Complaint ID',
    gu: 'ફરિયાદ ID',
  },
  complaintTitle: {
    en: 'Complaint Title',
    gu: 'ફરિયાદનું શીર્ષક',
  },
  enterComplaintTitle: {
    en: 'Enter complaint title',
    gu: 'ફરિયાદનું શીર્ષક દાખલ કરો',
  },
  describeComplaint: {
    en: 'Describe your complaint in detail',
    gu: 'તમારી ફરિયાદ વિગતવાર વર્ણવો',
  },
  enterAddress: {
    en: 'Enter complete address',
    gu: 'સંપૂર્ણ સરનામું દાખલ કરો',
  },
  getCurrentLocation: {
    en: 'Get Current Location',
    gu: 'વર્તમાન સ્થાન મેળવો',
  },
  locationCaptured: {
    en: 'Location captured successfully',
    gu: 'સ્થાન સફળતાપૂર્વક મેળવાયું',
  },
  addPhotos: {
    en: 'Add Photos',
    gu: 'ફોટા ઉમેરો',
  },
  submitComplaint: {
    en: 'Submit Complaint',
    gu: 'ફરિયાદ સબમિટ કરો',
  },
  requiredFields: {
    en: 'Required fields',
    gu: 'આવશ્યક ફીલ્ડ્સ',
  },
  noComplaints: {
    en: 'No complaints found',
    gu: 'કોઈ ફરિયાદ મળી નથી',
  },
  beFirstToComplain: {
    en: 'Be the first to register a complaint',
    gu: 'ફરિયાદ નોંધાવનાર પ્રથમ બનો',
  },
  registerComplaint: {
    en: 'Register Complaint',
    gu: 'ફરિયાદ નોંધાવો',
  },
  loadingComplaints: {
    en: 'Loading complaints...',
    gu: 'ફરિયાદો લોડ થાય છે...',
  },
  latestComplaints: {
    en: 'Latest Complaints',
    gu: 'તાજેતરની ફરિયાદો',
  },
  allComplaints: {
    en: 'All Complaints',
    gu: 'બધી ફરિયાદો',
  },
  showRecent: {
    en: 'Show Recent',
    gu: 'તાજેતરની બતાવો',
  },
  seeAll: {
    en: 'See All',
    gu: 'બધી જુઓ',
  },
  enterTitle: {
    en: 'Please enter complaint title',
    gu: 'કૃપા કરીને ફરિયાદનું શીર્ષક દાખલ કરો',
  },
  enterDescription: {
    en: 'Please enter complaint description',
    gu: 'કૃપા કરીને ફરિયાદનું વર્ણન દાખલ કરો',
  },
  selectCategory: {
    en: 'Please select a category',
    gu: 'કૃપા કરીને શ્રેણી પસંદ કરો',
  },
  enterAddress: {
    en: 'Please enter address',
    gu: 'કૃપા કરીને સરનામું દાખલ કરો',
  },
  complaintSubmitted: {
    en: 'Your complaint has been submitted successfully!',
    gu: 'તમારી ફરિયાદ સફળતાપૂર્વક સબમિટ થઈ ગઈ છે!',
  },
  locationFeatureComing: {
    en: 'Location feature will be implemented with actual GPS',
    gu: 'લોકેશન ફીચર વાસ્તવિક GPS સાથે લાગુ કરવામાં આવશે',
  },
  ok: {
    en: 'OK',
    gu: 'બરાબર',
  },
  error: {
    en: 'Error',
    gu: 'ભૂલ',
  },
  success: {
    en: 'Success',
    gu: 'સફળતા',
  },


  // service
  publicServices: {
    en: 'Public Services',
    gu: 'જાહેર સેવાઓ',
  },
  totalServices: {
    en: 'Total Services',
    gu: 'કુલ સેવાઓ',
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
  utility: {
    en: 'Utility',
    gu: 'ઉપયોગિતા',
  },
  infrastructure: {
    en: 'Infrastructure',
    gu: 'ઈન્ફ્રાસ્ટ્રક્ચર',
  },
  health: {
    en: 'Health',
    gu: 'આરોગ્ય',
  },
  education: {
    en: 'Education',
    gu: 'શિક્ષણ',
  },
  transport: {
    en: 'Transport',
    gu: 'પરિવહન',
  },
  emergency: {
    en: 'Emergency',
    gu: 'કટોકટી',
  },
  schedule: {
    en: 'Schedule',
    gu: 'સમયપત્રક',
  },
  department: {
    en: 'Department',
    gu: 'વિભાગ',
  },
  contact: {
    en: 'Contact',
    gu: 'સંપર્ક',
  },
  lastUpdated: {
    en: 'Last Updated',
    gu: 'છેલ્લે અપડેટ',
  },
  serviceDetails: {
    en: 'Service Details',
    gu: 'સેવાની વિગતો',
  },
  coverage: {
    en: 'Coverage',
    gu: 'કવરેજ',
  },
  nextMaintenance: {
    en: 'Next Maintenance',
    gu: 'આગામી જાળવણી',
  },
  quality: {
    en: 'Quality',
    gu: 'ગુણવત્તા',
  },
  pressure: {
    en: 'Pressure',
    gu: 'દબાણ',
  },
  voltage: {
    en: 'Voltage',
    gu: 'વોલ્ટેજ',
  },
  responseTime: {
    en: 'Response Time',
    gu: 'પ્રતિસાદ સમય',
  },
  activeComplaints: {
    en: 'Active Complaints',
    gu: 'સક્રિય ફરિયાદો',
  },
  callNow: {
    en: 'Call Now',
    gu: 'હમણાં કૉલ કરો',
  },
  navigate: {
    en: 'Navigate',
    gu: 'નેવિગેટ કરો',
  },
  loadingServices: {
    en: 'Loading services...',
    gu: 'સેવાઓ લોડ થાય છે...',
  },
  noServices: {
    en: 'No services found',
    gu: 'કોઈ સેવાઓ મળી નથી',
  },
  services: {
    en: 'services',
    gu: 'સેવાઓ',
  },


  // shop
  shops: {
    en: 'Shops',
    gu: 'દુકાનો',
  },
  grocery: {
    en: 'Grocery',
    gu: 'કરિયાણું',
  },
  medical: {
    en: 'Medical',
    gu: 'મેડિકલ',
  },
  hardware: {
    en: 'Hardware',
    gu: 'હાર્ડવેર',
  },
  electronics: {
    en: 'Electronics',
    gu: 'ઇલેક્ટ્રોનિક્સ',
  },
  food: {
    en: 'Food',
    gu: 'ખાદ્ય',
  },
  stationery: {
    en: 'Stationery',
    gu: 'સ્ટેશનરી',
  },
  dairy: {
    en: 'Dairy',
    gu: 'ડેરી',
  },
  agriculture: {
    en: 'Agriculture',
    gu: 'કૃષિ',
  },
  searchShops: {
    en: 'Search shops or items...',
    gu: 'દુકાનો અથવા વસ્તુઓ શોધો...',
  },
  searchItems: {
    en: 'Search Items',
    gu: 'વસ્તુઓ શોધો',
  },
  searchForItem: {
    en: 'Search for an item...',
    gu: 'વસ્તુ શોધો...',
  },
  searchForItemPrompt: {
    en: 'Search for any item to find which shops have it',
    gu: 'કોઈપણ વસ્તુ શોધો કે જે દુકાનોમાં ઉપલબ્ધ છે',
  },
  noShopsFound: {
    en: 'No shops found',
    gu: 'કોઈ દુકાન મળી નથી',
  },
  tryChangingFilters: {
    en: 'Try changing your search or filters',
    gu: 'તમારી શોધ અથવા ફિલ્ટર બદલીને જુઓ',
  },
  loadingShops: {
    en: 'Loading shops...',
    gu: 'દુકાનો લોડ થાય છે...',
  },
  verified: {
    en: 'Verified',
    gu: 'ચકાસાયેલ',
  },
  verifiedShop: {
    en: 'Verified Shop',
    gu: 'ચકાસાયેલ દુકાન',
  },
  delivery: {
    en: 'Delivery',
    gu: 'ડિલિવરી',
  },
  timing: {
    en: 'Timing',
    gu: 'સમય',
  },
  phone: {
    en: 'Phone',
    gu: 'ફોન',
  },
  email: {
    en: 'Email',
    gu: 'ઈમેલ',
  },
  payment: {
    en: 'Payment',
    gu: 'ચુકવણી',
  },
  cash: {
    en: 'Cash',
    gu: 'રોકડ',
  },
  upi: {
    en: 'UPI',
    gu: 'યુપીઆઈ',
  },
  card: {
    en: 'Card',
    gu: 'કાર્ડ',
  },
  inventory: {
    en: 'Inventory',
    gu: 'ઇન્વેન્ટરી',
  },
  items: {
    en: 'items',
    gu: 'વસ્તુઓ',
  },
  available: {
    en: 'Available',
    gu: 'ઉપલબ્ધ',
  },
  outOfStock: {
    en: 'Out of Stock',
    gu: 'સ્ટોક નથી',
  },
  navigateToShop: {
    en: 'Navigate to Shop',
    gu: 'દુકાન પર જાઓ',
  },
  call: {
    en: 'Call',
    gu: 'કૉલ કરો',
  },
  calling: {
    en: 'Calling',
    gu: 'કૉલ કરી રહ્યા છે',
  },
  reviews: {
    en: 'reviews',
    gu: 'સમીક્ષાઓ',
  },
  noItemsFound: {
    en: 'No items found',
    gu: 'કોઈ વસ્તુ મળી નથી',
  },
  tryDifferentItem: {
    en: 'Try searching for a different item',
    gu: 'અલગ વસ્તુ શોધીને જુઓ',
  },
  found: {
    en: 'found',
    gu: 'મળ્યા',
  },
  availableItems: {
    en: 'Available Items',
    gu: 'ઉપલબ્ધ વસ્તુઓ',
  },
  inStock: {
    en: 'In Stock',
    gu: 'સ્ટોકમાં છે',
  },


  // profile
  profile: {
    en: 'Profile',
    gu: 'પ્રોફાઇલ',
  },
  loadingProfile: {
    en: 'Loading profile...',
    gu: 'પ્રોફાઇલ લોડ થાય છે...',
  },
  profileUpdated: {
    en: 'Profile updated successfully!',
    gu: 'પ્રોફાઇલ સફળતાપૂર્વક અપડેટ થઈ!',
  },
  personalInfo: {
    en: 'Personal',
    gu: 'વ્યક્તિગત',
  },
  contactInfo: {
    en: 'Contact',
    gu: 'સંપર્ક',
  },
  documents: {
    en: 'Documents',
    gu: 'દસ્તાવેજો',
  },
  personalDetails: {
    en: 'Personal Details',
    gu: 'વ્યક્તિગત વિગતો',
  },
  contactDetails: {
    en: 'Contact Details',
    gu: 'સંપર્ક વિગતો',
  },
  documentDetails: {
    en: 'Document Details',
    gu: 'દસ્તાવેજ વિગતો',
  },
  fullName: {
    en: 'Full Name',
    gu: 'પૂરું નામ',
  },
  dateOfBirth: {
    en: 'Date of Birth',
    gu: 'જન્મ તારીખ',
  },
  age: {
    en: 'Age',
    gu: 'ઉંમર',
  },
  ageGroup: {
    en: 'Age Group',
    gu: 'વય જૂથ',
  },
  gender: {
    en: 'Gender',
    gu: 'લિંગ',
  },
  bloodGroup: {
    en: 'Blood Group',
    gu: 'રક્ત જૂથ',
  },
  maritalStatus: {
    en: 'Marital Status',
    gu: 'વૈવાહિક સ્થિતિ',
  },
  education: {
    en: 'Education',
    gu: 'શિક્ષણ',
  },
  occupation: {
    en: 'Occupation',
    gu: 'વ્યવસાય',
  },
  address: {
    en: 'Address',
    gu: 'સરનામું',
  },
  contactNumber: {
    en: 'Contact Number',
    gu: 'સંપર્ક નંબર',
  },
  email: {
    en: 'Email',
    gu: 'ઈમેલ',
  },
  familyMembers: {
    en: 'Family Members',
    gu: 'પરિવારના સભ્યો',
  },
  aadharNumber: {
    en: 'Aadhar Number',
    gu: 'આધાર નંબર',
  },
  voterId: {
    en: 'Voter ID',
    gu: 'વોટર ID',
  },
  rationCardNumber: {
    en: 'Ration Card Number',
    gu: 'રેશન કાર્ડ નંબર',
  },
  disabilityDetails: {
    en: 'Disability Details',
    gu: 'વિકલાંગતા વિગતો',
  },
  none: {
    en: 'None',
    gu: 'કોઈ નહીં',
  },
  changePassword: {
    en: 'Change Password',
    gu: 'પાસવર્ડ બદલો',
  },
  currentPassword: {
    en: 'Current Password',
    gu: 'વર્તમાન પાસવર્ડ',
  },
  newPassword: {
    en: 'New Password',
    gu: 'નવો પાસવર્ડ',
  },
  confirmPassword: {
    en: 'Confirm Password',
    gu: 'પાસવર્ડની પુષ્ટિ કરો',
  },
  enterCurrentPassword: {
    en: 'Enter current password',
    gu: 'વર્તમાન પાસવર્ડ દાખલ કરો',
  },
  enterNewPassword: {
    en: 'Enter new password',
    gu: 'નવો પાસવર્ડ દાખલ કરો',
  },
  confirmNewPassword: {
    en: 'Confirm new password',
    gu: 'નવા પાસવર્ડની પુષ્ટિ કરો',
  },
  updatePassword: {
    en: 'Update Password',
    gu: 'પાસવર્ડ અપડેટ કરો',
  },
  passwordChanged: {
    en: 'Password changed successfully!',
    gu: 'પાસવર્ડ સફળતાપૂર્વક બદલાયો!',
  },
  currentPasswordRequired: {
    en: 'Current password is required',
    gu: 'વર્તમાન પાસવર્ડ આવશ્યક છે',
  },
  newPasswordRequired: {
    en: 'New password is required',
    gu: 'નવો પાસવર્ડ આવશ્યક છે',
  },
  confirmPasswordRequired: {
    en: 'Please confirm your password',
    gu: 'કૃપા કરીને તમારા પાસવર્ડની પુષ્ટિ કરો',
  },
  passwordMinLength: {
    en: 'Password must be at least 6 characters',
    gu: 'પાસવર્ડ ઓછામાં ઓછા ૬ અક્ષરોનો હોવો જોઈએ',
  },
  passwordMismatch: {
    en: 'Passwords do not match',
    gu: 'પાસવર્ડ મેળ ખાતા નથી',
  },
  save: {
    en: 'Save',
    gu: 'સાચવો',
  },
  cancel: {
    en: 'Cancel',
    gu: 'રદ કરો',
  },










  // shopkeeper
  shopRegistration: {
    en: 'Shop Registration',
    gu: 'દુકાન નોંધણી',
  },
  registerYourShop: {
    en: 'Register Your Shop',
    gu: 'તમારી દુકાન નોંધાવો',
  },
  basicDetails: {
    en: 'Enter basic details to get started',
    gu: 'શરૂ કરવા માટે મૂળભૂત વિગતો દાખલ કરો',
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
    en: 'Enter owner name',
    gu: 'માલિકનું નામ દાખલ કરો',
  },
  ownerNameRequired: {
    en: 'Owner name is required',
    gu: 'માલિકનું નામ આવશ્યક છે',
  },
  emailRequired: {
    en: 'Email is required',
    gu: 'ઈમેલ આવશ્યક છે',
  },
  validEmail: {
    en: 'Enter a valid email',
    gu: 'માન્ય ઈમેલ દાખલ કરો',
  },
  mobileRequired: {
    en: 'Mobile number is required',
    gu: 'મોબાઈલ નંબર આવશ્યક છે',
  },
  validMobile: {
    en: 'Enter a valid 10-digit mobile number',
    gu: 'માન્ય ૧૦-અંકનો મોબાઈલ નંબર દાખલ કરો',
  },
  registrationNote: {
    en: 'After registration, you will receive a Shop ID. Your application will be reviewed by admin before approval.',
    gu: 'નોંધણી પછી, તમને દુકાન ID મળશે. મંજૂરી પહેલાં તમારી અરજી એડમિન દ્વારા સમીક્ષા કરવામાં આવશે.',
  },
  yourShopId: {
    en: 'Your Shop ID',
    gu: 'તમારી દુકાન ID',
  },
  saveShopId: {
    en: 'Please save this ID for login',
    gu: 'કૃપા કરીને લોગિન માટે આ ID સાચવો',
  },
  registrationSuccessful: {
    en: 'Registration Successful',
    gu: 'નોંધણી સફળ',
  },
  shopkeeperDashboard: {
    en: 'Shop Dashboard',
    gu: 'દુકાન ડેશબોર્ડ',
  },
  loadingShop: {
    en: 'Loading shop details...',
    gu: 'દુકાનની વિગતો લોડ થાય છે...',
  },
  applicationPending: {
    en: 'Application Pending',
    gu: 'અરજી બાકી છે',
  },
  applicationRejected: {
    en: 'Application Rejected',
    gu: 'અરજી નામંજૂર',
  },
  pendingMessage: {
    en: 'Your shop registration is under review by admin. You will be notified once approved.',
    gu: 'તમારી દુકાન નોંધણી એડમિન દ્વારા સમીક્ષા હેઠળ છે. મંજૂર થયા પછી તમને સૂચિત કરવામાં આવશે.',
  },
  rejectedMessage: {
    en: 'Your shop application has been rejected. Please update your information and try again.',
    gu: 'તમારી દુકાન અરજી નામંજૂર કરવામાં આવી છે. કૃપા કરીને તમારી માહિતી અપડેટ કરો અને ફરી પ્રયાસ કરો.',
  },
  yourDetails: {
    en: 'Your Details',
    gu: 'તમારી વિગતો',
  },
  shopId: {
    en: 'Shop ID',
    gu: 'દુકાન ID',
  },
  category: {
    en: 'Category',
    gu: 'શ્રેણી',
  },
  registrationDate: {
    en: 'Registration Date',
    gu: 'નોંધણી તારીખ',
  },
  documentStatus: {
    en: 'Document Status',
    gu: 'દસ્તાવેજ સ્થિતિ',
  },
  aadhaarCard: {
    en: 'Aadhaar Card',
    gu: 'આધાર કાર્ડ',
  },
  panCard: {
    en: 'PAN Card',
    gu: 'પાન કાર્ડ',
  },
  shopLicense: {
    en: 'Shop License',
    gu: 'દુકાન લાયસન્સ',
  },
  updateInformation: {
    en: 'Update Information',
    gu: 'માહિતી અપડેટ કરો',
  },
  updateNote: {
    en: 'You can update your documents and details here. After updating, admin will review your application again.',
    gu: 'તમે અહીં તમારા દસ્તાવેજો અને વિગતો અપડેટ કરી શકો છો. અપડેટ કર્યા પછી, એડમિન તમારી અરજીની ફરી સમીક્ષા કરશે.',
  },
  uploadDocuments: {
    en: 'Upload Documents',
    gu: 'દસ્તાવેજો અપલોડ કરો',
  },
  editDetails: {
    en: 'Edit Details',
    gu: 'વિગતો સંપાદિત કરો',
  },
  shopApproved: {
    en: 'Shop Approved',
    gu: 'દુકાન મંજૂર',
  },
  approvedMessage: {
    en: 'Your shop is now active. Start managing your inventory and products.',
    gu: 'તમારી દુકાન હવે સક્રિય છે. તમારી ઇન્વેન્ટરી અને ઉત્પાદનોનું સંચાલન શરૂ કરો.',
  },
  totalItems: {
    en: 'Total Items',
    gu: 'કુલ વસ્તુઓ',
  },
  totalStock: {
    en: 'Total Stock',
    gu: 'કુલ સ્ટોક',
  },
  inventoryValue: {
    en: 'Inventory Value',
    gu: 'ઇન્વેન્ટરી મૂલ્ય',
  },
  editShop: {
    en: 'Edit Shop',
    gu: 'દુકાન સંપાદિત કરો',
  },
  addItem: {
    en: 'Add Item',
    gu: 'વસ્તુ ઉમેરો',
  },
  manageStock: {
    en: 'Manage Stock',
    gu: 'સ્ટોક મેનેજ કરો',
  },
  reports: {
    en: 'Reports',
    gu: 'રિપોર્ટ્સ',
  },
  recentItems: {
    en: 'Recent Items',
    gu: 'તાજેતરની વસ્તુઓ',
  },
  inStock: {
    en: 'in stock',
    gu: 'સ્ટોકમાં',
  },
  addNewItem: {
    en: 'Add New Item',
    gu: 'નવી વસ્તુ ઉમેરો',
  },
  itemName: {
    en: 'Item Name',
    gu: 'વસ્તુનું નામ',
  },
  enterItemName: {
    en: 'Enter item name',
    gu: 'વસ્તુનું નામ દાખલ કરો',
  },
  price: {
    en: 'Price',
    gu: 'કિંમત',
  },
  enterPrice: {
    en: 'Enter price',
    gu: 'કિંમત દાખલ કરો',
  },
  unit: {
    en: 'Unit',
    gu: 'એકમ',
  },
  enterUnit: {
    en: 'Enter unit (kg, pcs, liter)',
    gu: 'એકમ દાખલ કરો (કિગ્રા, પીસ, લિટર)',
  },
  stock: {
    en: 'Stock',
    gu: 'સ્ટોક',
  },
  enterStock: {
    en: 'Enter stock quantity',
    gu: 'સ્ટોક જથ્થો દાખલ કરો',
  },
  fillAllFields: {
    en: 'Please fill all fields',
    gu: 'કૃપા કરીને બધા ક્ષેત્રો ભરો',
  },
  itemAdded: {
    en: 'Item added successfully',
    gu: 'વસ્તુ સફળતાપૂર્વક ઉમેરાઈ',
  },
  shopUpdated: {
    en: 'Shop details updated successfully',
    gu: 'દુકાનની વિગતો સફળતાપૂર્વક અપડેટ થઈ',
  },
  close: {
    en: 'Close',
    gu: 'બંધ કરો',
  },




  applicationStatus: {
    en: 'Application Status',
    gu: 'અરજી સ્થિતિ',
  },
  loadingData: {
    en: 'Loading data...',
    gu: 'ડેટા લોડ થાય છે...',
  },
  shopInformation: {
    en: 'Shop Information',
    gu: 'દુકાનની માહિતી',
  },
  edit: {
    en: 'Edit',
    gu: 'સંપાદિત કરો',
  },
  upload: {
    en: 'Upload',
    gu: 'અપલોડ કરો',
  },
  uploaded: {
    en: 'Uploaded',
    gu: 'અપલોડ થયેલ',
  },
  businessProof: {
    en: 'Business Proof',
    gu: 'વ્યવસાય પુરાવો',
  },
  updateShopDetails: {
    en: 'Update Shop Details',
    gu: 'દુકાનની વિગતો અપડેટ કરો',
  },
  enterDescription: {
    en: 'Enter shop description',
    gu: 'દુકાનનું વર્ણન દાખલ કરો',
  },
  enterBusinessProof: {
    en: 'Enter business proof type',
    gu: 'વ્યવસાય પુરાવાનો પ્રકાર દાખલ કરો',
  },
  uploadDocuments: {
    en: 'Upload Documents',
    gu: 'દસ્તાવેજો અપલોડ કરો',
  },
  saveChanges: {
    en: 'Save Changes',
    gu: 'ફેરફારો સાચવો',
  },
  uploadDocument: {
    en: 'Upload Document',
    gu: 'દસ્તાવેજ અપલોડ કરો',
  },
  takePhoto: {
    en: 'Take Photo',
    gu: 'ફોટો લો',
  },
  chooseFromGallery: {
    en: 'Choose from Gallery',
    gu: 'ગેલેરીમાંથી પસંદ કરો',
  },
  addressRequired: {
    en: 'Address is required',
    gu: 'સરનામું આવશ્યક છે',
  },
  categoryRequired: {
    en: 'Category is required',
    gu: 'શ્રેણી આવશ્યક છે',
  },
  descriptionRequired: {
    en: 'Description is required',
    gu: 'વર્ણન આવશ્યક છે',
  },
  pleaseFixErrors: {
    en: 'Please fix the errors in the form',
    gu: 'કૃપા કરીને ફોર્મમાં ભૂલો સુધારો',
  },
  detailsUpdated: {
    en: 'Details updated successfully',
    gu: 'વિગતો સફળતાપૂર્વક અપડેટ થઈ',
  },
  documentUploaded: {
    en: 'Document uploaded successfully',
    gu: 'દસ્તાવેજ સફળતાપૂર્વક અપલોડ થયો',
  },
  selectDocument: {
    en: 'Select Document',
    gu: 'દસ્તાવેજ પસંદ કરો',
  },
  registrationSubmitted: {
    en: 'Registration Submitted',
    gu: 'નોંધણી સબમિટ થઈ',
  },
  adminReview: {
    en: 'Admin Review',
    gu: 'એડમિન સમીક્ષા',
  },
  finalApproval: {
    en: 'Final Approval',
    gu: 'અંતિમ મંજૂરી',
  },
  inProgress: {
    en: 'In Progress',
    gu: 'પ્રગતિમાં',
  },
  approvalNote: {
    en: 'Your application is being reviewed. You can update your information anytime. Once approved, you will get full access to the dashboard.',
    gu: 'તમારી અરજીની સમીક્ષા ચાલુ છે. તમે કોઈપણ સમયે તમારી માહિતી અપડેટ કરી શકો છો. મંજૂર થયા પછી, તમને ડેશબોર્ડનો સંપૂર્ણ ઍક્સેસ મળશે.',
  },
  welcomeBack: {
    en: 'Welcome back,',
    gu: 'પાછા સ્વાગત છે,',
  },
  active: {
    en: 'Active',
    gu: 'સક્રિય',
  },
  totalItems: {
    en: 'Total Items',
    gu: 'કુલ વસ્તુઓ',
  },
  totalStock: {
    en: 'Total Stock',
    gu: 'કુલ સ્ટોક',
  },
  inventoryValue: {
    en: 'Inventory Value',
    gu: 'ઇન્વેન્ટરી મૂલ્ય',
  },
  editShop: {
    en: 'Edit Shop',
    gu: 'દુકાન સંપાદિત કરો',
  },
  addItem: {
    en: 'Add Item',
    gu: 'વસ્તુ ઉમેરો',
  },
  manageStock: {
    en: 'Manage Stock',
    gu: 'સ્ટોક મેનેજ કરો',
  },
  reports: {
    en: 'Reports',
    gu: 'રિપોર્ટ્સ',
  },
  category: {
    en: 'Category',
    gu: 'શ્રેણી',
  },
  description: {
    en: 'Description',
    gu: 'વર્ણન',
  },
  address: {
    en: 'Address',
    gu: 'સરનામું',
  },
  contact: {
    en: 'Contact',
    gu: 'સંપર્ક',
  },
  recentItems: {
    en: 'Recent Items',
    gu: 'તાજેતરની વસ્તુઓ',
  },
  inStock: {
    en: 'in stock',
    gu: 'સ્ટોકમાં',
  },
  noItems: {
    en: 'No items in inventory',
    gu: 'ઇન્વેન્ટરીમાં કોઈ વસ્તુ નથી',
  },
  addFirstItem: {
    en: 'Add First Item',
    gu: 'પ્રથમ વસ્તુ ઉમેરો',
  },
  addNewItem: {
    en: 'Add New Item',
    gu: 'નવી વસ્તુ ઉમેરો',
  },
  itemName: {
    en: 'Item Name',
    gu: 'વસ્તુનું નામ',
  },
  enterItemName: {
    en: 'Enter item name',
    gu: 'વસ્તુનું નામ દાખલ કરો',
  },
  price: {
    en: 'Price',
    gu: 'કિંમત',
  },
  enterPrice: {
    en: 'Enter price',
    gu: 'કિંમત દાખલ કરો',
  },
  unit: {
    en: 'Unit',
    gu: 'એકમ',
  },
  enterUnit: {
    en: 'Enter unit (kg, pcs, liter)',
    gu: 'એકમ દાખલ કરો (કિગ્રા, પીસ, લિટર)',
  },
  stock: {
    en: 'Stock',
    gu: 'સ્ટોક',
  },
  enterStock: {
    en: 'Enter stock quantity',
    gu: 'સ્ટોક જથ્થો દાખલ કરો',
  },
  fillAllFields: {
    en: 'Please fill all fields',
    gu: 'કૃપા કરીને બધા ક્ષેત્રો ભરો',
  },
  itemAdded: {
    en: 'Item added successfully',
    gu: 'વસ્તુ સફળતાપૂર્વક ઉમેરાઈ',
  },
  shopUpdated: {
    en: 'Shop details updated successfully',
    gu: 'દુકાનની વિગતો સફળતાપૂર્વક અપડેટ થઈ',
  },
  comingSoon: {
    en: 'Coming Soon',
    gu: 'ટૂંક સમયમાં',
  },
  error: {
    en: 'Error',
    gu: 'ભૂલ',
  },
  success: {
    en: 'Success',
    gu: 'સફળતા',
  },
  save: {
    en: 'Save',
    gu: 'સાચવો',
  },
  cancel: {
    en: 'Cancel',
    gu: 'રદ કરો',
  },
  seeAll: {
    en: 'See All',
    gu: 'બધા જુઓ',
  },

  failedToLoad: {
    en: 'Failed to load shop data',
    gu: 'દુકાન ડેટા લોડ કરવામાં નિષ્ફળ',
  },
  screenNotAvailable: {
    en: 'This screen is not available',
    gu: 'આ સ્ક્રીન ઉપલબ્ધ નથી',
  },
  featureComingSoon: {
    en: 'This feature is coming soon',
    gu: 'આ સુવિધા ટૂંક સમયમાં આવી રહી છે',
  },
  retry: {
    en: 'Retry',
    gu: 'ફરી પ્રયાસ કરો',
  },



  addMultipleItems: {
    en: 'Add Multiple Items',
    gu: 'બહુવિધ વસ્તુઓ ઉમેરો',
  },
  addAnother: {
    en: 'Add Another',
    gu: 'બીજું ઉમેરો',
  },
  item: {
    en: 'Item',
    gu: 'વસ્તુ',
  },
  initialStock: {
    en: 'Initial Stock',
    gu: 'પ્રારંભિક સ્ટોક',
  },
  itemNameRequired: {
    en: 'Item name is required',
    gu: 'વસ્તુનું નામ આવશ્યક છે',
  },
  priceRequired: {
    en: 'Price is required',
    gu: 'કિંમત આવશ્યક છે',
  },
  validPriceRequired: {
    en: 'Please enter a valid price',
    gu: 'કૃપા કરીને માન્ય કિંમત દાખલ કરો',
  },
  unitRequired: {
    en: 'Unit is required',
    gu: 'એકમ આવશ્યક છે',
  },
  itemsAddedSuccessfully: {
    en: 'items added successfully',
    gu: 'વસ્તુઓ સફળતાપૂર્વક ઉમેરાઈ',
  },
  addMore: {
    en: 'Add More',
    gu: 'વધુ ઉમેરો',
  },
  goToDashboard: {
    en: 'Go to Dashboard',
    gu: 'ડેશબોર્ડ પર જાઓ',
  },
  addingItems: {
    en: 'Adding items...',
    gu: 'વસ્તુઓ ઉમેરાઈ રહી છે...',
  },
  cannotRemoveLastItem: {
    en: 'Cannot remove the last item. Add a new item first if you want to remove this one.',
    gu: 'છેલ્લી વસ્તુ દૂર કરી શકાતી નથી. જો તમે આને દૂર કરવા માંગતા હોવ તો પહેલા નવી વસ્તુ ઉમેરો.',
  },
  addItems: {
    en: 'Add Items',
    gu: 'વસ્તુઓ ઉમેરો',
  },


  // admin profile
  profile: {
    en: 'Profile',
    gu: 'પ્રોફાઇલ',
  },
  ownerInformation: {
    en: 'Owner Information',
    gu: 'માલિકની માહિતી',
  },
  shopInformation: {
    en: 'Shop Information',
    gu: 'દુકાનની માહિતી',
  },
  registrationInfo: {
    en: 'Registration Information',
    gu: 'નોંધણી માહિતી',
  },
  documentStatus: {
    en: 'Document Status',
    gu: 'દસ્તાવેજ સ્થિતિ',
  },
  editProfile: {
    en: 'Edit Profile',
    gu: 'પ્રોફાઇલ એડિટ કરો',
  },
  profileUpdated: {
    en: 'Profile updated successfully',
    gu: 'પ્રોફાઇલ સફળતાપૂર્વક અપડેટ થઈ',
  },
  logout: {
    en: 'Logout',
    gu: 'લોગઆઉટ',
  },
  logoutConfirmation: {
    en: 'Are you sure you want to logout?',
    gu: 'શું તમે લોગઆઉટ કરવા માંગો છો?',
  },
  currentPassword: {
    en: 'Current Password',
    gu: 'વર્તમાન પાસવર્ડ',
  },
  newPassword: {
    en: 'New Password',
    gu: 'નવો પાસવર્ડ',
  },
  confirmPassword: {
    en: 'Confirm Password',
    gu: 'પાસવર્ડની પુષ્ટિ કરો',
  },
  enterCurrentPassword: {
    en: 'Enter current password',
    gu: 'વર્તમાન પાસવર્ડ દાખલ કરો',
  },
  enterNewPassword: {
    en: 'Enter new password',
    gu: 'નવો પાસવર્ડ દાખલ કરો',
  },
  confirmNewPassword: {
    en: 'Confirm new password',
    gu: 'નવા પાસવર્ડની પુષ્ટિ કરો',
  },
  updatePassword: {
    en: 'Update Password',
    gu: 'પાસવર્ડ અપડેટ કરો',
  },
  passwordChanged: {
    en: 'Password changed successfully',
    gu: 'પાસવર્ડ સફળતાપૂર્વક બદલાયો',
  },
  currentPasswordRequired: {
    en: 'Current password is required',
    gu: 'વર્તમાન પાસવર્ડ આવશ્યક છે',
  },
  newPasswordRequired: {
    en: 'New password is required',
    gu: 'નવો પાસવર્ડ આવશ્યક છે',
  },
  confirmPasswordRequired: {
    en: 'Please confirm your password',
    gu: 'કૃપા કરીને તમારા પાસવર્ડની પુષ્ટિ કરો',
  },
  passwordMinLength: {
    en: 'Password must be at least 6 characters',
    gu: 'પાસવર્ડ ઓછામાં ઓછા ૬ અક્ષરોનો હોવો જોઈએ',
  },
  passwordMismatch: {
    en: 'Passwords do not match',
    gu: 'પાસવર્ડ મેળ ખાતા નથી',
  },
  saveChanges: {
    en: 'Save Changes',
    gu: 'ફેરફારો સાચવો',
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