import { useState, useEffect } from 'react';

import Sidebar from '../components/Sidebar';
import Home from '../components/Home';

import '../stylesheets/Dashboard.css';

const Dashboard = () => {
  const [villageData, setVillageData] = useState({
    details: {
      name: '',
      district: '',
      state: '',
      slogan: '',
      description: '',
      established: '',
      literacyRate: '',
      mainCrops: [],
      facilities: []
    },
    sectors: [],
    important_places: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVillageData = async () => {
      try {
        const response = await fetch("http://localhost:5000/get-village-data");
        const data = await response.json();
        console.log(data)
        setVillageData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      finally {
        setLoading(false);
      }
    };

    fetchVillageData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading village data...
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-main">
        <Sidebar villageData={villageData} />
        <div className="dashboard-content">
          <Home villageData={villageData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;