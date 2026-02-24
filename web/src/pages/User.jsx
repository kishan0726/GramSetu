import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../stylesheets/User.css';

const User = () => {
    const navigate = useNavigate();

    const genderOptions = [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' }
    ];

    const maritalOptions = [
        { value: 'unmarried', label: 'Unmarried' },
        { value: 'married', label: 'Married' },
        { value: 'widowed', label: 'Widowed' },
        { value: 'divorced', label: 'Divorced' }
    ];

    const occupationOptions = [
        'Farmer', 'Shopkeeper', 'Teacher', 'Government Employee',
        'Private Job', 'Business', 'Student', 'Homemaker', 'Retired', 'Other'
    ];

    const educationOptions = [
        'No Formal Education', 'Primary School', 'Middle School',
        'High School', 'Higher Secondary', 'Graduate', 'Post Graduate',
        'Diploma', 'ITI', 'Other'
    ];

    const bloodGroupOptions = [
        'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'
    ];

    const villageAreas = [
        'Main Village', 'North Area', 'South Area', 'East Area',
        'West Area', 'Near Temple', 'Near School', 'Near River', 'Other'
    ];

    const [activeTab, setActiveTab] = useState('alive');
    const [users, setUsers] = useState([]);
    const [expiredUsers, setExpiredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGender, setFilterGender] = useState('all');
    const [filterAgeGroup, setFilterAgeGroup] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showExpireModal, setShowExpireModal] = useState(false);
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [userToExpire, setUserToExpire] = useState(null);
    const [userToRestore, setUserToRestore] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state for adding new user
    const [formData, setFormData] = useState({
        id: null,
        firstName: '',
        lastName: '',
        firstNameGuj: '',
        lastNameGuj: '',
        gender: 'male',
        dateOfBirth: '',
        placeOfBirth: '',
        placeOfBirthGuj: '',
        fatherName: '',
        fatherNameGuj: '',
        motherName: '',
        motherNameGuj: '',
        address: '',
        addressGuj: '',
        villageArea: '',
        contactNumber: '',
        aadharNumber: '',
        occupation: '',
        occupationGuj: '',
        education: '',
        bloodGroup: '',
        maritalStatus: 'unmarried',
        isVoter: false,
        isBPL: false,
        isDisabled: false,
        disabilityDetails: '',
        profilePhoto: null,
        profilePhotoName: '',
        registeredDate: new Date().toISOString().split('T')[0],
        status: 'alive'
    });

    const [errors, setErrors] = useState({});

    // Load data from localStorage on component mount
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const response = await fetch("http://localhost:5000/get-users");
        const result = await response.json();

        if (result.success) {
            const alive = result.data.filter(u => u.status === "alive");
            const expired = result.data.filter(u => u.status === "expired");

            setUsers(alive);
            setExpiredUsers(expired);
        }
    };

    const saveUsers = async (user) => {
        const firstName = user.firstName;
        const birthYear = new Date(user.dateOfBirth).getFullYear();
        const password = firstName + birthYear;
        const updatedData = {...user, password}

        const response = await fetch(`http://localhost:5000/update-user/${user.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedData)
        })
        const result = await response.json();
        if (result.success)
            alert("Done")
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else if (type === 'file') {
            if (files && files[0]) {
                setFormData(prev => ({
                    ...prev,
                    profilePhoto: files[0],
                    profilePhotoName: files[0].name
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }
        if (!formData.firstNameGuj.trim()) {
            newErrors.firstNameGuj = 'Gujarati first name is required';
        }
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }
        if (!formData.lastNameGuj.trim()) {
            newErrors.lastNameGuj = 'Gujarati last name is required';
        }
        if (!formData.dateOfBirth) {
            newErrors.dateOfBirth = 'Date of birth is required';
        }
        if (!formData.fatherName.trim()) {
            newErrors.fatherName = 'Father\'s name is required';
        }
        if (!formData.fatherNameGuj.trim()) {
            newErrors.fatherNameGuj = 'Gujarati father\'s name is required';
        }
        if (!formData.motherName.trim()) {
            newErrors.motherName = 'Mother\'s name is required';
        }
        if (!formData.motherNameGuj.trim()) {
            newErrors.motherNameGuj = 'Gujarati mother\'s name is required';
        }
        if (!formData.placeOfBirth.trim()) {
            newErrors.placeOfBirth = 'Place of birth is required';
        }
        if (!formData.placeOfBirthGuj.trim()) {
            newErrors.placeOfBirthGuj = 'Gujarati place of birth is required';
        }
        if (!formData.address.trim()) {
            newErrors.address = 'Address is required';
        }
        if (!formData.addressGuj.trim()) {
            newErrors.addressGuj = 'Gujarati address is required';
        }
        if (!formData.villageArea) {
            newErrors.villageArea = 'Village area is required';
        }
        if (formData.contactNumber && !/^\d{10}$/.test(formData.contactNumber)) {
            newErrors.contactNumber = 'Enter valid 10-digit mobile number';
        }
        if (formData.aadharNumber && !/^\d{12}$/.test(formData.aadharNumber)) {
            newErrors.aadharNumber = 'Enter valid 12-digit Aadhar number';
        }
        if (formData.isDisabled && !formData.disabilityDetails.trim()) {
            newErrors.disabilityDetails = 'Please provide disability details';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const calculateAge = (dob) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const getAgeGroup = (age) => {
        if (age < 5) return 'Infant (0-4)';
        if (age < 12) return 'Child (5-11)';
        if (age < 18) return 'Teen (12-17)';
        if (age < 35) return 'Youth (18-34)';
        if (age < 60) return 'Adult (35-59)';
        return 'Senior (60+)';
    };

    const handleAddUser = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const newUser = {
                ...formData,
                id: formData.id || Date.now().toString(),
                registeredDate: formData.registeredDate || new Date().toISOString().split('T')[0],
                age: calculateAge(formData.dateOfBirth),
                ageGroup: getAgeGroup(calculateAge(formData.dateOfBirth)),
                status: 'alive'
            };

            await saveUsers(newUser);
            alert(formData.id ? 'User updated successfully!' : 'New user added successfully!');

            // Reset form and switch to alive tab
            resetForm();
            setActiveTab('alive');

        } catch (error) {
            alert('Error saving user. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            id: null,
            firstName: '',
            lastName: '',
            firstNameGuj: '',
            lastNameGuj: '',
            gender: 'male',
            dateOfBirth: '',
            placeOfBirth: '',
            placeOfBirthGuj: '',
            fatherName: '',
            fatherNameGuj: '',
            motherName: '',
            motherNameGuj: '',
            address: '',
            addressGuj: '',
            villageArea: '',
            contactNumber: '',
            aadharNumber: '',
            occupation: '',
            occupationGuj: '',
            education: '',
            bloodGroup: '',
            maritalStatus: 'unmarried',
            isVoter: false,
            isBPL: false,
            isDisabled: false,
            disabilityDetails: '',
            profilePhoto: null,
            profilePhotoName: '',
            registeredDate: new Date().toISOString().split('T')[0],
            status: 'alive'
        });
        setErrors({});
        setSelectedUser(null);
    };

    const handleEditUser = (user) => {
        setFormData(user);
        setSelectedUser(user);
        setActiveTab('add');
    };

    const handleExpireUser = (user) => {
        setUserToExpire(user);
        setShowExpireModal(true);
    };

    const confirmExpire = async () => {
        if (!userToExpire) return;

        const updatedUser = {
            ...userToExpire,
            status: "expired",
            expiryDate: new Date().toISOString().split("T")[0]
        };

        const response = await fetch(
            `http://localhost:5000/update-user/${userToExpire.id}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedUser)
            }
        );

        const result = await response.json();

        if (result.success) {
            await fetchUsers();
            setShowExpireModal(false);
            setUserToExpire(null);
            alert("User marked as expired");
        }
    };

    const handleRestoreUser = (user) => {
        setUserToRestore(user);
        setShowRestoreModal(true);
    };

    const confirmRestore = async () => {
        if (!userToRestore) return;

        const updatedUser = {
            ...userToRestore,
            status: "alive",
            expiryDate: null
        };

        const response = await fetch(
            `http://localhost:5000/update-user/${userToRestore.id}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedUser)
            }
        );

        const result = await response.json();

        if (result.success) {
            await fetchUsers();
            setShowRestoreModal(false);
            setUserToRestore(null);
            alert("User restored successfully");
        }
    };

    const getFilteredAliveUsers = () => {
        return users.filter(user => {
            const matchesSearch =
                user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.firstNameGuj.includes(searchTerm) ||
                user.fatherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.contactNumber.includes(searchTerm);

            const matchesGender = filterGender === 'all' || user.gender === filterGender;
            const matchesAgeGroup = filterAgeGroup === 'all' || user.ageGroup === filterAgeGroup;

            return matchesSearch && matchesGender && matchesAgeGroup;
        });
    };

    const getFilteredExpiredUsers = () => {
        return expiredUsers.filter(user => {
            const matchesSearch =
                user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.firstNameGuj.includes(searchTerm) ||
                user.fatherName.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesGender = filterGender === 'all' || user.gender === filterGender;

            return matchesSearch && matchesGender;
        });
    };

    const getTotalCounts = () => {
        const maleCount = users.filter(u => u.gender === 'male').length;
        const femaleCount = users.filter(u => u.gender === 'female').length;
        const childrenCount = users.filter(u => u.age < 18).length;
        const seniorCount = users.filter(u => u.age >= 60).length;
        const voterCount = users.filter(u => u.isVoter).length;
        const bplCount = users.filter(u => u.isBPL).length;

        return { maleCount, femaleCount, childrenCount, seniorCount, voterCount, bplCount };
    };

    const counts = getTotalCounts();

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <div className="user-container">
            {/* Header */}
            <div className="user-header">
                <h1>
                    Village Population Management
                </h1>
                <p className="user-header-subtitle">
                    Register new births, manage citizen records, and track village population
                </p>
            </div>

            {/* Stats Cards */}
            <div className="user-stats-grid">
                <div className="user-stat-card">
                    <div className="user-stat-content">
                        <span className="user-stat-label">Total Population</span>
                        <span className="user-stat-value">{users.length}</span>
                    </div>
                </div>
                <div className="user-stat-card">
                    <div className="user-stat-content">
                        <span className="user-stat-label">Male</span>
                        <span className="user-stat-value">{counts.maleCount}</span>
                    </div>
                </div>
                <div className="user-stat-card">
                    <div className="user-stat-content">
                        <span className="user-stat-label">Female</span>
                        <span className="user-stat-value">{counts.femaleCount}</span>
                    </div>
                </div>
                <div className="user-stat-card">
                    <div className="user-stat-content">
                        <span className="user-stat-label">Children (Below 18)</span>
                        <span className="user-stat-value">{counts.childrenCount}</span>
                    </div>
                </div>
                <div className="user-stat-card">
                    <div className="user-stat-content">
                        <span className="user-stat-label">Senior Citizens</span>
                        <span className="user-stat-value">{counts.seniorCount}</span>
                    </div>
                </div>
                <div className="user-stat-card">
                    <div className="user-stat-content">
                        <span className="user-stat-label">Voters</span>
                        <span className="user-stat-value">{counts.voterCount}</span>
                    </div>
                </div>
                <div className="user-stat-card">
                    <div className="user-stat-content">
                        <span className="user-stat-label">BPL Families</span>
                        <span className="user-stat-value">{counts.bplCount}</span>
                    </div>
                </div>
                <div className="user-stat-card">
                    <div className="user-stat-content">
                        <span className="user-stat-label">Expired</span>
                        <span className="user-stat-value">{expiredUsers.length}</span>
                    </div>
                </div>
            </div>

            {/* Main Tabs */}
            <div className="user-main-tabs">
                <button
                    className={`user-main-tab-btn ${activeTab === 'alive' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('alive');
                        setSearchTerm('');
                        setFilterGender('all');
                    }}
                >
                    Alive Citizens ({users.length})
                </button>
                <button
                    className={`user-main-tab-btn ${activeTab === 'expired' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('expired');
                        setSearchTerm('');
                        setFilterGender('all');
                    }}
                >
                    Expired Citizens ({expiredUsers.length})
                </button>
                <button
                    className={`user-main-tab-btn ${activeTab === 'add' ? 'active' : ''}`}
                    onClick={() => {
                        resetForm();
                        setActiveTab('add');
                    }}
                >
                    {formData.id ? 'Edit Citizen' : 'Register New Birth'}
                </button>
            </div>

            {/* Alive Citizens Tab */}
            {activeTab === 'alive' && (
                <div className="user-alive-view">
                    <div className="user-list-header">
                        <h2>Alive Citizens</h2>
                        <button
                            className="user-btn-primary"
                            onClick={() => {
                                resetForm();
                                setActiveTab('add');
                            }}
                        >
                            Register New Birth
                        </button>
                    </div>

                    {/* Search and Filter */}
                    <div className="user-search-filter">
                        <div className="user-search-box">
                            <input
                                type="text"
                                placeholder="Search by name, father's name, mobile..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="user-search-input"
                            />
                        </div>

                        <select
                            className="user-filter-select"
                            value={filterGender}
                            onChange={(e) => setFilterGender(e.target.value)}
                        >
                            <option value="all">All Genders</option>
                            {genderOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>

                        <select
                            className="user-filter-select"
                            value={filterAgeGroup}
                            onChange={(e) => setFilterAgeGroup(e.target.value)}
                        >
                            <option value="all">All Age Groups</option>
                            <option value="Infant (0-4)">Infant (0-4)</option>
                            <option value="Child (5-11)">Child (5-11)</option>
                            <option value="Teen (12-17)">Teen (12-17)</option>
                            <option value="Youth (18-34)">Youth (18-34)</option>
                            <option value="Adult (35-59)">Adult (35-59)</option>
                            <option value="Senior (60+)">Senior (60+)</option>
                        </select>
                    </div>

                    {/* Users List */}
                    {getFilteredAliveUsers().length === 0 ? (
                        <div className="user-empty-state">
                            <h3>No citizens found</h3>
                            <p>Register new births to add citizens to the village</p>
                            <button
                                className="user-btn-primary"
                                onClick={() => {
                                    resetForm();
                                    setActiveTab('add');
                                }}
                            >
                                Register New Birth
                            </button>
                        </div>
                    ) : (
                        <div className="user-grid">
                            {getFilteredAliveUsers().map((user) => (
                                <div key={user.id} className="user-card">
                                    <div className="user-card-header">
                                        <div className="user-avatar">
                                            {user.profilePhotoName ? '📷' : '👤'}
                                        </div>
                                        <div className="user-badges">
                                            {user.isVoter && <span className="user-badge voter">Voter</span>}
                                            {user.isBPL && <span className="user-badge bpl">BPL</span>}
                                            {user.isDisabled && <span className="user-badge disabled">Disabled</span>}
                                        </div>
                                    </div>

                                    <div className="user-card-body">
                                        <h3 className="user-name">{user.firstName} {user.lastName}</h3>
                                        <h4 className="user-name-guj">{user.firstNameGuj} {user.lastNameGuj}</h4>

                                        <div className="user-details">
                                            <div className="user-detail-item">
                                                <span className="user-detail-label">Father:</span>
                                                <span className="user-detail-value">{user.fatherName}</span>
                                            </div>
                                            <div className="user-detail-item">
                                                <span className="user-detail-label">Mother:</span>
                                                <span className="user-detail-value">{user.motherName}</span>
                                            </div>
                                            <div className="user-detail-item">
                                                <span className="user-detail-label">Age:</span>
                                                <span className="user-detail-value">{user.age} years ({user.ageGroup})</span>
                                            </div>
                                            <div className="user-detail-item">
                                                <span className="user-detail-label">Gender:</span>
                                                <span className="user-detail-value">
                                                    {user.gender === 'male' ? 'Male' : user.gender === 'female' ? 'Female' : 'Other'}
                                                </span>
                                            </div>
                                            <div className="user-detail-item">
                                                <span className="user-detail-label">Area:</span>
                                                <span className="user-detail-value">{user.villageArea}</span>
                                            </div>
                                            {user.occupation && (
                                                <div className="user-detail-item">
                                                    <span className="user-detail-label">Occupation:</span>
                                                    <span className="user-detail-value">{user.occupation}</span>
                                                </div>
                                            )}
                                            {user.contactNumber && (
                                                <div className="user-detail-item">
                                                    <span className="user-detail-label">Contact:</span>
                                                    <span className="user-detail-value">{user.contactNumber}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="user-card-footer">
                                        <div className="user-registered-date">
                                            Registered: {formatDate(user.registeredDate)}
                                        </div>
                                        <div className="user-card-actions">
                                            <button
                                                className="user-card-btn view"
                                                onClick={() => navigate(`/users/${user.id}`)}
                                            >
                                                View
                                            </button>
                                            <button
                                                className="user-card-btn edit"
                                                onClick={() => handleEditUser(user)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="user-card-btn delete"
                                                onClick={() => handleExpireUser(user)}
                                            >
                                                Expire
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Expired Citizens Tab */}
            {activeTab === 'expired' && (
                <div className="user-expired-view">
                    <div className="user-list-header">
                        <h2>Expired Citizens</h2>
                    </div>

                    {/* Search for expired */}
                    <div className="user-search-filter">
                        <div className="user-search-box">
                            <input
                                type="text"
                                placeholder="Search expired citizens..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="user-search-input"
                            />
                        </div>

                        <select
                            className="user-filter-select"
                            value={filterGender}
                            onChange={(e) => setFilterGender(e.target.value)}
                        >
                            <option value="all">All Genders</option>
                            {genderOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Expired Users List */}
                    {getFilteredExpiredUsers().length === 0 ? (
                        <div className="user-empty-state">
                            <h3>No expired citizens found</h3>
                            <p>Expired citizens will appear here when marked as expired</p>
                        </div>
                    ) : (
                        <div className="user-grid">
                            {getFilteredExpiredUsers().map((user) => (
                                <div key={user.id} className="user-card expired">
                                    <div className="user-card-header">
                                        <div className="user-avatar expired">
                                            ⚰️
                                        </div>
                                        <div className="user-expiry-badge">
                                            Expired on {formatDate(user.expiryDate)}
                                        </div>
                                    </div>

                                    <div className="user-card-body">
                                        <h3 className="user-name">{user.firstName} {user.lastName}</h3>
                                        <h4 className="user-name-guj">{user.firstNameGuj} {user.lastNameGuj}</h4>

                                        <div className="user-details">
                                            <div className="user-detail-item">
                                                <span className="user-detail-label">Father:</span>
                                                <span className="user-detail-value">{user.fatherName}</span>
                                            </div>
                                            <div className="user-detail-item">
                                                <span className="user-detail-label">Age at expiry:</span>
                                                <span className="user-detail-value">{user.age} years</span>
                                            </div>
                                            <div className="user-detail-item">
                                                <span className="user-detail-label">Gender:</span>
                                                <span className="user-detail-value">
                                                    {user.gender === 'male' ? 'Male' : user.gender === 'female' ? 'Female' : 'Other'}
                                                </span>
                                            </div>
                                            <div className="user-detail-item">
                                                <span className="user-detail-label">Area:</span>
                                                <span className="user-detail-value">{user.villageArea}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="user-card-footer">
                                        <div className="user-registered-date">
                                            Born: {formatDate(user.dateOfBirth)}
                                        </div>
                                        <div className="user-card-actions">
                                            <button
                                                className="user-card-btn view"
                                                onClick={() => {
                                                    alert(`Details of expired citizen: ${user.firstName} ${user.lastName}`);
                                                }}
                                            >
                                                View
                                            </button>
                                            <button
                                                className="user-card-btn edit"
                                                onClick={() => handleRestoreUser(user)}
                                            >
                                                Restore
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Add/Edit User Form */}
            {activeTab === 'add' && (
                <div className="user-form-view">
                    <div className="user-form-header">
                        <h2>{formData.id ? 'Edit Citizen' : 'Register New Birth'}</h2>
                        <button
                            className="user-btn-outline"
                            onClick={() => {
                                if (window.confirm('Discard changes?')) {
                                    resetForm();
                                    setActiveTab('alive');
                                }
                            }}
                        >
                            Cancel
                        </button>
                    </div>

                    <form className="user-form" onSubmit={handleAddUser}>
                        <div className="user-form-grid">
                            {/* English Section */}
                            <div className="user-form-section">
                                <div className="user-section-header">
                                    <div className="user-language-badge english">
                                        <span>🇬🇧 English Details</span>
                                    </div>
                                </div>

                                <div className="user-form-group">
                                    <label className="user-form-label">
                                        First Name *
                                        <span className="user-required-dot"></span>
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        placeholder="Enter first name"
                                        className={`user-form-input ${errors.firstName ? 'error' : ''}`}
                                    />
                                    {errors.firstName && <span className="user-error-message">{errors.firstName}</span>}
                                </div>

                                <div className="user-form-group">
                                    <label className="user-form-label">
                                        Last Name *
                                        <span className="user-required-dot"></span>
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        placeholder="Enter last name"
                                        className={`user-form-input ${errors.lastName ? 'error' : ''}`}
                                    />
                                    {errors.lastName && <span className="user-error-message">{errors.lastName}</span>}
                                </div>

                                <div className="user-form-group">
                                    <label className="user-form-label">
                                        Father's Name *
                                        <span className="user-required-dot"></span>
                                    </label>
                                    <input
                                        type="text"
                                        name="fatherName"
                                        value={formData.fatherName}
                                        onChange={handleInputChange}
                                        placeholder="Enter father's name"
                                        className={`user-form-input ${errors.fatherName ? 'error' : ''}`}
                                    />
                                    {errors.fatherName && <span className="user-error-message">{errors.fatherName}</span>}
                                </div>

                                <div className="user-form-group">
                                    <label className="user-form-label">
                                        Mother's Name *
                                        <span className="user-required-dot"></span>
                                    </label>
                                    <input
                                        type="text"
                                        name="motherName"
                                        value={formData.motherName}
                                        onChange={handleInputChange}
                                        placeholder="Enter mother's name"
                                        className={`user-form-input ${errors.motherName ? 'error' : ''}`}
                                    />
                                    {errors.motherName && <span className="user-error-message">{errors.motherName}</span>}
                                </div>

                                <div className="user-form-group">
                                    <label className="user-form-label">
                                        Place of Birth *
                                        <span className="user-required-dot"></span>
                                    </label>
                                    <input
                                        type="text"
                                        name="placeOfBirth"
                                        value={formData.placeOfBirth}
                                        onChange={handleInputChange}
                                        placeholder="Enter place of birth"
                                        className={`user-form-input ${errors.placeOfBirth ? 'error' : ''}`}
                                    />
                                    {errors.placeOfBirth && <span className="user-error-message">{errors.placeOfBirth}</span>}
                                </div>

                                <div className="user-form-group">
                                    <label className="user-form-label">
                                        Address *
                                        <span className="user-required-dot"></span>
                                    </label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="Enter full address"
                                        className={`user-form-textarea ${errors.address ? 'error' : ''}`}
                                        rows={3}
                                    />
                                    {errors.address && <span className="user-error-message">{errors.address}</span>}
                                </div>

                                <div className="user-form-group">
                                    <label className="user-form-label">Occupation</label>
                                    <select
                                        name="occupation"
                                        value={formData.occupation}
                                        onChange={handleInputChange}
                                        className="user-form-select"
                                    >
                                        <option value="">Select Occupation</option>
                                        {occupationOptions.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="user-form-group">
                                    <label className="user-form-label">Education</label>
                                    <select
                                        name="education"
                                        value={formData.education}
                                        onChange={handleInputChange}
                                        className="user-form-select"
                                    >
                                        <option value="">Select Education</option>
                                        {educationOptions.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Gujarati Section */}
                            <div className="user-form-section">
                                <div className="user-section-header">
                                    <div className="user-language-badge gujarati">
                                        <span>🇮🇳 ગુજરાતી વિગતો</span>
                                    </div>
                                </div>

                                <div className="user-form-group">
                                    <label className="user-form-label">
                                        પ્રથમ નામ *
                                        <span className="user-required-dot"></span>
                                    </label>
                                    <input
                                        type="text"
                                        name="firstNameGuj"
                                        value={formData.firstNameGuj}
                                        onChange={handleInputChange}
                                        placeholder="પ્રથમ નામ લખો"
                                        className={`user-form-input ${errors.firstNameGuj ? 'error' : ''}`}
                                    />
                                    {errors.firstNameGuj && <span className="user-error-message">{errors.firstNameGuj}</span>}
                                </div>

                                <div className="user-form-group">
                                    <label className="user-form-label">
                                        છેલ્લું નામ *
                                        <span className="user-required-dot"></span>
                                    </label>
                                    <input
                                        type="text"
                                        name="lastNameGuj"
                                        value={formData.lastNameGuj}
                                        onChange={handleInputChange}
                                        placeholder="છેલ્લું નામ લખો"
                                        className={`user-form-input ${errors.lastNameGuj ? 'error' : ''}`}
                                    />
                                    {errors.lastNameGuj && <span className="user-error-message">{errors.lastNameGuj}</span>}
                                </div>

                                <div className="user-form-group">
                                    <label className="user-form-label">
                                        પિતાનું નામ *
                                        <span className="user-required-dot"></span>
                                    </label>
                                    <input
                                        type="text"
                                        name="fatherNameGuj"
                                        value={formData.fatherNameGuj}
                                        onChange={handleInputChange}
                                        placeholder="પિતાનું નામ લખો"
                                        className={`user-form-input ${errors.fatherNameGuj ? 'error' : ''}`}
                                    />
                                    {errors.fatherNameGuj && <span className="user-error-message">{errors.fatherNameGuj}</span>}
                                </div>

                                <div className="user-form-group">
                                    <label className="user-form-label">
                                        માતાનું નામ *
                                        <span className="user-required-dot"></span>
                                    </label>
                                    <input
                                        type="text"
                                        name="motherNameGuj"
                                        value={formData.motherNameGuj}
                                        onChange={handleInputChange}
                                        placeholder="માતાનું નામ લખો"
                                        className={`user-form-input ${errors.motherNameGuj ? 'error' : ''}`}
                                    />
                                    {errors.motherNameGuj && <span className="user-error-message">{errors.motherNameGuj}</span>}
                                </div>

                                <div className="user-form-group">
                                    <label className="user-form-label">
                                        જન્મ સ્થળ *
                                        <span className="user-required-dot"></span>
                                    </label>
                                    <input
                                        type="text"
                                        name="placeOfBirthGuj"
                                        value={formData.placeOfBirthGuj}
                                        onChange={handleInputChange}
                                        placeholder="જન્મ સ્થળ લખો"
                                        className={`user-form-input ${errors.placeOfBirthGuj ? 'error' : ''}`}
                                    />
                                    {errors.placeOfBirthGuj && <span className="user-error-message">{errors.placeOfBirthGuj}</span>}
                                </div>

                                <div className="user-form-group">
                                    <label className="user-form-label">
                                        સરનામું *
                                        <span className="user-required-dot"></span>
                                    </label>
                                    <textarea
                                        name="addressGuj"
                                        value={formData.addressGuj}
                                        onChange={handleInputChange}
                                        placeholder="સંપૂર્ણ સરનામું લખો"
                                        className={`user-form-textarea ${errors.addressGuj ? 'error' : ''}`}
                                        rows={3}
                                    />
                                    {errors.addressGuj && <span className="user-error-message">{errors.addressGuj}</span>}
                                </div>

                                <div className="user-form-group">
                                    <label className="user-form-label">વ્યવસાય</label>
                                    <input
                                        type="text"
                                        name="occupationGuj"
                                        value={formData.occupationGuj}
                                        onChange={handleInputChange}
                                        placeholder="વ્યવસાય લખો"
                                        className="user-form-input"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Additional Details Section */}
                        <div className="user-details-section">
                            <h3 className="user-section-title">Additional Details</h3>

                            <div className="user-details-grid">
                                <div className="user-form-group">
                                    <label className="user-form-label">Date of Birth *</label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleInputChange}
                                        className={`user-form-input ${errors.dateOfBirth ? 'error' : ''}`}
                                        max={new Date().toISOString().split('T')[0]}
                                    />
                                    {errors.dateOfBirth && <span className="user-error-message">{errors.dateOfBirth}</span>}
                                </div>

                                <div className="user-form-group">
                                    <label className="user-form-label">Gender *</label>
                                    <div className="user-radio-group">
                                        {genderOptions.map(option => (
                                            <label key={option.value} className="user-radio-label">
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    value={option.value}
                                                    checked={formData.gender === option.value}
                                                    onChange={handleInputChange}
                                                    className="user-radio-input"
                                                />
                                                <span>{option.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="user-form-group">
                                    <label className="user-form-label">Village Area *</label>
                                    <select
                                        name="villageArea"
                                        value={formData.villageArea}
                                        onChange={handleInputChange}
                                        className={`user-form-select ${errors.villageArea ? 'error' : ''}`}
                                    >
                                        <option value="">Select Area</option>
                                        {villageAreas.map(area => (
                                            <option key={area} value={area}>{area}</option>
                                        ))}
                                    </select>
                                    {errors.villageArea && <span className="user-error-message">{errors.villageArea}</span>}
                                </div>

                                <div className="user-form-group">
                                    <label className="user-form-label">Marital Status</label>
                                    <select
                                        name="maritalStatus"
                                        value={formData.maritalStatus}
                                        onChange={handleInputChange}
                                        className="user-form-select"
                                    >
                                        {maritalOptions.map(option => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="user-form-group">
                                    <label className="user-form-label">Blood Group</label>
                                    <select
                                        name="bloodGroup"
                                        value={formData.bloodGroup}
                                        onChange={handleInputChange}
                                        className="user-form-select"
                                    >
                                        <option value="">Select Blood Group</option>
                                        {bloodGroupOptions.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="user-form-group">
                                    <label className="user-form-label">Contact Number</label>
                                    <input
                                        type="tel"
                                        name="contactNumber"
                                        value={formData.contactNumber}
                                        onChange={handleInputChange}
                                        placeholder="10-digit mobile number"
                                        className={`user-form-input ${errors.contactNumber ? 'error' : ''}`}
                                        maxLength={10}
                                    />
                                    {errors.contactNumber && <span className="user-error-message">{errors.contactNumber}</span>}
                                </div>

                                <div className="user-form-group">
                                    <label className="user-form-label">Aadhar Number</label>
                                    <input
                                        type="text"
                                        name="aadharNumber"
                                        value={formData.aadharNumber}
                                        onChange={handleInputChange}
                                        placeholder="12-digit Aadhar number"
                                        className={`user-form-input ${errors.aadharNumber ? 'error' : ''}`}
                                        maxLength={12}
                                    />
                                    {errors.aadharNumber && <span className="user-error-message">{errors.aadharNumber}</span>}
                                </div>

                                <div className="user-form-group">
                                    <label className="user-form-label">Registration Date</label>
                                    <input
                                        type="date"
                                        name="registeredDate"
                                        value={formData.registeredDate}
                                        onChange={handleInputChange}
                                        className="user-form-input"
                                        max={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>

                            {/* Checkboxes */}
                            <div className="user-checkbox-group">
                                <label className="user-checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="isVoter"
                                        checked={formData.isVoter}
                                        onChange={handleInputChange}
                                        className="user-checkbox-input"
                                    />
                                    <span>Is Voter (Age 18+)</span>
                                </label>

                                <label className="user-checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="isBPL"
                                        checked={formData.isBPL}
                                        onChange={handleInputChange}
                                        className="user-checkbox-input"
                                    />
                                    <span>BPL Family</span>
                                </label>

                                <label className="user-checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="isDisabled"
                                        checked={formData.isDisabled}
                                        onChange={handleInputChange}
                                        className="user-checkbox-input"
                                    />
                                    <span>Person with Disability</span>
                                </label>
                            </div>

                            {formData.isDisabled && (
                                <div className="user-form-group">
                                    <label className="user-form-label">Disability Details</label>
                                    <textarea
                                        name="disabilityDetails"
                                        value={formData.disabilityDetails}
                                        onChange={handleInputChange}
                                        placeholder="Please provide details about disability"
                                        className={`user-form-textarea ${errors.disabilityDetails ? 'error' : ''}`}
                                        rows={2}
                                    />
                                    {errors.disabilityDetails && <span className="user-error-message">{errors.disabilityDetails}</span>}
                                </div>
                            )}
                        </div>

                        {/* Form Actions */}
                        <div className="user-form-actions">
                            <button
                                type="button"
                                className="user-btn-secondary"
                                onClick={() => {
                                    if (window.confirm('Discard changes?')) {
                                        resetForm();
                                        setActiveTab('alive');
                                    }
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="user-btn-primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="user-loading-spinner"></span>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        {formData.id ? 'Update Citizen' : 'Register Birth'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Expire Confirmation Modal */}
            {showExpireModal && (
                <div className="user-modal-overlay">
                    <div className="user-modal">
                        <div className="user-modal-header">
                            <h3>Confirm Expiry</h3>
                            <button
                                className="user-modal-close"
                                onClick={() => setShowExpireModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="user-modal-body">
                            <p>Are you sure you want to mark <strong>{userToExpire?.firstName} {userToExpire?.lastName}</strong> as expired?</p>
                            <p className="user-modal-warning">This will move the citizen to expired records.</p>
                        </div>
                        <div className="user-modal-footer">
                            <button
                                className="user-btn-secondary"
                                onClick={() => setShowExpireModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="user-btn-danger"
                                onClick={confirmExpire}
                            >
                                Confirm Expiry
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Restore Confirmation Modal */}
            {showRestoreModal && (
                <div className="user-modal-overlay">
                    <div className="user-modal">
                        <div className="user-modal-header">
                            <h3>Restore Citizen</h3>
                            <button
                                className="user-modal-close"
                                onClick={() => setShowRestoreModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="user-modal-body">
                            <p>Are you sure you want to restore <strong>{userToRestore?.firstName} {userToRestore?.lastName}</strong> to active citizens?</p>
                        </div>
                        <div className="user-modal-footer">
                            <button
                                className="user-btn-secondary"
                                onClick={() => setShowRestoreModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="user-btn-primary"
                                onClick={confirmRestore}
                            >
                                Restore
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default User;