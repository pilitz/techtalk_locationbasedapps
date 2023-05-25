import React, {useEffect, useState} from 'react';
import {View, Text, PermissionsAndroid} from 'react-native';
import Geolocation from 'react-native-geolocation-service';

const App = () => {
  const [location, setLocation] = useState({
    longitude: 0,
    latitude: 0,
    accuracy: 0,
  });
  const [weather, setWeather] = useState({
    temperature: 0.0,
    windspeed: 0,
  });

  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          Geolocation.watchPosition(
            pos => {
              setLocation(pos.coords);
              const fetchWeather = async () => {
                try {
                  const response = await fetch(
                    'https://api.open-meteo.com/v1/forecast?latitude=' +
                      pos.coords.latitude +
                      '&longitude=' +
                      pos.coords.longitude +
                      '&current_weather=true',
                  );
                  const data = await response.json();

                  if (response.ok) {
                    setWeather(data.current_weather);
                  } else {
                    console.log('Error:', data.error);
                  }
                } catch (error) {
                  console.log('Error:', error);
                }
              };
              fetchWeather();
            },
            error => {
              console.log('Error getting location: ', error);
            },
            {
              //accuracy: {android: 'high'}, // high: finest location, balanced: medium accuracy and power usage, low: coarse location, low power usage, passive: no power usage
              enableHighAccuracy: true,
              distanceFilter: 10, // minimum distance in meters to trigger onLocationChange
              interval: 5000, // Get location every 5 seconds
              fastestInterval: 2000, // fastest interval to get location
              //showLocationDialog: true, // show location dialog when location is off
              //forceRequestLocation: true, // request location even if location services are disabled
            },
          );
        } else {
          console.log('Location permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    };

    requestLocationPermission();

    return () => {
      Geolocation.stopObserving();
    };
  }, []);

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <View style={{height: 200}}>
        <Text style={{fontSize: 40, fontWeight: 'bold', textAlign: 'center'}}>
          Weather
        </Text>
        <Text style={{fontSize: 30, textAlign: 'center'}}>
          Temperature: {weather.temperature}°C
        </Text>
        <Text style={{fontSize: 30, textAlign: 'center'}}>
          Wind Speed: {weather.windspeed} km/h
        </Text>
      </View>
      <Text style={{fontSize: 40, fontWeight: 'bold'}}>Location</Text>
      <Text style={{fontSize: 30}}>Lat: {location?.latitude}</Text>
      <Text style={{fontSize: 30}}>Long: {location?.longitude}</Text>
      <Text style={{fontSize: 30}}>
        Accuracy: {Math.round(location?.accuracy)} meters
      </Text>
    </View>
  );
};

export default App;
