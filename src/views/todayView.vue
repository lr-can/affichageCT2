<template>
    <div id="Background" class="background-container">
        <img src="../assets/backgrounds/aujourdhui.jpg" alt="">
    </div>
    <div id="Title">
        <h1>Aujourd'hui</h1>
    </div>
    <div class="interContainer">
        <div class="fullRow">
            {{ new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' }) }}
        </div>
        <div class="fullRow">
            <div class="teamsContainer">
                <div :style="{textTransform: 'uppercase', color: 'black', padding: '1rem'}">
                    équipes
                </div>
                <div class="currentTeam" v-if="currentTeam">
                    <div class="title" :style="{color: teamColors[currentTeam]}">
                        <span v-show="display1">En cours</span><span v-show="!display1">{{ giveInfoGarde() }}</span>
                    </div>
                    <div class="teamTitle" :style="{backgroundColor: teamColors[currentTeam]}">
                        {{ currentTeam }}
                    </div>
                </div>
                <div class="Middle" style="position: absolute; padding-top: 8%;">
                    ⪢
                </div>
                <div class="nextTeam" v-if="nextTeam">
                    <div class="title" :style="{color: teamColors[nextTeam]}">
                        <span v-show="display1">Prochaine</span><span v-show="!display1">{{ giveInfoNextGarde() }}</span>
                    </div>
                    <div class="teamTitle" :style="{backgroundColor: teamColors[nextTeam]}">
                        {{ nextTeam }}
                    </div>
                </div>
            </div>
            <div class="teamsContainer">
                <div :style="{textTransform: 'uppercase', color: 'black'}">
                        Prochaine réunion
                </div>
                <div class="nextTeam">
                    <div class="teamTitle" :style="{fontSize: '1.2em', backgroundColor: getBackGroundColor('nextReu'), color: getColor('nextReu')}">
                        {{ giveDuration("nextReu")}} à 19h
                    </div>
                </div>
            </div>
        </div>
        <div class="fullRow">
            <div class="eventContainer">
                <div :style="{textTransform: 'uppercase', color: 'black', fontWeight: 'bold', fontSize: '1.5em'}">>
                    Anniversaires
                </div>
                <div class="eventGroup" v-for="aniv in nextAniv" :key="aniv.Date">
                    <div class="event" :style="{fontSize: '1.2em'}">
                        <span v-show=display1>{{ giveDurationBirthday(aniv.Date, 'birthday') }}</span><span v-show="!display1">{{ formatDate(aniv.Date) }}</span> - {{ aniv.anniversaire }}
                    </div>
                </div>
            </div>
            <div class="eventContainer">
                <div :style="{textTransform: 'uppercase', color: 'black', fontWeight: 'bold', fontSize: '1.5em'}">>
                    Événements
                </div>

            <div class="eventGroup" v-for="event in nextEvent" :key="event.Date">
                <div class="event" :style="{fontSize: '1.2em'}">
                    <span v-show="display1">{{ giveDurationBirthday(event.Date) }}</span><span v-show="!display1">{{ formatDate(event.Date) }}</span> - {{ event.evenementNom }}
                </div>
            </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { onMounted, ref } from 'vue';
import { useWeather } from '../store/weather';
const planning = useWeather();
const currentTeam = ref(null);
const nextTeam = ref(null);
const display1 = ref(true);
const nextReu = ref(null);
const nextAniv = ref(null);
const nextEvent = ref(null);

const teamColors = ref({
    "A": "#854085",
    "B": "#407855",
    "C": "#C8AA39",
    "D": "#CA5010",
    "E": "#0078d4",
    "F": "#A4262C",
})

onMounted(async () => {
    const planningTeams = await planning.getCurrentTeamAndNextTeam();
    const data = planningTeams.planningData;
    currentTeam.value = data.currentTeam;
    nextTeam.value = data.nextTeam;
    nextReu.value = new Date(data.nextReunion);
    nextAniv.value = data.nextTwoBirthdays;
    nextEvent.value = data.nextTwoEvents;

});

setInterval(() => {
    display1.value = !display1.value;
}, 10000);

const giveDuration = (type) => {
    const now = new Date();
    if (type === "nextReu") {
        const diff = nextReu.value - now;
        const days = Math.floor(diff / 1000 / 60 / 60 / 24);
        if (days === 0 || days < 0) {
            return "Aujourd'hui";
        } else if (days === 1 || days < 1) {
            return "Demain";
        } else if (days >= 7){
            return `Vendredi prochain`;
        }
        return `Ce vendredi`;
    }
}
const getBackGroundColor = (type) => {
    let duration = giveDuration(type);
    if (duration === "Vendredi prochain"){
        return "#d3d3d3";
    } else {
        return "red";
    }
}
const getColor = (type) => {
    let duration = giveDuration(type);
    if (duration === "Vendredi prochain"){
        return "#666666";
    } else {
        return "white";
    }
}
const giveDurationBirthday = (date, type='') => {
    const now = new Date();
    const diff = new Date(date) - now;
    const days = Math.floor(diff / 1000 / 60 / 60 / 24);
    if (days < 0) {
        if (type === 'birthday') {
            return "🎂 Aujourd'hui !";
        }
        return "Aujourd'hui !";
    } else if (days === 1 || days < 1 || days ===0) {
        return "Demain";
    } else if (days >= 7){
        if (days <= 14) {
            return `La semaine prochaine`;
        }
        return `Dans ${Math.floor(days / 7)} semaine${Math.floor(days / 7) > 1 ? "s" : ""} environ`;
    }
    return `Dans ${days} jours`;
}

const giveInfoGarde = () => {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    if (day === 6 || day === 0) {
        return "Jusqu'à lundi";
    } else if (hour < 6 || hour > 20) {
        return "Jusqu'à 6h";
    }
    return "A partir de 20h";
}

const giveInfoNextGarde = () => {
    const now = new Date();
    const day = now.getDay();
    if (day === 1 || day === 2){
        return "Mercredi 20h";
    } else if (day === 3 || day === 4) {
        return "Vendredi 20h";
    } else {
        return "Lundi 20h";
    }
}
const formatDate = (date) => {
    let date_obj = new Date(date)
    return date_obj.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' });
}
</script>
<style scoped>
#Background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    z-index: 1;
    filter: blur(5px) brightness(0.6);
    scale: 1.1;
}
img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
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
.interContainer {
    display: flex;
    align-items: center;
    justify-content: space-around;
    height: 70%;
    width: 80%;
    position: absolute;
    top: 53%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 3;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1), 0px 6px 20px rgba(0, 0, 0, 0.1);
    border-radius: 30px;
    backdrop-filter: blur(10px) brightness(1);
    background-color: #ffffff59;
    overflow: hidden;
    flex-wrap: wrap;
}

.currentTeam, .nextTeam {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 30%;
    height: 100%;
}
.Middle{
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50%;
    height: 100%;
    margin: 0;
    font-size: 2rem;
    color: #9a9a9a;
}
.teamTitle {
    padding: 1rem;
    background-color: red;
    font-size: 2em;
    padding: 1rem;
    padding-left: 2rem;
    padding-right: 2rem;
    color: white;
    border-radius: 1rem;
    font-weight: bold;
}
.fullRow {
    width: 100%;
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: 45%;
    background-color: #ffffffad;
}
.fullRow:first-child {
    height: 10%;
    font-size: 2rem;
    color: #666666;
    text-transform: uppercase;
    background-color: #ffffffad;
    border-bottom: 1px solid #a3a3a3;
}
.fullRow:nth-child(2) {
    background-color: #ffffffad;
}
.title{
    font-size: 1.5em;
    color: red;
    width: 100%;
    text-align: center;
    font-weight: bold;
}
.teamsContainer {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    flex-basis: 60%;
    padding: 1rem;
}
.teamsContainer:last-child {
    flex-basis: 40%;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1), 0px 6px 20px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    background-color: #ffffff59;
    margin-right: 2rem;
}
.teamsContainer:last-child > div {
    padding: 1rem;
    width: 100%;
    text-align: center;
    font-weight: bold;
    flex-basis: 1;
}
.teamsContainer > div:first-child {
    font-size: 1.5em;
    color: red;
    width: 100%;
    text-align: center;
    width: 100%;
    font-weight: bold;
    flex-basis: 1;
}
.eventContainer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    flex-basis: 50%;
    padding: 1rem;
}
.eventGroup {
    padding: 0.2rem;
    padding-top: 0.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
}
.event {
    width: 100%;
    text-align: center;
    flex-basis: 1;
    color: rgb(44, 44, 44);
    padding-bottom: 1rem;
    border-bottom: 1px solid #a3a3a3;
}
span {
    transition: all 0.3s ease;
}

</style>