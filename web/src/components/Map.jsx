// import React, { useState, useEffect, useRef } from 'react';
// import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, Tooltip, useMap } from 'react-leaflet';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
// import '../stylesheets/Map.css';

// // Fix for default icons in Leaflet
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
//   iconUrl: require('leaflet/dist/images/marker-icon.png'),
//   shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
// });

// // Custom icons
// const createCustomIcon = (iconChar, color = '#38bdf8') => {
//   return L.divIcon({
//     html: `<div style="
//       background: ${color};
//       width: 40px;
//       height: 40px;
//       border-radius: 50%;
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       color: white;
//       font-size: 20px;
//       font-weight: bold;
//       border: 3px solid white;
//       box-shadow: 0 2px 5px rgba(0,0,0,0.3);
//     ">${iconChar}</div>`,
//     className: 'custom-div-icon',
//     iconSize: [40, 40],
//     iconAnchor: [20, 40],
//   });
// };

// // Map controls component
// const MapControls = ({ onZoomIn, onZoomOut, onResetView, onToggleLayer }) => {
//   return (
//     <div className="leaflet-control leaflet-control-custom">
//       <div className="control-group">
//         <button className="control-btn" onClick={onZoomIn} title="Zoom In">
//           <span className="control-icon">+</span>
//         </button>
//         <button className="control-btn" onClick={onZoomOut} title="Zoom Out">
//           <span className="control-icon">-</span>
//         </button>
//         <button className="control-btn" onClick={onResetView} title="Reset View">
//           <span className="control-icon">⌖</span>
//         </button>
//       </div>
//     </div>
//   );
// };

// // Real-time vehicle component
// const RealTimeVehicle = ({ vehicle, icon }) => {
//   const [position, setPosition] = useState(vehicle.position);
  
//   useEffect(() => {
//     const interval = setInterval(() => {
//       // Simulate movement
//       setPosition(prev => [
//         prev[0] + (Math.random() * 0.0005 - 0.00025),
//         prev[1] + (Math.random() * 0.0005 - 0.00025)
//       ]);
//     }, 3000);

//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <Marker position={position} icon={icon}>
//       <Popup>
//         <div className="vehicle-popup">
//           <h4>{vehicle.name}</h4>
//           <p><strong>Type:</strong> {vehicle.type}</p>
//           <p><strong>Status:</strong> <span className={`status-${vehicle.status}`}>{vehicle.status}</span></p>
//           <p><strong>Speed:</strong> {vehicle.speed}</p>
//           <p><strong>Last Updated:</strong> Just now</p>
//         </div>
//       </Popup>
//     </Marker>
//   );
// };

// // Main component
// const VillageMap = () => {
//   const mapRef = useRef(null);
//   const [mapCenter] = useState([23.0225, 72.5714]); // Default village coordinates
//   const [zoomLevel, setZoomLevel] = useState(15);
//   const [showTraffic, setShowTraffic] = useState(false);
//   const [showSatellite, setShowSatellite] = useState(false);
//   const [selectedVehicle, setSelectedVehicle] = useState(null);
//   const [liveVehicles, setLiveVehicles] = useState([
//     {
//       id: 1,
//       name: 'Ambulance - RAM 112',
//       type: 'Emergency',
//       position: [23.0230, 72.5720],
//       speed: '45 km/h',
//       status: 'active',
//       icon: createCustomIcon('🚑', '#ef4444')
//     },
//     {
//       id: 2,
//       name: 'Water Tanker - WT 001',
//       type: 'Utility',
//       position: [23.0215, 72.5700],
//       speed: '25 km/h',
//       status: 'active',
//       icon: createCustomIcon('🚛', '#3b82f6')
//     },
//     {
//       id: 3,
//       name: 'Garbage Truck - GT 005',
//       type: 'Sanitation',
//       position: [23.0240, 72.5730],
//       speed: '20 km/h',
//       status: 'active',
//       icon: createCustomIcon('🚚', '#059669')
//     },
//     {
//       id: 4,
//       name: 'Police Patrol - PP 007',
//       type: 'Security',
//       position: [23.0220, 72.5695],
//       speed: '30 km/h',
//       status: 'patrolling',
//       icon: createCustomIcon('🚓', '#8b5cf6')
//     }
//   ]);

//   // Village boundaries
//   const villageBoundary = [
//     [23.0200, 72.5680],
//     [23.0200, 72.5750],
//     [23.0260, 72.5750],
//     [23.0260, 72.5680],
//     [23.0200, 72.5680]
//   ];

//   // Important locations
//   const locations = [
//     {
//       id: 1,
//       name: 'Gram Panchayat Office',
//       position: [23.0225, 72.5714],
//       type: 'government',
//       icon: createCustomIcon('🏛️', '#7c3aed')
//     },
//     {
//       id: 2,
//       name: 'Primary Health Center',
//       position: [23.0235, 72.5718],
//       type: 'health',
//       icon: createCustomIcon('🏥', '#ef4444')
//     },
//     {
//       id: 3,
//       name: 'Government High School',
//       position: [23.0210, 72.5705],
//       type: 'education',
//       icon: createCustomIcon('🏫', '#f59e0b')
//     },
//     {
//       id: 4,
//       name: 'Main Market',
//       position: [23.0230, 72.5725],
//       type: 'commercial',
//       icon: createCustomIcon('🛒', '#10b981')
//     },
//     {
//       id: 5,
//       name: 'Village Temple',
//       position: [23.0215, 72.5730],
//       type: 'religious',
//       icon: createCustomIcon('🛕', '#8b5cf6')
//     },
//     {
//       id: 6,
//       name: 'Water Tank',
//       position: [23.0245, 72.5700],
//       type: 'utility',
//       icon: createCustomIcon('💧', '#0ea5e9')
//     },
//     {
//       id: 7,
//       name: 'Bus Stand',
//       position: [23.0220, 72.5690],
//       type: 'transport',
//       icon: createCustomIcon('🚌', '#f59e0b')
//     },
//     {
//       id: 8,
//       name: 'State Bank',
//       position: [23.0232, 72.5710],
//       type: 'commercial',
//       icon: createCustomIcon('🏦', '#059669')
//     }
//   ];

//   // Roads and paths
//   const mainRoads = [
//     { 
//       name: 'Main Road',
//       coordinates: [[23.0205, 72.5690], [23.0255, 72.5740]],
//       color: '#334155',
//       weight: 8
//     },
//     {
//       name: 'Market Road',
//       coordinates: [[23.0220, 72.5700], [23.0240, 72.5730]],
//       color: '#64748b',
//       weight: 6
//     },
//     {
//       name: 'School Road',
//       coordinates: [[23.0210, 72.5705], [23.0225, 72.5720]],
//       color: '#94a3b8',
//       weight: 4
//     }
//   ];

//   // Residential areas
//   const residentialAreas = [
//     {
//       name: 'North Zone',
//       center: [23.0240, 72.5720],
//       radius: 200,
//       color: '#93c5fd'
//     },
//     {
//       name: 'South Zone',
//       center: [23.0210, 72.5700],
//       radius: 180,
//       color: '#86efac'
//     },
//     {
//       name: 'East Zone',
//       center: [23.0230, 72.5740],
//       radius: 150,
//       color: '#fde68a'
//     }
//   ];

//   // Agricultural land
//   const agriculturalLand = [
//     {
//       name: 'Farm Area 1',
//       coordinates: [[23.0190, 72.5740], [23.0200, 72.5755], [23.0180, 72.5760], [23.0175, 72.5745]]
//     },
//     {
//       name: 'Farm Area 2',
//       coordinates: [[23.0260, 72.5680], [23.0270, 72.5695], [23.0255, 72.5705], [23.0245, 72.5690]]
//     }
//   ];

//   const handleZoomIn = () => {
//     if (mapRef.current) {
//       mapRef.current.setZoom(mapRef.current.getZoom() + 1);
//       setZoomLevel(mapRef.current.getZoom());
//     }
//   };

//   const handleZoomOut = () => {
//     if (mapRef.current) {
//       mapRef.current.setZoom(mapRef.current.getZoom() - 1);
//       setZoomLevel(mapRef.current.getZoom());
//     }
//   };

//   const handleResetView = () => {
//     if (mapRef.current) {
//       mapRef.current.setView(mapCenter, 15);
//       setZoomLevel(15);
//     }
//   };

//   const toggleSatellite = () => {
//     setShowSatellite(!showSatellite);
//   };

//   const toggleTraffic = () => {
//     setShowTraffic(!showTraffic);
//   };

//   const MapComponent = () => {
//     const map = useMap();
//     mapRef.current = map;
    
//     useEffect(() => {
//       const handleZoom = () => {
//         setZoomLevel(map.getZoom());
//       };
      
//       map.on('zoom', handleZoom);
//       return () => {
//         map.off('zoom', handleZoom);
//       };
//     }, [map]);

//     return null;
//   };

//   return (
//     <div className="village-map-container">
//       {/* Header */}
//       <div className="map-header">
//         <div className="header-left">
//           <h1>
//             <span className="header-icon">🗺️</span>
//             Village Live Map
//           </h1>
//           <p className="header-subtitle">Interactive map with real-time tracking of village activities</p>
//         </div>
//         <div className="header-right">
//           <div className="map-stats">
//             <div className="stat-item">
//               <span className="stat-icon">🚗</span>
//               <span className="stat-value">{liveVehicles.length}</span>
//               <span className="stat-label">Active Vehicles</span>
//             </div>
//             <div className="stat-item">
//               <span className="stat-icon">📍</span>
//               <span className="stat-value">{locations.length}</span>
//               <span className="stat-label">Locations</span>
//             </div>
//             <div className="stat-item">
//               <span className="stat-icon">🗺️</span>
//               <span className="stat-value">Zoom: {zoomLevel}x</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="map-main-content">
//         {/* Left Panel - Controls */}
//         <div className="map-controls-panel">
//           <div className="controls-section">
//             <h3 className="section-title">Map Layers</h3>
//             <div className="layer-controls">
//               <label className="layer-toggle">
//                 <input 
//                   type="checkbox" 
//                   checked={showSatellite}
//                   onChange={toggleSatellite}
//                 />
//                 <span className="toggle-slider"></span>
//                 <span className="toggle-label">
//                   <span className="toggle-icon">🛰️</span>
//                   Satellite View
//                 </span>
//               </label>
              
//               <label className="layer-toggle">
//                 <input 
//                   type="checkbox" 
//                   checked={showTraffic}
//                   onChange={toggleTraffic}
//                 />
//                 <span className="toggle-slider"></span>
//                 <span className="toggle-label">
//                   <span className="toggle-icon">🚦</span>
//                   Traffic View
//                 </span>
//               </label>
//             </div>
//           </div>

//           <div className="controls-section">
//             <h3 className="section-title">Map Tools</h3>
//             <div className="tool-buttons">
//               <button className="tool-btn" onClick={handleZoomIn}>
//                 <span className="tool-icon">➕</span>
//                 Zoom In
//               </button>
//               <button className="tool-btn" onClick={handleZoomOut}>
//                 <span className="tool-icon">➖</span>
//                 Zoom Out
//               </button>
//               <button className="tool-btn" onClick={handleResetView}>
//                 <span className="tool-icon">⌖</span>
//                 Reset View
//               </button>
//               <button className="tool-btn" onClick={() => alert('Coming soon!')}>
//                 <span className="tool-icon">📏</span>
//                 Measure
//               </button>
//               <button className="tool-btn" onClick={() => alert('Coming soon!')}>
//                 <span className="tool-icon">📍</span>
//                 Add Marker
//               </button>
//             </div>
//           </div>

//           <div className="controls-section">
//             <h3 className="section-title">Live Vehicles</h3>
//             <div className="vehicles-list">
//               {liveVehicles.map(vehicle => (
//                 <div 
//                   key={vehicle.id} 
//                   className={`vehicle-item ${selectedVehicle?.id === vehicle.id ? 'selected' : ''}`}
//                   onClick={() => setSelectedVehicle(vehicle)}
//                 >
//                   <div className="vehicle-icon">{vehicle.icon.options.html.match(/>(.*?)</)[1]}</div>
//                   <div className="vehicle-info">
//                     <h4 className="vehicle-name">{vehicle.name}</h4>
//                     <div className="vehicle-details">
//                       <span className="detail">{vehicle.type}</span>
//                       <span className="detail">{vehicle.speed}</span>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="controls-section">
//             <h3 className="section-title">Legend</h3>
//             <div className="legend-grid">
//               <div className="legend-item">
//                 <div className="legend-marker" style={{ background: '#7c3aed' }}>🏛️</div>
//                 <span>Government</span>
//               </div>
//               <div className="legend-item">
//                 <div className="legend-marker" style={{ background: '#ef4444' }}>🏥</div>
//                 <span>Health</span>
//               </div>
//               <div className="legend-item">
//                 <div className="legend-marker" style={{ background: '#f59e0b' }}>🏫</div>
//                 <span>Education</span>
//               </div>
//               <div className="legend-item">
//                 <div className="legend-marker" style={{ background: '#10b981' }}>🛒</div>
//                 <span>Commercial</span>
//               </div>
//               <div className="legend-item">
//                 <div className="legend-line" style={{ background: '#334155' }}></div>
//                 <span>Main Road</span>
//               </div>
//               <div className="legend-item">
//                 <div className="legend-line" style={{ background: '#64748b' }}></div>
//                 <span>Secondary Road</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Right Panel - Map */}
//         <div className="map-display-panel">
//           <div className="map-container-wrapper">
//             <MapContainer
//               center={mapCenter}
//               zoom={zoomLevel}
//               style={{ height: '100%', width: '100%', borderRadius: '10px' }}
//               zoomControl={false}
//               scrollWheelZoom={true}
//             >
//               <MapComponent />
              
//               {/* Base Map Layer */}
//               {showSatellite ? (
//                 <TileLayer
//                   attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//                   url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
//                 />
//               ) : (
//                 <TileLayer
//                   attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//                   url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                 />
//               )}

//               {/* Village Boundary */}
//               <Polyline
//                 positions={villageBoundary}
//                 color="#38bdf8"
//                 weight={3}
//                 dashArray="10, 10"
//                 fillOpacity={0.1}
//               />

//               {/* Village Areas */}
//               {residentialAreas.map((area, index) => (
//                 <Circle
//                   key={index}
//                   center={area.center}
//                   radius={area.radius}
//                   pathOptions={{
//                     fillColor: area.color,
//                     color: area.color,
//                     fillOpacity: 0.2,
//                     weight: 2
//                   }}
//                 >
//                   <Tooltip direction="center" permanent>
//                     {area.name}
//                   </Tooltip>
//                 </Circle>
//               ))}

//               {/* Agricultural Land */}
//               {agriculturalLand.map((area, index) => (
//                 <Polyline
//                   key={index}
//                   positions={area.coordinates}
//                   color="#86efac"
//                   weight={2}
//                   fillColor="#86efac"
//                   fillOpacity={0.3}
//                 >
//                   <Tooltip direction="center" permanent>
//                     {area.name}
//                   </Tooltip>
//                 </Polyline>
//               ))}

//               {/* Roads */}
//               {mainRoads.map((road, index) => (
//                 <Polyline
//                   key={index}
//                   positions={road.coordinates}
//                   color={road.color}
//                   weight={road.weight}
//                   opacity={0.8}
//                 >
//                   <Tooltip direction="top" permanent>
//                     {road.name}
//                   </Tooltip>
//                 </Polyline>
//               ))}

//               {/* Traffic Layer (Simulated) */}
//               {showTraffic && (
//                 <Polyline
//                   positions={[[23.0220, 72.5710], [23.0230, 72.5720]]}
//                   color="#ef4444"
//                   weight={8}
//                   dashArray="5, 10"
//                   opacity={0.6}
//                 >
//                   <Tooltip>Traffic Congestion</Tooltip>
//                 </Polyline>
//               )}

//               {/* Important Locations */}
//               {locations.map(location => (
//                 <Marker 
//                   key={location.id} 
//                   position={location.position} 
//                   icon={location.icon}
//                 >
//                   <Popup>
//                     <div className="location-popup">
//                       <h4>{location.name}</h4>
//                       <p><strong>Type:</strong> {location.type}</p>
//                       <p><strong>Coordinates:</strong> {location.position[0].toFixed(6)}, {location.position[1].toFixed(6)}</p>
//                       <button className="popup-btn">
//                         Get Directions
//                       </button>
//                     </div>
//                   </Popup>
//                 </Marker>
//               ))}

//               {/* Live Vehicles */}
//               {liveVehicles.map(vehicle => (
//                 <RealTimeVehicle key={vehicle.id} vehicle={vehicle} icon={vehicle.icon} />
//               ))}
//             </MapContainer>

//             {/* Custom Map Controls */}
//             <div className="custom-map-controls">
//               <div className="control-group">
//                 <button className="control-btn" onClick={handleZoomIn} title="Zoom In">
//                   <span className="control-icon">+</span>
//                 </button>
//                 <button className="control-btn" onClick={handleZoomOut} title="Zoom Out">
//                   <span className="control-icon">-</span>
//                 </button>
//                 <button className="control-btn" onClick={handleResetView} title="Reset View">
//                   <span className="control-icon">⌖</span>
//                 </button>
//               </div>
//             </div>

//             {/* Location Search */}
//             <div className="map-search-box">
//               <input 
//                 type="text" 
//                 placeholder="Search locations..." 
//                 className="search-input"
//               />
//               <button className="search-btn">
//                 <span className="search-icon">🔍</span>
//               </button>
//             </div>

//             {/* Coordinates Display */}
//             <div className="coordinates-display">
//               <div className="coord-info">
//                 <span className="coord-label">Center:</span>
//                 <span className="coord-value">{mapCenter[0].toFixed(6)}, {mapCenter[1].toFixed(6)}</span>
//               </div>
//               <div className="coord-info">
//                 <span className="coord-label">Zoom:</span>
//                 <span className="coord-value">{zoomLevel}x</span>
//               </div>
//             </div>
//           </div>

//           {/* Selected Vehicle Info */}
//           {selectedVehicle && (
//             <div className="selected-vehicle-panel">
//               <div className="panel-header">
//                 <h4>{selectedVehicle.name}</h4>
//                 <button 
//                   className="close-btn"
//                   onClick={() => setSelectedVehicle(null)}
//                 >
//                   ✕
//                 </button>
//               </div>
//               <div className="vehicle-details">
//                 <div className="detail-row">
//                   <span className="detail-label">Type:</span>
//                   <span className="detail-value">{selectedVehicle.type}</span>
//                 </div>
//                 <div className="detail-row">
//                   <span className="detail-label">Status:</span>
//                   <span className="detail-value status-active">{selectedVehicle.status}</span>
//                 </div>
//                 <div className="detail-row">
//                   <span className="detail-label">Speed:</span>
//                   <span className="detail-value">{selectedVehicle.speed}</span>
//                 </div>
//                 <div className="detail-row">
//                   <span className="detail-label">Last Updated:</span>
//                   <span className="detail-value">Just now</span>
//                 </div>
//                 <button className="track-btn">
//                   <span className="btn-icon">📍</span>
//                   Track Vehicle
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VillageMap;