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
                <div class="rowFlexx" v-if="currentTeam && nextTeam && teamAfter">
                    <div id="currentTeam" :style="{width: '70%'}">
                        <div class="teamTitre">
                            En cours
                        </div>
                        <div class="teamContainer">
                            <div class="teamTitle" id="firstTeam" :style="{color: 'white', backgroundColor: teamColors[currentTeam.equipe], width:'60%',  boxShadow: teamColors[currentTeam.equipe] + '4D  0px 10px 30px'}">
                                <span :style="{color: 'white'}">{{ currentTeam.equipe }}</span>
                                <span :style="{color: 'rgb(255, 255, 255, 0.8)'}"><em>{{ giveInfoGarde() }}</em></span>
                            </div>
                        </div>
                        <div class="teamFooter">
                            <span v-for="data of currentTeam.dateComment" :key="data">{{data}}</span>
                        </div>
                    </div>
                    <div id="nextTeam" :style="{width: '35%'}">
                        <div class="teamTitre">
                            Prochaine
                        </div>
                        <div class="teamContainer">
                            <div class="teamTitle" :style="{color: 'white', backgroundColor: teamColors[nextTeam.equipe], boxShadow: teamColors[nextTeam.equipe] + '33  0px 8px 24px', width:'20%'}">
                                {{ nextTeam.equipe }}
                            </div>
                        </div>
                        <div class="teamFooter">
                            <span v-for="data of nextTeam.dateComment" :key="data">{{data}}</span>
                        </div>
                    </div>
                    <div id="teamAfter" :style="{width: '35%'}">
                        <div class="teamTitre">
                            Ensuite
                        </div>
                        <div class="teamContainer">
                            <div class="teamTitle" :style="{color: 'white', backgroundColor: teamColors[teamAfter.equipe], boxShadow: teamColors[teamAfter.equipe] + '33  0px 8px 24px', width:'20%'}">
                                {{ teamAfter.equipe }}
                            </div>
                        </div>
                        <div class="teamFooter">
                            <span v-for="data of teamAfter.dateComment" :key="data">{{data}}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="teamsContainer">
                <div :style="{textTransform: 'uppercase', color: 'black'}">
                        Prochaine réunion
                </div>
                <div class="nextTeam">
                    <div class="teamTitle nextReu" :style="{fontSize: '1.2em', backgroundColor: getBackGroundColor(), color: getColor()}">
                        <div>
                            {{ giveDuration("nextReu")}} à 19h
                        </div>
                        <div class="nextReuOrganisation">
                            <span :style="{fontSize: '0.8rem', fontWeight: 'normal'}">Organisée par l'équipe</span> <span :style="{backgroundColor: teamColors[nextReunionTeam], color: 'white'}" class="nextReuTeam">{{ nextReunionTeam }}</span>
                        </div>
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
const teamAfter = ref(null);
const display1 = ref(true);
const nextReu = ref(null);
const nextAniv = ref(null);
const nextEvent = ref(null);
const nextReunionTeam = ref(null);

const teamColors = ref({
    "A": "#a02b93",
    "B": "#4ea72e",
    "C": "#ffc000",
    "D": "#e97132",
    "E": "#00b0f0",
    "F": "#ff0000",
})

onMounted(async () => {
    const planningTeams = await planning.getCurrentTeamAndNextTeam();
    const data = planningTeams.planningData;
    currentTeam.value = data.currentTeam;
    nextTeam.value = data.nextTeam;
    teamAfter.value = data.teamAfter;
    nextReu.value = new Date(data.nextReunion);
    nextAniv.value = data.nextTwoBirthdays;
    nextEvent.value = data.nextTwoEvents;
    nextReunionTeam.value = data.nextReunionTeam;
});

setInterval(() => {
    display1.value = !display1.value;
}, 10000);

const giveDuration = (type) => {
    const now = new Date();
    if (type === "nextReu") {
        const diff = nextReu.value - now;
        const days = Math.floor(diff / 1000 / 60 / 60 / 24);
        if ( days < 0) {
            return "Aujourd'hui";
        } else if (days === 0 || days < 1) {
            return "Demain";
        } else if (days === 1 || days < 2) {
            return "Après-demain";
        } else if (days >= 6){
            return `Vendredi prochain`;
        }
        return `Ce vendredi`;
    }
}
const getBackGroundColor = () => {
    return "#d3d3d3";
}
const getColor = () => {
    return "#666666";
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
    } else if (days < 1 || days === 0) {
        return "Demain";
    } else if (days === 1 || days < 2) {
        return "Après-demain";
    } else if (days >= 7){
        if (days <= 14) {
            return `Dans les deux prochaines semaines`;
        }
        return `Dans ${Math.floor(days / 7)} semaine${Math.floor(days / 7) > 1 ? "s" : ""} environ`;
    }
    return `Dans ${days + 1} jours`;
}

const giveInfoGarde = () => {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    if (day === 5) {
        return "19h > lundi 6h";
    } else if (day === 6 || day === 0) {
        return "> lundi 6h";
    } else if (hour < 6 || hour >= 19) {
        return "> 6h";
    }
    return "19h > 6h";
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
.nextReu {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 1rem;
    font-size: 2rem;
    color: #666666;
}
.nextReuOrganisation {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    width: 100%;
    font-size: 0.8em;
    color: #666666;
}
.teamTitle {
    background-color: red;
    font-size: 2rem;
    padding: 1rem;
    padding-left: 2rem;
    padding-right: 2rem;
    color: white;
    border-radius: 5px;
    width: 70%;
    font-weight: bold;
}
.teamTitle > span {
    font-size: 0.5em;
    font-weight: normal;
    display: block;
    margin-top: 0.5rem;
    color: #ffffff87;
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
.rowFlexx {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    width: 100%;
    flex-grow: 1;

}
.rowFlexx > div {
    width: 100%;
    text-align: center;
    font-size: 1.5em;
    color: #666666;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.nextReuTeam {
    background-color: #d3d3d3;
    color: white;
    font-size: 0.8rem;
    padding: 0.3rem;
    padding-left: 0.4rem;
    padding-right: 0.4rem;
    border-radius: 10px;
    width: 1rem;
    font-weight: bold;
}
.teamTitre {
    font-size: 1.2rem;
    color: #666666;
    font-weight: bold;
    width: 100%;
    text-align: center;
    margin-bottom: 1rem;
    text-transform: uppercase;
}
.teamContainer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
}
.teamFooter {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    font-size: 0.8em;
    color: #666666;
    margin-top: 1rem;
}
#firstTeam{
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 0;
    padding-top: 1rem;
    padding-bottom: 1rem;
    width: 100%;
}
#firstTeam > span:first-child {
    font-size: 2rem;
    font-weight: bold;
    width: 50%;
    text-align: center;
    color: white;
    margin: 0;
}
#firstTeam > span:last-child {
    font-size: 1rem;
    font-weight: normal;
    width: 100%;
    text-align: center;
    font-style: italic;
    margin: 0;
    color: #ffffff87;
}

</style>