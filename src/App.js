import React, { useState } from 'react';
import styles from './App.module.css';
import openWeather from './images/openWeather.png';
import weatherBit from './images/weatherBit.png';
import weatherApi from './images/weatherApi.png';

// Placeholder image URLs
const PROVIDER_IMAGES = {
  'WeatherBit': weatherBit,
  'WeatherAPI': weatherApi, 
  'OpenWeatherMap': openWeather
};

// Fetch weather data asynchronously from backend API
const fetchWeatherDataAsync = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/weather/async');
    if (!response.ok) {
      throw new Error('Failed to fetch async weather data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching async weather data:', error);
    return [];
  }
};

// Fetch weather data synchronously from backend API
const fetchWeatherDataSync = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/weather/sync');
    if (!response.ok) {
      throw new Error('Failed to fetch sync weather data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching sync weather data:', error);
    return [];
  }
};

// Weather Provider Card Component
const WeatherProviderCard = ({ provider }) => {
  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.toLocaleTimeString()} : ${date.getMilliseconds()}ms`;
  };

  return (
    <div className={styles.weatherProviderCard}>
      <img 
        src={PROVIDER_IMAGES[provider.apiProviderName]} 
        alt={provider.apiProviderName} 
        className={styles.providerImage}
      />
      <div className={styles.providerDetails}>
        <h3>{provider.apiProviderName}</h3>
        <p>Temperature: {provider.temperature}°C</p>
        <p>Start Time: {formatDateTime(provider.startTime)}</p>
        <p>End Time: {formatDateTime(provider.endTime)}</p>
        <p>Response Time: {provider.responseTime}ms</p>
      </div>
    </div>
  );
};

// Main Weather App Aggregator Component
const WeatherAppAggregator = () => {
  const [asyncResponse, setAsyncResponse] = useState([]);
  const [syncResponse, setSyncResponse] = useState([]);
  const [asyncLoading, setAsyncLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  const fetchAsyncWeatherData = async () => {
    setAsyncResponse([]);
    setAsyncLoading(true);
    try {
      const asyncData = await fetchWeatherDataAsync();
      setAsyncResponse(asyncData);
      setAsyncLoading(false);
    } catch (error) {
      console.error('Error fetching async weather data:', error);
      setAsyncLoading(false);
    }
  };

  const fetchSyncWeatherData = async () => {
    setSyncResponse([]);
    try {
      const syncData = await fetchWeatherDataSync();
      setSyncResponse(syncData);
      setSyncLoading(false);
    } catch (error) {
      console.error('Error fetching sync weather data:', error);
      setSyncLoading(false);
    }
  };

  const handleGetWeatherData = async () => {
    // Start both async and sync data fetching
    await Promise.all([
      fetchAsyncWeatherData(),
      (async () => {
        // Delay sync response by 1 second
        await new Promise(resolve => setTimeout(resolve, 1000));
        await fetchSyncWeatherData();
      })()
    ]);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.mainHeading}>
        Weather Data Aggregator
      </h1>
      
      <div className={styles.buttonContainer}>
        <button 
          onClick={handleGetWeatherData}
          className={styles.getWeatherButton}
        >
          Get Weather Data
        </button>
      </div>

      <div className={styles.responseContainer}>
        <div className={styles.responseColumn}>
          <h2 className={styles.columnHeading}>Multithreading Response</h2>
          <div className={styles.loadingContainer}>
            {asyncLoading ? (
              <div className={styles.loader}></div>
            ) : (
              asyncResponse.map((provider, index) => (
                <WeatherProviderCard key={index} provider={provider} />
              ))
            )}
          </div>
        </div>

        <div className={styles.responseColumn}>
          <h2 className={styles.columnHeading}>Single Thread Response</h2>
          <div className={styles.loadingContainer}>
            {syncLoading ? (
              <div className={styles.loader}></div>
            ) : (
              syncResponse.map((provider, index) => (
                <WeatherProviderCard key={index} provider={provider} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherAppAggregator;
