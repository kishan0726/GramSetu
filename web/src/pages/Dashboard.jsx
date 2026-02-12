import React from 'react';
import '../stylesheets/Dashboard.css';
import Sidebar from '../components/Sidebar';
import Home from '../components/Home';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-main">
        <Sidebar />
        <div className="dashboard-content">
          <Home />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;