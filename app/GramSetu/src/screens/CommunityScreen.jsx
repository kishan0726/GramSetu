import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    StatusBar,
    SafeAreaView,
    Alert,
    ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../context/LanguageContext';

// Sample community groups data
const SAMPLE_GROUPS = [
    {
        id: '1',
        name: 'Gram Panchayat Office',
        icon: '🏛️',
        lastMessage: 'Gram Sabha meeting scheduled for tomorrow at 11 AM',
        memberCount: 156,
        lastActive: '10:30 AM',
        category: 'Official',
    },
    {
        id: '2',
        name: 'Health Committee',
        icon: '🏥',
        lastMessage: 'Free health checkup camp this Sunday at PHC',
        memberCount: 45,
        lastActive: 'Yesterday',
        category: 'Health',
    },
    {
        id: '3',
        name: 'Farmers Group',
        icon: '🌾',
        lastMessage: 'New farming techniques workshop on Friday',
        memberCount: 89,
        lastActive: '2 days ago',
        category: 'Agriculture',
    },
    {
        id: '4',
        name: 'Women Self Help Group',
        icon: '👩‍👧‍👦',
        lastMessage: 'Monthly meeting on Wednesday at 4 PM',
        memberCount: 34,
        lastActive: '3 days ago',
        category: 'Social',
    },
    {
        id: '5',
        name: 'Youth Club',
        icon: '⚽',
        lastMessage: 'Sports tournament registration open',
        memberCount: 67,
        lastActive: '5 days ago',
        category: 'Sports',
    },
    {
        id: '6',
        name: 'Shopkeepers Association',
        icon: '🏪',
        lastMessage: 'Market committee meeting on Monday',
        memberCount: 42,
        lastActive: '1 week ago',
        category: 'Business',
    },
];

const CommunityScreen = ({ navigation }) => {
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [groups, setGroups] = useState(SAMPLE_GROUPS);
    const [selectedCategory, setSelectedCategory] = useState('all');

    const categories = [
        { id: 'all', name: 'All', icon: 'apps' },
        { id: 'Official', name: 'Official', icon: 'business' },
        { id: 'Health', name: 'Health', icon: 'local-hospital' },
        { id: 'Agriculture', name: 'Agriculture', icon: 'agriculture' },
        { id: 'Social', name: 'Social', icon: 'people' },
        { id: 'Sports', name: 'Sports', icon: 'sports' },
        { id: 'Business', name: 'Business', icon: 'store' },
    ];

    const filteredGroups = groups.filter(group => {
        const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            group.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || group.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const renderGroupItem = ({ item }) => (
        <TouchableOpacity
            style={styles.groupCard}
            onPress={() => navigation.navigate('ChatScreen', {
                chat: {
                    id: item.id,
                    userName: item.name,
                    userAvatar: item.icon,
                    lastMessage: item.lastMessage,
                    messageTime: item.lastActive,
                    isGroup: true,
                    memberCount: item.memberCount,
                    online: true,
                }
            })}
            activeOpacity={0.7}
        >
            <View style={styles.groupIconContainer}>
                <Text style={styles.groupIcon}>{item.icon}</Text>
            </View>

            <View style={styles.groupContent}>
                <View style={styles.groupHeader}>
                    <Text style={styles.groupName} numberOfLines={1}>
                        {item.name}
                    </Text>
                    <View style={styles.categoryTag}>
                        <Text style={styles.categoryText}>{item.category}</Text>
                    </View>
                </View>

                <Text style={styles.groupLastMessage} numberOfLines={2}>
                    {item.lastMessage}
                </Text>

                <View style={styles.groupFooter}>
                    <View style={styles.memberInfo}>
                        <Icon name="group" size={14} color="#64748b" />
                        <Text style={styles.memberCount}>{item.memberCount} members</Text>
                    </View>
                    <Text style={styles.lastActive}>{item.lastActive}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#38bdf8" barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={24} color="#ffffff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('communities') || 'Communities'}</Text>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => Alert.alert('Create Group', 'Create new community group')}
                >
                    <Icon name="add" size={24} color="#ffffff" />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Icon name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder={t('searchGroups') || 'Search groups...'}
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
                            ]}
                            onPress={() => setSelectedCategory(category.id)}
                        >
                            <Icon
                                name={category.icon}
                                size={16}
                                color={selectedCategory === category.id ? '#ffffff' : '#64748b'}
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

            {/* Groups List */}
            <FlatList
                data={filteredGroups}
                renderItem={renderGroupItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Icon name="people" size={60} color="#e2e8f0" />
                        <Text style={styles.emptyText}>{t('noGroups') || 'No groups found'}</Text>
                    </View>
                }
            />

            {/* Create Group FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => Alert.alert('Create Group', 'Create new community group')}
                activeOpacity={0.8}
            >
                <Icon name="group-add" size={24} color="#ffffff" />
            </TouchableOpacity>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#ffffff',
    },
    createButton: {
        padding: 8,
        marginRight: -8,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        marginHorizontal: 16,
        marginVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        height: 44,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
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
        marginRight: 8,
    },
    selectedCategoryChip: {
        backgroundColor: '#38bdf8',
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
    listContainer: {
        padding: 16,
    },
    groupCard: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    groupIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 2,
        borderColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    groupIcon: {
        fontSize: 30,
    },
    groupContent: {
        flex: 1,
    },
    groupHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    groupName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        flex: 1,
    },
    categoryTag: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginLeft: 8,
    },
    categoryText: {
        fontSize: 10,
        color: '#64748b',
        fontWeight: '500',
    },
    groupLastMessage: {
        fontSize: 13,
        color: '#64748b',
        marginBottom: 8,
        lineHeight: 18,
    },
    groupFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    memberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    memberCount: {
        fontSize: 11,
        color: '#64748b',
    },
    lastActive: {
        fontSize: 10,
        color: '#94a3b8',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 14,
        color: '#94a3b8',
    },
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
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
});

export default CommunityScreen;