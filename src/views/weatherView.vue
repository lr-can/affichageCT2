<template>
    <div class="weather-container">
        <header class="weather-header">
            <h1 class="weather-title">Météo</h1>
        </header>

        <main class="weather-content">
            <!-- Carte actuelle -->
            <div class="weather-card current-weather" v-if="weatherForecast">
                <div class="card-header">
                    <h2 class="card-title">Actuellement</h2>
                    <p class="weather-label">{{ weatherLabel }}</p>
                </div>
                <div class="weather-main" v-if="weatherCode != '00000'">
                    <div class="weather-icon-large">
                        <weatherIcon :size="2" :iconSrc="weatherCode" />
                    </div>
                    <div class="temperature-display">
                        <span class="temperature">{{ Math.round(weatherForecast[1].values.temperature) }}</span>
                        <span class="temperature-unit">°C</span>
                    </div>
                </div>
                <div class="weather-details">
                    <div class="detail-item">
                        <span class="detail-label">Ressenti</span>
                        <span class="detail-value">{{ Math.round(weatherForecast[1].values.temperatureApparent) }}°C</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-icon">☔</span>
                        <span class="detail-value">{{ weatherForecast[1].values.precipitationProbability }}%</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-icon">💧</span>
                        <span class="detail-value">{{ weatherForecast[1].values.humidity }}%</span>
                    </div>
                </div>
            </div>

            <!-- Prévisions (heures + jours) -->
            <div class="weather-card forecast-card" v-if="limitedForecast && limitedForecast2 && !shouldHideForecasts">
                <h2 class="card-title">Prévisions</h2>
                <div class="forecast-grid-container">
                    <!-- Prochaines heures -->
                    <div class="forecast-section">
                        <h3 class="forecast-section-title">Prochaines heures</h3>
                        <div class="forecast-grid">
                            <div v-for="day in limitedForecast" :key="day.time" class="forecast-item-grid">
                                <p class="forecast-time">{{ new Date(day.time).getHours() < 10 ? "0" + new Date(day.time).getHours() : new Date(day.time).getHours()}}h00</p>
                                <div class="forecast-icon-small">
                                    <weatherIcon :size="0.7" :iconSrc="`${day.values.weatherCode}${now.getHours() > 18 || now.getHours() < 6 ? '1' : '0'}`" />
                                </div>
                                <p class="forecast-temp">{{ Math.round(day.values.temperature) }}°C</p>
                                <div class="forecast-extras-small">
                                    <span v-if="day.values.precipitationProbability > 0" class="forecast-rain">☔ {{ day.values.precipitationProbability }}%</span>
                                    <span class="forecast-wind">💨 {{ Math.round(day.values.windSpeed) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Prochains jours -->
                    <div class="forecast-section">
                        <h3 class="forecast-section-title">Prochains jours</h3>
                        <div class="forecast-grid">
                            <div v-for="day in limitedForecast2" :key="day.time" class="forecast-item-grid">
                                <p class="forecast-date">
                                    <span class="day-name">{{ getDayName(new Date(day.time).getDay()) }}</span>
                                    <span class="day-number">{{ new Date(day.time).getDate() }}/{{ (new Date(day.time).getMonth() + 1) < 10 ? "0" + (new Date(day.time).getMonth() + 1) : (new Date(day.time).getMonth() + 1) }}</span>
                                </p>
                                <div class="forecast-icon-small">
                                    <weatherIcon :size="0.7" :iconSrc="`${day.values.weatherCode}${now.getHours() > 18 || now.getHours() < 6 ? '1' : '0'}`" />
                                </div>
                                <p class="forecast-temp">{{ Math.round(day.values.temperature) }}°C</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Détails météo supplémentaires -->
            <div class="weather-card details-card" v-if="weatherForecast">
                <h2 class="card-title">Détails</h2>
                <div class="details-grid">
                    <div class="detail-card">
                        <div class="detail-icon">💨</div>
                        <div class="detail-info">
                            <span class="detail-label">Vent</span>
                            <span class="detail-value">{{ Math.round(weatherForecast[1].values.windSpeed) }} km/h</span>
                            <span class="detail-subvalue" v-if="weatherForecast[1].values.windGust > weatherForecast[1].values.windSpeed">
                                Rafales: {{ Math.round(weatherForecast[1].values.windGust) }} km/h
                            </span>
                            <span class="detail-direction">Direction: {{ getWindDirection(weatherForecast[1].values.windDirection) }}</span>
                        </div>
                    </div>
                    <div class="detail-card">
                        <div class="detail-icon">📊</div>
                        <div class="detail-info">
                            <span class="detail-label">Pression</span>
                            <span class="detail-value">{{ Math.round(weatherForecast[1].values.pressureSeaLevel) }} hPa</span>
                        </div>
                    </div>
                    <div class="detail-card">
                        <div class="detail-icon">👁️</div>
                        <div class="detail-info">
                            <span class="detail-label">Visibilité</span>
                            <span class="detail-value">{{ Math.round(weatherForecast[1].values.visibility) }} km</span>
                        </div>
                    </div>
                    <div class="detail-card">
                        <div class="detail-icon">☁️</div>
                        <div class="detail-info">
                            <span class="detail-label">Nuages</span>
                            <span class="detail-value">{{ weatherForecast[1].values.cloudCover }}%</span>
                            <span class="detail-subvalue" v-if="weatherForecast[1].values.cloudBase">
                                Base: {{ Math.round(weatherForecast[1].values.cloudBase) }} km
                            </span>
                        </div>
                    </div>
                    <div class="detail-card">
                        <div class="detail-icon">🌡️</div>
                        <div class="detail-info">
                            <span class="detail-label">Point de rosée</span>
                            <span class="detail-value">{{ Math.round(weatherForecast[1].values.dewPoint) }}°C</span>
                        </div>
                    </div>
                    <div class="detail-card" v-if="weatherForecast[1].values.uvIndex !== null && weatherForecast[1].values.uvIndex !== undefined">
                        <div class="detail-icon">☀️</div>
                        <div class="detail-info">
                            <span class="detail-label">Index UV</span>
                            <span class="detail-value">{{ weatherForecast[1].values.uvIndex }}</span>
                            <span class="detail-subvalue">{{ getUVLevel(weatherForecast[1].values.uvIndex) }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Alerte vigilance -->
            <div class="weather-card alert-card" v-if="alertData && alertData.alerteSeverite" :style="{ width: alertCardWidth }">
                <div class="alert-header" :class="`${alertData.alerteSeverite}Background ${alertData.alerteSeverite}Foreground`">
                    <h3 class="alert-title">{{ alertData.alerteCouleur }}</h3>
                </div>
                <div class="alert-content">
                    <div v-if="imgURL" class="alert-map">
                        <img :src="imgURL" alt="Carte de vigilance" :style="giveStyle()">
                    </div>
                    <div v-if="alertData.icon && alertData.icon.length > 0" class="alert-icons">
                        <div v-for="alert in alertData.icon.split(', ')" :key="alert" class="alert-icon-item">
                            <img :src="getImgUrl(alert)" alt="Alerte météo" :class="`${alertData.alerteSeverite}Img`">
                            <p class="alert-icon-label">{{ alert ? alert : "" }}</p>
                        </div>
                    </div>
                </div>
                <div v-if="alertMessageText.length > 0" class="alert-message" :style="{ fontSize: alertMessageFontSize }">
                    <p>{{ alertMessageText }}</p>
                </div>
            </div>
        </main>
    </div>
</template>
<script setup>
import weatherIcon from '../components/weatherIcon.vue';
import { onMounted, ref, computed } from 'vue';
import { useWeather } from '../store/weather';

const weatherStore = useWeather();

const weatherCode = ref('00000');
const weather = ref(null);
const weatherForecast = ref(null);
const weatherLabel = ref('');
const limitedForecast = ref(null);
const limitedForecast2 = ref(null);
const now = ref(new Date());
const alertData = ref(null);
const imgURL = ref('');

// TODO: Remove this flag and lorem ipsum when real alert data is available
const USE_LOREM_IPSUM = false;
const LOREM_IPSUM_TEXT = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.";

const alertMessageText = computed(() => {
    if (!alertData.value) return '';
    // Use lorem ipsum if flag is true, otherwise use real message
    if (USE_LOREM_IPSUM) {
        return LOREM_IPSUM_TEXT;
    }
    return alertData.value.alerteMessage || '';
});

// Détermine si on doit masquer les prévisions selon la taille du message d'alerte
const shouldHideForecasts = computed(() => {
    if (!alertData.value || !alertData.value.alerteSeverite) return false;
    const messageLength = alertMessageText.value.length;
    // Masquer les prévisions si le message dépasse 400 caractères
    return messageLength > 400;
});

// Largeur dynamique de la carte d'alerte selon la taille du message
const alertCardWidth = computed(() => {
    if (!alertData.value || !alertData.value.alerteSeverite) return '320px';
    const messageLength = alertMessageText.value.length;
    
    if (messageLength > 1000) {
        return 'min(1600px, 100%)';
    } else if (messageLength > 800) {
        return 'min(1400px, 100%)';
    } else if (messageLength > 600) {
        return 'min(1200px, 100%)';
    } else if (messageLength > 400) {
        return 'min(1000px, 100%)';
    } else if (messageLength > 200) {
        return 'min(800px, 100%)';
    }
    return '320px';
});

// Taille du texte dynamique selon la longueur du message
const alertMessageFontSize = computed(() => {
    if (!alertData.value || !alertData.value.alerteSeverite) return '0.9rem';
    const messageLength = alertMessageText.value.length;
    
    if (messageLength > 800) {
        return '1.15rem';
    } else if (messageLength > 600) {
        return '1.1rem';
    } else if (messageLength > 400) {
        return '1.05rem';
    } else if (messageLength > 200) {
        return '1rem';
    }
    return '0.9rem';
});

onMounted(async () => {
    await weatherStore.getWeather();
    imgURL.value = await weatherStore.vigilanceMap();
    alertData.value = await weatherStore.alertWeather();
    weather.value = weatherStore.weather;
    weatherForecast.value = weather.value.weatherForecast;
    weatherLabel.value = weather.value.weatherLabel;
    weatherCode.value = weatherForecast.value[1].values.weatherCode;
    weatherCode.value +=  now.value.getHours() > 18 || now.value.getHours() < 6 ? '1' : '0';
    limitedForecast.value = [weatherForecast.value[2], weatherForecast.value[4], weatherForecast.value[6]];
    limitedForecast2.value = [weatherForecast.value[25], weatherForecast.value[49], weatherForecast.value[73]];
    if (alertData.value && alertData.value.alerteMessage && alertData.value.alerteMessage.length >= 550) {
      alertData.value.alerteMessage = alertData.value.alerteMessage.length < 750 ? alertData.value.alerteMessage : alertData.value.alerteMessage.slice(0, 750) + '…';
    imgURL.value = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://www.meteoalarm.org/en/live/region/FR?s=Rh%C3%B4ne#list";
    }
});

const getDayName = (day) => {
    switch (day) {
        case 0:
            return 'Dim';
        case 1:
            return 'Lun';
        case 2:
            return 'Mar';
        case 3:
            return 'Mer';
        case 4:
            return 'Jeu';
        case 5:
            return 'Ven';
        case 6:
            return 'Sam';
    }
};

const getWindDirection = (degrees) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
};

const getUVLevel = (uvIndex) => {
    if (uvIndex <= 2) return 'Faible';
    if (uvIndex <= 5) return 'Modéré';
    if (uvIndex <= 7) return 'Élevé';
    if (uvIndex <= 10) return 'Très élevé';
    return 'Extrême';
};

const getImgUrl = (alert) => {
    return new URL(`../assets/weather/${alert}.svg`, import.meta.url).href;
};
const giveStyle = () => {
    if (alertData.value){
        if(alertData.value.alerteMessage && alertData.value.alerteMessage.length > 400){
            return {width: '80px', height: 'auto' };
        }    else if (alertData.value.alerteMessage && alertData.value.alerteMessage.length > 150) {
            return {width: '200px', height: 'auto' };
        } else if(alertData.value.alerteSeverite && alertData.value.alerteSeverite != 'None'){
            return {width: '250px', height: 'auto'};
        } 
        return {width: '400px', height: 'auto'};
    }

}
</script>
<style scoped>
* {
    box-sizing: border-box;
}

.weather-container {
    position: relative;
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.weather-header {
    position: relative;
    padding: 2rem 3rem;
    z-index: 10;
}

.weather-title {
    font-size: 2rem;
    font-weight: 700;
    color: #ffffff;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0;
    text-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

.weather-content {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1.5rem;
    padding: 2rem;
    justify-items: center;
    align-items: stretch;
    max-width: 1800px;
    margin: 0 auto;
}

.weather-content::-webkit-scrollbar {
    height: 8px;
}

.weather-content::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
}

.weather-content::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
}

.weather-content::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.4);
}

/* Cartes météo */
.weather-card {
    background: rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(30px);
    border-radius: 1.5rem;
    padding: 2rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 0 8px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #ffffff;
    animation: slideInUp 0.6s ease-out forwards;
    opacity: 0;
    width: 320px;
    min-height: 250px;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.weather-card:nth-child(1) { animation-delay: 0.1s; }
.weather-card:nth-child(2) { animation-delay: 0.2s; }
.weather-card:nth-child(3) { animation-delay: 0.3s; }
.weather-card:nth-child(4) { animation-delay: 0.4s; }

@keyframes slideInUp {
    from {
        transform: translateY(30px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.card-header {
    text-align: center;
    margin-bottom: 1.5rem;
}

.card-title {
    font-size: 1.1rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 0.5rem 0;
    opacity: 0.9;
}

.weather-label {
    font-size: 0.9rem;
    opacity: 0.8;
    margin: 0;
    text-transform: capitalize;
}

/* Prévisions groupées */
.forecast-card {
    width: 320px;
}

.forecast-grid-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    flex: 1;
    margin-top: 1rem;
}

.forecast-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.forecast-section-title {
    font-size: 0.9rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    opacity: 0.8;
    margin: 0;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.forecast-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
}

.forecast-item-grid {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 0.5rem;
    background: rgba(0, 0, 0, 0.15);
    border-radius: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.2s ease;
}

.forecast-item-grid:hover {
    background: rgba(0, 0, 0, 0.25);
    transform: translateY(-2px);
}

.forecast-icon-small {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.forecast-time,
.forecast-date {
    font-size: 0.75rem;
    font-weight: 600;
    opacity: 0.9;
    margin: 0;
    text-align: center;
}

.forecast-date {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
}

.day-name {
    font-size: 0.8rem;
    font-weight: 700;
}

.day-number {
    font-size: 0.7rem;
    opacity: 0.8;
}

.forecast-temp {
    font-size: 0.95rem;
    font-weight: 600;
    margin: 0;
}

.forecast-extras-small {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
    font-size: 0.65rem;
    opacity: 0.8;
    margin-top: 0.25rem;
}

.forecast-rain,
.forecast-wind {
    font-size: 0.6rem;
}

.weather-main {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin: 2rem 0;
}

.weather-icon-large {
    width: 120px;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.temperature-display {
    display: flex;
    align-items: flex-start;
    gap: 0.25rem;
}

.temperature {
    font-size: 4.5rem;
    font-weight: 700;
    line-height: 1;
}

.temperature-unit {
    font-size: 2rem;
    font-weight: 600;
    opacity: 0.9;
    margin-top: 0.5rem;
}

.weather-details {
    display: flex;
    justify-content: space-around;
    gap: 1rem;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.detail-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
}

.detail-label {
    font-size: 0.75rem;
    opacity: 0.7;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.detail-icon {
    font-size: 1.2rem;
}

.detail-value {
    font-size: 0.95rem;
    font-weight: 600;
}


/* Détails météo */
.details-card {
    width: 320px;
}

.details-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-top: 1rem;
    flex: 1;
}

.detail-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.15);
    border-radius: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.2s ease;
}

.detail-card:hover {
    background: rgba(0, 0, 0, 0.2);
    transform: translateY(-2px);
}

.detail-icon {
    font-size: 1.8rem;
    margin-bottom: 0.25rem;
}

.detail-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    text-align: center;
}

.detail-label {
    font-size: 0.75rem;
    opacity: 0.7;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.detail-value {
    font-size: 1.1rem;
    font-weight: 700;
}

.detail-subvalue {
    font-size: 0.75rem;
    opacity: 0.8;
    margin-top: 0.25rem;
}

.detail-direction {
    font-size: 0.7rem;
    opacity: 0.7;
    margin-top: 0.25rem;
}

/* Alerte vigilance */
.alert-card {
    width: 320px;
    transition: width 0.3s ease;
}

.alert-header {
    border-radius: 1rem;
    padding: 1rem 1.5rem;
    margin-bottom: 1rem;
    text-align: center;
}

.alert-title {
    font-size: 1.3rem;
    font-weight: 700;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.alert-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
}

.alert-map {
    display: flex;
    justify-content: center;
}

.alert-map img {
    border-radius: 0.75rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.alert-icons {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 1.5rem;
}

.alert-icon-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.alert-icon-item img {
    width: 50px;
    height: 50px;
}

.alert-icon-label {
    font-size: 0.85rem;
    font-weight: 600;
    margin: 0;
    text-align: center;
}

.alert-message {
    padding: 1.25rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 0.75rem;
    text-align: justify;
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.9);
    flex: 1;
}

.alert-message p {
    margin: 0;
}

/* Styles d'alerte */
.AdvisoryBackground {
    background-color: #f1c40f;
    border-radius: 1rem;
}

.AdvisoryForeground {
    color: #1a1a1a;
}

.WatchBackground {
    background-color: #e67e22;
    border-radius: 1rem;
}

.WatchForeground {
    color: white;
}

.WarningBackground {
    background-color: #e74c3c;
    border-radius: 1rem;
}

.WarningForeground {
    color: white;
}

.AdvisoryImg,
.WatchImg,
.WarningImg {
    filter: invert(100%) sepia(100%) saturate(1000%) hue-rotate(180deg) brightness(100%) contrast(100%);
}

.NoneForeground {
    color: white;
}

.NoneBackground {
    background-color: #1f8d49;
    border-radius: 1rem;
}

/* Responsive */
@media (max-width: 1200px) {
    .weather-content {
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    }
    
    .forecast-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    .weather-header {
        padding: 1.5rem 2rem;
    }
    
    .weather-title {
        font-size: 1.5rem;
    }
    
    .weather-content {
        grid-template-columns: 1fr;
        padding: 1rem;
    }
    
    .weather-card {
        width: 100%;
    }
    
    .forecast-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}
</style>
