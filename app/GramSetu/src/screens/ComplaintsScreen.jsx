import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Dimensions,
  StatusBar,
  SafeAreaView,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../context/LanguageContext';

const { width, height } = Dimensions.get('window');

// Sample complaints data based on your DB structure
const SAMPLE_COMPLAINTS = [
  {
    id: "COMP001",
    title: "Water Supply Issue",
    description: "No water supply in North Zone for past 3 days. Affecting 50+ households.",
    category: "water",
    priority: "high",
    status: "pending",
    submittedDate: "2024-12-25 10:30 AM",
    lastUpdated: "21/02/26, 12:37 pm",
    location: {
      lat: 23.0225,
      lng: 72.5714
    },
    userAddress: "House No. 12, North Zone, Ramnagar",
    assignedTo: "Assigned to Team",
    department: "Public Works",
    images: ["water1.jpg", "water2.jpg"]
  },
  {
    id: "COMP002",
    title: "Street Light Not Working",
    description: "Street lights near the temple have been not working for 5 days. Dark area causing safety concerns.",
    category: "electricity",
    priority: "high",
    status: "in-progress",
    submittedDate: "2024-12-24 03:15 PM",
    lastUpdated: "21/02/26, 10:15 am",
    location: {
      lat: 23.0255,
      lng: 72.5754
    },
    userAddress: "Near Temple, Main Road",
    assignedTo: "Electricity Department",
    department: "Electricity Board",
    images: ["light1.jpg"]
  },
  {
    id: "COMP003",
    title: "Garbage Collection Issue",
    description: "Garbage not collected for a week. Overflowing bins causing health hazard.",
    category: "sanitation",
    priority: "medium",
    status: "resolved",
    submittedDate: "2024-12-23 09:45 AM",
    lastUpdated: "21/02/25, 03:22 pm",
    location: {
      lat: 23.0205,
      lng: 72.5694
    },
    userAddress: "Market Area, Sector B",
    assignedTo: "Sanitation Team",
    department: "Municipal Corporation",
    images: []
  },
  {
    id: "COMP004",
    title: "Road Damage",
    description: "Large pothole on main road causing traffic issues and accidents.",
    category: "road",
    priority: "urgent",
    status: "pending",
    submittedDate: "2024-12-22 11:20 AM",
    lastUpdated: "21/02/26, 09:05 am",
    location: {
      lat: 23.0285,
      lng: 72.5784
    },
    userAddress: "Main Road, Near Bus Stop",
    assignedTo: "Road Department",
    department: "Public Works",
    images: ["road1.jpg", "road2.jpg"]
  },
  {
    id: "COMP005",
    title: "Drainage Blockage",
    description: "Drainage line blocked near school, water logging during rain.",
    category: "drainage",
    priority: "medium",
    status: "in-progress",
    submittedDate: "2024-12-21 02:30 PM",
    lastUpdated: "21/02/25, 11:45 am",
    location: {
      lat: 23.0265,
      lng: 72.5734
    },
    userAddress: "Near Primary School",
    assignedTo: "Drainage Team",
    department: "Public Works",
    images: []
  },
  {
    id: "COMP006",
    title: "Mosquito Problem",
    description: "Stagnant water causing mosquito breeding, health concerns in community.",
    category: "health",
    priority: "high",
    status: "pending",
    submittedDate: "2024-12-20 04:15 PM",
    lastUpdated: "21/02/24, 02:30 pm",
    location: {
      lat: 23.0245,
      lng: 72.5704
    },
    userAddress: "Community Center Area",
    assignedTo: "Health Department",
    department: "Health Services",
    images: []
  },
  {
    id: "COMP007",
    title: "Broken Water Pipe",
    description: "Water pipe broken near market, water wastage and muddy road.",
    category: "water",
    priority: "urgent",
    status: "resolved",
    submittedDate: "2024-12-19 08:00 AM",
    lastUpdated: "21/02/23, 04:50 pm",
    location: {
      lat: 23.0295,
      lng: 72.5764
    },
    userAddress: "Market Complex",
    assignedTo: "Water Department",
    department: "Public Works",
    images: ["pipe1.jpg"]
  },
  {
    id: "COMP008",
    title: "Stray Animal Issue",
    description: "Stray dogs creating nuisance in residential area, children scared to go out.",
    category: "animal",
    priority: "medium",
    status: "pending",
    submittedDate: "2024-12-18 05:45 PM",
    lastUpdated: "21/02/23, 10:20 am",
    location: {
      lat: 23.0215,
      lng: 72.5674
    },
    userAddress: "Housing Society, Block C",
    assignedTo: "Animal Control",
    department: "Municipal Corporation",
    images: []
  }
];

const ComplaintsScreen = ({ navigation }) => {
  const { t, language } = useLanguage();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showNewComplaintModal, setShowNewComplaintModal] = useState(false);

  // New complaint form state
  const [newComplaint, setNewComplaint] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    location: null,
    address: '',
    images: []
  });

  const categories = [
    { id: 'all', name: t('all'), icon: 'apps', color: '#64748b' },
    { id: 'water', name: t('water'), icon: 'water-drop', color: '#3b82f6' },
    { id: 'electricity', name: t('electricity'), icon: 'bolt', color: '#f59e0b' },
    { id: 'road', name: t('road'), icon: 'road', color: '#64748b' },
    { id: 'sanitation', name: t('sanitation'), icon: 'delete', color: '#10b981' },
    { id: 'drainage', name: t('drainage'), icon: 'plumbing', color: '#64748b' },
    { id: 'health', name: t('health'), icon: 'local-hospital', color: '#ef4444' },
    { id: 'animal', name: t('animal'), icon: 'pets', color: '#8b5cf6' },
  ];

  const statuses = [
    { id: 'all', name: t('all'), color: '#64748b' },
    { id: 'pending', name: t('pending'), color: '#f59e0b' },
    { id: 'in-progress', name: t('inProgress'), color: '#3b82f6' },
    { id: 'resolved', name: t('resolved'), color: '#10b981' },
    { id: 'rejected', name: t('rejected'), color: '#ef4444' },
  ];

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      // Sort by submitted date (newest first)
      const sorted = [...SAMPLE_COMPLAINTS].sort((a, b) => 
        new Date(b.submittedDate) - new Date(a.submittedDate)
      );
      setComplaints(sorted);
      setLoading(false);
      setRefreshing(false);
    }, 1000);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchComplaints();
  };

  const getFilteredComplaints = () => {
    let filtered = complaints;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }
    
    // Limit to 10 if not showing all
    if (!showAll) {
      filtered = filtered.slice(0, 10);
    }
    
    return filtered;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'in-progress':
        return '#3b82f6';
      case 'resolved':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return 'hourglass-empty';
      case 'in-progress':
        return 'pending';
      case 'resolved':
        return 'check-circle';
      case 'rejected':
        return 'cancel';
      default:
        return 'info';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return '#ef4444';
      case 'high':
        return '#f59e0b';
      case 'medium':
        return '#3b82f6';
      case 'low':
        return '#10b981';
      default:
        return '#64748b';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return t('today');
    } else if (diffDays === 1) {
      return t('yesterday');
    } else if (diffDays < 7) {
      return `${diffDays} ${t('daysAgo')}`;
    } else {
      return date.toLocaleDateString(language === 'gu' ? 'gu-IN' : 'en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#64748b';
  };

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.icon || 'info';
  };

  const handleGetCurrentLocation = () => {
    // Simulate getting location (will be implemented with actual GPS later)
    Alert.alert(
      t('location'),
      t('locationFeatureComing'),
      [{ text: t('ok') }]
    );
    
    // Mock location data
    setNewComplaint({
      ...newComplaint,
      location: {
        lat: 23.0225,
        lng: 72.5714
      }
    });
  };

  const handleSubmitComplaint = () => {
    // Validate form
    if (!newComplaint.title.trim()) {
      Alert.alert(t('error'), t('enterTitle'));
      return;
    }
    if (!newComplaint.description.trim()) {
      Alert.alert(t('error'), t('enterComplaintDescription'));
      return;
    }
    if (!newComplaint.category) {
      Alert.alert(t('error'), t('selectCategory'));
      return;
    }
    if (!newComplaint.address.trim()) {
      Alert.alert(t('error'), t('enterAddress'));
      return;
    }

    // Show success message
    Alert.alert(
      t('success'),
      t('complaintSubmitted'),
      [
        {
          text: t('ok'),
          onPress: () => {
            setShowNewComplaintModal(false);
            // Reset form
            setNewComplaint({
              title: '',
              description: '',
              category: '',
              priority: 'medium',
              location: null,
              address: '',
              images: []
            });
          }
        }
      ]
    );
  };

  const renderComplaintItem = ({ item, index }) => {
    const categoryColor = getCategoryColor(item.category);
    const statusColor = getStatusColor(item.status);
    
    return (
      <TouchableOpacity
        style={[
          styles.complaintCard,
          index === 0 && styles.firstCard
        ]}
        onPress={() => {
          setSelectedComplaint(item);
          setModalVisible(true);
        }}
        activeOpacity={0.7}
      >
        <View style={[styles.priorityStrip, { backgroundColor: getPriorityColor(item.priority) }]} />
        
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '15' }]}>
              <Icon 
                name={getCategoryIcon(item.category)} 
                size={12} 
                color={categoryColor} 
              />
              <Text style={[styles.categoryText, { color: categoryColor }]}>
                {t(item.category)}
              </Text>
            </View>
            
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
              <Icon 
                name={getStatusIcon(item.status)} 
                size={12} 
                color={statusColor} 
              />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {t(item.status)}
              </Text>
            </View>
          </View>

          <Text style={styles.complaintTitle} numberOfLines={2}>
            {item.title}
          </Text>
          
          <Text style={styles.complaintDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.cardFooter}>
            <View style={styles.dateInfo}>
              <Icon name="calendar-today" size={12} color="#94a3b8" />
              <Text style={styles.dateText}>{formatDate(item.submittedDate)}</Text>
            </View>
            
            {item.images && item.images.length > 0 && (
              <View style={styles.imageBadge}>
                <Icon name="image" size={12} color="#38bdf8" />
                <Text style={styles.imageText}>{item.images.length}</Text>
              </View>
            )}

            <View style={styles.priorityBadge}>
              <Icon 
                name="priority-high" 
                size={12} 
                color={getPriorityColor(item.priority)} 
              />
              <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
                {t(item.priority)}
              </Text>
            </View>
          </View>

          {item.assignedTo && (
            <View style={styles.assignedContainer}>
              <Icon name="person" size={12} color="#94a3b8" />
              <Text style={styles.assignedText} numberOfLines={1}>
                {item.assignedTo}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const filteredComplaints = getFilteredComplaints();

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
          <Text style={styles.headerTitle}>{t('complaints')}</Text>
          <TouchableOpacity 
            style={styles.newComplaintButton}
            onPress={() => setShowNewComplaintModal(true)}
          >
            <Icon name="add" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{complaints.length}</Text>
            <Text style={styles.statLabel}>{t('total')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {complaints.filter(c => c.status === 'pending').length}
            </Text>
            <Text style={styles.statLabel}>{t('pending')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {complaints.filter(c => c.status === 'in-progress').length}
            </Text>
            <Text style={styles.statLabel}>{t('inProgress')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {complaints.filter(c => c.status === 'resolved').length}
            </Text>
            <Text style={styles.statLabel}>{t('resolved')}</Text>
          </View>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersSection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {/* Category Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>{t('category')}:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterChips}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.filterChip,
                    selectedCategory === category.id && styles.selectedFilterChip,
                    selectedCategory === category.id && { backgroundColor: category.color }
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Icon 
                    name={category.icon} 
                    size={14} 
                    color={selectedCategory === category.id ? '#ffffff' : category.color} 
                  />
                  <Text style={[
                    styles.filterChipText,
                    selectedCategory === category.id && styles.selectedFilterChipText,
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Status Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>{t('status')}:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterChips}
            >
              {statuses.map((status) => (
                <TouchableOpacity
                  key={status.id}
                  style={[
                    styles.filterChip,
                    selectedStatus === status.id && styles.selectedFilterChip,
                    selectedStatus === status.id && { backgroundColor: status.color }
                  ]}
                  onPress={() => setSelectedStatus(status.id)}
                >
                  <Text style={[
                    styles.filterChipText,
                    selectedStatus === status.id && styles.selectedFilterChipText,
                  ]}>
                    {status.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </ScrollView>

        {/* View Toggle */}
        <TouchableOpacity 
          style={styles.viewToggle}
          onPress={() => setShowAll(!showAll)}
        >
          <Text style={styles.viewToggleText}>
            {showAll ? t('showRecent') : t('seeAll')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Complaints List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#38bdf8" />
          <Text style={styles.loadingText}>{t('loadingComplaints')}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredComplaints}
          renderItem={renderComplaintItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#38bdf8']}
              tintColor="#38bdf8"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="report-problem" size={60} color="#e2e8f0" />
              <Text style={styles.emptyText}>{t('noComplaints')}</Text>
              <Text style={styles.emptySubText}>
                {t('beFirstToComplain')}
              </Text>
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={() => setShowNewComplaintModal(true)}
              >
                <Text style={styles.emptyButtonText}>{t('registerComplaint')}</Text>
              </TouchableOpacity>
            </View>
          }
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderText}>
                {showAll ? t('allComplaints') : t('latestComplaints')}
              </Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>
                  {filteredComplaints.length}
                </Text>
              </View>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Complaint Detail Modal */}
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

            {selectedComplaint && (
              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScrollContent}
              >
                <View style={styles.modalStatus}>
                  <View style={[
                    styles.modalStatusBadge, 
                    { backgroundColor: getStatusColor(selectedComplaint.status) + '15' }
                  ]}>
                    <Icon 
                      name={getStatusIcon(selectedComplaint.status)} 
                      size={16} 
                      color={getStatusColor(selectedComplaint.status)} 
                    />
                    <Text style={[
                      styles.modalStatusText, 
                      { color: getStatusColor(selectedComplaint.status) }
                    ]}>
                      {t(selectedComplaint.status)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.modalTitle}>
                  {selectedComplaint.title}
                </Text>

                <View style={styles.modalMetaGrid}>
                  <View style={styles.modalMetaItem}>
                    <Icon name="category" size={16} color="#64748b" />
                    <Text style={styles.modalMetaLabel}>{t('category')}</Text>
                    <View style={[styles.modalMetaValueChip, { backgroundColor: getCategoryColor(selectedComplaint.category) + '15' }]}>
                      <Icon name={getCategoryIcon(selectedComplaint.category)} size={12} color={getCategoryColor(selectedComplaint.category)} />
                      <Text style={[styles.modalMetaValue, { color: getCategoryColor(selectedComplaint.category) }]}>
                        {t(selectedComplaint.category)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalMetaItem}>
                    <Icon name="priority-high" size={16} color="#64748b" />
                    <Text style={styles.modalMetaLabel}>{t('priority')}</Text>
                    <View style={[styles.modalMetaValueChip, { backgroundColor: getPriorityColor(selectedComplaint.priority) + '15' }]}>
                      <Text style={[styles.modalMetaValue, { color: getPriorityColor(selectedComplaint.priority) }]}>
                        {t(selectedComplaint.priority)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalMetaItem}>
                    <Icon name="calendar-today" size={16} color="#64748b" />
                    <Text style={styles.modalMetaLabel}>{t('submitted')}</Text>
                    <Text style={styles.modalMetaValue}>
                      {new Date(selectedComplaint.submittedDate).toLocaleDateString()}
                    </Text>
                  </View>

                  <View style={styles.modalMetaItem}>
                    <Icon name="update" size={16} color="#64748b" />
                    <Text style={styles.modalMetaLabel}>{t('lastUpdated')}</Text>
                    <Text style={styles.modalMetaValue}>
                      {selectedComplaint.lastUpdated}
                    </Text>
                  </View>

                  {selectedComplaint.department && (
                    <View style={styles.modalMetaItem}>
                      <Icon name="business" size={16} color="#64748b" />
                      <Text style={styles.modalMetaLabel}>{t('department')}</Text>
                      <Text style={styles.modalMetaValue}>
                        {selectedComplaint.department}
                      </Text>
                    </View>
                  )}

                  {selectedComplaint.assignedTo && (
                    <View style={styles.modalMetaItem}>
                      <Icon name="person" size={16} color="#64748b" />
                      <Text style={styles.modalMetaLabel}>{t('assignedTo')}</Text>
                      <Text style={styles.modalMetaValue}>
                        {selectedComplaint.assignedTo}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.modalDescription}>
                  <Text style={styles.modalDescriptionLabel}>{t('description')}</Text>
                  <Text style={styles.modalDescriptionText}>
                    {selectedComplaint.description}
                  </Text>
                </View>

                <View style={styles.modalLocation}>
                  <Text style={styles.modalLocationLabel}>{t('location')}</Text>
                  <View style={styles.locationCard}>
                    <Icon name="location-on" size={20} color="#38bdf8" />
                    <Text style={styles.locationAddress}>
                      {selectedComplaint.userAddress}
                    </Text>
                  </View>
                  {selectedComplaint.location && (
                    <TouchableOpacity style={styles.viewMapButton}>
                      <Icon name="map" size={16} color="#38bdf8" />
                      <Text style={styles.viewMapText}>{t('viewOnMap')}</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {selectedComplaint.images && selectedComplaint.images.length > 0 && (
                  <View style={styles.modalImages}>
                    <Text style={styles.modalImagesLabel}>{t('attachments')}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {selectedComplaint.images.map((image, index) => (
                        <TouchableOpacity key={index} style={styles.imageThumb}>
                          <Icon name="image" size={30} color="#94a3b8" />
                          <Text style={styles.imageName}>{image}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                <View style={styles.modalFooter}>
                  <Text style={styles.modalFooterText}>
                    {t('complaintId')}: {selectedComplaint.id}
                  </Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* New Complaint Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showNewComplaintModal}
        onRequestClose={() => setShowNewComplaintModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.newComplaintModal]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>{t('registerNewComplaint')}</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowNewComplaintModal(false)}
              >
                <Icon name="close" size={24} color="#1e293b" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.newComplaintForm}
            >
              {/* Title */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>{t('complaintTitle')} *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder={t('enterComplaintTitle')}
                  value={newComplaint.title}
                  onChangeText={(text) => setNewComplaint({...newComplaint, title: text})}
                />
              </View>

              {/* Category */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>{t('category')} *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.categorySelector}>
                    {categories.filter(c => c.id !== 'all').map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.categoryOption,
                          newComplaint.category === category.id && styles.selectedCategoryOption,
                          newComplaint.category === category.id && { backgroundColor: category.color }
                        ]}
                        onPress={() => setNewComplaint({...newComplaint, category: category.id})}
                      >
                        <Icon 
                          name={category.icon} 
                          size={16} 
                          color={newComplaint.category === category.id ? '#ffffff' : category.color} 
                        />
                        <Text style={[
                          styles.categoryOptionText,
                          newComplaint.category === category.id && styles.selectedCategoryOptionText,
                        ]}>
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Priority */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>{t('priority')}</Text>
                <View style={styles.prioritySelector}>
                  {['urgent', 'high', 'medium', 'low'].map((priority) => (
                    <TouchableOpacity
                      key={priority}
                      style={[
                        styles.priorityOption,
                        newComplaint.priority === priority && styles.selectedPriorityOption,
                        newComplaint.priority === priority && { backgroundColor: getPriorityColor(priority) }
                      ]}
                      onPress={() => setNewComplaint({...newComplaint, priority})}
                    >
                      <Text style={[
                        styles.priorityOptionText,
                        newComplaint.priority === priority && styles.selectedPriorityOptionText,
                      ]}>
                        {t(priority)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Description */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>{t('description')} *</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  placeholder={t('describeComplaint')}
                  value={newComplaint.description}
                  onChangeText={(text) => setNewComplaint({...newComplaint, description: text})}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Location */}
              <View style={styles.formGroup}>
                
                <TouchableOpacity 
                  style={styles.locationButton}
                  onPress={handleGetCurrentLocation}
                >
                  <Icon name="my-location" size={20} color="#38bdf8" />
                  <Text style={styles.locationButtonText}>{t('getCurrentLocation')}</Text>
                </TouchableOpacity>

                {newComplaint.location && (
                  <View style={styles.locationPreview}>
                    <Icon name="check-circle" size={16} color="#10b981" />
                    <Text style={styles.locationPreviewText}>
                      {t('locationCaptured')}
                    </Text>
                  </View>
                )}
              </View>

              {/* Attachments (optional) */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>{t('attachments')}</Text>
                <TouchableOpacity style={styles.attachButton}>
                  <Icon name="attach-file" size={20} color="#38bdf8" />
                  <Text style={styles.attachButtonText}>{t('addPhotos')}</Text>
                </TouchableOpacity>
              </View>

              {/* Submit Button */}
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleSubmitComplaint}
              >
                <Text style={styles.submitButtonText}>{t('submitComplaint')}</Text>
              </TouchableOpacity>

              <Text style={styles.requiredNote}>* {t('requiredFields')}</Text>
            </ScrollView>
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
  newComplaintButton: {
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
  filtersSection: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  filtersContainer: {
    gap: 16,
  },
  filterGroup: {
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  filterChips: {
    gap: 8,
    paddingRight: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedFilterChip: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterChipText: {
    fontSize: 12,
    marginLeft: 4,
    color: '#64748b',
  },
  selectedFilterChipText: {
    color: '#ffffff',
  },
  viewToggle: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  viewToggleText: {
    fontSize: 12,
    color: '#38bdf8',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  listHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  countBadge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  complaintCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  firstCard: {
    marginTop: 0,
  },
  priorityStrip: {
    width: 4,
    height: 'auto',
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  complaintTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 6,
    lineHeight: 22,
  },
  complaintDescription: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  imageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  imageText: {
    fontSize: 11,
    color: '#38bdf8',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  assignedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  assignedText: {
    fontSize: 11,
    color: '#64748b',
    flex: 1,
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
    paddingHorizontal: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 20,
    backgroundColor: '#38bdf8',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
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
  newComplaintModal: {
    maxHeight: height * 0.95,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalScrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  modalStatus: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
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
    textTransform: 'capitalize',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 30,
  },
  modalMetaGrid: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  modalMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  modalMetaLabel: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 8,
    marginRight: 8,
    minWidth: 70,
  },
  modalMetaValueChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modalMetaValue: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  modalDescription: {
    marginBottom: 20,
  },
  modalDescriptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  modalDescriptionText: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 24,
  },
  modalLocation: {
    marginBottom: 20,
  },
  modalLocationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  locationAddress: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
  },
  viewMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  viewMapText: {
    fontSize: 14,
    color: '#38bdf8',
    fontWeight: '500',
  },
  modalImages: {
    marginBottom: 20,
  },
  modalImagesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  imageThumb: {
    width: 80,
    height: 80,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  imageName: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  modalFooter: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 16,
    marginTop: 8,
  },
  modalFooterText: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
  },
  newComplaintForm: {
    padding: 20,
    paddingTop: 0,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1e293b',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categorySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedCategoryOption: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryOptionText: {
    fontSize: 13,
    marginLeft: 6,
    color: '#64748b',
  },
  selectedCategoryOptionText: {
    color: '#ffffff',
  },
  prioritySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedPriorityOption: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  priorityOptionText: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'capitalize',
  },
  selectedPriorityOptionText: {
    color: '#ffffff',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  locationButtonText: {
    fontSize: 14,
    color: '#38bdf8',
    fontWeight: '500',
  },
  locationPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  locationPreviewText: {
    fontSize: 12,
    color: '#10b981',
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  attachButtonText: {
    fontSize: 14,
    color: '#38bdf8',
  },
  submitButton: {
    backgroundColor: '#38bdf8',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  requiredNote: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default ComplaintsScreen;