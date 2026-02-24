import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../context/LanguageContext';

const { width, height } = Dimensions.get('window');

// Sample services data
const SAMPLE_SERVICES = [
  {
    id: 'water001',
    name: 'Water Supply',
    nameGuj: 'પાણી પુરવઠો',
    icon: 'water-drop',
    status: 'active',
    statusColor: '#10b981',
    schedule: '7:00 AM - 9:00 AM (Morning) | 5:00 PM - 7:00 PM (Evening)',
    scheduleGuj: 'સવારે ૭:૦૦ - ૯:૦૦ | સાંજે ૫:૦૦ - ૭:૦૦',
    department: 'Water Department',
    contact: '1800-123-4567',
    lastUpdated: 'Today, 6:30 AM',
    nextMaintenance: '2024-03-01',
    coverage: '98%',
    quality: 'Good',
    pressure: 'Normal',
    complaints: 12,
  },
  {
    id: 'electricity001',
    name: 'Electricity Supply',
    nameGuj: 'વીજળી પુરવઠો',
    icon: 'bolt',
    status: 'active',
    statusColor: '#10b981',
    schedule: '24/7 Supply',
    scheduleGuj: '૨૪/૭ પુરવઠો',
    department: 'Electricity Board',
    contact: '1912',
    lastUpdated: 'Today, 8:00 AM',
    nextMaintenance: '2024-02-28',
    coverage: '100%',
    voltage: '230V',
    load: 'Normal',
    complaints: 5,
  },
  {
    id: 'road001',
    name: 'Road Maintenance',
    nameGuj: 'રોડ જાળવણી',
    icon: 'road',
    status: 'maintenance',
    statusColor: '#f59e0b',
    schedule: 'Maintenance in progress',
    scheduleGuj: 'જાળવણી ચાલુ છે',
    department: 'Public Works',
    contact: '1800-123-7890',
    lastUpdated: 'Yesterday, 2:30 PM',
    nextMaintenance: 'Ongoing',
    coverage: '85%',
    condition: 'Good',
    ongoingWork: 'Main Road Repair',
    complaints: 8,
  },
  {
    id: 'drainage001',
    name: 'Drainage System',
    nameGuj: 'ડ્રેનેજ સિસ્ટમ',
    icon: 'plumbing',
    status: 'active',
    statusColor: '#10b981',
    schedule: 'Regular cleaning',
    scheduleGuj: 'નિયમિત સફાઈ',
    department: 'Sanitation Department',
    contact: '1800-123-4568',
    lastUpdated: '2 days ago',
    nextMaintenance: '2024-03-05',
    coverage: '92%',
    condition: 'Good',
    cleaningFrequency: 'Weekly',
    complaints: 3,
  },
  {
    id: 'waste001',
    name: 'Waste Collection',
    nameGuj: 'કચરો સંગ્રહ',
    icon: 'delete',
    status: 'active',
    statusColor: '#10b981',
    schedule: '8:00 AM - 11:00 AM (Daily)',
    scheduleGuj: 'સવારે ૮:૦૦ - ૧૧:૦૦ (રોજ)',
    department: 'Sanitation Department',
    contact: '1800-123-4569',
    lastUpdated: 'Today, 9:15 AM',
    nextMaintenance: 'Daily',
    coverage: '95%',
    frequency: 'Daily',
    lastCollection: 'Today',
    complaints: 2,
  },
  {
    id: 'streetlight001',
    name: 'Street Lights',
    nameGuj: 'સ્ટ્રીટ લાઇટ',
    icon: 'light-mode',
    status: 'active',
    statusColor: '#10b981',
    schedule: '6:30 PM - 6:30 AM',
    scheduleGuj: 'સાંજે ૬:૩૦ - સવારે ૬:૩૦',
    department: 'Electricity Board',
    contact: '1912',
    lastUpdated: 'Yesterday, 7:00 PM',
    nextMaintenance: '2024-03-10',
    coverage: '90%',
    workingLights: '450/500',
    complaints: 15,
  },
  {
    id: 'health001',
    name: 'Health Services',
    nameGuj: 'આરોગ્ય સેવાઓ',
    icon: 'local-hospital',
    status: 'active',
    statusColor: '#10b981',
    schedule: '24/7 Emergency | 9:00 AM - 5:00 PM (OPD)',
    scheduleGuj: '૨૪/૭ ઇમરજન્સી | સવારે ૯:૦૦ - સાંજે ૫:૦૦ (ઓપીડી)',
    department: 'Health Department',
    contact: '108',
    lastUpdated: 'Today, 8:00 AM',
    nextMaintenance: 'NA',
    coverage: '100%',
    doctors: '5 Available',
    beds: '25/30 Occupied',
  },
  {
    id: 'education001',
    name: 'Education Services',
    nameGuj: 'શિક્ષણ સેવાઓ',
    icon: 'school',
    status: 'active',
    statusColor: '#10b981',
    schedule: '10:00 AM - 4:00 PM (School Hours)',
    scheduleGuj: 'સવારે ૧૦:૦૦ - સાંજે ૪:૦૦ (શાળાનો સમય)',
    department: 'Education Department',
    contact: '1800-123-4570',
    lastUpdated: 'Today, 9:00 AM',
    nextMaintenance: 'Summer Break',
    coverage: '100%',
    schools: '5 Active',
    students: '1200 Enrolled',
  },
  {
    id: 'bus001',
    name: 'Public Transport',
    nameGuj: 'જાહેર પરિવહન',
    icon: 'directions-bus',
    status: 'active',
    statusColor: '#10b981',
    schedule: '6:00 AM - 9:00 PM (Every 30 mins)',
    scheduleGuj: 'સવારે ૬:૦૦ - રાત્રે ૯:૦૦ (દર ૩૦ મિનિટે)',
    department: 'Transport Department',
    contact: '1800-123-4571',
    lastUpdated: 'Today, 7:30 AM',
    nextMaintenance: '2024-03-15',
    coverage: '80%',
    buses: '8 Running',
    routes: '5 Active',
  },
  {
    id: 'fire001',
    name: 'Fire Services',
    nameGuj: 'ફાયર સેવાઓ',
    icon: 'fire-hydrant',
    status: 'active',
    statusColor: '#10b981',
    schedule: '24/7 Emergency',
    scheduleGuj: '૨૪/૭ ઇમરજન્સી',
    department: 'Fire Department',
    contact: '101',
    lastUpdated: 'Today, 12:00 AM',
    nextMaintenance: 'Weekly Check',
    coverage: '100%',
    responseTime: '< 10 mins',
    vehicles: '2 Available',
  },
  {
    id: 'police001',
    name: 'Police Services',
    nameGuj: 'પોલીસ સેવાઓ',
    icon: 'local-police',
    status: 'active',
    statusColor: '#10b981',
    schedule: '24/7 Emergency',
    scheduleGuj: '૨૪/૭ ઇમરજન્સી',
    department: 'Police Department',
    contact: '100',
    lastUpdated: 'Today, 12:00 AM',
    nextMaintenance: 'NA',
    coverage: '100%',
    responseTime: '< 15 mins',
    patrols: 'Active',
  },
  {
    id: 'internet001',
    name: 'Internet Services',
    nameGuj: 'ઇન્ટરનેટ સેવાઓ',
    icon: 'wifi',
    status: 'maintenance',
    statusColor: '#f59e0b',
    schedule: 'Maintenance in progress',
    scheduleGuj: 'જાળવણી ચાલુ છે',
    department: 'Telecom Department',
    contact: '1800-123-4572',
    lastUpdated: '2 hours ago',
    nextMaintenance: 'Ongoing',
    coverage: '95%',
    speed: '100 Mbps',
    downtime: 'Expected 2 hours',
  },
];

const PublicServicesScreen = ({ navigation }) => {
  const { t, language } = useLanguage();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedService, setSelectedService] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewType, setViewType] = useState('grid'); // 'grid' or 'list'

  const categories = [
    { id: 'all', name: t('all'), icon: 'apps', color: '#64748b' },
    { id: 'utility', name: t('utility'), icon: 'power', color: '#f59e0b' },
    { id: 'infrastructure', name: t('infrastructure'), icon: 'construction', color: '#64748b' },
    { id: 'health', name: t('health'), icon: 'local-hospital', color: '#ef4444' },
    { id: 'education', name: t('education'), icon: 'school', color: '#8b5cf6' },
    { id: 'transport', name: t('transport'), icon: 'directions-bus', color: '#3b82f6' },
    { id: 'emergency', name: t('emergency'), icon: 'warning', color: '#ef4444' },
  ];

  // Map service categories
  const getServiceCategory = (service) => {
    const utilityServices = ['water', 'electricity', 'internet', 'streetlight'];
    const infrastructureServices = ['road', 'drainage'];
    const healthServices = ['health'];
    const educationServices = ['education'];
    const transportServices = ['bus'];
    const emergencyServices = ['fire', 'police'];
    
    if (utilityServices.some(s => service.id.includes(s))) return 'utility';
    if (infrastructureServices.some(s => service.id.includes(s))) return 'infrastructure';
    if (healthServices.some(s => service.id.includes(s))) return 'health';
    if (educationServices.some(s => service.id.includes(s))) return 'education';
    if (transportServices.some(s => service.id.includes(s))) return 'transport';
    if (emergencyServices.some(s => service.id.includes(s))) return 'emergency';
    return 'utility';
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setServices(SAMPLE_SERVICES);
      setLoading(false);
      setRefreshing(false);
    }, 1000);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchServices();
  };

  const getFilteredServices = () => {
    if (selectedCategory === 'all') {
      return services;
    }
    return services.filter(service => 
      getServiceCategory(service) === selectedCategory
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'maintenance':
        return '#f59e0b';
      case 'inactive':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return 'check-circle';
      case 'maintenance':
        return 'build';
      case 'inactive':
        return 'error';
      default:
        return 'info';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return t('active');
      case 'maintenance':
        return t('maintenance');
      case 'inactive':
        return t('inactive');
      default:
        return status;
    }
  };

  const getCategoryColor = (service) => {
    const category = categories.find(c => c.id === getServiceCategory(service));
    return category?.color || '#64748b';
  };

  const renderGridView = () => {
    const filteredServices = getFilteredServices();
    
    return (
      <View style={styles.gridContainer}>
        {filteredServices.map((service) => {
          const categoryColor = getCategoryColor(service);
          const statusColor = getStatusColor(service.status);
          
          return (
            <TouchableOpacity
              key={service.id}
              style={styles.gridCard}
              onPress={() => {
                setSelectedService(service);
                setModalVisible(true);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.gridIconContainer, { backgroundColor: categoryColor + '15' }]}>
                <Icon name={service.icon} size={30} color={categoryColor} />
              </View>
              
              <Text style={styles.gridServiceName} numberOfLines={2}>
                {language === 'gu' ? service.nameGuj : service.name}
              </Text>
              
              <View style={[styles.gridStatusBadge, { backgroundColor: statusColor + '15' }]}>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <Text style={[styles.gridStatusText, { color: statusColor }]}>
                  {getStatusText(service.status)}
                </Text>
              </View>

              <View style={styles.gridSchedule}>
                <Icon name="schedule" size={12} color="#94a3b8" />
                <Text style={styles.gridScheduleText} numberOfLines={1}>
                  {language === 'gu' ? service.scheduleGuj : service.schedule}
                </Text>
              </View>

              <View style={styles.gridFooter}>
                <Icon name="phone" size={12} color="#38bdf8" />
                <Text style={styles.gridContact}>{service.contact}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderListView = () => {
    const filteredServices = getFilteredServices();
    
    return (
      <View style={styles.listContainer}>
        {filteredServices.map((service) => {
          const categoryColor = getCategoryColor(service);
          const statusColor = getStatusColor(service.status);
          
          return (
            <TouchableOpacity
              key={service.id}
              style={styles.listCard}
              onPress={() => {
                setSelectedService(service);
                setModalVisible(true);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.listIconContainer, { backgroundColor: categoryColor + '15' }]}>
                <Icon name={service.icon} size={24} color={categoryColor} />
              </View>
              
              <View style={styles.listContent}>
                <View style={styles.listHeader}>
                  <Text style={styles.listServiceName}>
                    {language === 'gu' ? service.nameGuj : service.name}
                  </Text>
                  <View style={[styles.listStatusBadge, { backgroundColor: statusColor + '15' }]}>
                    <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                    <Text style={[styles.listStatusText, { color: statusColor }]}>
                      {getStatusText(service.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.listSchedule}>
                  <Icon name="schedule" size={14} color="#94a3b8" />
                  <Text style={styles.listScheduleText} numberOfLines={1}>
                    {language === 'gu' ? service.scheduleGuj : service.schedule}
                  </Text>
                </View>

                <View style={styles.listDetails}>
                  <View style={styles.listDetailItem}>
                    <Icon name="business" size={12} color="#94a3b8" />
                    <Text style={styles.listDetailText}>{service.department}</Text>
                  </View>
                  <View style={styles.listDetailItem}>
                    <Icon name="phone" size={12} color="#94a3b8" />
                    <Text style={styles.listDetailText}>{service.contact}</Text>
                  </View>
                </View>

                <View style={styles.listFooter}>
                  <Text style={styles.listUpdated}>
                    {t('lastUpdated')}: {service.lastUpdated}
                  </Text>
                  {service.complaints > 0 && (
                    <View style={styles.complaintBadge}>
                      <Icon name="report-problem" size={12} color="#ef4444" />
                      <Text style={styles.complaintText}>{service.complaints}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const filteredServices = getFilteredServices();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#38bdf8" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('publicServices')}</Text>
          <TouchableOpacity 
            style={styles.viewToggle}
            onPress={() => setViewType(viewType === 'grid' ? 'list' : 'grid')}
          >
            <Icon 
              name={viewType === 'grid' ? 'view-list' : 'grid-view'} 
              size={24} 
              color="#ffffff" 
            />
          </TouchableOpacity>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{services.length}</Text>
            <Text style={styles.statLabel}>{t('totalServices')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {services.filter(s => s.status === 'active').length}
            </Text>
            <Text style={styles.statLabel}>{t('active')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {services.filter(s => s.status === 'maintenance').length}
            </Text>
            <Text style={styles.statLabel}>{t('maintenance')}</Text>
          </View>
        </View>
      </View>

      {/* Category Filter */}
      <View style={styles.categorySection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.selectedCategoryChip,
                selectedCategory === category.id && { backgroundColor: category.color }
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Icon 
                name={category.icon} 
                size={16} 
                color={selectedCategory === category.id ? '#ffffff' : category.color} 
              />
              <Text style={[
                styles.categoryChipText,
                selectedCategory === category.id && styles.selectedCategoryChipText,
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Services List/Grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#38bdf8" />
          <Text style={styles.loadingText}>{t('loadingServices')}</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#38bdf8']}
              tintColor="#38bdf8"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {filteredServices.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="build" size={60} color="#e2e8f0" />
              <Text style={styles.emptyText}>{t('noServices')}</Text>
            </View>
          ) : (
            <>
              <View style={styles.resultHeader}>
                <Text style={styles.resultText}>
                  {filteredServices.length} {t('services')}
                </Text>
              </View>
              {viewType === 'grid' ? renderGridView() : renderListView()}
            </>
          )}
        </ScrollView>
      )}

      {/* Service Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                <Icon name="close" size={24} color="#1e293b" />
              </TouchableOpacity>
            </View>

            {selectedService && (
              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScrollContent}
              >
                <View style={styles.modalIconSection}>
                  <View style={[styles.modalIconContainer, { backgroundColor: getCategoryColor(selectedService) + '15' }]}>
                    <Icon name={selectedService.icon} size={50} color={getCategoryColor(selectedService)} />
                  </View>
                  <Text style={styles.modalServiceName}>
                    {language === 'gu' ? selectedService.nameGuj : selectedService.name}
                  </Text>
                </View>

                <View style={styles.modalStatus}>
                  <View style={[
                    styles.modalStatusBadge, 
                    { backgroundColor: getStatusColor(selectedService.status) + '15' }
                  ]}>
                    <Icon 
                      name={getStatusIcon(selectedService.status)} 
                      size={16} 
                      color={getStatusColor(selectedService.status)} 
                    />
                    <Text style={[
                      styles.modalStatusText, 
                      { color: getStatusColor(selectedService.status) }
                    ]}>
                      {getStatusText(selectedService.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalInfoGrid}>
                  <View style={styles.modalInfoItem}>
                    <Icon name="schedule" size={20} color="#38bdf8" />
                    <Text style={styles.modalInfoLabel}>{t('schedule')}</Text>
                    <Text style={styles.modalInfoValue}>
                      {language === 'gu' ? selectedService.scheduleGuj : selectedService.schedule}
                    </Text>
                  </View>

                  <View style={styles.modalInfoItem}>
                    <Icon name="business" size={20} color="#38bdf8" />
                    <Text style={styles.modalInfoLabel}>{t('department')}</Text>
                    <Text style={styles.modalInfoValue}>{selectedService.department}</Text>
                  </View>

                  <View style={styles.modalInfoItem}>
                    <Icon name="phone" size={20} color="#38bdf8" />
                    <Text style={styles.modalInfoLabel}>{t('contact')}</Text>
                    <Text style={styles.modalInfoValue}>{selectedService.contact}</Text>
                  </View>

                  <View style={styles.modalInfoItem}>
                    <Icon name="update" size={20} color="#38bdf8" />
                    <Text style={styles.modalInfoLabel}>{t('lastUpdated')}</Text>
                    <Text style={styles.modalInfoValue}>{selectedService.lastUpdated}</Text>
                  </View>
                </View>

                {/* Service Specific Details */}
                <View style={styles.modalDetailsSection}>
                  <Text style={styles.modalDetailsTitle}>{t('serviceDetails')}</Text>
                  
                  {selectedService.coverage && (
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>{t('coverage')}</Text>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: selectedService.coverage }]} />
                      </View>
                      <Text style={styles.modalDetailValue}>{selectedService.coverage}</Text>
                    </View>
                  )}

                  {selectedService.nextMaintenance && (
                    <View style={styles.modalDetailRow}>
                      <Icon name="build" size={16} color="#64748b" />
                      <Text style={styles.modalDetailLabel}>{t('nextMaintenance')}</Text>
                      <Text style={styles.modalDetailValue}>{selectedService.nextMaintenance}</Text>
                    </View>
                  )}

                  {selectedService.quality && (
                    <View style={styles.modalDetailRow}>
                      <Icon name="water-drop" size={16} color="#64748b" />
                      <Text style={styles.modalDetailLabel}>{t('quality')}</Text>
                      <Text style={styles.modalDetailValue}>{selectedService.quality}</Text>
                    </View>
                  )}

                  {selectedService.pressure && (
                    <View style={styles.modalDetailRow}>
                      <Icon name="speed" size={16} color="#64748b" />
                      <Text style={styles.modalDetailLabel}>{t('pressure')}</Text>
                      <Text style={styles.modalDetailValue}>{selectedService.pressure}</Text>
                    </View>
                  )}

                  {selectedService.voltage && (
                    <View style={styles.modalDetailRow}>
                      <Icon name="bolt" size={16} color="#64748b" />
                      <Text style={styles.modalDetailLabel}>{t('voltage')}</Text>
                      <Text style={styles.modalDetailValue}>{selectedService.voltage}</Text>
                    </View>
                  )}

                  {selectedService.responseTime && (
                    <View style={styles.modalDetailRow}>
                      <Icon name="timer" size={16} color="#64748b" />
                      <Text style={styles.modalDetailLabel}>{t('responseTime')}</Text>
                      <Text style={styles.modalDetailValue}>{selectedService.responseTime}</Text>
                    </View>
                  )}

                  {selectedService.complaints !== undefined && (
                    <TouchableOpacity 
                      style={styles.complaintButton}
                      onPress={() => {
                        setModalVisible(false);
                        navigation.navigate('Complaints', { category: selectedService.id.includes('water') ? 'water' : 'electricity' });
                      }}
                    >
                      <Icon name="report-problem" size={16} color="#ef4444" />
                      <Text style={styles.complaintButtonText}>
                        {selectedService.complaints} {t('activeComplaints')}
                      </Text>
                      <Icon name="chevron-right" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Action Buttons */}
                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.callButton]}
                    onPress={() => {
                      // Implement call functionality
                    }}
                  >
                    <Icon name="phone" size={20} color="#ffffff" />
                    <Text style={styles.actionButtonText}>{t('callNow')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.actionButton, styles.navigateButton]}
                    onPress={() => {
                      // Implement navigation to map
                      navigation.navigate('Map', { service: selectedService });
                    }}
                  >
                    <Icon name="navigation" size={20} color="#ffffff" />
                    <Text style={styles.actionButtonText}>{t('navigate')}</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#38bdf8',
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  viewToggle: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 10,
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 2,
  },
  categorySection: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 12,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedCategoryChip: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryChipText: {
    fontSize: 13,
    marginLeft: 6,
    color: '#64748b',
  },
  selectedCategoryChipText: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  resultHeader: {
    marginBottom: 16,
  },
  resultText: {
    fontSize: 14,
    color: '#64748b',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    width: (width - 48) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  gridIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    alignSelf: 'center',
  },
  gridServiceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
    height: 40,
  },
  gridStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
    alignSelf: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  gridStatusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  gridSchedule: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  gridScheduleText: {
    fontSize: 10,
    color: '#64748b',
    flex: 1,
  },
  gridFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  gridContact: {
    fontSize: 12,
    color: '#38bdf8',
    fontWeight: '500',
  },
  listContainer: {
    gap: 12,
  },
  listCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  listIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listContent: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  listServiceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  listStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  listStatusText: {
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 4,
  },
  listSchedule: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  listScheduleText: {
    fontSize: 12,
    color: '#64748b',
    flex: 1,
  },
  listDetails: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 16,
  },
  listDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listDetailText: {
    fontSize: 12,
    color: '#64748b',
  },
  listFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  listUpdated: {
    fontSize: 10,
    color: '#94a3b8',
  },
  complaintBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  complaintText: {
    fontSize: 10,
    color: '#ef4444',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#94a3b8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.9,
  },
  modalHeader: {
    alignItems: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalScrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  modalIconSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalServiceName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
  },
  modalStatus: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
  },
  modalStatusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalInfoGrid: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    gap: 16,
  },
  modalInfoItem: {
    alignItems: 'center',
  },
  modalInfoLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 2,
  },
  modalInfoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    textAlign: 'center',
  },
  modalDetailsSection: {
    marginBottom: 20,
  },
  modalDetailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  modalDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    gap: 8,
  },
  modalDetailLabel: {
    flex: 1,
    fontSize: 14,
    color: '#64748b',
  },
  modalDetailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#38bdf8',
    borderRadius: 3,
  },
  complaintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  complaintButtonText: {
    flex: 1,
    fontSize: 14,
    color: '#ef4444',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  callButton: {
    backgroundColor: '#10b981',
  },
  navigateButton: {
    backgroundColor: '#38bdf8',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default PublicServicesScreen;