import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AdminReportGenerator = ({ onClose }) => {
    const [generating, setGenerating] = useState(false);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch data when component mounts
    useEffect(() => {
        fetchVillageData();
    }, []);

    const fetchVillageData = async () => {
        try {
            setLoading(true);
            // Use the new endpoint that returns COMPLETE data
            const response = await fetch('http://localhost:5000/get-full-report-data');
            const result = await response.json();

            if (result.success === false) {
                setError('Failed to fetch data');
            } else {
                console.log('📊 Full report data received:', result);
                setData(result);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Format date
    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp);
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get status counts for complaints
    const getComplaintStats = () => {
        const complaints = data?.complaints_list || {};
        const stats = {
            total: Object.keys(complaints).length,
            pending: 0,
            'in-progress': 0,
            resolved: 0,
            rejected: 0,
            byPriority: { high: 0, medium: 0, low: 0 },
            byCategory: {}
        };

        Object.values(complaints).forEach(complaint => {
            if (complaint.status === 'pending') stats.pending++;
            else if (complaint.status === 'in-progress') stats['in-progress']++;
            else if (complaint.status === 'resolved') stats.resolved++;
            else if (complaint.status === 'rejected') stats.rejected++;

            if (complaint.priority) {
                stats.byPriority[complaint.priority] = (stats.byPriority[complaint.priority] || 0) + 1;
            }

            if (complaint.category) {
                stats.byCategory[complaint.category] = (stats.byCategory[complaint.category] || 0) + 1;
            }
        });

        return stats;
    };

    // Get shop statistics
    const getShopStats = () => {
        const shops = data?.shops_list || {};
        const stats = {
            total: Object.keys(shops).length,
            approved: 0,
            pending: 0,
            rejected: 0,
            byCategory: {},
            totalItems: 0,
            totalInventoryValue: 0
        };

        Object.values(shops).forEach(shop => {
            if (shop.status === 'approved') stats.approved++;
            else if (shop.status === 'pending') stats.pending++;
            else if (shop.status === 'rejected') stats.rejected++;

            if (shop.category) {
                stats.byCategory[shop.category] = (stats.byCategory[shop.category] || 0) + 1;
            }

            if (shop.items) {
                const shopItems = Object.values(shop.items);
                stats.totalItems += shopItems.length;
                shopItems.forEach(item => {
                    stats.totalInventoryValue += (item.price || 0) * (item.stock || 0);
                });
            }
        });

        return stats;
    };

    // Get user statistics
    const getUserStats = () => {
        const users = data?.user_data || {};
        return {
            total: Object.keys(users).length,
            byGender: {
                male: Object.values(users).filter(u => u.gender === 'male').length,
                female: Object.values(users).filter(u => u.gender === 'female').length,
                other: Object.values(users).filter(u => u.gender === 'other').length
            },
            byAgeGroup: Object.values(users).reduce((acc, user) => {
                const group = user.ageGroup || 'Unknown';
                acc[group] = (acc[group] || 0) + 1;
                return acc;
            }, {}),
            bplCount: Object.values(users).filter(u => u.isBPL === true).length,
            disabledCount: Object.values(users).filter(u => u.isDisabled === true).length,
            voterCount: Object.values(users).filter(u => u.isVoter === true).length
        };
    };

    // Get announcement statistics
    const getAnnouncementStats = () => {
        const announcements = data?.published_announcement || {};
        return {
            total: Object.keys(announcements).length,
            byCategory: Object.values(announcements).reduce((acc, ann) => {
                const cat = ann.category || 'general';
                acc[cat] = (acc[cat] || 0) + 1;
                return acc;
            }, {}),
            byPriority: Object.values(announcements).reduce((acc, ann) => {
                const priority = ann.priority || 'normal';
                acc[priority] = (acc[priority] || 0) + 1;
                return acc;
            }, {})
        };
    };

    // Get village statistics
    const getVillageStats = () => {
        const village = data?.village_data || {};
        return {
            name: village.details?.name || 'N/A',
            population: village.details?.population || 0,
            households: village.details?.households || 0,
            area: village.details?.area || 'N/A',
            literacyRate: village.details?.literacyRate || 'N/A',
            facilities: village.details?.facilities || [],
            importantPlaces: village.important_places || []
        };
    };

    const generateReport = () => {
        setGenerating(true);

        try {
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const primaryColor = [56, 189, 248];
            const secondaryColor = [100, 116, 139];

            const addHeader = (doc, pageNum) => {
                doc.setFillColor(...primaryColor);
                doc.rect(0, 0, 210, 20, 'F');

                doc.setTextColor(255, 255, 255);
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text('GramSetu - Village Management System', 105, 12, { align: 'center' });

                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.text(`Report Generated: ${new Date().toLocaleString()}`, 105, 18, { align: 'center' });

                doc.setTextColor(0, 0, 0);
            };

            const addFooter = (doc, pageNum) => {
                doc.setDrawColor(...secondaryColor);
                doc.line(20, 287, 190, 287);

                doc.setFontSize(8);
                doc.setTextColor(...secondaryColor);
                doc.text(`Page ${pageNum}`, 105, 292, { align: 'center' });
                doc.text('© GramSetu - Digital Village Management', 105, 297, { align: 'center' });
            };

            let pageNum = 1;
            addHeader(doc, pageNum);

            // Title
            doc.setFontSize(24);
            doc.setTextColor(...primaryColor);
            doc.setFont('helvetica', 'bold');
            doc.text('Administrative Report', 105, 35, { align: 'center' });

            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'normal');
            doc.text(`Village: ${data?.village_data?.details?.name || 'Visavada'}`, 105, 45, { align: 'center' });

            // Executive Summary
            doc.setFontSize(16);
            doc.setTextColor(...primaryColor);
            doc.setFont('helvetica', 'bold');
            doc.text('Executive Summary', 20, 60);

            const complaintStats = getComplaintStats();
            const shopStats = getShopStats();
            const userStats = getUserStats();
            const villageStats = getVillageStats();
            const announcementStats = getAnnouncementStats();

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);

            let yPos = 70;

            doc.text(`• Total Village Population: ${villageStats.population.toLocaleString()}`, 25, yPos);
            yPos += 6;
            doc.text(`• Total Households: ${villageStats.households.toLocaleString()}`, 25, yPos);
            yPos += 6;
            doc.text(`• Registered Citizens: ${userStats.total}`, 25, yPos);
            yPos += 6;
            doc.text(`• Registered Shops: ${shopStats.total}`, 25, yPos);
            yPos += 6;
            doc.text(`• Total Complaints: ${complaintStats.total}`, 25, yPos);
            yPos += 6;
            const resolvedPercent = complaintStats.total > 0 ? Math.round(complaintStats.resolved / complaintStats.total * 100) : 0;
            doc.text(`• Resolved Complaints: ${complaintStats.resolved} (${resolvedPercent}%)`, 25, yPos);
            yPos += 6;
            doc.text(`• Active Announcements: ${announcementStats.total}`, 25, yPos);
            yPos += 6;
            doc.text(`• Total Inventory Value: ₹${shopStats.totalInventoryValue.toLocaleString()}`, 25, yPos);
            yPos += 15;

            // Live Data
            const liveData = data?.live_data || [];
            const liveDataRows = liveData.map(item => [item.label, item.value]);

            if (liveDataRows.length > 0) {
                autoTable(doc, {
                    startY: yPos,
                    head: [['Statistics Metric', 'Value']],
                    body: liveDataRows,
                    theme: 'striped',
                    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
                    styles: { fontSize: 10 },
                    margin: { left: 20, right: 20 }
                });

                yPos = doc.lastAutoTable.finalY + 15;
            }

            // Complaints Summary
            const complaintSummaryRows = [
                ['Total Complaints', complaintStats.total],
                ['Pending', complaintStats.pending],
                ['In Progress', complaintStats['in-progress']],
                ['Resolved', complaintStats.resolved],
                ['Rejected', complaintStats.rejected]
            ];

            autoTable(doc, {
                startY: yPos,
                head: [['Complaint Status', 'Count']],
                body: complaintSummaryRows,
                theme: 'striped',
                headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
                styles: { fontSize: 10 },
                margin: { left: 20, right: 20 }
            });

            yPos = doc.lastAutoTable.finalY + 15;

            // Complaints by Category
            const categoryNames = {
                water: 'Water Supply',
                electricity: 'Electricity',
                road: 'Road',
                sanitation: 'Sanitation',
                drainage: 'Drainage',
                health: 'Health',
                animal: 'Animal'
            };

            const categoryRows = Object.entries(complaintStats.byCategory).map(([cat, count]) => [
                categoryNames[cat] || cat,
                count
            ]);

            if (categoryRows.length > 0) {
                autoTable(doc, {
                    startY: yPos,
                    head: [['Complaint Category', 'Count']],
                    body: categoryRows,
                    theme: 'striped',
                    headStyles: { fillColor: secondaryColor, textColor: [255, 255, 255] },
                    styles: { fontSize: 10 },
                    margin: { left: 20, right: 20 }
                });

                yPos = doc.lastAutoTable.finalY + 15;
            }

            // Shops Summary
            const shopSummaryRows = [
                ['Total Shops', shopStats.total],
                ['Approved', shopStats.approved],
                ['Pending', shopStats.pending],
                ['Rejected', shopStats.rejected],
                ['Total Items', shopStats.totalItems],
                ['Total Inventory Value', `₹${shopStats.totalInventoryValue.toLocaleString()}`]
            ];

            autoTable(doc, {
                startY: yPos,
                head: [['Shop Metric', 'Value']],
                body: shopSummaryRows,
                theme: 'striped',
                headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
                styles: { fontSize: 10 },
                margin: { left: 20, right: 20 }
            });

            yPos = doc.lastAutoTable.finalY + 15;

            // Shops by Category
            const shopCategoryNames = {
                grocery: 'Grocery',
                medical: 'Medical',
                hardware: 'Hardware',
                electronics: 'Electronics',
                food: 'Food',
                stationery: 'Stationery',
                dairy: 'Dairy',
                agriculture: 'Agriculture'
            };

            const shopCategoryRows = Object.entries(shopStats.byCategory).map(([cat, count]) => [
                shopCategoryNames[cat] || cat,
                count
            ]);

            if (shopCategoryRows.length > 0) {
                autoTable(doc, {
                    startY: yPos,
                    head: [['Shop Category', 'Count']],
                    body: shopCategoryRows,
                    theme: 'striped',
                    headStyles: { fillColor: secondaryColor, textColor: [255, 255, 255] },
                    styles: { fontSize: 10 },
                    margin: { left: 20, right: 20 }
                });

                yPos = doc.lastAutoTable.finalY + 15;
            }

            // Citizen Demographics
            const citizenRows = [
                ['Total Registered Citizens', userStats.total],
                ['Male', userStats.byGender.male],
                ['Female', userStats.byGender.female],
                ['BPL Families', userStats.bplCount],
                ['Disabled Persons', userStats.disabledCount],
                ['Voters', userStats.voterCount]
            ];

            autoTable(doc, {
                startY: yPos,
                head: [['Demographic', 'Count']],
                body: citizenRows,
                theme: 'striped',
                headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
                styles: { fontSize: 10 },
                margin: { left: 20, right: 20 }
            });

            yPos = doc.lastAutoTable.finalY + 15;

            // Announcements
            const announcementRows = [
                ['Total Announcements', announcementStats.total]
            ];

            autoTable(doc, {
                startY: yPos,
                head: [['Announcements Metric', 'Value']],
                body: announcementRows,
                theme: 'striped',
                headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
                styles: { fontSize: 10 },
                margin: { left: 20, right: 20 }
            });

            // Footer on last page
            addFooter(doc, pageNum);

            // Save the PDF
            const fileName = `GramSetu_Admin_Report_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);

            alert('Report generated successfully!');

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p>Loading village data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.errorContainer}>
                <span style={styles.errorIcon}>⚠️</span>
                <p style={styles.errorText}>{error}</p>
                <button
                    onClick={fetchVillageData}
                    style={styles.retryButton}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Preview Stats */}
            <div style={styles.previewSection}>
                <h3 style={styles.previewTitle}>Report Preview</h3>
                <div style={styles.statsGrid}>
                    <div style={styles.statBox}>
                        <span style={styles.statValue}>{data?.village_data?.stat?.[0]?.value || '42'}</span>
                        <span style={styles.statLabel}>Registered Shops</span>
                    </div>
                    <div style={styles.statBox}>
                        <span style={styles.statValue}>{data?.village_data?.stat?.[1]?.value || '8'}</span>
                        <span style={styles.statLabel}>Active Schemes</span>
                    </div>
                    <div style={styles.statBox}>
                        <span style={styles.statValue}>{data?.village_data?.stat?.[2]?.value || '12'}</span>
                        <span style={styles.statLabel}>Pending Tasks</span>
                    </div>
                    <div style={styles.statBox}>
                        <span style={styles.statValue}>{data?.village_data?.stat?.[3]?.value || '3,245'}</span>
                        <span style={styles.statLabel}>App Users</span>
                    </div>
                </div>
            </div>

            {/* Generate Button */}
            <button
                onClick={generateReport}
                disabled={generating}
                style={{
                    ...styles.generateButton,
                    ...(generating ? styles.disabledButton : {})
                }}
            >
                {generating ? (
                    <>
                        <span style={styles.spinner}></span>
                        Generating Report...
                    </>
                ) : (
                    <>
                        <span style={styles.buttonIcon}>📊</span>
                        Generate Full Report
                    </>
                )}
            </button>
        </div>
    );
};

const styles = {
    container: {
        width: '100%'
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center'
    },
    errorContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center'
    },
    errorIcon: {
        fontSize: '40px',
        marginBottom: '15px'
    },
    errorText: {
        color: '#ef4444',
        fontSize: '14px',
        marginBottom: '20px'
    },
    retryButton: {
        background: '#38bdf8',
        color: 'white',
        border: 'none',
        padding: '10px 24px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer'
    },
    previewSection: {
        background: '#f8fafc',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        border: '1px solid #e2e8f0'
    },
    previewTitle: {
        margin: '0 0 15px 0',
        fontSize: '16px',
        color: '#1e293b',
        fontWeight: '600'
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px'
    },
    statBox: {
        background: 'white',
        padding: '15px',
        borderRadius: '10px',
        textAlign: 'center',
        border: '1px solid #e2e8f0'
    },
    statValue: {
        display: 'block',
        fontSize: '20px',
        fontWeight: '700',
        color: '#38bdf8',
        marginBottom: '5px'
    },
    statLabel: {
        fontSize: '11px',
        color: '#64748b',
        fontWeight: '500'
    },
    generateButton: {
        background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
        color: 'white',
        border: 'none',
        padding: '14px 20px',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        width: '100%',
        transition: 'all 0.3s ease'
    },
    disabledButton: {
        opacity: '0.7',
        cursor: 'not-allowed'
    },
    buttonIcon: {
        fontSize: '18px'
    },
    spinner: {
        display: 'inline-block',
        width: '16px',
        height: '16px',
        border: '2px solid white',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    }
};

export default AdminReportGenerator;