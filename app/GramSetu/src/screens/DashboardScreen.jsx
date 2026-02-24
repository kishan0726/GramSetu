import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Image,
    Dimensions,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

const DashboardScreen = ({ navigation }) => {
    const { t } = useLanguage();
    const [userName, setUserName] = useState('Kishan Shingrakhiya');
    const [announcementCount, setAnnouncementCount] = useState(3);
    const [weather, setWeather] = useState({
        temp: '32°C',
        condition: 'Sunny',
        icon: '☀️',
    });

    // Quick actions menu items (announcements and profile removed)
    const quickActions = [
        {
            id: 1,
            title: t('map'),
            icon: 'map',
            screen: 'Map',
            color: '#3b82f6',
            bgColor: '#eff6ff',
        },
        {
            id: 2,
            title: t('complaints'),
            icon: 'report-problem',
            screen: 'Complaints',
            color: '#ef4444',
            bgColor: '#fef2f2',
        },
        {
            id: 3,
            title: t('shops'),
            icon: 'store',
            screen: 'Shops',
            color: '#10b981',
            bgColor: '#f0fdf4',
        },
        {
            id: 4,
            title: t('publicServices'),
            icon: 'build',
            screen: 'Services',
            color: '#f59e0b',
            bgColor: '#fffbeb',
        },
        {
            id: 5,
            title: t('myAnimals'),
            icon: 'pets',
            screen: 'AnimalTracking',
            color: '#ec4899',
            bgColor: '#fdf2f8',
        },
        {
            id: 6,
            title: t('schemes'),
            icon: 'card-giftcard',
            screen: 'Schemes',
            color: '#8b5cf6',
            bgColor: '#f5f3ff',
        },
    ];

    // Recent announcements
    const recentAnnouncements = [
        {
            id: 1,
            title: t('gramSabhaMeeting'),
            description: t('gramSabhaDesc'),
            date: '2024-03-20',
            time: '11:00 AM',
        },
        {
            id: 2,
            title: t('waterSupply'),
            description: t('waterSupplyDesc'),
            date: '2024-03-19',
            time: '7:00 AM',
        },
    ];

    // Services status
    const servicesStatus = [
        {
            id: 1,
            name: t('waterSupply'),
            status: 'active',
            icon: '💧',
            color: '#3b82f6',
        },
        {
            id: 2,
            name: t('electricity'),
            status: 'active',
            icon: '⚡',
            color: '#f59e0b',
        },
        {
            id: 3,
            name: t('roadMaintenance'),
            status: 'maintenance',
            icon: '🛣️',
            color: '#10b981',
        },
    ];

    const handleChatPress = () => {
        navigation.navigate('Chat');
    };

    const handleNotificationPress = () => {
        navigation.navigate('Announcements');
    };

    const handleProfilePress = () => {
        navigation.navigate('Profile');
    };

    const handleQuickAction = (screen) => {
        navigation.navigate(screen);
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
                {/* Quick Actions Grid - Now with 4 items */}
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

                {/* Recent Announcements */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t('recentAnnouncements')}</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Announcements')}>
                            <Text style={styles.seeAllText}>{t('seeAll')}</Text>
                        </TouchableOpacity>
                    </View>

                    {recentAnnouncements.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.announcementCard}
                            onPress={() => navigation.navigate('Announcements')}
                        >
                            <View style={styles.announcementIcon}>
                                <Icon name="campaign" size={20} color="#38bdf8" />
                            </View>
                            <View style={styles.announcementContent}>
                                <Text style={styles.announcementTitle}>{item.title}</Text>
                                <Text style={styles.announcementDesc} numberOfLines={1}>
                                    {item.description}
                                </Text>
                                <View style={styles.announcementMeta}>
                                    <Icon name="calendar-today" size={12} color="#94a3b8" />
                                    <Text style={styles.announcementDate}>{item.date}</Text>
                                    <Icon name="access-time" size={12} color="#94a3b8" />
                                    <Text style={styles.announcementTime}>{item.time}</Text>
                                </View>
                            </View>
                            <Icon name="chevron-right" size={20} color="#94a3b8" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Services Status */}
                <View style={[styles.section, styles.lastSection]}>
                    <Text style={styles.sectionTitle}>{t('servicesStatus')}</Text>
                    {servicesStatus.map((service) => (
                        <View key={service.id} style={styles.serviceCard}>
                            <View style={styles.serviceInfo}>
                                <Text style={styles.serviceIcon}>{service.icon}</Text>
                                <View>
                                    <Text style={styles.serviceName}>{service.name}</Text>
                                    <View style={styles.serviceStatus}>
                                        <View style={[styles.statusDot, { backgroundColor: getStatusColor(service.status) }]} />
                                        <Text style={[styles.statusText, { color: getStatusColor(service.status) }]}>
                                            {getStatusText(service.status)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.serviceAction}
                                onPress={() => navigation.navigate('Services')}
                            >
                                <Text style={styles.serviceActionText}>{t('viewDetails')}</Text>
                                <Icon name="arrow-forward" size={16} color="#38bdf8" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* Emergency Contacts */}
                <View style={[styles.section, styles.emergencySection]}>
                    <Text style={styles.sectionTitle}>{t('emergencyContacts')}</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.emergencyScroll}
                    >
                        <TouchableOpacity style={[styles.emergencyCard, { backgroundColor: '#ef4444' }]}>
                            <Icon name="local-police" size={28} color="#ffffff" />
                            <Text style={styles.emergencyTitle}>{t('police')}</Text>
                            <Text style={styles.emergencyNumber}>100</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.emergencyCard, { backgroundColor: '#10b981' }]}>
                            <Icon name="local-hospital" size={28} color="#ffffff" />
                            <Text style={styles.emergencyTitle}>{t('ambulance')}</Text>
                            <Text style={styles.emergencyNumber}>108</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.emergencyCard, { backgroundColor: '#f59e0b' }]}>
                            <Icon name="fire-hydrant" size={28} color="#ffffff" />
                            <Text style={styles.emergencyTitle}>{t('fire')}</Text>
                            <Text style={styles.emergencyNumber}>101</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.emergencyCard, { backgroundColor: '#3b82f6' }]}>
                            <Icon name="electric-bolt" size={28} color="#ffffff" />
                            <Text style={styles.emergencyTitle}>{t('electricity')}</Text>
                            <Text style={styles.emergencyNumber}>1912</Text>
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
    lastSection: {
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
    seeAllText: {
        fontSize: 14,
        color: '#38bdf8',
        fontWeight: '600',
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
    announcementCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    announcementIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    announcementContent: {
        flex: 1,
    },
    announcementTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    announcementDesc: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 6,
    },
    announcementMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    announcementDate: {
        fontSize: 10,
        color: '#94a3b8',
        marginLeft: 4,
        marginRight: 12,
    },
    announcementTime: {
        fontSize: 10,
        color: '#94a3b8',
        marginLeft: 4,
    },
    serviceCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    serviceInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    serviceIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    serviceName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    serviceStatus: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
    },
    serviceAction: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    serviceActionText: {
        fontSize: 12,
        color: '#38bdf8',
        marginRight: 4,
    },
    emergencySection: {
        marginBottom: 100,
    },
    emergencyScroll: {
        marginTop: 12,
    },
    emergencyCard: {
        width: 110,
        padding: 16,
        borderRadius: 12,
        marginRight: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    emergencyTitle: {
        fontSize: 12,
        color: '#ffffff',
        marginTop: 8,
        fontWeight: '500',
    },
    emergencyNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
        marginTop: 4,
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