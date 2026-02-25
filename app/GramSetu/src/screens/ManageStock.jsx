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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../context/LanguageContext';

const ManageStock = ({ navigation, route }) => {
  const { t } = useLanguage();
  const { shopData } = route.params;
  const [inventory, setInventory] = useState(shopData.inventory || []);

  const updateStock = (itemId, newStock) => {
    setInventory(inventory.map(item => 
      item.id === itemId ? { ...item, stock: parseInt(newStock) || 0 } : item
    ));
  };

  const handleSave = () => {
    // Save updated stock
    Alert.alert(t('success'), t('stockUpdated'));
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#38bdf8" barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('manageStock')}</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveText}>{t('save')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {inventory.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemUnit}>{item.unit}</Text>
            </View>
            
            <View style={styles.stockControl}>
              <TouchableOpacity 
                style={styles.stockButton}
                onPress={() => updateStock(item.id, item.stock - 1)}
              >
                <Icon name="remove" size={20} color="#64748b" />
              </TouchableOpacity>
              
              <TextInput
                style={styles.stockInput}
                value={item.stock.toString()}
                onChangeText={(text) => updateStock(item.id, text)}
                keyboardType="numeric"
              />
              
              <TouchableOpacity 
                style={styles.stockButton}
                onPress={() => updateStock(item.id, item.stock + 1)}
              >
                <Icon name="add" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
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
  content: {
    padding: 16,
  },
  itemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  itemUnit: {
    fontSize: 12,
    color: '#64748b',
  },
  stockControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stockButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockInput: {
    width: 50,
    height: 36,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
});

export default ManageStock;