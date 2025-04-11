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
      </div>
    </div>
  );
};

export default Dashboard;