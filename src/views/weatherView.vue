<template>
    <div id="Title">
            <h1>Météo</h1>
    </div>
    <div class="weathers">
        <div class="forecast" v-if="weatherForecast">
            <p>Actuellement</p>
            <p>{{weatherLabel}}</p>
            <div class="display" v-if="weatherCode != '00000'">
                <weatherIcon :size="2" :iconSrc="weatherCode" />
            </div>
            <h1>{{ Math.round(weatherForecast[1].values.temperature) }}°C</h1>
            <p>Ressenti : {{ Math.round(weatherForecast[1].values.temperatureApparent) }}°C</p>
            <p>☔ {{ weatherForecast[1].values.precipitationProbability }}%  - 💧 {{ weatherForecast[1].values.humidity }}%</p>
        </div>
        <div class="forecast" v-if="limitedForecast">
            <p>Prochaines heures</p>
            <div v-for="day in limitedForecast" :key="day.time">
                <p class="newDay">{{ new Date(day.time).getHours() < 10 ? "0" + new Date(day.time).getHours() : new Date(day.time).getHours()}} h 00</p>
                <div class="smallIcon">
                    <weatherIcon :size="1" :iconSrc="`${day.values.weatherCode}${now.getHours() > 18 || now.getHours() < 6 ? '1' : '0'}`" />
                </div>
                <p>{{ Math.round(day.values.temperature) }}°C</p>
            </div>
        </div>
        <div class="forecast" v-if="limitedForecast2">
            <p>Prochains jours</p>
            <div v-for="day in limitedForecast2" :key="day.time">
                <p class="newDay">{{ getDayName(new Date(day.time).getDay()) }} {{ new Date(day.time).getDate() }}/{{ (new Date(day.time).getMonth() + 1) < 10 ? "0" + (new Date(day.time).getMonth() + 1) : (new Date(day.time).getMonth() + 1) }}</p>
                <div class="smallIcon">
                    <weatherIcon :size="1" :iconSrc="`${day.values.weatherCode}${now.getHours() > 18 || now.getHours() < 6 ? '1' : '0'}`" />
                </div>
                <p>{{ Math.round(day.values.temperature) }}°C</p>
            </div>
        </div>
        <div class="forecast vigilance" v-if="alertData && alertData.alerteSeverite">
            <h3 :class="`${alertData.alerteSeverite}` + 'Background' + ' ' +`${alertData.alerteSeverite}` + 'Foreground' + ' coolPadding'">
             {{ alertData.alerteCouleur }}
            </h3>
            <div class="flexx">
                <div v-if="imgURL">
                    <img :src="imgURL" alt="Alerte météo" :style="giveStyle()">
                </div>
                <div v-if="alertData.icon" v-for="alert in alertData.icon.split(', ')" :key="alert">
                    <img :src="getImgUrl(alert)" alt="Alerte météo" :class="`${alertData.alerteSeverite}` + 'Img'" style="width: 50px; height: 50px; margin-top: 1rem;">
                    <div class="bold">	
                    <p>{{ alertData.alerteType ? alertData.alerteType : ""}}</p>
                     </div>
                </div>
            </div>
            <div style="text-align: justify; color: #d3d3d3;">
                <p>{{ alertData.alerteMessage }}</p>
            </div>
        </div>
    </div>

</template>
<script setup>
import weatherIcon from '../components/weatherIcon.vue';
import { onMounted, ref } from 'vue';
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
      alertData.value.alerteMessage = alertData.value.alerteMessage.slice(0, 550) + '…';
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
const getImgUrl = (alert) => {
    return new URL(`../assets/weather/${alert}.svg`, import.meta.url).href;
};
const giveStyle = () => {
    if (alertData.value){
        if(alertData.value.alerteMessage && alertData.value.alerteMessage.length > 350){
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
#Title {
    position: absolute;
    top: 1.2rem;
    left: 2.5rem;
    z-index: 4;
    color: white;
    font-size: 1em;
    text-align: center;
    text-transform: uppercase;
}

.weathers{
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;

}
.flexx {
    display: flex;
    justify-content: space-around;
    align-items: center;
    width: 100%;
}
.weathers > div {
    height: 75%;
}

.currentWeather {
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 0 20px 10px rgba(0, 0, 0, 0.1);
    color: white;
    text-align: center;
    backdrop-filter: blur(10px) brightness(0.7);
}

.currentWeather p {
    margin: 5px 0;
}

.currentWeather h1 {
    margin: 10px 0;
    font-size: 4em;
    padding: 1rem;
}
.bold {
    font-weight: bold;
}
.coolPadding {
    padding: 1rem;
}
.currentWeather p {
    margin-top: 0rem;
    padding-top: 0;
}
.forecast {
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-direction: column;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 0 20px 10px rgba(0, 0, 0, 0.1);
    color: white;
    text-align: center;
    backdrop-filter: blur(10px) brightness(0.7);
    margin-left: 1rem;
    flex-wrap: wrap;
    width: 10%;
    animation: slideInRight 0.5s ease-in-out;
    opacity: 0;
    animation-fill-mode: forwards;
}
@keyframes slideInRight {
        from {
            transform: translateX(20%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
.forecast:nth-child(1){
    background-color: #3498db20;
    width: 15%;
}
.vigilance{
    width: 30%;
}
.forecast:nth-child(2){
    animation-delay: 200ms;
}
.forecast:nth-child(3){
    animation-delay: 300ms;
}
.forecast:nth-child(4){
    animation-delay: 400ms;
}
.smallIcon {
    width: 50px;
    height: 50px;
    margin: 0 auto;
}
.newDay {
    border-top: 1px solid grey;
    width: 100%;
}
.AdvisoryBackground {
    background-color: #f1c40f;
    border-radius: 30px;
}
.AdvisoryForeground {
    color: white;
}
.WatchBackground {
    border-radius: 30px;
    background-color: #e67e22;
}
.WatchForeground {
    color: white;
}
.WarningBackground {
    border-radius: 30px;
    background-color: #e74c3c
}
.WarningForeground {
    color: white;
}
.AdvisoryImg, .WatchImg, .WarningImg {
    filter: invert(100%) sepia(100%) saturate(1000%) hue-rotate(180deg) brightness(100%) contrast(100%);
}
.NoneForeground {
    color: white;
}
.NoneBackground {
    background-color: #1f8d49;
    border-radius: 30px;
}

</style>
