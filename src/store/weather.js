import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useWeather = defineStore('weather', () => {
    const weather = ref({});
    const getWeather = async () => {
        const options = {
            method: 'GET',
            headers: {accept: 'application/json', 'accept-encoding': 'deflate, gzip, br'}
          };
        const data = await fetch('https://api.tomorrow.io/v4/weather/forecast?location=69660%20FR&timesteps=1h&units=metric&apikey=IQXktd1TVkvBQgC24hQvuwi5adHIrjIo', options)
        const result = await data.json();
        const weatherData = result.timelines.hourly;
        const labelData = await fetch(`https://api.cms-collonges.fr/getWeatherLabel/${weatherData[1].values.weatherCode}`, options);
        const label = await labelData.json();
        weather.value = {
            weatherForecast: weatherData,
            weatherLabel: label.result,
        };
    }
    return {
        weather,
        getWeather,
    }
});