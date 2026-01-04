<template>
    <div id="Background">
        <img src="../assets/backgrounds/CTA.jpg" alt="Véhicule" style="width: 110vw; height: 110vh;">
    </div>
    <div class="app-container">
        <header class="header">
            <h1 class="title">{{showPeople ? "Agents disponibles" : "Synoptique des engins" }}</h1>
            <div class="agents-badge" :style="{ backgroundColor: giveBackground(agents.available), color: giveForeground(agents.available) }" v-if="agents">
                <span class="agents-icon">🧑‍🚒</span>
                <span class="agents-count">{{ agents.available }}</span>
                <span class="agents-total">/ {{ agents.total }}</span>
            </div>
        </header>

        <main class="main-content">
            <!-- Vue des engins -->
            <div class="vehiculeContainer" v-if="familles.length > 0 && giveNumberOfEngin() < numberOfEngins + 5 && !showPeople">
                <div class="famille" :class="{ 'famille-inactive': isFamilleInactive(famille) }" v-for="famille in familles" :key="famille.famEngCod">
                    <div class="familleTitle">
                        {{ famille.famEngLib }}
                    </div>
                    <div class="engins">
                        <div class="animation" v-for="engin in famille.engins" :key="engin.engCod">
                            <div class="enginCard">
                                <div class="enginTitle" :style="{ backgroundColor: engin.backgroundColor, color: engin.libColor }">
                                    {{ engin.lib }}
                                </div>
                                <div class="enginImage">
                                    <img :src="giveEnginImg(engin)" alt="engin">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- État de chargement -->
            <div class="vehiculeContainer loading-state" v-if="familles.length == 0 || giveNumberOfEngin() >= numberOfEngins + 5">
                <div class="loading-content">
                    <img src="../assets/vehiculeLoader.gif" alt="Chargement" class="loading-gif">
                    <p class="loading-text">Chargement des engins...</p>
                </div>
            </div>

            <!-- Vue des agents -->
            <div class="agents-container" v-if="agentList && agentList.length && showPeople">
                <!-- Agents disponibles (non-IN) -->
                <div class="agents-grid" v-if="availableAgents.length > 0">
                    <div
                        class="personCard"
                        v-for="person in availableAgents"
                        :key="person.matricule"
                    >
                        <div class="person-avatar">
                            <img
                                :src="giveAgentGrade(person.grade)"
                                :alt="person.grade"
                            />
                        </div>
                        <div class="person-info">
                            <div class="person-nom">{{ person.nom }}</div>
                            <div class="person-prenom">{{ person.prenom }}</div>
                        </div>
                        <span
                            class="personStatus"
                            :style="{ 
                                backgroundColor: '#' + person.statusColor, 
                                color: (person.statusColor && person.statusColor.length ? (parseInt(person.statusColor,16) > 0x999999 ? '#111' : '#fff') : '#000')
                            }"
                            :class="{ 'status-blink': person.status === 'INTER' }"
                        >
                            {{ person.status }}
                        </span>
                    </div>
                </div>
                <!-- Agents indisponibles (IN) - style compact -->
                <div class="agents-grid-compact" v-if="inactiveAgents.length > 0">
                    <div
                        class="personCardCompact"
                        v-for="person in inactiveAgents"
                        :key="person.matricule"
                    >
                        <img
                            :src="giveAgentGrade(person.grade)"
                            :alt="person.grade"
                            class="compact-avatar"
                        />
                        <span class="compact-nom">{{ person.nom }}</span>
                    </div>
                </div>
            </div>
        </main>

        <footer class="footer">
            <p class="info-text">Mise à jour : Il y a {{ timeElapsed }} environ.</p>
        </footer>
    </div>
</template>
<script setup>
import { onMounted, ref, computed } from 'vue';
import { useSmartemis } from '../store/smartemis';

const smartemis = useSmartemis();
const familles = ref([]);
const miseAJour = ref();
const timeElapsed = ref();
const agents = ref();
const numberOfEngins = ref(0);
const showPeople = ref(false);

const agentList = ref([]);

// Séparer les agents disponibles des agents indisponibles
const availableAgents = computed(() => {
    return agentList.value.filter(person => person.status !== 'IN');
});

const inactiveAgents = computed(() => {
    return agentList.value.filter(person => person.status === 'IN');
});
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
const currentTime = new Date();

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
    return dict_grades[grade];
};

const counter = ref(0);

onMounted(async () => {
    familles.value = await smartemis.getEngins();
    agentList.value = await smartemis.getAvailablePeople();
    for (let i = 0; i < familles.value.length; i++){
        for (let j = 0; j < familles.value[i].engins.length; j++){
            numberOfEngins.value += 1;
        }
    }
    //console.log("Found" + numberOfEngins.value + "engins");
    miseAJour.value = await smartemis.getLastUpdateEngins();
    agents.value = await smartemis.getAgentsAvailable();
    const now = new Date();
    let timeElapsedValue = now - new Date(miseAJour.value);
    const secondsElapsed = Math.round(timeElapsedValue / 10000) * 10;
    if (secondsElapsed < 60) {
        timeElapsed.value = `${secondsElapsed} s`;
    } else {
        const minutes = Math.floor(secondsElapsed / 60);
        const remainingSeconds = secondsElapsed % 60;
        timeElapsed.value = remainingSeconds != 0 ? `${minutes} min ${remainingSeconds} s` : `${minutes} min`;
    }

    
    setInterval(async () => {
    counter.value += 1;
        familles.value = await smartemis.getEngins();
    miseAJour.value = await smartemis.getLastUpdateEngins();
    agents.value = await smartemis.getAgentsAvailable();
    agentList.value = await smartemis.getAvailablePeople();
    const now = new Date();
    let timeElapsedValue = now - new Date(miseAJour.value);
    const secondsElapsed = Math.round(timeElapsedValue / 10000) * 10;
    if (secondsElapsed < 60) {
        timeElapsed.value = `${secondsElapsed} s`;
    } else {
        const minutes = Math.floor(secondsElapsed / 60);
        const remainingSeconds = secondsElapsed % 60;
        timeElapsed.value = remainingSeconds != 0 ? `${minutes} min ${remainingSeconds} s` : `${minutes} min`;
    }
    counter.value % 2 === 0 ? showPeople.value = !showPeople.value : null;
    }
    , 10000);

});

const giveNumberOfEngin = () => {
    let number = 0;
    for (let i = 0; i < familles.value.length; i++){
        for (let j = 0; j < familles.value[i].engins.length; j++){
            number += 1;
        }
    }
    return number;
}

const isFamilleInactive = (famille) => {
    if (!famille || !famille.engins || famille.engins.length === 0) {
        return false;
    }
    // Vérifier si tous les engins de la famille sont "IN" ou "DM"
    return famille.engins.every(engin => engin.statut === 'IN' || engin.statut === 'DM');
}
const giveEnginImg = (engin) => {
    if (engin.statut == 'Dl'){
        if (engin.lib.startsWith('L') || engin.lib.includes('MPRGP')){
            const vtutStatut = familles.value.find(famille => famille.engins.some(engin => engin.lib.includes("VTUT") && engin.statut === 'Dl'));
            const vlcdgStatut = familles.value.find(famille => famille.engins.some(engin => engin.lib.includes("VLCDG") && engin.statut === 'Dl'));
            if (vlcdgStatut && engin.lib.includes("LCTHER")){
                return new URL(`../assets/vehicules/engins/Dl-${engin.lib.split(' ')[0].replace("+","")}.png`, import.meta.url).href
            } else if (vtutStatut && !engin.lib.includes("LCTHER")){
                return new URL(`../assets/vehicules/engins/Dl-${engin.lib.split(' ')[0].replace("+","")}.png`, import.meta.url).href
            }
            return new URL(`../assets/vehicules/engins/DM-${engin.lib.split(' ')[0].replace("+","")}.png`, import.meta.url).href
        } else {
            return new URL(`../assets/vehicules/engins/Dl-${engin.lib.split(' ')[0].replace("+","")}.png`, import.meta.url).href
        }
    } else if (engin.statut == "DM"){
        if (engin.lib.startsWith('L') || engin.lib.includes('MPRGP')){
            const vtutStatut = familles.value.find(famille => famille.engins.some(engin => engin.lib.includes("VTUT") && engin.statut === 'Dl'));
            const vlcdgStatut = familles.value.find(famille => famille.engins.some(engin => engin.lib.includes("VLCDG") && engin.statut === 'Dl'));
            if (vlcdgStatut && engin.lib.includes("LCTHER")){
                return new URL(`../assets/vehicules/engins/Dl-${engin.lib.split(' ')[0].replace("+","")}.png`, import.meta.url).href
            } else if (vtutStatut && !engin.lib.includes("LCTHER")){
                return new URL(`../assets/vehicules/engins/Dl-${engin.lib.split(' ')[0].replace("+","")}.png`, import.meta.url).href
            }
            return new URL(`../assets/vehicules/engins/DM-${engin.lib.split(' ')[0].replace("+","")}.png`, import.meta.url).href
        } else {
            return new URL(`../assets/vehicules/engins/DM-${engin.lib.split(' ')[0].replace("+","")}.png`, import.meta.url).href
        }
    } else {
        return new URL(`../assets/vehicules/statuts/${engin.statut}.png`, import.meta.url).href
    }
}
const giveBackground = (available) => {
    const vsav01 = familles.value.find(famille => famille.engins.some(engin => engin.lib === 'VSAV 01' && engin.statut === 'DM'));
    const vsav02 = familles.value.find(famille => famille.engins.some(engin => engin.lib === 'VSAV 02' && engin.statut === 'DM'));

    if (available < 2){
        return '#fff4f4B3';
    } else if (vsav01 && vsav02) {
        return '#fff4f3B3';
    } else if (vsav01 || vsav02) {
        return '#f4f6ffB3';
    } else {
        return '#dffee6B3';
    }
}
const giveForeground = (available) => {
    const vsav01 = familles.value.find(famille => famille.engins.some(engin => engin.lib === 'VSAV 01' && engin.statut === 'DM'));
    const vsav02 = familles.value.find(famille => famille.engins.some(engin => engin.lib === 'VSAV 02' && engin.statut === 'DM'));

    if (available < 2){
        return '#f60700';
    } else if (vsav01 && vsav02) {
        return '#fc5d00';
    } else if (vsav01 || vsav02) {
        return '#0078f3';
    } else {
        return '#1f8d49';
    }
}
const colorConvert = (color) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, 0.1)`;
}


</script>
<style scoped>
* {
    box-sizing: border-box;
}

#Background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    z-index: 1;
    filter: blur(8px) brightness(0.65);
    transform: scale(1.1);
    object-fit: cover;
}

.app-container {
    position: relative;
    z-index: 2;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

/* Header */
.header {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2rem 3rem;
    z-index: 10;
}

.title {
    font-size: 2rem;
    font-weight: 700;
    color: #ffffff;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0;
    text-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

.agents-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1.5rem;
    border-radius: 1rem;
    backdrop-filter: blur(20px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.2);
    font-weight: 600;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.agents-badge:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1);
}

.agents-icon {
    font-size: 1.5rem;
}

.agents-count {
    font-size: 1.75rem;
    font-weight: 700;
}

.agents-total {
    font-size: 1rem;
    opacity: 0.8;
}

/* Main Content */
.main-content {
    flex: 1;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 1rem 2rem 2rem 2rem;
    overflow-y: auto;
    overflow-x: hidden;
    min-height: 0;
}

.vehiculeContainer {
    width: 90%;
    max-width: 1600px;
    padding: 2.5rem;
    border-radius: 2rem;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    justify-content: space-between;
    align-items: flex-start;
    animation: fadeInUp 0.6s ease-out;
    margin: 0 auto;
    max-height: calc(100vh - 200px);
    overflow-y: auto;
    overflow-x: hidden;
}

.vehiculeContainer::-webkit-scrollbar {
    width: 10px;
}

.vehiculeContainer::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 5px;
}

.vehiculeContainer::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 5px;
}

.vehiculeContainer::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
}

.loading-state {
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
}

.loading-gif {
    width: 150px;
    height: auto;
}

.loading-text {
    color: #1a1a1a;
    font-size: 1.25rem;
    font-weight: 500;
    margin: 0;
}

/* Famille */
.famille {
    flex: 1;
    min-width: 240px;
    max-width: 350px;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 1rem;
    padding: 1.25rem;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(0, 0, 0, 0.06);
    opacity: 0;
    animation: slideInFade 0.6s ease-out forwards;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.famille:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.famille:nth-child(1) { animation-delay: 0.1s; }
.famille:nth-child(2) { animation-delay: 0.2s; }
.famille:nth-child(3) { animation-delay: 0.3s; }
.famille:nth-child(4) { animation-delay: 0.4s; }
.famille:nth-child(5) { animation-delay: 0.5s; }
.famille:nth-child(6) { animation-delay: 0.6s; }

.famille:last-child {
    flex-basis: 100%;
    max-width: 100%;
}

.familleTitle {
    font-size: 0.85rem;
    font-weight: 600;
    color: #1a1a1a;
    padding-bottom: 0.6rem;
    margin-bottom: 0.75rem;
    border-bottom: 2px solid rgba(0, 0, 0, 0.1);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.engins {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: flex-start;
}

.animation {
    opacity: 0;
    animation: slideInFade 0.5s ease-out forwards;
}

.animation:nth-child(1) { animation-delay: 0.3s; }
.animation:nth-child(2) { animation-delay: 0.4s; }
.animation:nth-child(3) { animation-delay: 0.5s; }
.animation:nth-child(4) { animation-delay: 0.6s; }
.animation:nth-child(5) { animation-delay: 0.7s; }
.animation:nth-child(6) { animation-delay: 0.8s; }
.animation:nth-child(7) { animation-delay: 0.9s; }
.animation:nth-child(8) { animation-delay: 1s; }
.animation:nth-child(9) { animation-delay: 1.1s; }
.animation:nth-child(10) { animation-delay: 1.2s; }
.animation:nth-child(11) { animation-delay: 1.3s; }
.animation:nth-child(12) { animation-delay: 1.4s; }

.enginCard {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 0.75rem;
    min-width: 100px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    border: 1px solid rgba(0, 0, 0, 0.05);
}

.enginCard:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.enginTitle {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.4rem 0.7rem;
    border-radius: 0.6rem;
    text-align: center;
    min-width: 70px;
    letter-spacing: 0.02em;
}

.enginImage {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 50px;
}

.enginImage img {
    height: 50px;
    width: auto;
    object-fit: contain;
}

/* Agents Container */
.agents-container {
    width: 90%;
    max-width: 1600px;
    margin: 0 auto;
    max-height: calc(100vh - 200px);
    overflow-y: auto;
    overflow-x: hidden;
    animation: fadeInUp 0.6s ease-out;
}

.agents-container::-webkit-scrollbar {
    width: 8px;
}

.agents-container::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
}

.agents-container::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
}

.agents-container::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
}

/* Agents Grid - Disponibles */
.agents-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.75rem;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 2rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    margin-bottom: 1rem;
}

/* Agents Grid - Indisponibles (compact) */
.agents-grid-compact {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 0.5rem;
    padding: 1.5rem 2rem;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 2rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    opacity: 0.5;
}
.famille-inactive {
    opacity: 0.4;
}

.personCardCompact {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 0.4rem;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 0.625rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
    opacity: 0.5;
    cursor: default;
}

.personCardCompact:hover {
    background: rgba(255, 255, 255, 0.8);
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.compact-avatar {
    width: 28px;
    height: 28px;
    object-fit: cover;
    border-radius: 4px;
    flex-shrink: 0;
}

.compact-nom {
    font-size: 0.7rem;
    font-weight: 600;
    color: #1a1a1a;
    text-align: center;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    width: 100%;
    line-height: 1.2;
}

.personCard {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.7rem 0.9rem;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 0.75rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border: 1px solid rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
    animation: fadeIn 0.4s ease-out;
}

.personCard:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    background: rgba(255, 255, 255, 1);
}


.person-avatar {
    flex-shrink: 0;
}

.person-avatar img {
    height: 32px;
    width: auto;
    border-radius: 6px;
    object-fit: cover;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.person-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.person-nom {
    font-weight: 700;
    font-size: 0.8rem;
    color: #1a1a1a;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}

.person-prenom {
    font-size: 0.7rem;
    color: #666;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}

.personStatus {
    padding: 0.3rem 0.6rem;
    border-radius: 0.5rem;
    font-weight: 700;
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    flex-shrink: 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-blink {
    animation: blink 2s infinite;
}

/* Footer */
.footer {
    position: relative;
    padding: 1.5rem 3rem;
    z-index: 10;
}

.info-text {
    color: #ffffff;
    font-size: 0.875rem;
    margin: 0;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    opacity: 0.9;
}

/* Animations */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes slideInFade {
    from {
        opacity: 0;
        transform: translateX(-15px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes blink {
    0%, 49% {
        opacity: 1;
    }
    50%, 99% {
        opacity: 0.6;
    }
    100% {
        opacity: 1;
    }
}

/* Responsive */
@media (max-width: 1200px) {
    .vehiculeContainer {
        width: 95%;
        padding: 2rem;
    }
    
    .famille {
        min-width: 240px;
    }
}

@media (max-width: 768px) {
    .header {
        padding: 1.5rem 2rem;
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
    }
    
    .title {
        font-size: 1.5rem;
    }
    
    .vehiculeContainer {
        padding: 1.5rem;
        border-radius: 1.5rem;
    }
    
    .agents-grid {
        grid-template-columns: 1fr;
        padding: 1.5rem;
    }
    
    .footer {
        padding: 1rem 2rem;
    }
}
</style>
