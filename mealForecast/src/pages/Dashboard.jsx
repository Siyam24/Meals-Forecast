import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useTheme } from "../context/ThemeContext";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const { theme } = useTheme();
  const [data, setData] = useState([]);
  const [foodOptions, setFoodOptions] = useState([]);
  const [selectedFood, setSelectedFood] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedFestival, setSelectedFestival] = useState('');
  const [festivalDemand, setFestivalDemand] = useState(null);

   // List of festivals available in your dataset
   const festivals = [
    'Christmas',
    'Deepavali',
    'Independence_Day',
    'Ramadan_End',
    'Sinhala_New_Year',
    'Vesak'
  ];

  useEffect(() => {
    Papa.parse('/all_forecasts_combined.csv', {
      download: true,
      header: true,
      complete: (result) => {
        const parsedData = result.data.map(row => ({
          ...row,
          ds: new Date(row.ds),
          yhat: Number(row.yhat),
        }));
        setData(parsedData);

        const foods = [...new Set(parsedData.map(row => row.food))];
        setFoodOptions(foods);
        setSelectedFood([foods[0]]); // default to the first food item
      }
    });
  }, []);

  // Filtering data based on the selected food items and the date range
  const filteredData = data.filter(row => {
    const rowDate = new Date(row.ds);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    return (
      (selectedFood.includes(row.food)) &&
      (!start || rowDate >= start) &&
      (!end || rowDate <= end)
    );
  });

  const handleFoodChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedFood(selected);
  };


  const analyzeFestivalDemand = () => {
    if (!selectedFestival) return;
    
    // Get all rows where the selected festival has a non-zero impact
    const festivalData = data.filter(row => {
      return row[selectedFestival] && Number(row[selectedFestival]) !== 0;
    });

    if (festivalData.length === 0) {
      setFestivalDemand(null);
      return;
    }

    // Group by food and calculate average impact
    const foodImpact = {};
    festivalData.forEach(row => {
      if (!foodImpact[row.food]) {
        foodImpact[row.food] = {
          totalImpact: 0,
          count: 0
        };
      }
      foodImpact[row.food].totalImpact += Number(row[selectedFestival]);
      foodImpact[row.food].count += 1;
    });

    // Calculate average impact for each food
    const foodAverages = Object.keys(foodImpact).map(food => ({
      food,
      averageImpact: foodImpact[food].totalImpact / foodImpact[food].count
    }));

    // Sort by impact (descending)
    foodAverages.sort((a, b) => b.averageImpact - a.averageImpact);

    setFestivalDemand({
      festival: selectedFestival,
      topFoods: foodAverages.slice(0, 3) // Get top 3 foods
    });
  };

  const handleFestivalChange = (e) => {
    setSelectedFestival(e.target.value);
    setFestivalDemand(null); // Reset previous results
  };

  return (
    <div className={`dashboard-wrapper ${theme}`}>
      <div className="dashboard-container">
        <h2 className="dashboard-title">
          Sales Forecast Dashboard
          <span className="title-underline"></span>
        </h2>

        {/* Date Range Filter */}
        <div className="date-range-container">
          <div className="input-group">
            <label htmlFor="start-date" className="date-label">Start Date:</label>
            <input
              type="date"
              id="start-date"
              className="date-input"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="end-date" className="date-label">End Date:</label>
            <input
              type="date"
              id="end-date"
              className="date-input"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Food Selection (Multiple Food Items) */}
        <div className="select-container">
          <label htmlFor="food-select" className="select-label">Select Food Items:</label>
          <select
            id="food-select"
            className="food-select"
            multiple
            value={selectedFood}
            onChange={handleFoodChange}
          >
            {foodOptions.map(food => (
              <option key={food} value={food}>{food}</option>
            ))}
          </select>
        </div>

        {/* Forecast Chart */}
        <div className="chart-container">
          <h3 className="chart-title">Forecast Chart</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="ds"
                tickFormatter={(tick) => new Date(tick).toLocaleDateString()}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              {/* Loop through selected food items and display their respective lines */}
              {selectedFood.map((food) => (
                <Line
                  key={food}
                  type="monotone"
                  dataKey="yhat"
                  stroke="#6366f1"
                  strokeWidth={3}
                  name={food}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Festival Demand Analysis */}
        <div className="festival-analysis-container">
          <h3 className="section-title">
            Festival Demand Analysis
            <span className="title-underline"></span>
          </h3>
          
          <div className="festival-select-container">
            <label htmlFor="festival-select" className="select-label">Select Festival:</label>
            <select
              id="festival-select"
              className="festival-select"
              value={selectedFestival}
              onChange={handleFestivalChange}
            >
              <option value="">-- Select a Festival --</option>
              {festivals.map(festival => (
                <option key={festival} value={festival}>
                  {festival.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            <button 
              className="analyze-button"
              onClick={analyzeFestivalDemand}
              disabled={!selectedFestival}
            >
              Analyze Demand
            </button>
          </div>

          {festivalDemand && (
            <div className="results-container">
              <h4>Top Demanded Foods During {festivalDemand.festival.replace(/_/g, ' ')}:</h4>
              {festivalDemand.topFoods.length > 0 ? (
                <ul className="food-list">
                  {festivalDemand.topFoods.map((item, index) => (
                    <li key={item.food} className="food-item">
                      <span className="rank">{index + 1}.</span>
                      <span className="food-name">{item.food}</span>
                      <span className="impact-value">
                        (Impact: {item.averageImpact.toFixed(2)})
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No significant demand data found for this festival.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;