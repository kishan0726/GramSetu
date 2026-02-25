import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../context/LanguageContext';

const AddShopItem = ({ navigation, route }) => {
  const { t } = useLanguage();
  const { shopData } = route.params;
  const [items, setItems] = useState([
    { id: Date.now().toString(), name: '', price: '', unit: '', stock: '' }
  ]);
  const [loading, setLoading] = useState(false);

  const addNewItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString() + Math.random(), name: '', price: '', unit: '', stock: '' }
    ]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    } else {
      Alert.alert(t('info'), t('cannotRemoveLastItem'));
    }
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const validateItems = () => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.name.trim()) {
        Alert.alert(t('error'), `${t('itemNameRequired')} (Item ${i + 1})`);
        return false;
      }
      if (!item.price) {
        Alert.alert(t('error'), `${t('priceRequired')} (Item ${i + 1})`);
        return false;
      }
      if (isNaN(parseFloat(item.price)) || parseFloat(item.price) <= 0) {
        Alert.alert(t('error'), `${t('validPriceRequired')} (Item ${i + 1})`);
        return false;
      }
      if (!item.unit.trim()) {
        Alert.alert(t('error'), `${t('unitRequired')} (Item ${i + 1})`);
        return false;
      }
    }
    return true;
  };

  const handleAddItems = () => {
    if (!validateItems()) return;

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        t('success'),
        `${items.length} ${t('itemsAddedSuccessfully')}`,
        [
          {
            text: t('addMore'),
            onPress: () => {
              setItems([{ id: Date.now().toString(), name: '', price: '', unit: '', stock: '' }]);
            }
          },
          {
            text: t('goToDashboard'),
            onPress: () => navigation.goBack()
          }
        ]
      );
    }, 1500);
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{t('item')} {index + 1}</Text>
        <TouchableOpacity 
          onPress={() => removeItem(item.id)}
          style={styles.removeButton}
        >
          <Icon name="delete-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.formRow}>
        <View style={styles.formField}>
          <Text style={styles.label}>{t('itemName')} *</Text>
          <TextInput
            style={styles.input}
            value={item.name}
            onChangeText={(text) => updateItem(item.id, 'name', text)}
            placeholder={t('enterItemName')}
          />
        </View>
      </View>

      <View style={styles.formRow}>
        <View style={[styles.formField, { flex: 2, marginRight: 8 }]}>
          <Text style={styles.label}>{t('price')} *</Text>
          <TextInput
            style={styles.input}
            value={item.price}
            onChangeText={(text) => updateItem(item.id, 'price', text)}
            placeholder={t('enterPrice')}
            keyboardType="numeric"
          />
        </View>

        <View style={[styles.formField, { flex: 1 }]}>
          <Text style={styles.label}>{t('unit')} *</Text>
          <TextInput
            style={styles.input}
            value={item.unit}
            onChangeText={(text) => updateItem(item.id, 'unit', text)}
            placeholder={t('enterUnit')}
          />
        </View>
      </View>

      <View style={styles.formRow}>
        <View style={styles.formField}>
          <Text style={styles.label}>{t('initialStock')}</Text>
          <TextInput
            style={styles.input}
            value={item.stock}
            onChangeText={(text) => updateItem(item.id, 'stock', text)}
            placeholder={t('enterStock')}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Unit Suggestions */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionContainer}>
        <TouchableOpacity 
          style={styles.suggestionChip}
          onPress={() => updateItem(item.id, 'unit', 'kg')}
        >
          <Text style={styles.suggestionText}>kg</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.suggestionChip}
          onPress={() => updateItem(item.id, 'unit', 'g')}
        >
          <Text style={styles.suggestionText}>g</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.suggestionChip}
          onPress={() => updateItem(item.id, 'unit', 'liter')}
        >
          <Text style={styles.suggestionText}>liter</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.suggestionChip}
          onPress={() => updateItem(item.id, 'unit', 'ml')}
        >
          <Text style={styles.suggestionText}>ml</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.suggestionChip}
          onPress={() => updateItem(item.id, 'unit', 'piece')}
        >
          <Text style={styles.suggestionText}>piece</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.suggestionChip}
          onPress={() => updateItem(item.id, 'unit', 'pack')}
        >
          <Text style={styles.suggestionText}>pack</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.suggestionChip}
          onPress={() => updateItem(item.id, 'unit', 'dozen')}
        >
          <Text style={styles.suggestionText}>dozen</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#38bdf8" barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('addMultipleItems')}</Text>
        <TouchableOpacity onPress={handleAddItems}>
          <Text style={styles.saveText}>{t('save')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryBar}>
        <Text style={styles.summaryText}>
          {t('totalItems')}: {items.length}
        </Text>
        <TouchableOpacity 
          style={styles.addMoreButton}
          onPress={addNewItem}
        >
          <Icon name="add" size={20} color="#38bdf8" />
          <Text style={styles.addMoreText}>{t('addAnother')}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleAddItems}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Icon name="check-circle" size={20} color="#ffffff" />
                <Text style={styles.submitButtonText}>
                  {t('addItems')} ({items.length})
                </Text>
              </>
            )}
          </TouchableOpacity>
        }
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#38bdf8" />
          <Text style={styles.loadingText}>{t('addingItems')}</Text>
        </View>
      )}
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
    padding: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  addMoreText: {
    fontSize: 12,
    color: '#38bdf8',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
  },
  itemCard: {
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
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#38bdf8',
  },
  removeButton: {
    padding: 4,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  formField: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  suggestionContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  suggestionChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  suggestionText: {
    fontSize: 12,
    color: '#1e293b',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#38bdf8',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 20,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#1e293b',
  },
});

export default AddShopItem;