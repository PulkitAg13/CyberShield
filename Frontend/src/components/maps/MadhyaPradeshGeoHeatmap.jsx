import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getFraudulentTransactions, getFraudGeoData } from '../../services/api';

// Fix for default markers in React Leaflet
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MadhyaPradeshGeoHeatmap = ({ refreshTrigger }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapData, setMapData] = useState([]);

  // Madhya Pradesh coordinates - centered on Bhopal
  const mpCenter = [23.2599, 77.4126];
  const mapZoom = 7;

  // Major cities in Madhya Pradesh with coordinates
  const mpCities = useMemo(() => ({
    'Bhopal': { lat: 23.2599, lng: 77.4126, district: 'Bhopal' },
    'Indore': { lat: 22.7196, lng: 75.8577, district: 'Indore' },
    'Jabalpur': { lat: 23.1815, lng: 79.9864, district: 'Jabalpur' },
    'Gwalior': { lat: 26.2183, lng: 78.1828, district: 'Gwalior' },
    'Ujjain': { lat: 23.1765, lng: 75.7885, district: 'Ujjain' },
    'Sagar': { lat: 23.8388, lng: 78.7378, district: 'Sagar' },
    'Dewas': { lat: 22.9676, lng: 76.0534, district: 'Dewas' },
    'Satna': { lat: 24.5670, lng: 80.8320, district: 'Satna' },
    'Ratlam': { lat: 23.3315, lng: 75.0367, district: 'Ratlam' },
    'Rewa': { lat: 24.5364, lng: 81.2964, district: 'Rewa' },
    'Murwara': { lat: 23.1815, lng: 79.9864, district: 'Katni' },
    'Singrauli': { lat: 24.1992, lng: 82.6739, district: 'Singrauli' },
    'Burhanpur': { lat: 21.3009, lng: 76.2291, district: 'Burhanpur' },
    'Khandwa': { lat: 21.8343, lng: 76.3569, district: 'Khandwa' },
    'Bhind': { lat: 26.5653, lng: 78.7875, district: 'Bhind' },
    'Chhindwara': { lat: 22.0572, lng: 78.9315, district: 'Chhindwara' },
    'Guna': { lat: 24.6537, lng: 77.3112, district: 'Guna' },
    'Shivpuri': { lat: 25.4244, lng: 77.6581, district: 'Shivpuri' },
    'Vidisha': { lat: 23.5251, lng: 77.8081, district: 'Vidisha' },
    'Chhatarpur': { lat: 24.9178, lng: 79.5941, district: 'Chhatarpur' }
  }), []);

  const processTransactionsForMap = useCallback((transactions) => {
    // Group transactions by simulated cities (since we don't have actual location data)
    const cityKeys = Object.keys(mpCities);
    const grouped = {};

    transactions.forEach((transaction, index) => {
      // Simulate city assignment based on transaction characteristics
      const cityIndex = Math.abs(
        (transaction.id || index) + 
        (transaction.amount || 0) + 
        (transaction.step || 0)
      ) % cityKeys.length;
      
      const cityName = cityKeys[cityIndex];
      
      if (!grouped[cityName]) {
        grouped[cityName] = {
          city: cityName,
          coordinates: mpCities[cityName],
          transactions: [],
          totalAmount: 0,
          avgRiskScore: 0,
          count: 0
        };
      }
      
      grouped[cityName].transactions.push(transaction);
      grouped[cityName].totalAmount += transaction.amount || 0;
      grouped[cityName].count += 1;
    });

    // Calculate averages and risk scores
    Object.values(grouped).forEach(cityData => {
      cityData.avgRiskScore = cityData.transactions.reduce((sum, t) => 
        sum + (t.prediction_confidence || Math.random() * 100), 0
      ) / cityData.transactions.length;
      
      cityData.avgAmount = cityData.totalAmount / cityData.count;
    });

    return Object.values(grouped);
  }, [mpCities]);

  const generateRealisticMPData = useCallback(() => {
    // Create realistic fraud patterns based on real-world factors
    const cityKeys = Object.keys(mpCities);
    
    // Define population and economic activity levels for MP cities (realistic estimates)
    const cityProfiles = {
      'Indore': { population: 3.2, economicActivity: 0.95, urbanization: 0.9 },
      'Bhopal': { population: 2.4, economicActivity: 0.9, urbanization: 0.85 },
      'Jabalpur': { population: 1.3, economicActivity: 0.7, urbanization: 0.75 },
      'Gwalior': { population: 1.2, economicActivity: 0.65, urbanization: 0.7 },
      'Ujjain': { population: 0.7, economicActivity: 0.6, urbanization: 0.65 },
      'Sagar': { population: 0.4, economicActivity: 0.45, urbanization: 0.5 },
      'Dewas': { population: 0.3, economicActivity: 0.5, urbanization: 0.55 },
      'Satna': { population: 0.35, economicActivity: 0.4, urbanization: 0.45 },
      'Ratlam': { population: 0.28, economicActivity: 0.45, urbanization: 0.5 },
      'Rewa': { population: 0.25, economicActivity: 0.35, urbanization: 0.4 },
      'Murwara': { population: 0.2, economicActivity: 0.4, urbanization: 0.45 },
      'Singrauli': { population: 0.3, economicActivity: 0.6, urbanization: 0.55 }, // Industrial city
      'Burhanpur': { population: 0.2, economicActivity: 0.3, urbanization: 0.35 },
      'Khandwa': { population: 0.2, economicActivity: 0.35, urbanization: 0.4 },
      'Bhind': { population: 0.18, economicActivity: 0.3, urbanization: 0.35 },
      'Chhindwara': { population: 0.15, economicActivity: 0.3, urbanization: 0.35 },
      'Guna': { population: 0.18, economicActivity: 0.25, urbanization: 0.3 },
      'Shivpuri': { population: 0.2, economicActivity: 0.25, urbanization: 0.3 },
      'Vidisha': { population: 0.16, economicActivity: 0.3, urbanization: 0.35 },
      'Chhatarpur': { population: 0.13, economicActivity: 0.2, urbanization: 0.25 }
    };

    return cityKeys.map(cityName => {
      const profile = cityProfiles[cityName] || { population: 0.1, economicActivity: 0.2, urbanization: 0.25 };
      
      // Calculate fraud count based on realistic factors:
      // - Population size (more people = more transactions = more potential fraud)
      // - Economic activity (higher activity = more transactions)
      // - Urbanization (urban areas typically have higher digital fraud rates)
      const baseFraudCount = Math.floor(
        (profile.population * 15) + 
        (profile.economicActivity * 25) + 
        (profile.urbanization * 20) +
        (Math.random() * 10) // Small random variation
      );
      
      // Ensure minimum count for visibility
      const fraudCount = Math.max(baseFraudCount, 3);
      
      // Calculate average transaction amounts based on economic activity
      const baseAmount = 50000 + (profile.economicActivity * 200000);
      const avgTransactionAmount = baseAmount + (Math.random() * baseAmount * 0.3);
      
      // Risk score correlates with urbanization and economic activity
      // (Higher activity areas tend to have more sophisticated fraud)
      const baseRisk = 50 + (profile.urbanization * 25) + (profile.economicActivity * 20);
      const riskScore = Math.min(baseRisk + (Math.random() * 15), 95);
      
      // Generate realistic transaction types based on city profile
      const getRealisticTransactionType = () => {
        if (profile.urbanization > 0.7) {
          // Urban areas: more diverse transaction types
          const types = ['TRANSFER', 'CASH_OUT', 'PAYMENT', 'CASH_IN', 'DEBIT'];
          const weights = [0.3, 0.25, 0.25, 0.1, 0.1]; // Urban distribution
          const rand = Math.random();
          let cumulative = 0;
          for (let i = 0; i < types.length; i++) {
            cumulative += weights[i];
            if (rand <= cumulative) return types[i];
          }
          return 'TRANSFER';
        } else {
          // Rural areas: simpler transaction patterns
          const types = ['TRANSFER', 'CASH_OUT', 'PAYMENT'];
          const weights = [0.5, 0.35, 0.15]; // Rural distribution
          const rand = Math.random();
          let cumulative = 0;
          for (let i = 0; i < types.length; i++) {
            cumulative += weights[i];
            if (rand <= cumulative) return types[i];
          }
          return 'TRANSFER';
        }
      };

      return {
        city: cityName,
        coordinates: mpCities[cityName],
        count: fraudCount,
        totalAmount: fraudCount * avgTransactionAmount,
        avgRiskScore: riskScore,
        transactions: Array.from({ length: fraudCount }, (_, i) => {
          // Create realistic transaction amounts
          const transactionAmount = avgTransactionAmount * (0.3 + Math.random() * 1.4);
          
          return {
            id: `${cityName}-${i}`,
            amount: Math.floor(transactionAmount),
            type: getRealisticTransactionType(),
            prediction_confidence: Math.max(60, riskScore + (Math.random() * 20 - 10))
          };
        })
      };
    });
  }, [mpCities]);

  const fetchAndProcessData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch geo data from API first
      try {
        const geoData = await getFraudGeoData();
        if (geoData && geoData.districts && geoData.districts.length > 0) {
          // Transform API response to match component format
          const transformedData = geoData.districts.map(district => ({
            city: district.name,
            coordinates: { lat: district.lat, lng: district.lng, district: district.name },
            count: district.count,
            totalAmount: district.count * 50000, // Mock amount
            avgRiskScore: Math.min(60 + (district.count * 2), 95),
            transactions: Array.from({ length: district.count }, (_, i) => ({
              id: `${district.name}-${i}`,
              amount: Math.floor(Math.random() * 500000) + 10000,
              type: ['TRANSFER', 'CASH_OUT', 'PAYMENT'][Math.floor(Math.random() * 3)],
              prediction_confidence: Math.floor(Math.random() * 40) + 60
            }))
          }));
          setMapData(transformedData);
          return;
        }
      } catch (geoError) {
        console.warn('Geo API failed, falling back to transaction processing:', geoError);
      }
      
      
      // Fallback: Fetch fraud data and process locally
      const response = await getFraudulentTransactions(1000);
      const transactions = response.transactions || [];
      if (transactions.length > 0) {
        const processedData = processTransactionsForMap(transactions);
        setMapData(processedData);
      } else {
        // Use realistic data if no transactions available
        const realisticData = generateRealisticMPData();
        setMapData(realisticData);
      }
      
    } catch (err) {
      setError('Failed to fetch fraud data for mapping');
      console.error('Error fetching fraud data:', err);
      
      // Generate realistic data for demonstration if API fails
      const realisticData = generateRealisticMPData();
      setMapData(realisticData);
    } finally {
      setLoading(false);
    }
  }, [processTransactionsForMap, generateRealisticMPData]);

  useEffect(() => {
    fetchAndProcessData();
  }, [refreshTrigger, fetchAndProcessData]);

  // Create custom icons based on fraud intensity
  const createHeatIcon = (riskScore, count) => {
    let color = '#10B981'; // green
    let size = 35; // Increased base size
    
    if (riskScore >= 85) {
      color = '#DC2626'; // red
      size = 70; // Much bigger for high risk
    } else if (riskScore >= 75) {
      color = '#EA580C'; // orange
      size = 60;
    } else if (riskScore >= 65) {
      color = '#D97706'; // amber
      size = 50;
    }

    // Increase size based on transaction count (bigger multiplier)
    const heatSize = Math.min(size + (count * 3), 100); // Increased max size

    return L.divIcon({
      className: 'custom-heat-icon',
      html: `
        <div style="
          background: radial-gradient(circle, ${color}60, ${color}90);
          width: ${heatSize}px;
          height: ${heatSize}px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 6px 20px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: ${Math.min(12 + Math.floor(count/4), 20)}px;
          font-weight: bold;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
          opacity: 0.85;
          backdrop-filter: blur(2px);
        ">
          <div style="text-align: center;">
            <div>${Math.round(riskScore)}</div>
            <div style="font-size: ${Math.max(8, Math.min(10 + Math.floor(count/6), 14))}px;">
              (${count})
            </div>
          </div>
        </div>
      `,
      iconSize: [heatSize, heatSize],
      iconAnchor: [heatSize/2, heatSize/2]
    });
  };

  // Component to fit map bounds
  const FitMapBounds = ({ data }) => {
    const map = useMap();
    
    useEffect(() => {
      if (data && data.length > 0) {
        const bounds = data.map(item => [
          item.coordinates.lat, 
          item.coordinates.lng
        ]);
        
        if (bounds.length > 0) {
          map.fitBounds(bounds, { padding: [20, 20] });
        }
      }
    }, [data, map]);
    
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Madhya Pradesh Fraud Heatmap
        </h3>
        <div className="flex items-center justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-2 text-gray-600">Loading fraud heatmap...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Madhya Pradesh Fraud Heatmap
        </h3>
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.348 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchAndProcessData}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-gray-800">
            Madhya Pradesh Fraud Heatmap
          </h3>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Realistic Mock Data</span>
        </div>
        <button
          onClick={fetchAndProcessData}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
        >
          Refresh
        </button>
      </div>

      {/* Legend */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-sm font-medium text-gray-700">Risk Level Legend</h4>
          <p className="text-xs text-gray-600 italic max-w-md">
            Realistic fraud patterns based on MP city demographics, economic activity, and urbanization levels
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-600 rounded-full border-2 border-white shadow-md opacity-85"></div>
            <span>Critical (85+)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-orange-600 rounded-full border-2 border-white shadow-md opacity-85"></div>
            <span>High (75-84)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-amber-600 rounded-full border-2 border-white shadow-md opacity-85"></div>
            <span>Medium (65-74)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-green-600 rounded-full border-2 border-white shadow-md opacity-85"></div>
            <span>Low (&lt;65)</span>
          </div>
          <div className="text-gray-600 ml-4">
            <span>Circle size = Transaction count | Number = Risk score</span>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
        <MapContainer
          center={mpCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <FitMapBounds data={mapData} />

          {mapData.map((cityData, index) => (
            <Marker
              key={`${cityData.city}-${index}`}
              position={[cityData.coordinates.lat, cityData.coordinates.lng]}
              icon={createHeatIcon(cityData.avgRiskScore, cityData.count)}
            >
              <Popup className="custom-popup">
                <div className="p-3 min-w-64">
                  <div className="border-b border-gray-200 pb-2 mb-3">
                    <h3 className="font-bold text-gray-900 text-lg">{cityData.city}</h3>
                    <p className="text-sm text-gray-600">{cityData.coordinates.district} District</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-red-50 p-2 rounded">
                      <p className="text-red-600 font-medium">Fraud Cases</p>
                      <p className="text-xl font-bold text-red-700">{cityData.count}</p>
                    </div>
                    <div className="bg-orange-50 p-2 rounded">
                      <p className="text-orange-600 font-medium">Avg Risk</p>
                      <p className="text-xl font-bold text-orange-700">{Math.round(cityData.avgRiskScore)}%</p>
                    </div>
                    <div className="bg-blue-50 p-2 rounded">
                      <p className="text-blue-600 font-medium">Total Amount</p>
                      <p className="text-lg font-bold text-blue-700">₹{(cityData.totalAmount / 1000000).toFixed(1)}M</p>
                    </div>
                    <div className="bg-green-50 p-2 rounded">
                      <p className="text-green-600 font-medium">Avg Amount</p>
                      <p className="text-lg font-bold text-green-700">₹{Math.round(cityData.totalAmount / cityData.count).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Recent Transaction Types:</p>
                    <div className="flex flex-wrap gap-1">
                      {[...new Set(cityData.transactions.slice(0, 5).map(t => t.type))].map(type => (
                        <span key={type} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Summary Statistics */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-red-50 p-3 rounded-lg text-center">
          <p className="text-sm text-red-600 font-medium">Total Cities</p>
          <p className="text-xl font-bold text-red-700">{mapData.length}</p>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg text-center">
          <p className="text-sm text-orange-600 font-medium">Total Cases</p>
          <p className="text-xl font-bold text-orange-700">
            {mapData.reduce((sum, city) => sum + city.count, 0)}
          </p>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <p className="text-sm text-blue-600 font-medium">Highest Risk</p>
          <p className="text-xl font-bold text-blue-700">
            {Math.round(Math.max(...mapData.map(city => city.avgRiskScore), 0))}%
          </p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg text-center">
          <p className="text-sm text-green-600 font-medium">Total Amount</p>
          <p className="text-xl font-bold text-green-700">
            ₹{(mapData.reduce((sum, city) => sum + city.totalAmount, 0) / 10000000).toFixed(1)}Cr
          </p>
        </div>
      </div>
    </div>
  );
};

export default MadhyaPradeshGeoHeatmap;
