<template>
    <div class="clock-container">
        <div class="clock">
            <span class="heureMin">{{ nowHour.toString().replace("h", '') }}<span class="blink"> : </span>{{ nowMinute }}</span><span class="seconds">{{ nowSeconds }}</span>
        </div>
    </div>
</template>
<style scoped>
.clock-container {
    position: absolute;
    bottom: 1rem;
    right: 1rem;
    padding: 10px;
    font-size: 1.5rem;
    color: white;
    z-index: 50;
    background-color: #ffffff20;
    backdrop-filter: blur(10px) brightness(1);
    border-radius: 3rem;
    width: 10rem;
    box-shadow: 0 0 20px 10px rgba(0, 0, 0, 0.1);
    font-family: 'Roboto', monospace;
}
.clock > span {
    margin: 0 0.2rem;
}
.seconds {
    font-size: 1.2rem;
    color: rgb(160, 160, 160);
    padding-left: 0.3rem;
}
.blink {
    animation: blink 2s infinite;
}
@keyframes blink {
    0% {
        opacity: 1;
    }
    49.9% {
        opacity: 1;
    }
    50% {
        opacity: 0;
    }
    99.9% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}

</style>
<script setup>
import { onMounted, ref } from 'vue';
import { useWeather } from '../store/weather';

const planning = useWeather();
const nowHour = ref(new Date().getHours());
const nowMinute = ref(new Date().getMinutes());
const nowSeconds = ref(new Date().getSeconds());
const today = new Date().getDay();
const currentTeam = ref(null);
const reunion = ref(null);
const reunionToday = ref(null);

import dpsem from '../assets/sounds/DPSEM.mp3';
import dpwe from '../assets/sounds/DPWE.mp3';
import equipeA from '../assets/sounds/equipeA.mp3';
import equipeB from '../assets/sounds/equipeB.mp3';
import equipeC from '../assets/sounds/equipeC.mp3';
import equipeD from '../assets/sounds/equipeD.mp3';
import equipeE from '../assets/sounds/equipeE.mp3';
import equipeF from '../assets/sounds/equipeF.mp3';

import hourly_pips from '../assets/sounds/hourly_pips.mp3';
import hourly_pips_sat from '../assets/sounds/hourly_pips_sat.mp3';

onMounted(async ()=>{
    const planningTeams = await planning.getCurrentTeamAndNextTeam();
    const data = planningTeams.planningData;
    currentTeam.value = data.currentTeam;
    reunion.value = new Date(data.nextReunion);
    const now = new Date();
    const diff = reunion.value - now;
    const days = Math.floor(diff / 1000 / 60 / 60 / 24);
    if (days === 0 || days < 0) {
        reunionToday.value = true;
        return;
    }
    reunionToday.value = false;
});

const teamsAudio = {
    A: equipeA,
    B: equipeB,
    C: equipeC,
    D: equipeD,
    E: equipeE,
    F: equipeF,
}

let audio1 = new Audio();
let audio2 = new Audio();
let audio3 = new Audio();
setInterval(() => {
    nowHour.value = new Date().getHours().toString().padStart(2, '0');
    nowMinute.value = new Date().getMinutes().toString().padStart(2, '0');
    nowSeconds.value = new Date().getSeconds().toString().padStart(2, '0');
    if (nowMinute.value === '59' && nowSeconds.value === '56'){
        if (nowHour.value === '19'){
        if (today === 5 || today === 6){
            audio1.src = hourly_pips_sat;
            audio2.src = teamsAudio[currentTeam.value];
            audio3.src = dpwe;
            audio1.play();
            audio1.onended = () => {
                audio2.play();
                audio2.onended = () => {
                    audio3.play();
                }
            }
            return;
        } else {
            audio1.src = hourly_pips;
            audio2.src = teamsAudio[currentTeam.value];
            audio3.src = dpsem;
            audio1.play();
            audio1.onended = () => {
                audio2.play();
                audio2.onended = () => {
                    audio3.play();
                }
            }
            return;
        }
    } else if ((today === 6 && nowHour === '8') || (nowHour === '18' && reunionToday.value)){
        audio1.src = hourly_pips_sat;
        audio1.play();
    } else {
        audio1.src = hourly_pips;
        audio1.volume = 0.5;
        audio1.play();
    }
    }
}, 1000);

</script>