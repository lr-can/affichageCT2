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
                <div class="sectionTitleTeams">
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
                            <div class="teamTitle teamTitleSmall" :style="{color: 'white', backgroundColor: teamColors[nextTeam.equipe], boxShadow: teamColors[nextTeam.equipe] + '33  0px 8px 24px'}">
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
                            <div class="teamTitle teamTitleSmall" :style="{color: 'white', backgroundColor: teamColors[teamAfter.equipe], boxShadow: teamColors[teamAfter.equipe] + '33  0px 8px 24px'}">
                                {{ teamAfter.equipe }}
                            </div>
                        </div>
                        <div class="teamFooter">
                            <span v-for="data of teamAfter.dateComment" :key="data">{{data}}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="teamsContainer" v-if="fullPlanning && fullPlanning.length > 0">
                <calendarGarde :calendar="fullPlanning" />
            </div>
        </div>
        <div class="fullRow">
            <div class="eventContainer">
                <div class="sectionTitle">
                    Anniversaires
                </div>
                <div class="eventGroup" v-for="aniv in nextAniv" :key="aniv.Date">
                    <div class="event">
                        <div class="eventHeader">
                            <span class="durationChip" :class="getDurationChipClass(aniv.Date, 'birthday')">
                                {{ giveDurationBirthday(aniv.Date, 'birthday') }}
                            </span>
                            <span class="eventDate">{{ formatDate(aniv.Date) }}</span>
                        </div>
                        <div class="eventItems">
                            <div class="eventAgent" v-for="(matricule, index) in splitByComma(aniv.anniversaire)" :key="`${aniv.Date}-${index}`">
                                <img v-if="getAgentInfo(matricule)" :src="giveAgentGrade(getAgentInfo(matricule).grade)" :alt="getAgentInfo(matricule).grade" class="agentGradeIcon" />
                                <div class="agentInfo" v-if="getAgentInfo(matricule)">
                                    <span class="agentName">{{ getAgentInfo(matricule).nom }} {{ getAgentInfo(matricule).prenom }}</span>
                                </div>
                                <div class="eventName" v-else>{{ matricule }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="eventContainer">
                <div class="sectionTitle">
                    Événements
                </div>
                <div class="eventGroup" v-for="event in nextEvent" :key="event.Date">
                    <div class="event">
                        <div class="eventHeader">
                            <span class="durationChip" :class="getDurationChipClass(event.Date)">
                                {{ giveDurationBirthday(event.Date) }}
                            </span>
                            <span class="eventDate">{{ formatDate(event.Date) }}</span>
                        </div>
                        <div class="eventItems">
                            <div class="eventName" v-for="(eventName, index) in splitByComma(event.evenementNom)" :key="`${event.Date}-${index}`" :style="getEventNameStyle(eventName)">
                                {{ eventName }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { onMounted, ref, computed } from 'vue';
import { useWeather } from '../store/weather';
import { useSmartemis } from '../store/smartemis';
import calendarGarde from '../components/calendarGarde.vue';
import Sap2CL from '../assets/grades/Sap 2CL.png';
import Sap1CL from '../assets/grades/Sap 1CL.png';
import Caporal from '../assets/grades/Caporal.png';
import CaporalChef from '../assets/grades/Caporal-Chef.png';
import Sergent from '../assets/grades/Sergent.png';
import SergentChef from '../assets/grades/Sergent-Chef.png';
import Adjudant from '../assets/grades/Adjudant.png';
import AdjudantChef from '../assets/grades/Adjudant-Chef.png';
import Lieutenant from '../assets/grades/Lieutenant.png';
import Capitaine from '../assets/grades/Capitaine.png';
import Commandant from '../assets/grades/Commandant.png';
import Professeur from '../assets/grades/Professeur.png';
import Infirmiere from '../assets/grades/Infirmière.png';

const planning = useWeather();
const smartemis = useSmartemis();

const dict_grades = {
  'Sap 2CL': Sap2CL,
  'Sap 1CL': Sap1CL,
  'Caporal': Caporal,
  'Caporal-Chef': CaporalChef,
  'Sergent': Sergent,
  'Sergent-Chef': SergentChef,
  'Adjudant': Adjudant,
  'Adjudant-Chef': AdjudantChef,
  'Lieutenant': Lieutenant,
  'Capitaine': Capitaine,
  'Commandant': Commandant,
  'Infirmière': Infirmiere,
  'Professeur': Professeur
};

const giveAgentGrade = (grade) => {
    return dict_grades[grade] || null;
};

const agentsList = ref([]);

const getAgentInfo = (matricule) => {
    if (!matricule || !agentsList.value || agentsList.value.length === 0) return null;
    const matriculeStr = matricule.toString().trim();
    return agentsList.value.find(agent => (agent.matricule || '').toString().trim() === matriculeStr) || null;
};

const splitByComma = (str) => {
    if (!str) return [];
    return str.split(',').map(s => s.trim()).filter(s => s.length > 0);
};

// Fusionner les données des agents avec la feuille agentsASUP
const mergeAgentData = async (agents) => {
    try {
        const response = await fetch('https://opensheet.elk.sh/1ottTPiBjgBXSZSj8eU8jYcatvQaXLF64Ppm3qOfYbbI/agentsAsup');
        const agentsASUP = await response.json();
        const agentsASUPDict = {};
        agentsASUP.forEach(agent => {
            if (agent.matricule) {
                agentsASUPDict[agent.matricule] = agent;
            }
        });
        
        return agents.map(agent => {
            const asupData = agentsASUPDict[agent.matricule] || {};
            return { ...agent, ...asupData };
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des données agentsASUP:', error);
        return agents;
    }
};
const currentTeam = ref(null);
const nextTeam = ref(null);
const teamAfter = ref(null);
const nextReu = ref(null);
const nextAniv = ref(null);
const nextEvent = ref(null);
const nextReunionTeam = ref(null);
const fullPlanning = ref(null);

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
    const planning_data = await planning.getFullPlanning();
    fullPlanning.value = planning_data.mappedPlanningData;
    //console.log(fullPlanning.value);
    const data = planningTeams.planningData;
    currentTeam.value = data.currentTeam;
    nextTeam.value = data.nextTeam;
    teamAfter.value = data.teamAfter;
    nextReu.value = new Date(data.nextReunion);
    nextAniv.value = data.nextTwoBirthdays;
    nextEvent.value = data.nextTwoEvents;
    nextReunionTeam.value = data.nextReunionTeam;
    
    // Récupérer les agents depuis la feuille ASUP (comme dans vehiculeView.vue)
    try {
        const rawAgents = await smartemis.getAvailablePeople();
        agentsList.value = await mergeAgentData(rawAgents);
    } catch (error) {
        console.error('Erreur lors de la récupération des agents:', error);
    }
});

// Plus d'alternance nécessaire

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
            return "🎂 Aujourd'hui";
        }
        return "Aujourd'hui";
    } else if (days < 1 || days === 0) {
        return "Demain";
    } else if (days === 1 || days < 2) {
        return "Après-demain";
    } else if (days >= 5 && days <= 8) {
        return "Dans ~1 sem.";
    } else if (days >= 7){
        const weeks = Math.ceil(days / 7);
        if (weeks === 2) {
            return "Dans ~2 sem.";
        }
        return `Dans ~${weeks} sem.`;
    }
    return `Dans ${days + 1} j`;
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

const getDurationChipClass = (date, type = '') => {
    const now = new Date();
    const diff = new Date(date) - now;
    const days = Math.floor(diff / 1000 / 60 / 60 / 24);
    
    if (days < 0) {
        return 'chip-today'; // Rouge pour aujourd'hui
    } else if (days < 1 || days === 0) {
        return 'chip-tomorrow'; // Orange pour demain
    } else if (days === 1 || days < 2) {
        return 'chip-day-after'; // Jaune pour après-demain
    } else if (days >= 5 && days <= 9) {
        return 'chip-week'; // Bleu pour environ 1 semaine
    } else {
        return 'chip-later'; // Gris sinon
    }
}

const getEventNameStyle = (eventName) => {
    const length = eventName.length;
    let fontSize = '1em';
    if (length > 80) {
        fontSize = '0.85em';
    } else if (length > 60) {
        fontSize = '0.9em';
    } else if (length > 40) {
        fontSize = '0.95em';
    }
    return { fontSize };
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
    top: 1.5rem;
    left: 3rem;
    z-index: 4;
    color: white;
    font-size: 1.2em;
    text-align: center;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

#Title h1 {
    margin: 0;
    font-weight: 600;
}
.interContainer {
    display: flex;
    align-items: center;
    justify-content: space-around;
    height: 70%;
    width: 82%;
    position: absolute;
    top: 53%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 3;
    box-shadow: 0px 8px 32px rgba(0, 0, 0, 0.15), 0px 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 32px;
    backdrop-filter: blur(12px) brightness(1.05);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.65) 100%);
    overflow: hidden;
    flex-wrap: wrap;
    border: 1px solid rgba(255, 255, 255, 0.3);
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
    font-size: 1.8rem;
    padding: 0.9rem 1.5rem;
    color: white;
    border-radius: 12px;
    width: 70%;
    font-weight: 700;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
}
.teamTitleSmall {
    width: 60%;
    font-size: 1.5rem;
    padding: 0.8rem 1.2rem;
    text-align: center;
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
    background: transparent;
    padding: 0 2rem;
}
.fullRow:first-child {
    height: 10%;
    font-size: 1.6rem;
    color: #2c2c2c;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.05em;
    background: transparent;
    border-bottom: 2px solid rgba(163, 163, 163, 0.2);
    padding: 1rem 2rem;
}
.fullRow:nth-child(2) {
    background: transparent;
    padding: 1rem 2rem;
}
.fullRow:nth-child(3) {
    padding: 1rem 2rem;
    background: transparent;
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
    box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.12), 0px 2px 8px rgba(0, 0, 0, 0.08);
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.7);
    margin-right: 2rem;
    border: 1px solid rgba(255, 255, 255, 0.4);
}
.sectionTitleTeams {
    font-size: 1.2em;
    color: #2c2c2c;
    width: 100%;
    text-align: center;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 0.8rem;
    padding: 0.3rem 0;
}
.eventContainer {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    flex-wrap: wrap;
    flex-basis: 50%;
    padding: 1rem 1.5rem;
}
.sectionTitle {
    text-transform: uppercase;
    color: #2c2c2c;
    font-weight: 700;
    font-size: 1.1em;
    letter-spacing: 0.1em;
    margin-bottom: 1rem;
    width: 100%;
    text-align: left;
    padding-bottom: 0.4rem;
    border-bottom: 2px solid rgba(163, 163, 163, 0.2);
}
.eventGroup {
    padding: 0.3rem 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    flex-wrap: wrap;
    width: 100%;
}
.event {
    width: 100%;
    text-align: left;
    color: #2c2c2c;
    padding: 0.6rem 0;
    border-bottom: 1px solid rgba(163, 163, 163, 0.15);
    transition: all 0.2s ease;
}
.event:hover {
    background-color: rgba(0, 0, 0, 0.02);
    padding-left: 0.5rem;
    border-radius: 6px;
}
.eventHeader {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.8rem;
    flex-wrap: wrap;
    margin-bottom: 0.4rem;
}
.eventDate {
    font-weight: 400;
    color: #555;
    font-size: 0.95em;
    text-transform: lowercase;
}
.durationChip {
    display: inline-block;
    padding: 0.25rem 0.65rem;
    border-radius: 16px;
    font-size: 0.75em;
    font-weight: 600;
    white-space: nowrap;
    letter-spacing: 0.02em;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
}
.chip-today {
    background-color: #ff4444;
    color: white;
    box-shadow: 0 2px 8px rgba(255, 68, 68, 0.4);
    font-weight: 700;
}
.chip-tomorrow {
    background-color: #ff8800;
    color: white;
    box-shadow: 0 2px 6px rgba(255, 136, 0, 0.3);
}
.chip-day-after {
    background-color: #ffc000;
    color: #2c2c2c;
    box-shadow: 0 2px 6px rgba(255, 192, 0, 0.3);
}
.chip-week {
    background-color: #4a90e2;
    color: white;
    box-shadow: 0 2px 6px rgba(74, 144, 226, 0.3);
}
.chip-later {
    background-color: #9e9e9e;
    color: white;
    box-shadow: 0 2px 6px rgba(158, 158, 158, 0.3);
}
.eventName {
    color: #2c2c2c;
    font-weight: 500;
    line-height: 1.4;
    margin-left: 1.2rem;
    transition: font-size 0.2s ease;
}
.eventItems {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-left: 1.2rem;
    margin-top: 0.3rem;
}
.eventAgent {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.8rem;
}
.agentGradeIcon {
    width: 24px;
    height: 24px;
    object-fit: contain;
    flex-shrink: 0;
    border-radius: 4px;
}
.agentInfo {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
}
.agentGrade {
    font-size: 0.85em;
    color: #666;
    font-weight: 500;
}
.agentName {
    font-size: 1em;
    color: #2c2c2c;
    font-weight: 500;
}
span {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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

/* Amélioration des transitions et animations */
* {
    box-sizing: border-box;
}

/* Amélioration de la lisibilité générale */
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
    font-size: 1rem;
    color: #4a4a4a;
    font-weight: 600;
    width: 100%;
    text-align: center;
    margin-bottom: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
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
    color: #5a5a5a;
    margin-top: 0.8rem;
    font-weight: 500;
}
#firstTeam{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1.2rem 1.5rem;
    width: 100%;
    gap: 0.4rem;
}
#firstTeam > span:first-child {
    font-size: 2.5rem;
    font-weight: 700;
    width: 100%;
    text-align: center;
    color: white;
    margin: 0;
    letter-spacing: 0.05em;
}
#firstTeam > span:last-child {
    font-size: 1rem;
    font-weight: 400;
    width: 100%;
    text-align: center;
    font-style: italic;
    margin: 0;
    color: rgba(255, 255, 255, 0.9);
    opacity: 0.95;
}

</style>