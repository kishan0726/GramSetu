import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { useLanguage } from '../context/LanguageContext';

const ShopReportGenerator = ({ shopData, items, shopId, visible, onClose }) => {
  const { t } = useLanguage();
  const [generating, setGenerating] = useState(false);
  const [reportType, setReportType] = useState('full'); // 'full', 'inventory', 'summary'

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Calculate inventory statistics
  const calculateStats = () => {
    const totalItems = items.length;
    const totalStock = items.reduce((sum, item) => sum + (parseInt(item.stock) || 0), 0);
    const totalValue = items.reduce((sum, item) => 
      sum + ((parseFloat(item.price) || 0) * (parseInt(item.stock) || 0)), 0
    );
    
    // Calculate low stock items (stock < 10)
    const lowStockItems = items.filter(item => (item.stock || 0) < 10).length;
    
    // Calculate out of stock items
    const outOfStockItems = items.filter(item => (item.stock || 0) === 0).length;

    return { totalItems, totalStock, totalValue, lowStockItems, outOfStockItems };
  };

  // Generate HTML content based on report type
  const generateHTML = () => {
    const stats = calculateStats();
    
    // Common styles
    const styles = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #f8fafc;
          padding: 30px;
          color: #1e293b;
        }
        
        .report-container {
          max-width: 1200px;
          margin: 0 auto;
          background: white;
          border-radius: 24px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.05);
          overflow: hidden;
        }
        
        .report-header {
          background: linear-gradient(135deg, #38bdf8, #0ea5e9);
          padding: 40px;
          color: white;
        }
        
        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .shop-badge {
          background: rgba(255,255,255,0.2);
          padding: 8px 16px;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 500;
        }
        
        .shop-name {
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 10px;
          letter-spacing: -0.5px;
        }
        
        .shop-meta {
          display: flex;
          gap: 20px;
          font-size: 14px;
          opacity: 0.9;
        }
        
        .report-title {
          font-size: 18px;
          font-weight: 600;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 2px solid rgba(255,255,255,0.2);
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          padding: 30px;
          background: #f8fafc;
        }
        
        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.02);
          border: 1px solid #e2e8f0;
        }
        
        .stat-label {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        
        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #0ea5e9;
        }
        
        .stat-sub {
          font-size: 14px;
          color: #334155;
          margin-top: 5px;
        }
        
        .warning-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 30px;
          font-size: 12px;
          font-weight: 500;
          margin-left: 10px;
        }
        
        .warning-low { background: #fef3c7; color: #92400e; }
        .warning-out { background: #fee2e2; color: #991b1b; }
        
        .section {
          padding: 30px;
          border-top: 2px solid #e2e8f0;
        }
        
        .section-title {
          font-size: 20px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        
        .info-item {
          background: #f8fafc;
          padding: 15px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }
        
        .info-label {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 5px;
        }
        
        .info-value {
          font-size: 16px;
          font-weight: 500;
          color: #1e293b;
        }
        
        .coordinates {
          font-family: 'Courier New', monospace;
          background: #0f172a;
          color: #a5f3fc;
          padding: 10px;
          border-radius: 8px;
          font-size: 14px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }
        
        th {
          background: #f1f5f9;
          padding: 12px;
          text-align: left;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          border-bottom: 2px solid #cbd5e1;
        }
        
        td {
          padding: 12px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 14px;
        }
        
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 30px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .status-active { background: #dcfce7; color: #166534; }
        .status-low { background: #fef3c7; color: #92400e; }
        .status-out { background: #fee2e2; color: #991b1b; }
        
        .footer {
          background: #f1f5f9;
          padding: 30px;
          text-align: center;
          font-size: 12px;
          color: #64748b;
          border-top: 2px solid #e2e8f0;
        }
        
        .watermark {
          position: fixed;
          bottom: 20px;
          right: 20px;
          opacity: 0.1;
          font-size: 60px;
          transform: rotate(-15deg);
          pointer-events: none;
        }
        
        @media print {
          body { background: white; }
          .no-print { display: none; }
        }
      </style>
    `;

    // Shop Details Section
    const shopDetailsHTML = `
      <div class="section">
        <div class="section-title">
          <span>🏪</span> Shop Details
        </div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Owner Name</div>
            <div class="info-value">${shopData?.ownerName || 'N/A'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Email</div>
            <div class="info-value">${shopData?.email || 'N/A'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Phone</div>
            <div class="info-value">${shopData?.mobileNumber || shopData?.phone || 'N/A'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Category</div>
            <div class="info-value">${shopData?.category || 'N/A'}</div>
          </div>
        </div>
        <div style="margin-top: 15px;">
          <div class="info-item">
            <div class="info-label">Address</div>
            <div class="info-value">${shopData?.address || 'N/A'}</div>
          </div>
        </div>
        <div style="margin-top: 15px;">
          <div class="info-item">
            <div class="info-label">Description</div>
            <div class="info-value">${shopData?.description || 'N/A'}</div>
          </div>
        </div>
        ${shopData?.coordinates ? `
          <div style="margin-top: 15px;">
            <div class="info-label">Location Coordinates</div>
            <div class="coordinates">
              Lat: ${shopData.coordinates.lat || 'N/A'}, Lng: ${shopData.coordinates.lng || 'N/A'}
            </div>
          </div>
        ` : ''}
        <div style="margin-top: 15px;">
          <div class="info-item">
            <div class="info-label">Registration Date</div>
            <div class="info-value">${formatDate(shopData?.createdAt)}</div>
          </div>
        </div>
        <div style="margin-top: 15px;">
          <div class="info-item">
            <div class="info-label">Last Updated</div>
            <div class="info-value">${formatDate(shopData?.lastUpdated)}</div>
          </div>
        </div>
      </div>
    `;

    // Inventory Section
    const inventoryHTML = `
      <div class="section">
        <div class="section-title">
          <span>📦</span> Inventory Report
        </div>
        
        <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr); padding: 0 0 20px 0;">
          <div class="stat-card">
            <div class="stat-label">Total Items</div>
            <div class="stat-value">${stats.totalItems}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total Stock</div>
            <div class="stat-value">${stats.totalStock}</div>
            <div class="stat-sub">units</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Inventory Value</div>
            <div class="stat-value">${formatCurrency(stats.totalValue)}</div>
          </div>
        </div>
        
        <div style="display: flex; gap: 20px; margin-bottom: 20px;">
          <div class="stat-card" style="flex: 1;">
            <div class="stat-label">Low Stock Items</div>
            <div class="stat-value" style="color: #f59e0b;">${stats.lowStockItems}</div>
            <span class="warning-badge warning-low">Below 10 units</span>
          </div>
          <div class="stat-card" style="flex: 1;">
            <div class="stat-label">Out of Stock</div>
            <div class="stat-value" style="color: #ef4444;">${stats.outOfStockItems}</div>
            <span class="warning-badge warning-out">Zero stock</span>
          </div>
        </div>
        
        ${items.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Price</th>
                <th>Unit</th>
                <th>Stock</th>
                <th>Value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => {
                const stockStatus = (item.stock || 0) <= 0 ? 'out' : (item.stock || 0) < 10 ? 'low' : 'active';
                const statusClass = stockStatus === 'active' ? 'status-active' : stockStatus === 'low' ? 'status-low' : 'status-out';
                const statusText = stockStatus === 'active' ? 'In Stock' : stockStatus === 'low' ? 'Low Stock' : 'Out of Stock';
                
                return `
                  <tr>
                    <td><strong>${item.name}</strong></td>
                    <td>${formatCurrency(item.price)}</td>
                    <td>${item.unit || 'unit'}</td>
                    <td>${item.stock || 0}</td>
                    <td>${formatCurrency((item.price || 0) * (item.stock || 0))}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
            <tfoot>
              <tr style="background: #f8fafc; font-weight: 600;">
                <td colspan="4" style="text-align: right;">Total Value:</td>
                <td colspan="2">${formatCurrency(stats.totalValue)}</td>
              </tr>
            </tfoot>
          </table>
        ` : '<p style="text-align: center; padding: 30px; color: #64748b;">No items in inventory</p>'}
      </div>
    `;

    // Summary Section
    const summaryHTML = `
      <div class="section">
        <div class="section-title">
          <span>📊</span> Summary Report
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Total Items</div>
            <div class="stat-value">${stats.totalItems}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total Stock</div>
            <div class="stat-value">${stats.totalStock}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Inventory Value</div>
            <div class="stat-value">${formatCurrency(stats.totalValue)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Low Stock Items</div>
            <div class="stat-value" style="color: #f59e0b;">${stats.lowStockItems}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Out of Stock</div>
            <div class="stat-value" style="color: #ef4444;">${stats.outOfStockItems}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Avg Item Value</div>
            <div class="stat-value">${stats.totalItems ? formatCurrency(stats.totalValue / stats.totalItems) : '₹0.00'}</div>
          </div>
        </div>
        
        <div style="margin-top: 20px;">
          <div class="info-item">
            <div class="info-label">Shop Status</div>
            <div class="info-value">
              <span class="status-badge status-${shopData?.status || 'pending'}">
                ${(shopData?.status || 'pending').toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        
        ${shopData?.businessProof ? `
          <div style="margin-top: 20px;">
            <div class="info-item">
              <div class="info-label">Business Proof</div>
              <div class="info-value">${shopData.businessProof}</div>
            </div>
          </div>
        ` : ''}
      </div>
    `;

    // Select content based on report type
    let contentHTML = '';
    switch(reportType) {
      case 'full':
        contentHTML = shopDetailsHTML + inventoryHTML + summaryHTML;
        break;
      case 'inventory':
        contentHTML = inventoryHTML;
        break;
      case 'summary':
        contentHTML = summaryHTML;
        break;
      default:
        contentHTML = shopDetailsHTML + inventoryHTML;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${styles}
      </head>
      <body>
        <div class="report-container">
          <div class="report-header">
            <div class="header-top">
              <span class="shop-badge">ID: ${shopId}</span>
              <span class="shop-badge">Generated: ${new Date().toLocaleDateString()}</span>
            </div>
            <h1 class="shop-name">${shopData?.shopName || shopData?.name || 'Shop Report'}</h1>
            <div class="shop-meta">
              <span>👤 ${shopData?.ownerName || 'N/A'}</span>
              <span>📞 ${shopData?.mobileNumber || shopData?.phone || 'N/A'}</span>
            </div>
            <div class="report-title">
              ${reportType === 'full' ? 'Complete Shop Report' : 
                reportType === 'inventory' ? 'Inventory Report' : 'Summary Report'}
            </div>
          </div>
          
          ${contentHTML}
          
          <div class="footer">
            <p>GramSetu - Digital Village Management System</p>
            <p>This report was generated on ${new Date().toLocaleString()}</p>
            <p style="margin-top: 10px;">© 2024 GramSetu. All rights reserved.</p>
          </div>
        </div>
        <div class="watermark">GramSetu</div>
      </body>
      </html>
    `;
  };

  // Generate PDF
  const generatePDF = async () => {
    if (!shopData) {
      Alert.alert(t('error'), t('noDataToGenerate'));
      return null;
    }

    setGenerating(true);

    try {
      const html = generateHTML();
      const fileName = `${shopId}_${reportType}_report_${Date.now()}`;

      const options = {
        html,
        fileName,
        directory: 'Documents',
      };

      const file = await RNHTMLtoPDF.convert(options);
      console.log('PDF generated:', file.filePath);
      return file.filePath;
    } catch (error) {
      console.error('PDF generation error:', error);
      Alert.alert(t('error'), t('pdfGenerationFailed'));
      return null;
    } finally {
      setGenerating(false);
    }
  };

  // Handle download
  const handleDownload = async () => {
    const filePath = await generatePDF();
    if (filePath) {
      Alert.alert(t('success'), `${t('pdfSaved')}\n${filePath}`);
      onClose();
    }
  };

  // Handle share
  const handleShare = async () => {
    const filePath = await generatePDF();
    if (filePath) {
      try {
        await Share.open({
          url: `file://${filePath}`,
          type: 'application/pdf',
          title: t('shareReport'),
          subject: `${shopData?.shopName || 'Shop'} Report`,
        });
        onClose();
      } catch (error) {
        if (!error.message.includes('canceled')) {
          Alert.alert(t('error'), t('shareFailed'));
        }
      }
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('generateReport')}</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalBody}>
            {/* Shop Preview */}
            <View style={styles.previewCard}>
              <Text style={styles.previewShopName}>
                {shopData?.shopName || shopData?.name || 'Shop'}
              </Text>
              <Text style={styles.previewShopId}>ID: {shopId}</Text>
              <View style={styles.previewStats}>
                <View style={styles.previewStat}>
                  <Text style={styles.previewStatLabel}>Items</Text>
                  <Text style={styles.previewStatValue}>{items.length}</Text>
                </View>
                <View style={styles.previewStat}>
                  <Text style={styles.previewStatLabel}>Value</Text>
                  <Text style={styles.previewStatValue}>
                    {formatCurrency(calculateStats().totalValue)}
                  </Text>
                </View>
                <View style={styles.previewStat}>
                  <Text style={styles.previewStatLabel}>Stock</Text>
                  <Text style={styles.previewStatValue}>{calculateStats().totalStock}</Text>
                </View>
              </View>
            </View>

            {/* Report Type Selection */}
            <Text style={styles.sectionLabel}>{t('reportType')}</Text>
            <View style={styles.typeGrid}>
              <TouchableOpacity
                style={[styles.typeCard, reportType === 'full' && styles.typeCardSelected]}
                onPress={() => setReportType('full')}
              >
                <Icon name="description" size={32} color={reportType === 'full' ? '#38bdf8' : '#64748b'} />
                <Text style={[styles.typeText, reportType === 'full' && styles.typeTextSelected]}>
                  {t('fullReport')}
                </Text>
                <Text style={styles.typeDesc}>{t('fullReportDesc')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeCard, reportType === 'inventory' && styles.typeCardSelected]}
                onPress={() => setReportType('inventory')}
              >
                <Icon name="inventory" size={32} color={reportType === 'inventory' ? '#38bdf8' : '#64748b'} />
                <Text style={[styles.typeText, reportType === 'inventory' && styles.typeTextSelected]}>
                  {t('inventoryReport')}
                </Text>
                <Text style={styles.typeDesc}>{t('inventoryReportDesc')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeCard, reportType === 'summary' && styles.typeCardSelected]}
                onPress={() => setReportType('summary')}
              >
                <Icon name="summarize" size={32} color={reportType === 'summary' ? '#38bdf8' : '#64748b'} />
                <Text style={[styles.typeText, reportType === 'summary' && styles.typeTextSelected]}>
                  {t('summaryReport')}
                </Text>
                <Text style={styles.typeDesc}>{t('summaryReportDesc')}</Text>
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.downloadButton]}
                onPress={handleDownload}
                disabled={generating}
              >
                {generating ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Icon name="download" size={20} color="#ffffff" />
                    <Text style={styles.actionButtonText}>{t('download')}</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.shareButton]}
                onPress={handleShare}
                disabled={generating}
              >
                {generating ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Icon name="share" size={20} color="#ffffff" />
                    <Text style={styles.actionButtonText}>{t('share')}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
  },
  modalBody: {
    padding: 20,
  },
  previewCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  previewShopName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  previewShopId: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
  },
  previewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
  },
  previewStat: {
    alignItems: 'center',
  },
  previewStatLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 2,
  },
  previewStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#38bdf8',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  typeGrid: {
    gap: 12,
    marginBottom: 20,
  },
  typeCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  typeCardSelected: {
    borderColor: '#38bdf8',
    backgroundColor: '#f0f9ff',
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 4,
  },
  typeTextSelected: {
    color: '#38bdf8',
  },
  typeDesc: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  actionButtons: {
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
  downloadButton: {
    backgroundColor: '#38bdf8',
  },
  shareButton: {
    backgroundColor: '#10b981',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default ShopReportGenerator;