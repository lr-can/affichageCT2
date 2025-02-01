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
            <div class="currentTeam" v-if="currentTeam">
                <div class="title" :style="{color: teamColors[currentTeam]}">
                    En cours
                </div>
                <div class="teamTitle" :style="{backgroundColor: teamColors[currentTeam]}">
                    {{ currentTeam }}
                </div>
            </div>
            <div class="nextTeam" v-if="nextTeam">
                <div class="title" :style="{color: teamColors[nextTeam]}">
                    Prochaine
                </div>
                <div class="teamTitle" :style="{backgroundColor: teamColors[nextTeam]}">
                    {{ nextTeam }}
                </div>
            </div>
            <div class="nextTeam">
                <div class="title">
                    Prochaine réunion
                </div>
                <div class="teamTitle">
                    {{ giveDuration("nextReu")}} à 19h
                </div>
            </div>
        </div>
        <div class="fullRow">

        </div>
    </div>
</template>
<script setup>
import { onMounted, ref } from 'vue';
import { useWeather } from '../store/weather';
const planning = useWeather();
const currentTeam = ref(null);
const nextTeam = ref(null);
const nextReu = ref(null);

const teamColors = ref({
    "A": "#A558A0",
    "B": "#1f8d49",
    "C": "#C8AA39",
    "D": "#CE614A",
    "E": "#0078f3",
    "F": "#f60700",
})

onMounted(async () => {
    const planningTeams = await planning.getCurrentTeamAndNextTeam();
    const data = planningTeams.planningData;
    currentTeam.value = data.currentTeam;
    nextTeam.value = data.nextTeam;
    nextReu.value = new Date(data.nextReunion);
});
const giveDuration = (type) => {
    const now = new Date();
    if (type === "nextReu") {
        const diff = nextReu.value - now;
        const days = Math.floor(diff / 1000 / 60 / 60 / 24);
        if (days === 0) {
            return "Aujourd'hui";
        } else if (days === 1) {
            return "Demain";
        }
        return `Dans ${days} jours`;
    }
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
    width: 50%;
    background-color: #ffffff59;
    height: 100%;
}
.teamTitle {
    padding: 1rem;
    background-color: red;
    font-size: 3em;
    padding: 1rem;
    color: white;
}
.fullRow {
    width: 100%;
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: 33%;
}
.fullRow:first-child {
    height: 10%;
    font-size: 3rem;
    color: white;
    text-transform: uppercase;
}
.title{
    font-size: 1.5em;
    color: red;
    padding: 1rem;
    width: 100%;
    text-align: center;
    font-weight: bold;
}

</style>