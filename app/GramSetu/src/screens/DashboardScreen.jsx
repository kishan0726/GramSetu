import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    Alert,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { db } from '../config/firebase';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

const DashboardScreen = ({ navigation }) => {
    const { t, language } = useLanguage();
    const [userName, setUserName] = useState('Kishan Shingrakhiya');
    const [announcementCount, setAnnouncementCount] = useState(0);
    const [dashboardAnnouncements, setDashboardAnnouncements] = useState([]);
    const [weather, setWeather] = useState({
        temp: '32°C',
        condition: 'Sunny',
        icon: '☀️',
    });

    const categories = [
        { id: 'general', name: t('general'), icon: 'info', color: '#3b82f6' },
        { id: 'health', name: t('health'), icon: 'local-hospital', color: '#ef4444' },
        { id: 'utility', name: t('utility'), icon: 'power', color: '#f59e0b' },
    ];

    const quickActions = [
        {
            id: 1,
            title: t('map'),
            icon: 'map',
            screen: 'MapScreen',
            color: '#3b82f6',
            bgColor: '#eff6ff',
        },
        {
            id: 2,
            title: t('complaints'),
            icon: 'report-problem',
            screen: 'ComplaintsScreen',
            color: '#ef4444',
            bgColor: '#fef2f2',
        },
        {
            id: 3,
            title: t('shops'),
            icon: 'store',
            screen: 'ShopScreen',
            color: '#10b981',
            bgColor: '#f0fdf4',
        },
        {
            id: 4,
            title: t('publicServices'),
            icon: 'build',
            screen: 'PublicServicesScreen',
            color: '#f59e0b',
            bgColor: '#fffbeb',
        },
    ];

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

    const getWeatherDetails = (code) => {
        if (code === 0) {
            return { condition: "Clear Sky", icon: "☀️" };
        } else if (code >= 1 && code <= 3) {
            return { condition: "Partly Cloudy", icon: "⛅" };
        } else if (code >= 45 && code <= 48) {
            return { condition: "Fog", icon: "🌫️" };
        } else if (code >= 51 && code <= 67) {
            return { condition: "Rain", icon: "🌧️" };
        } else if (code >= 71 && code <= 77) {
            return { condition: "Snow", icon: "❄️" };
        } else if (code >= 80 && code <= 99) {
            return { condition: "Heavy Rain", icon: "⛈️" };
        } else {
            return { condition: "Unknown", icon: "🌤️" };
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

    useEffect(() => {
        getWeather();
        setUserOnline();
        const unsubscribe = fetchAnnouncements();
        return unsubscribe;
    }, []);

    // Format Data
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

    // Chat Press
    const handleChatPress = () => {
        navigation.navigate('ChatSetupScreen');
    };

    // Notification Press
    const handleNotificationPress = () => {
        navigation.navigate('AnnouncementsScreen');
    };

    // Profile Press
    const handleProfilePress = () => {
        navigation.navigate('ProfileScreen');
    };

    // Quick Action
    const handleQuickAction = (screen) => {
        navigation.navigate(screen);
    };

    // View All Announcemets
    const handleViewAllAnnouncements = () => {
        navigation.navigate('AnnouncementsScreen');
    };

    // Announcement Press
    const handleAnnouncementPress = (announcement) => {
        navigation.navigate('AnnouncementsScreen', { announcementId: announcement.id });
    };

    // Get Weather
    const getWeather = async () => {
        try {
            const url =
                "https://api.open-meteo.com/v1/forecast?latitude=21.6417&longitude=69.6292&current_weather=true&temperature_unit=celsius";
            const response = await axios.get(url);
            const data = response.data.current_weather;

            const weatherInfo = getWeatherDetails(data.weathercode);

            setWeather({
                temp: `${Math.round(data.temperature)}°C`,
                condition: weatherInfo.condition,
                icon: weatherInfo.icon,
            });

        } catch (error) {
            console.log(error);
        }
    };

    // Fetch Announcements
    const fetchAnnouncements = () => {
        const reference = db.ref('published_announcement');

        reference.on('value', snapshot => {
            if (!snapshot.exists()) {
                setAnnouncementCount(0);
                setDashboardAnnouncements([]);
                return;
            }

            const data = Object.values(snapshot.val());
            const now = new Date();
            const userType = "all"; // Replace with real user role

            const activeAnnouncements = data.filter(item => {

                const notExpired =
                    !item.expiryDate ||
                    item.expiryDate === "" ||
                    new Date(item.expiryDate) >= now;

                const audienceMatch =
                    item.targetAudience?.includes("all") ||
                    item.targetAudience?.includes(userType);

                return notExpired && audienceMatch;
            });

            // Sort newest first
            const sorted = activeAnnouncements.sort(
                (a, b) => new Date(b.publishDate) - new Date(a.publishDate)
            );

            setAnnouncementCount(sorted.length);

            // Only show latest 3 on dashboard
            setDashboardAnnouncements(sorted.slice(0, 5));
        });

        return () => reference.off();
    };

    // Set User Online
    const setUserOnline = async () => {

        const session = await AsyncStorage.getItem("userSession");
        const userId = JSON.parse(session)?.userId;

        const userRef = database().ref(`users/${userId}`);

        userRef.update({
            online: true
        });

        userRef.onDisconnect().update({
            online: false,
            lastSeen: Date.now()
        });
    };

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#38bdf8" barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity
                        style={styles.userInfo}
                        onPress={handleProfilePress}
                        activeOpacity={0.7}
                    >
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>👤</Text>
                        </View>
                        <View>
                            <Text style={styles.greeting}>{t('welcomeBack')}</Text>
                            <Text style={styles.userName}>{userName}</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.headerIcons}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={handleNotificationPress}
                        >
                            <Icon name="notifications" size={24} color="#ffffff" />

                            {announcementCount > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>
                                        {announcementCount > 9 ? '9+' : announcementCount}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Weather Card */}
                <View style={styles.weatherCard}>
                    <View style={styles.weatherInfo}>
                        <Text style={styles.weatherTemp}>{weather.temp}</Text>
                        <Text style={styles.weatherCondition}>{weather.condition}</Text>
                    </View>
                    <Text style={styles.weatherIcon}>{weather.icon}</Text>
                </View>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Quick Actions Grid */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('quickActions')}</Text>
                    <View style={styles.gridContainer}>
                        {quickActions.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={[styles.gridItem, { backgroundColor: item.bgColor }]}
                                onPress={() => handleQuickAction(item.screen)}
                            >
                                <View style={[styles.gridIconContainer, { backgroundColor: item.color + '20' }]}>
                                    <Icon name={item.icon} size={24} color={item.color} />
                                </View>
                                <Text style={styles.gridItemText}>{item.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Recent Announcements - Matching AnnouncementsScreen design */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t('recentAnnouncements')}</Text>
                        <TouchableOpacity
                            style={styles.moreButton}
                            onPress={handleViewAllAnnouncements}
                        >
                            <Text style={styles.moreButtonText}>{t('more')}</Text>
                            <Icon name="chevron-right" size={16} color="#38bdf8" />
                        </TouchableOpacity>
                    </View>

                    {dashboardAnnouncements.map((item, index) => {
                        const categoryColor = getCategoryColor(item.category);

                        return (
                            <TouchableOpacity
                                key={item.id}
                                style={[
                                    styles.announcementCard,
                                    index === 0 && styles.firstCard
                                ]}
                                onPress={() => handleAnnouncementPress(item)}
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
                                                {language === 'gu' ? t(item.category) : item.category}
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

                                    <Text style={styles.announcementTitle} numberOfLines={1}>
                                        {language === 'gu' ? item.titleGuj || item.title : item.title}
                                    </Text>

                                    <Text style={styles.announcementDescription} numberOfLines={1}>
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
                                                    {item.attachmentName.length > 8
                                                        ? item.attachmentName.substring(0, 8) + '...'
                                                        : item.attachmentName}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Emergency Contacts */}
                <View style={[styles.section, styles.emergencySection]}>
                    <Text style={styles.sectionTitle}>{t('emergencyContacts')}</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.emergencyScroll}
                    >
                        <TouchableOpacity
                            style={[styles.emergencyCard, { backgroundColor: '#ef4444' }]}
                            onPress={() => Alert.alert(t('emergency'), t('callPolice'))}
                        >
                            <Icon name="local-police" size={28} color="#ffffff" />
                            <Text style={styles.emergencyTitle}>{t('police')}</Text>
                            <Text style={styles.emergencyNumber}>100</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.emergencyCard, { backgroundColor: '#10b981' }]}
                            onPress={() => Alert.alert(t('emergency'), t('callAmbulance'))}
                        >
                            <Icon name="local-hospital" size={28} color="#ffffff" />
                            <Text style={styles.emergencyTitle}>{t('ambulance')}</Text>
                            <Text style={styles.emergencyNumber}>108</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.emergencyCard, { backgroundColor: '#f59e0b' }]}
                            onPress={() => Alert.alert(t('emergency'), t('callFire'))}
                        >
                            <Icon name="fire-hydrant" size={28} color="#ffffff" />
                            <Text style={styles.emergencyTitle}>{t('fire')}</Text>
                            <Text style={styles.emergencyNumber}>101</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.emergencyCard, { backgroundColor: '#3b82f6' }]}
                            onPress={() => Alert.alert(t('emergency'), t('callElectricity'))}
                        >
                            <Icon name="electric-bolt" size={28} color="#ffffff" />
                            <Text style={styles.emergencyTitle}>{t('electricity')}</Text>
                            <Text style={styles.emergencyNumber}>1912</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.emergencyCard, { backgroundColor: '#8b5cf6' }]}
                            onPress={() => Alert.alert(t('emergency'), t('callDisaster'))}
                        >
                            <Icon name="warning" size={28} color="#ffffff" />
                            <Text style={styles.emergencyTitle}>{t('disaster')}</Text>
                            <Text style={styles.emergencyNumber}>112</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </ScrollView>

            {/* Circular Chat Button */}
            <TouchableOpacity
                style={styles.chatButton}
                onPress={handleChatPress}
                activeOpacity={0.8}
            >
                <View style={styles.chatButtonInner}>
                    <Icon name="chat" size={28} color="#ffffff" />
                </View>
            </TouchableOpacity>
        </View>
    );
};

// StyleSheet
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        backgroundColor: '#38bdf8',
        paddingTop: 50,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    avatarText: {
        fontSize: 24,
    },
    greeting: {
        fontSize: 12,
        color: '#ffffff',
        opacity: 0.9,
    },
    userName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
        marginTop: 2,
    },
    headerIcons: {
        flexDirection: 'row',
    },
    iconButton: {
        padding: 8,
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: '#ef4444',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#38bdf8',
    },
    badgeText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    weatherCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 16,
        padding: 16,
        marginTop: 8,
    },
    weatherInfo: {
        flex: 1,
    },
    weatherTemp: {
        fontSize: 28,
        fontWeight: '600',
        color: '#ffffff',
    },
    weatherCondition: {
        fontSize: 14,
        color: '#ffffff',
        opacity: 0.9,
        marginTop: 2,
    },
    weatherIcon: {
        fontSize: 40,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    section: {
        marginTop: 24,
    },
    emergencySection: {
        marginBottom: 100,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
    },
    moreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eff6ff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    moreButtonText: {
        fontSize: 12,
        color: '#38bdf8',
        fontWeight: '600',
        marginRight: 2,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridItem: {
        width: cardWidth,
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    gridIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    gridItemText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
    },
    // Announcement card styles matching AnnouncementsScreen
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
        padding: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },
    categoryText: {
        fontSize: 9,
        fontWeight: '500',
        marginLeft: 4,
        textTransform: 'capitalize',
    },
    priorityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },
    priorityText: {
        fontSize: 9,
        fontWeight: '500',
        marginLeft: 4,
        textTransform: 'capitalize',
    },
    announcementTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
        lineHeight: 18,
    },
    announcementDescription: {
        fontSize: 11,
        color: '#64748b',
        lineHeight: 15,
        marginBottom: 6,
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
        fontSize: 9,
        color: '#94a3b8',
    },
    attachmentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eff6ff',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        maxWidth: width * 0.25,
    },
    attachmentText: {
        fontSize: 8,
        color: '#38bdf8',
        marginLeft: 2,
    },
    emergencyScroll: {
        marginTop: 12,
    },
    emergencyCard: {
        width: 100,
        padding: 14,
        borderRadius: 12,
        marginRight: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    emergencyTitle: {
        fontSize: 11,
        color: '#ffffff',
        marginTop: 6,
        fontWeight: '500',
    },
    emergencyNumber: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#ffffff',
        marginTop: 2,
    },
    chatButton: {
        position: 'absolute',
        bottom: 90,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#38bdf8',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
        borderWidth: 3,
        borderColor: '#ffffff',
    },
    chatButtonInner: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: '#0ea5e9',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default DashboardScreen;