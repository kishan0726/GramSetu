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
  TextInput
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../context/LanguageContext';

const { width, height } = Dimensions.get('window');

// Sample announcement data based on your DB structure
const SAMPLE_ANNOUNCEMENTS = [
  {
    id: "180226191309",
    title: "Gram Sabha Meeting on 25th March",
    titleGuj: "૨૫ માર્ચે ગ્રામ સભાની બેઠક",
    description: "Monthly gram sabha meeting will be held at community hall. All villagers are requested to attend.",
    descriptionGuj: "માસિક ગ્રામ સભાની બેઠક સામુદાયિક હોલમાં યોજાશે. તમામ ગ્રામજનોને હાજર રહેવા વિનંતી.",
    category: "general",
    publishDate: "2026-02-21T19:13",
    expiryDate: "2026-02-21T19:13",
    priority: "high",
    status: "published",
    targetAudience: ["all"],
    attachmentName: "",
    createdAt: "210226104229"
  },
  {
    id: "180226191310",
    title: "Water Supply Schedule Change",
    titleGuj: "પાણી પુરવઠાના સમયમાં ફેરફાર",
    description: "Due to maintenance work, water supply timing will be changed. New schedule will be from 7 AM to 9 AM.",
    descriptionGuj: "જાળવણી કાર્યને કારણે, પાણી પુરવઠાના સમયમાં ફેરફાર કરવામાં આવ્યો છે. નવો સમય સવારે ૭ થી ૯ વાગ્યા સુધીનો રહેશે.",
    category: "utility",
    publishDate: "2026-02-20T10:30",
    expiryDate: "2026-02-28T23:59",
    priority: "normal",
    status: "published",
    targetAudience: ["all"],
    attachmentName: "",
    createdAt: "210226104230"
  },
  {
    id: "180226191311",
    title: "Vaccination Camp for Cattle",
    titleGuj: "પશુઓ માટે રસીકરણ શિબિર",
    description: "Free vaccination camp for cattle will be organized at veterinary hospital on Sunday.",
    descriptionGuj: "રવિવારે પશુ દવાખાને પશુઓ માટે મફત રસીકરણ શિબિરનું આયોજન કરવામાં આવ્યું છે.",
    category: "health",
    publishDate: "2026-02-19T09:15",
    expiryDate: "2026-02-26T18:00",
    priority: "high",
    status: "published",
    targetAudience: ["farmers"],
    attachmentName: "camp_details.pdf",
    createdAt: "210226104231"
  },
  {
    id: "180226191312",
    title: "Electricity Maintenance Alert",
    titleGuj: "વીજળી જાળવણી એલર્ટ",
    description: "Power supply will be interrupted for 4 hours tomorrow for maintenance work.",
    descriptionGuj: "કાલે જાળવણી કાર્ય માટે ૪ કલાક વીજ પુરવઠો બંધ રહેશે.",
    category: "utility",
    publishDate: "2026-02-18T14:20",
    expiryDate: "2026-02-22T23:59",
    priority: "urgent",
    status: "published",
    targetAudience: ["all"],
    attachmentName: "",
    createdAt: "210226104232"
  },
  {
    id: "180226191313",
    title: "Free Health Checkup Camp",
    titleGuj: "મફત આરોગ્ય તપાસ શિબિર",
    description: "Free health checkup camp for senior citizens at primary health center.",
    descriptionGuj: "પ્રાથમિક આરોગ્ય કેન્દ્ર ખાતે વરિષ્ઠ નાગરિકો માટે મફત આરોગ્ય તપાસ શિબિર.",
    category: "health",
    publishDate: "2026-02-17T11:45",
    expiryDate: "2026-02-25T17:00",
    priority: "normal",
    status: "published",
    targetAudience: ["senior_citizens"],
    attachmentName: "",
    createdAt: "210226104233"
  },
  {
    id: "180226191314",
    title: "Road Construction Update",
    titleGuj: "રોડ નિર્માણ અપડેટ",
    description: "Main road construction work will start from next week. Alternative routes suggested.",
    descriptionGuj: "મુખ્ય માર્ગનું નિર્માણ કાર્ય આવતા અઠવાડિયેથી શરૂ થશે. વૈકલ્પિક માર્ગો સૂચવ્યા.",
    category: "infrastructure",
    publishDate: "2026-02-16T08:30",
    expiryDate: "2026-03-15T23:59",
    priority: "normal",
    status: "published",
    targetAudience: ["all"],
    attachmentName: "road_map.pdf",
    createdAt: "210226104234"
  },
  {
    id: "180226191315",
    title: "Farmers Training Program",
    titleGuj: "ખેડૂત તાલીમ કાર્યક્રમ",
    description: "Training program on modern farming techniques at agriculture office.",
    descriptionGuj: "કૃષિ કચેરી ખાતે આધુનિક ખેતી તકનીકો પર તાલીમ કાર્યક્રમ.",
    category: "agriculture",
    publishDate: "2026-02-15T13:00",
    expiryDate: "2026-02-28T18:00",
    priority: "normal",
    status: "published",
    targetAudience: ["farmers"],
    attachmentName: "",
    createdAt: "210226104235"
  },
  {
    id: "180226191316",
    title: "Plastic Free Village Initiative",
    titleGuj: "પ્લાસ્ટિક મુક્ત ગામ પહેલ",
    description: "Join the campaign to make our village plastic free. Meeting at village square.",
    descriptionGuj: "અમારા ગામને પ્લાસ્ટિક મુક્ત બનાવવાના અભિયાનમાં જોડાઓ. ગામના ચોકમાં બેઠક.",
    category: "environment",
    publishDate: "2026-02-14T10:00",
    expiryDate: "2026-03-01T23:59",
    priority: "high",
    status: "published",
    targetAudience: ["all"],
    attachmentName: "",
    createdAt: "210226104236"
  },
  {
    id: "180226191317",
    title: "Banking Correspondent Visit",
    titleGuj: "બેંકિંગ કોરસ્પોન્ડન્ટ મુલાકાત",
    description: "Banking correspondent will visit village for financial services on Friday.",
    descriptionGuj: "શુક્રવારે નાણાકીય સેવાઓ માટે બેંકિંગ કોરસ્પોન્ડન્ટ ગામની મુલાકાત લેશે.",
    category: "finance",
    publishDate: "2026-02-13T09:45",
    expiryDate: "2026-02-20T17:00",
    priority: "normal",
    status: "published",
    targetAudience: ["all"],
    attachmentName: "",
    createdAt: "210226104237"
  },
  {
    id: "180226191318",
    title: "Youth Sports Tournament",
    titleGuj: "યુવા રમત સ્પર્ધા",
    description: "Annual sports tournament registration open until 28th February.",
    descriptionGuj: "વાર્ષિક રમત સ્પર્ધા માટે રજીસ્ટ્રેશન ૨૮ ફેબ્રુઆરી સુધી ખુલ્લું.",
    category: "sports",
    publishDate: "2026-02-12T15:30",
    expiryDate: "2026-02-28T23:59",
    priority: "normal",
    status: "published",
    targetAudience: ["youth"],
    attachmentName: "tournament_rules.pdf",
    createdAt: "210226104238"
  },
  {
    id: "180226191319",
    title: "COVID-19 Vaccination Camp",
    titleGuj: "કોવિડ-૧૯ રસીકરણ શિબિર",
    description: "Special vaccination camp for 18+ at primary health center this weekend.",
    descriptionGuj: "આ સપ્તાહમાં પ્રાથમિક આરોગ્ય કેન્દ્ર ખાતે ૧૮+ માટે ખાસ રસીકરણ શિબિર.",
    category: "health",
    publishDate: "2026-02-11T12:15",
    expiryDate: "2026-02-22T18:00",
    priority: "urgent",
    status: "published",
    targetAudience: ["all"],
    attachmentName: "",
    createdAt: "210226104239"
  },
  {
    id: "180226191320",
    title: "Digital Payment Training",
    titleGuj: "ડિજિટલ ચુકવણી તાલીમ",
    description: "Learn how to use digital payment apps for daily transactions.",
    descriptionGuj: "રોજિંદા વ્યવહારો માટે ડિજિટલ ચુકવણી એપ્સનો ઉપયોગ કેવી રીતે કરવો તે શીખો.",
    category: "education",
    publishDate: "2026-02-10T16:00",
    expiryDate: "2026-02-25T17:30",
    priority: "normal",
    status: "published",
    targetAudience: ["senior_citizens", "women"],
    attachmentName: "",
    createdAt: "210226104240"
  }
];

const AnnouncementsScreen = ({ navigation }) => {
  const { t, language } = useLanguage();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: t('all'), icon: 'apps', color: '#64748b' },
    { id: 'general', name: t('general'), icon: 'info', color: '#3b82f6' },
    { id: 'health', name: t('health'), icon: 'local-hospital', color: '#ef4444' },
    { id: 'utility', name: t('utility'), icon: 'power', color: '#f59e0b' },
    { id: 'agriculture', name: t('agriculture'), icon: 'agriculture', color: '#10b981' },
    { id: 'environment', name: t('environment'), icon: 'nature', color: '#10b981' },
    { id: 'infrastructure', name: t('infrastructure'), icon: 'construction', color: '#64748b' },
    { id: 'education', name: t('education'), icon: 'school', color: '#8b5cf6' },
    { id: 'sports', name: t('sports'), icon: 'sports', color: '#ec4899' },
    { id: 'finance', name: t('finance'), icon: 'account-balance', color: '#64748b' },
  ];

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      // Sort by publish date (newest first)
      const sorted = [...SAMPLE_ANNOUNCEMENTS].sort((a, b) => 
        new Date(b.publishDate) - new Date(a.publishDate)
      );
      setAnnouncements(sorted);
      setLoading(false);
      setRefreshing(false);
    }, 1000);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnnouncements();
  };

  const getFilteredAnnouncements = () => {
    let filtered = announcements;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.titleGuj?.includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.descriptionGuj?.includes(query)
      );
    }
    
    // Limit to 10 if not showing all
    if (!showAll) {
      filtered = filtered.slice(0, 10);
    }
    
    return filtered;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return '#ef4444';
      case 'high':
        return '#f59e0b';
      case 'normal':
        return '#3b82f6';
      default:
        return '#64748b';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'warning';
      case 'high':
        return 'priority-high';
      case 'normal':
        return 'info';
      default:
        return 'info';
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

  const renderAnnouncementItem = ({ item, index }) => {
    const categoryColor = getCategoryColor(item.category);
    
    return (
      <TouchableOpacity
        style={[
          styles.announcementCard,
          index === 0 && styles.firstCard
        ]}
        onPress={() => {
          setSelectedAnnouncement(item);
          setModalVisible(true);
        }}
        activeOpacity={0.7}
      >
        <View style={[styles.priorityStrip, { backgroundColor: getPriorityColor(item.priority) }]} />
        
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '15' }]}>
              <Icon 
                name={categories.find(c => c.id === item.category)?.icon || 'info'} 
                size={12} 
                color={categoryColor} 
              />
              <Text style={[styles.categoryText, { color: categoryColor }]}>
                {language === 'gu' ? 
                  categories.find(c => c.id === item.category)?.name || item.category : 
                  item.category}
              </Text>
            </View>
            
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '15' }]}>
              <Icon 
                name={getPriorityIcon(item.priority)} 
                size={12} 
                color={getPriorityColor(item.priority)} 
              />
              <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
                {language === 'gu' ? t(item.priority) : item.priority}
              </Text>
            </View>
          </View>

          <Text style={styles.announcementTitle} numberOfLines={2}>
            {language === 'gu' ? item.titleGuj || item.title : item.title}
          </Text>
          
          <Text style={styles.announcementDescription} numberOfLines={2}>
            {language === 'gu' ? item.descriptionGuj || item.description : item.description}
          </Text>

          <View style={styles.cardFooter}>
            <View style={styles.dateInfo}>
              <Icon name="calendar-today" size={12} color="#94a3b8" />
              <Text style={styles.dateText}>{formatDate(item.publishDate)}</Text>
            </View>
            
            {item.attachmentName && (
              <View style={styles.attachmentBadge}>
                <Icon name="attachment" size={12} color="#38bdf8" />
                <Text style={styles.attachmentText} numberOfLines={1}>
                  {item.attachmentName.length > 10 
                    ? item.attachmentName.substring(0, 10) + '...' 
                    : item.attachmentName}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const filteredAnnouncements = getFilteredAnnouncements();

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
          <Text style={styles.headerTitle}>{t('announcements')}</Text>
          <TouchableOpacity 
            style={[
              styles.viewToggleButton,
              showAll && styles.viewToggleButtonActive
            ]}
            onPress={() => setShowAll(!showAll)}
          >
            <Icon 
              name={showAll ? 'format-list-bulleted' : 'star'} 
              size={20} 
              color="#ffffff" 
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('searchAnnouncements')}
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={20} color="#94a3b8" />
            </TouchableOpacity>
          ) : null}
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

      {/* Announcements List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#38bdf8" />
          <Text style={styles.loadingText}>{t('loadingAnnouncements')}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredAnnouncements}
          renderItem={renderAnnouncementItem}
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
              <Icon name="campaign" size={60} color="#e2e8f0" />
              <Text style={styles.emptyText}>{t('noAnnouncements')}</Text>
              <Text style={styles.emptySubText}>
                {t('tryChangingFilters')}
              </Text>
            </View>
          }
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderText}>
                {showAll ? t('allAnnouncements') : t('latestAnnouncements')}
              </Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>
                  {filteredAnnouncements.length}
                </Text>
              </View>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Announcement Detail Modal */}
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

            {selectedAnnouncement && (
              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScrollContent}
              >
                <View style={styles.modalPriority}>
                  <View style={[
                    styles.modalPriorityBadge, 
                    { backgroundColor: getPriorityColor(selectedAnnouncement.priority) + '15' }
                  ]}>
                    <Icon 
                      name={getPriorityIcon(selectedAnnouncement.priority)} 
                      size={16} 
                      color={getPriorityColor(selectedAnnouncement.priority)} 
                    />
                    <Text style={[
                      styles.modalPriorityText, 
                      { color: getPriorityColor(selectedAnnouncement.priority) }
                    ]}>
                      {language === 'gu' ? t(selectedAnnouncement.priority) : selectedAnnouncement.priority} {t('priority')}
                    </Text>
                  </View>
                </View>

                <Text style={styles.modalTitle}>
                  {language === 'gu' ? selectedAnnouncement.titleGuj || selectedAnnouncement.title : selectedAnnouncement.title}
                </Text>

                <View style={styles.modalMetaGrid}>
                  <View style={styles.modalMetaItem}>
                    <Icon name="category" size={16} color="#64748b" />
                    <Text style={styles.modalMetaLabel}>{t('category')}</Text>
                    <Text style={styles.modalMetaValue}>
                      {language === 'gu' ? 
                        categories.find(c => c.id === selectedAnnouncement.category)?.name || selectedAnnouncement.category : 
                        selectedAnnouncement.category}
                    </Text>
                  </View>
                  
                  <View style={styles.modalMetaItem}>
                    <Icon name="calendar-today" size={16} color="#64748b" />
                    <Text style={styles.modalMetaLabel}>{t('published')}</Text>
                    <Text style={styles.modalMetaValue}>
                      {new Date(selectedAnnouncement.publishDate).toLocaleDateString(language === 'gu' ? 'gu-IN' : 'en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </Text>
                  </View>

                  {selectedAnnouncement.expiryDate && (
                    <View style={styles.modalMetaItem}>
                      <Icon name="event" size={16} color="#64748b" />
                      <Text style={styles.modalMetaLabel}>{t('expires')}</Text>
                      <Text style={styles.modalMetaValue}>
                        {new Date(selectedAnnouncement.expiryDate).toLocaleDateString()}
                      </Text>
                    </View>
                  )}

                  {selectedAnnouncement.targetAudience && selectedAnnouncement.targetAudience.length > 0 && (
                    <View style={styles.modalMetaItem}>
                      <Icon name="group" size={16} color="#64748b" />
                      <Text style={styles.modalMetaLabel}>{t('audience')}</Text>
                      <Text style={styles.modalMetaValue} numberOfLines={1}>
                        {selectedAnnouncement.targetAudience.map(a => t(a)).join(', ')}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.modalDescription}>
                  <Text style={styles.modalDescriptionLabel}>{t('description')}</Text>
                  <Text style={styles.modalDescriptionText}>
                    {language === 'gu' ? selectedAnnouncement.descriptionGuj || selectedAnnouncement.description : selectedAnnouncement.description}
                  </Text>
                </View>

                {selectedAnnouncement.attachmentName && (
                  <TouchableOpacity style={styles.modalAttachment}>
                    <View style={styles.attachmentIcon}>
                      <Icon name="attach-file" size={20} color="#38bdf8" />
                    </View>
                    <View style={styles.attachmentInfo}>
                      <Text style={styles.attachmentFileName}>{selectedAnnouncement.attachmentName}</Text>
                      <Text style={styles.attachmentAction}>{t('tapToView')}</Text>
                    </View>
                  </TouchableOpacity>
                )}

                <View style={styles.modalFooter}>
                  <Text style={styles.modalFooterText}>
                    {t('id')}: {selectedAnnouncement.id}
                  </Text>
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
  viewToggleButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  viewToggleButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
    padding: 0,
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
    fontWeight: '500',
  },
  selectedCategoryChipText: {
    color: '#ffffff',
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
  announcementCard: {
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
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 6,
    lineHeight: 22,
  },
  announcementDescription: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  attachmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    maxWidth: width * 0.3,
  },
  attachmentText: {
    fontSize: 10,
    color: '#38bdf8',
    marginLeft: 4,
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
  modalPriority: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  modalPriorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
  },
  modalPriorityText: {
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
  },
  modalMetaValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1e293b',
    flex: 1,
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
  modalAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  attachmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentFileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  attachmentAction: {
    fontSize: 12,
    color: '#38bdf8',
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
});

export default AnnouncementsScreen;