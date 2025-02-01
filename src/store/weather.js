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
    const alertWeather = async () => {
        const options = {
            method: 'GET',
            headers: {accept: 'application/json', 'accept-encoding': 'deflate, gzip, br'}
          };
        const data = await fetch('https://opensheet.elk.sh/1wyZSMhwwWie9tZnmDYURRJd0e56jY_TQUp1RWY2jx5I/Feuille%201', options)
        const weatherArray = await data.json();
        const weatherAlert = weatherArray[0];
        return weatherAlert;
    }

    const vigilanceMap = async () => {
        const apiKey = `eyJ4NXQiOiJZV0kxTTJZNE1qWTNOemsyTkRZeU5XTTRPV014TXpjek1UVmhNbU14T1RSa09ETXlOVEE0Tnc9PSIsImtpZCI6ImdhdGV3YXlfY2VydGlmaWNhdGVfYWxpYXMiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJsMHIyazRuQGNhcmJvbi5zdXBlciIsImFwcGxpY2F0aW9uIjp7Im93bmVyIjoibDByMms0biIsInRpZXJRdW90YVR5cGUiOm51bGwsInRpZXIiOiJVbmxpbWl0ZWQiLCJuYW1lIjoiRGVmYXVsdEFwcGxpY2F0aW9uIiwiaWQiOjIwOTI4LCJ1dWlkIjoiMTZhNjU2NWQtYjZiNi00NTdkLTlkY2ItOGQ3NDIxYTBjNmZkIn0sImlzcyI6Imh0dHBzOlwvXC9wb3J0YWlsLWFwaS5tZXRlb2ZyYW5jZS5mcjo0NDNcL29hdXRoMlwvdG9rZW4iLCJ0aWVySW5mbyI6eyI2MFJlcVBhck1pbiI6eyJ0aWVyUXVvdGFUeXBlIjoicmVxdWVzdENvdW50IiwiZ3JhcGhRTE1heENvbXBsZXhpdHkiOjAsImdyYXBoUUxNYXhEZXB0aCI6MCwic3RvcE9uUXVvdGFSZWFjaCI6dHJ1ZSwic3Bpa2VBcnJlc3RMaW1pdCI6MCwic3Bpa2VBcnJlc3RVbml0Ijoic2VjIn19LCJrZXl0eXBlIjoiUFJPRFVDVElPTiIsInN1YnNjcmliZWRBUElzIjpbeyJzdWJzY3JpYmVyVGVuYW50RG9tYWluIjoiY2FyYm9uLnN1cGVyIiwibmFtZSI6IkRvbm5lZXNQdWJsaXF1ZXNWaWdpbGFuY2UiLCJjb250ZXh0IjoiXC9wdWJsaWNcL0RQVmlnaWxhbmNlXC92MSIsInB1Ymxpc2hlciI6ImFkbWluIiwidmVyc2lvbiI6InYxIiwic3Vic2NyaXB0aW9uVGllciI6IjYwUmVxUGFyTWluIn1dLCJleHAiOjE3Njk3NzM5ODMsInRva2VuX3R5cGUiOiJhcGlLZXkiLCJpYXQiOjE3MzgyMzc5ODMsImp0aSI6Ijk0MGM1YmIwLWUzNjItNDUwZS1hZWU3LWFjNDkzZTY3NjdmYiJ9.OaaTeveqKvy4GAxXvQtv8nvpu0HQrV5y2yTp9fmcsiNb-RKyk8VqvDBgeueO42-qYp-gQylMVbtKTADUwAKeZJX8zK3XN6M-XtoYhgvlWLhcaNTrG2WeQohH5XMoYynTUHulX_CU82-K6eD3c8NwpdOmBiPXY2bEOaUUWUrjIdsAwnveTmMX3H23fV92ymR5pTrNrrHAd9mIiVUGE5LwxxQnTqiSSzJqQqBEETenvu25mDThkttL63vfzN2r1D-7cH_VcwwVoMi_85rW8BQiOjrQlguawj1EuFL7lnVj5yThJtxW3BfWmiQHvb0HjpD0WCWniqqHkT7yqqxIAJ-Olw==`;
        const url = 'https://public-api.meteofrance.fr/public/DPVigilance/v1/vignettenationale-J/encours';
      const options = {
        method: "GET",
        headers: {
          accept: "image/png",
          "accept-encoding": "deflate, gzip, br",
          apikey: apiKey
        }
      };

      try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);

        // Convertir la réponse en blob (image)
        const blob = await response.blob();

        // Créer une URL temporaire pour afficher l'image
       return URL.createObjectURL(blob);
      }
        catch (error) {
            console.error(error);
        } 
    }  

    const getCurrentTeamAndNextTeam = async () => {
        const options = {
            method: 'GET',
            headers: {accept: 'application/json', 'accept-encoding': 'deflate, gzip, br'}
          };
        const data = await fetch('https://api.cms-collonges.fr/getPlanning', options)
        const planningData = await data.json();
        return {
            planningData
        };
    }
    return {
        weather,
        getWeather,
        alertWeather,
        vigilanceMap,
        getCurrentTeamAndNextTeam,
    }
});