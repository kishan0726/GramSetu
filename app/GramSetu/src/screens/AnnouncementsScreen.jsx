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
import { db } from '../config/firebase'

const { width, height } = Dimensions.get('window');

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
  { id: 'emergency', name: t('emergency'), icon: 'warning', color: '#ef4444' },
  { id: 'scheme', name: t('scheme'), icon: 'account-balance-wallet', color: '#10b981' },
  { id: 'event', name: t('event'), icon: 'event', color: '#8b5cf6' },
  { id: 'maintenance', name: t('maintenance'), icon: 'build', color: '#f59e0b' },
  { id: 'holiday', name: t('holiday'), icon: 'celebration', color: '#ec4899' },
  { id: 'meeting', name: t('meeting'), icon: 'groups', color: '#6366f1' },
  { id: 'important', name: t('important'), icon: 'priority-high', color: '#ef4444' },
];

  useEffect(() => {
    const unsubscribe = fetchAnnouncements();
    return unsubscribe;
  }, []);

  const fetchAnnouncements = () => {
    setLoading(true);

    const reference = db.ref('published_announcement');

    reference.on('value', snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.val();

        // Convert object → array
        const announcementsArray = Object.values(data);

        const now = new Date();

        // Filter expired announcements
        const filtered = announcementsArray.filter(item => {
          if (!item.expiryDate) return true;
          return new Date(item.expiryDate) >= now;
        });

        // Sort newest first
        const sorted = filtered.sort((a, b) =>
          new Date(b.publishDate) - new Date(a.publishDate)
        );

        setAnnouncements(sorted);
      } else {
        setAnnouncements([]);
      }

      setLoading(false);
      setRefreshing(false);
    });

    // Cleanup listener
    return () => reference.off();
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
                        {new Date(selectedAnnouncement.expiryDate).toLocaleDateString(language === 'gu' ? 'gu-IN' : 'en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
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