<template>
    <div :class="giveClass">
        <div class="header" :class="giveDelayImgStyle">{{ msgTitre.toUpperCase() }}</div>
        <div id="map"><mapBox :lon="props.data.lon" :lat="props.data.lat" /></div>
        <div id="delayImg" v-if="displayDelay && !isAllParti" :class="giveDelayImgStyle">
            <img src="../assets/vehicules/statuts/DE.png" alt="" width="300px" height="auto">
        </div>
        <div v-if="giveClass == 'interConfig'" class="info">
            <div class="infoHeader"><span :class="typeInterClass">{{ typeInter }}</span> <span id="interLibelle">{{ libelleInter.toUpperCase().replace(/\|/g, '-')  }}</span></div>
            <div class="infoDetail"><span><img src="../assets/icons/number.svg" style="filter: invert(100%) brightness(1000%);height: 1.8rem; width: auto ;" /></span><span>N°{{ numeroInter }}</span></div>
            <div class="infoDetail"><span><img src="../assets/icons/citySign.svg" style="filter: invert(100%) brightness(1000%);height: 2rem; width: auto ;" /></span><span>{{ villeInter.toUpperCase() }}</span></div>
            <div class="infoDetail"><span><img src="../assets/icons/address.svg" style="filter: invert(100%) brightness(1000%);height: 2rem; width: auto ;" /></span><span>{{ adresseInter.toUpperCase() }}</span></div>
            <div class="infoDetail"><span><img src="../assets/icons/fireEngine.svg" style="filter: invert(100%) brightness(1000%);height: 2rem; width: auto ;" /></span><span>{{ enginsInter }} engin{{ enginsInter > 1 ? 's' : '' }} engagé{{ enginsInter > 1 ? 's' : '' }}</span></div>
        </div>
        <div class="infoVehicule" v-if="giveClass == 'interConfig'">
            <div class="vehiculeHeader">Véhicules engagés</div>
            <div class="vehiculeList">
                <div class="loading" v-if="vehicules.length == 0">
                    <div style="margin-top: 1rem"><img src="../assets/vehiculeLoader.gif" alt="" width="150px" height="auto"></div>
                    <div style="color: #d3d3d3;"><span>En attente de véhicules...</span></div></div>
                    <div v-else id="vehiculeList">
                    <div v-for="vehicule in vehicules" :key="vehicule.id" class="vehicule">
                        <div class="vehStatut" :style="{ color: vehicule.libColor, backgroundColor: vehicule.backgroundColor }">{{ vehicule.lib }}</div>
                        <div class="vehiculeStatutLib">{{ vehicule.statutLib }}</div>
                    </div>
                    </div>
                <div style="color: #d3d3d3;font-size: 0.8rem;">MàJ {{ deltaUpdate.tempsTotal < 25 ? "à l'instant" : "il y a " + deltaUpdate.displayTemps  }}</div>
            </div>
        </div>
        <div class="infoAgents" v-if="giveClass == 'interConfig'">
            <div class="vehiculeHeader">Agents engagés</div>
            <div class="vehiculeList">
                <div class="loading" v-if="agentList.length == 0">
                    <div style="margin-top: 1rem">
                        <img src="../assets/vehiculeLoader.gif" alt="" width="150px" height="auto">
                    </div>
                    <div style="color: #d3d3d3;">
                        <span>En attente d'agents...</span>
                    </div>
                </div>
                <div v-else id="agentList" style="min-height: 25vh;">
                    <div v-for="agent in agentList" :key="agent.matricule" class="agent">
                        <div class="agentGrade">
                            <img :src="giveAgentGrade(agent.grade)" alt="" width="30px" height="auto">
                        </div>
                        <div class="agentNom">{{ agent.nom }} {{ agent.prenom }}</div>
                        <div class="matricule" :style="{borderBottom : '1px solid' + giveStatusColor(agent.status)}"><span v-if="alternateDisplay">{{ agent.matricule }}</span><span v-else>{{ agent.status }}</span></div>
                    </div>
                </div>
                <div style="color: #d3d3d3;font-size: 0.8rem;">
                    MàJ à {{ currentTime.getHours() }}h{{ currentTime.getMinutes() < 10 ? '0' + currentTime.getMinutes() : currentTime.getMinutes() }}
                </div>
            </div>
        </div>
    </div>
    <div class="interFooter" v-if="startEnd != 0">
        <div class="interFooterContent" :style="{ width: loaderWidth }"></div>
    </div>

</template>
<script setup>
import { ref, computed, onMounted } from 'vue';
import { useSmartemis } from '../store/smartemis';
import mapBox from '../components/mapBox.vue';
const msgTitre = ref('Nouveau départ en intervention');
import ronfleur from '../assets/sounds/ronfleur.mp3';
import ronfleurNuit from '../assets/sounds/ronfleurNuit.mp3';
const ronfleurAudio = new Audio(ronfleur);
import INC from '../assets/sounds/INC.mp3';
import PPBE from '../assets/sounds/PPBE.mp3';
const alternateDisplay = ref(true);
import SSUAP from '../assets/sounds/SSUAP.mp3';
import DFE from '../assets/sounds/DFE.mp3';
import DV from '../assets/sounds/DV.mp3';
import ACC from '../assets/sounds/ACC.mp3';
import DF20 from '../assets/sounds/DF20.mp3';
import VUrbG from '../assets/sounds/VUrbG.mp3';
import VUrbx from '../assets/sounds/VUrbx.mp3';
import INCnuit from '../assets/sounds/INCnuit.mp3';
import PPBEnuit from '../assets/sounds/PPBEnuit.mp3';
import SSUAPnuit from '../assets/sounds/SSUAPnuit.mp3';
import ACCnuit from '../assets/sounds/ACCnuit.mp3';
import VUrbGnuit from '../assets/sounds/VUrbGnuit.mp3';
import VUrbxnuit from '../assets/sounds/VUrbxnuit.mp3';
import departAssure from '../assets/sounds/departAssure.mp3';
import endTime from '../assets/sounds/endTime.mp3';
import tempsEcoule from '../assets/sounds/tempsEcoule.mp3';
const displayDelay = ref(false);
const departAssureAudio = new Audio(departAssure);
const endTimeAudio = new Audio(endTime);
const tempsEcouleAudio = new Audio(tempsEcoule);
const isEcoule = ref(false);
const giveDelayImgStyle = computed(() => {
    return isEcoule.value || !displayDelay.value ? 'noBlink' : 'blinkSecondary';
});

const condition1 = ref(false);
const condition2 = ref(true);
const condition3 = ref(false);
const condition4 = ref(true);

const typeInterAudioNuit = {
    'INC': INCnuit,
    'PPBE': PPBEnuit,
    'SSUAP': SSUAPnuit,
    "DFE": SSUAPnuit,
    'DV': SSUAPnuit,
    "DF20": SSUAPnuit,
    'ACC': ACCnuit,
    'VUrbG': VUrbGnuit,
    'VUrbx': VUrbxnuit
};
const typeInterAudio = {
    'INC': INC,
    'PPBE': PPBE,
    'SSUAP': SSUAP,
    'DFE': DFE,
    'DV': DV,
    'ACC': ACC,
    'DF20': DF20,
    'VUrbG': VUrbG,
    'VUrbx': VUrbx
};
const libelleInter = ref();
const adresseInter = ref();
const villeInter = ref();
const typeInter = ref();
const numeroInter = ref();
const enginsInter = ref();
const dateTimeInter = ref();
const endingTime = ref();
const startEnd = ref(0);
const loaderWidth = ref("0%");
onMounted(() => {
    libelleInter.value = props.data.libelleInter;
    adresseInter.value = props.data.adresseInter;
    villeInter.value = props.data.villeInter;
    typeInter.value = props.data.typeInter;
    numeroInter.value = props.data.numeroInter;
    enginsInter.value = props.data.enginsInter;
    dateTimeInter.value = props.data.dateTimeInter;
    let now = new Date();
    let nowHour = now.getHours();
    ronfleurAudio.volume = 0.3;
    if (nowHour >= 6 && nowHour < 20) {
        ronfleurAudio.volume = 0.5;
    } else {
        ronfleurAudio.src = ronfleurNuit;
    }
    ronfleurAudio.play();
    ronfleurAudio.onended = () => {
        let audio = new Audio();
        let audio_type = typeInterClass.value;
        if (libelleInter.value.includes("DF20")){
            audio.src = typeInterAudio['DF20'];
            audio_type = 'DF20';
        } else if (libelleInter.value.includes("DFE")){
            audio.src = typeInterAudio['DFE'];
            audio_type = 'DFE';
        } else if (libelleInter.value.includes("DV")){
            audio.src = typeInterAudio['DV'];
            audio_type = 'DV';
        } else {
            audio.src = typeInterAudio[typeInterClass.value];
        }
        if (nowHour >= 6 && nowHour < 21) {
            audio.volume = 1;
        } else {
            audio.src = typeInterAudioNuit[audio_type];
            audio.volume = 0.4;
        }
        audio.play();
    };
    endingTime.value = new Date(dateTimeInter.value).getTime() + 10 * 60 * 1000;
    let delta = endingTime.value - new Date().getTime();
    let deltaSec = Math.floor(delta / 1000);
    startEnd.value = deltaSec;
    setInterval(() => {
    if (dateTimeInter.value) {
        let elapsed = new Date().getTime() - new Date(dateTimeInter.value).getTime();
        let initialDuration = 10 * 60 * 1000; // 10 minutes in milliseconds
        let deltaPerc = (elapsed / initialDuration) * 100;
        condition1.value = deltaPerc > 60;
        condition3.value = deltaPerc > 90;
        displayDelay.value = deltaPerc > 90;
        loaderWidth.value = deltaPerc < 100 ? deltaPerc + "%" : "110%";
        }
}, 500);
});


const smartemis = useSmartemis();
const vehicules = ref([]); // Ensure this is initialized as a reactive array
const deltaUpdate = ref({});
const agentList = ref([]);
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

const typeInterClass = computed(() => {
    if(typeInter.value === 'SSUAP'){
        return 'SSUAP';
    }else if(typeInter.value === 'Incendie'){
        return 'INC';
    }else if(typeInter.value === 'PPBE'){
        return 'PPBE';
    }else if(typeInter.value === 'Accident'){
        return 'ACC';
    } else if (typeInter.value === 'Violences_Urbaines'){ 
        return 'VUrbx';
    } else if (typeInter.value === 'Violences_Urbaines_Graves'){ 
        return 'VUrbG';
    } else {
        return 'Div';
    }
});
const props = defineProps({
    data: Object,
});

const vehiculePhonetiques = ref("");
const interAudio = ref(null);
import introNotif from '../assets/sounds/introNotif.mp3';

const introNotifAudio = new Audio(introNotif);

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

const audioNotifs = async () => {
    const message = `${vehiculePhonetiques.value} . ${villeInter.value.replace("ST-", "SAINT").toLowerCase().split('-').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join('-')} . ${libelleInter.value.replace("DF20", "").replace("DFE", "").replace("DV", "").toLowerCase().replace("aggrave", "aggravé")}.`;
    interAudio.value = await smartemis.getTTS(message);
    setTimeout(() => {
        introNotifAudio.play();
        introNotifAudio.onended = () =>{
        interAudio.value.play();
        };
    }, 15000);
    setTimeout(()=>{
        introNotifAudio.play();
        introNotifAudio.onended = () =>{
        interAudio.value.play();
        };
    }, 2 * 60000);
    setTimeout(()=>{
        introNotifAudio.play();
        introNotifAudio.onended = () =>{
        interAudio.value.play();
        };
    }, 4 * 60000);
};

const isAllParti = ref(false);

const getStatus = async () => {
    alternateDisplay.value = !alternateDisplay.value;
    let newVehicules = await smartemis.filterEnginsInter();
    for (let vehicule of newVehicules){
        let found_vehicule = vehicules.value.find(v => v.id === vehicule.id);
        if (found_vehicule){
            found_vehicule.statut = vehicule.statut;
            found_vehicule.statutLib = vehicule.statutLib;
            found_vehicule.backgroundColor = vehicule.backgroundColor;
            found_vehicule.libColor = vehicule.libColor;
        } else {
            vehicules.value.push(vehicule);
            console.log("New vehicle added:", vehicule);
            vehiculePhonetiques.value += " , " + vehicule.nomPhonetique;
        } 
    }
    vehicules.value = vehicules.value.filter(v => newVehicules.some(nv => nv.id === v.id));
    let delta = new Date() - smartemis.lastUpdateEngins;
    let deltaSec = Math.floor(delta / 10000) * 10;
    let deltaMin = Math.floor(deltaSec / 60);
    let displayTemps = deltaMin < 1 ? deltaSec + ' sec env.' : deltaMin + ' min';
    deltaUpdate.value = {tempsTotal: deltaSec, tempsMin: deltaMin, displayTemps: displayTemps};
    await verifFinalAudio();
};

const vehicules_ecoules = ref([]);
const vehicules_partis = ref([]);

const verifFinalAudio = async () => {
    console.log("verifFinalAudio called");
    if (vehicules.value.length === 0) {
        console.log("No vehicles available");
        return;
    }
    let notEcoule = !vehicules.value.some(vehicule => vehicule.statut === 'DE' || vehicule.statut === 'ND' || vehicule.statut === 'PP');
    let allParti = vehicules.value.every(vehicule => vehicule.statut == 'PA' || vehicule.statut == 'SL');
    let list_vehicule_ecoule = vehicules.value.filter(vehicule => vehicule.statut === 'DE' || vehicule.statut === 'ND' || vehicule.statut === 'PP');
    let list_vehicule_parti = vehicules.value.filter(vehicule => vehicule.statut === 'PA' || vehicule.statut === 'SL');
    let new_vehicules_ecoules = list_vehicule_ecoule.filter(vehicule => !vehicules_ecoules.value.some(v => v.id === vehicule.id));
    let new_vehicules_partis = list_vehicule_parti.filter(vehicule => !vehicules_partis.value.some(v => v.id === vehicule.id));
    console.log("New vehicles ecoules:", new_vehicules_ecoules);
    console.log("New vehicles partis:", new_vehicules_partis);
    let audio = null;
    if (new_vehicules_ecoules.length > 0) {
        isEcoule.value = true;
        let message = `${new_vehicules_ecoules.map(v => v.nomPhonetique).join(" , ")} . Départ écoulé ou problème au départ.`;
        console.log("TTS message for ecoules:", message);
        audio = await smartemis.getTTS(message);
        vehicules_ecoules.value.push(...new_vehicules_ecoules);
    } else if (new_vehicules_partis.length > 0) {
        let message = `${new_vehicules_partis.map(v => v.nomPhonetique).join(" , ")} . Au départ.`;
        console.log("TTS message for partis:", message);
        audio = await smartemis.getTTS(message);
        vehicules_partis.value.push(...new_vehicules_partis);
    }
    if (condition1.value && condition2.value) {
        console.log("Condition1 and Condition2 met");
        if (!notEcoule) {
            console.log("NotEcoule condition met");
            msgTitre.value = "Départ écoulé / problème départ";
            condition2.value = false;
            tempsEcouleAudio.play();
            tempsEcouleAudio.onended = () => {
                console.log("Playing audio for tempsEcoule");
                audio.play();
            };
            return;
        }
        if (allParti) {
            console.log("All vehicles have departed");
            displayDelay.value = false;
            condition2.value = false;
            msgTitre.value = "Départ assuré";
            isAllParti.value = true;
            isEcoule.value = true;
            departAssureAudio.play();
            departAssureAudio.onended = () => {
                if (new_vehicules_partis.length > 0) {
                    console.log("Playing audio for new vehicles partis");
                    audio.play();
                }
            };
        } else if (new_vehicules_partis.length > 0) {
            console.log("Playing audio for new vehicles partis");
            audio.play();
        }
    }
    if (condition3.value && condition2.value && condition1.value && condition4.value) {
        console.log("Condition3, Condition2, Condition1, and Condition4 met");
        msgTitre.value = "Délai 10 min imminent";
        condition4.value = false;
        endTimeAudio.play();
        console.log("Playing endTimeAudio");
        return;
    }
};

const getAgents = async () => {
    await smartemis.getAgentsInter();
    const newAgents = smartemis.agentsInterList;
    for (let agent of newAgents){
        let found_agent = agentList.value.find(a => a.matricule === agent.matricule);
        if (found_agent){
            found_agent.statut = agent.statut;
        } else {
            agentList.value.push(agent);
        }
    }
    agentList.value = agentList.value.filter(a => newAgents.some(na => na.matricule === a.matricule));
};

const giveClass = ref('newInter');
const giveStatusColor = (status) => {
    if (status === 'DIP'){
        return '#27a658';
    }else if(status === 'IN' || status === 'IND'){
        return '#929292';
    }else if(status === 'AEC'){
        return '#FFCA00';
    }else if(status === 'AOR'){
        return '#fc5d00';
    }else {
        return 'white';
    }
};
setTimeout(() => {
    getStatus();
    getAgents();
    giveClass.value = 'interConfig';
    setInterval(async () => {
        await getStatus();
    }, 15000);
    setInterval(async ()=> {
        await getAgents();
    }, 30000);
}, 15000);

setTimeout(() => {
    audioNotifs();
}, 60000);
</script>
<style scoped>
div {
    color: white;
}
.newInter, .interConfig {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 100;
    background-color: transparent;
    overflow: hidden;
}
.header {
    font-size: 2rem;
    font-weight: bold;
    color: #f60700;
    margin-bottom: 1rem;
    position: absolute;
    left: 0;
    width: 100%;
    text-align: center;
    text-shadow: 0 0 10px 5px #f60700;
    z-index: 101;
    transition: all 0.5s ease-in-out;
    padding: 1rem;
}
.newInter > .header {
    background-color: #26262695;
    font-size: 5rem;
}
.newInter > #map {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}
.interConfig {
    position: absolute;
    top: 0;
    left: 0;
    width: 100dvw;
    height: 100dvh;
    z-index: 100;
    background-color: transparent;
    overflow: hidden;
    display: grid;
    /* Définir la grille : 4 colonnes et 4 lignes */
    grid-template-columns: 2fr 3fr 1fr 1fr;
    grid-template-rows: auto 3fr auto auto;
    gap: 10px; /* Optionnel : espace entre les éléments */
}

.interConfig > .header {
    grid-column: 1 / -1; /* S'étend sur toutes les colonnes */
    grid-row: 1; /* Première ligne */
    text-align: center;
    font-weight: bold;
    font-size: 2.5rem; /* Ajustez la taille selon vos besoins */
    width: 50%;
    height: 100%;
    margin-left: 35%; 
}

.interConfig > #map {
    grid-column: 1 / 2; /* Première colonne uniquement */
    grid-row: 2 / -1; /* Toutes les lignes sauf la première */
    overflow: hidden; /* Éviter tout dépassement */
    border-radius: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    scale: 1.1;
}


.interConfig > .info {
    grid-column: 2 / -1; /* S'étend des colonnes 2 à 4 */
    grid-row: 2; /* Deuxième ligne */
    margin-left: 6rem;
    margin-top: 7rem;
    
}

.interConfig > .infoAgents {
    grid-column: 2 / 3; /* Colonne 2 */
    grid-row: 3; /* Troisième ligne */
    width: 100%;
    height: 100%;
}

.interConfig > .infoVehicule {
    grid-column: 3 / -1; /* Colonnes 3 à 4 */
    grid-row: 3; /* Troisième ligne */
    width: 100%;
    height: 100%;
}
.infoHeader{
    display: flex;
    justify-content: left;
    align-items: center;
}
.SSUAP {
    background-color: #1f8d49;
    color: white;
    padding: 0.5rem;
    border-radius: 0.3rem;
    margin-right: 0.5rem;
}
.INC {
    background-color: #f60700;
    color: white;
    padding: 0.5rem;
    border-radius: 0.3rem;
    margin-right: 0.5rem;
}
.PPBE {
    background-color: #A558A0;
    color: white;
    padding: 0.5rem;
    border-radius: 0.3rem;
    margin-right: 0.5rem;
}
.ACC {
    background-color: #C3992A;
    color: white;
    padding: 0.5rem;
    border-radius: 0.3rem;
    margin-right: 0.5rem;
}
.Div {
    background-color: #009081;
    color: white;
    padding: 0.5rem;
    border-radius: 0.3rem;
    margin-right: 0.5rem;
}
.matricule{
    color: #bdbdbd;
    font-size: 0.8rem;
    font-style: italic;
}
.Vurbs {
    background-color: #E4794A;
    color: white;
    padding: 0.5rem;
    border-radius: 0.3rem;
    margin-right: 0.5rem;
}
.VUrbG {
    background-color: #FF732C;
    color: white;
    padding: 0.5rem;
    border-radius: 0.3rem;
    margin-right: 0.5rem;
}
#interLibelle {
    font-size: 2.3rem;
    margin-left: 1rem;
}
.infoDetail {
    display: flex;
    justify-content: left;
    align-items: center;
    margin-top: 2rem;
    margin-left: 3rem;
    padding: 0.5rem;
}
.infoDetail:first-child {
    margin-top: 4rem;
}
.infoDetail span {
    height: 1rem;
    font-size: 2rem;
    margin-right: 1rem;
}
.infoVehicule{
    background-color: #3d3d3d;
    color: white;
    padding: 0.5rem;
    border-radius: 0.3rem;
    margin-right: 1rem;
    margin-bottom: 3rem;
}
.vehicule{
    display: flex;
    justify-content: left;
    align-items: center;
    margin-top: 1rem;
    padding: 0.5rem;
}
.vehStatut{
    padding: 0.5rem;
    border-radius: 0.3rem;
    margin-right: 1rem;
}
.vehiculeHeader{
    font-size: 1.2rem;
    font-weight: bold;
    text-transform: uppercase;
    margin-bottom: 1rem;
}
.agent {
    display: flex;
    justify-content: left;
    align-items: center;
    padding: 0.5rem;
    width: 100%;
    flex-wrap: wrap;
}
.agentGrade {
    margin-right: 1rem;
    border-radius: 0.3rem;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
}
.agentNom {
    margin-right: 1rem;
}
.agentStatut {
    padding: 0.3rem;
    border-radius: 0.6rem;
    font-size: 0.8rem;
    margin-right: 1rem;
    opacity: 0.5;
}
#agentList {
    display: grid;
    grid-template-columns: 1fr 1fr; /* Two columns */
    row-gap: 0;
    padding-bottom: 1rem;
    padding-left: 2rem;
    z-index: 102;
}
.interFooter {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 5px;
    background-color: #642626;
    overflow: hidden;
    border-radius: 0.5rem 0.5rem 0 0;
    z-index: 102;
}

.interFooterContent {
    width: 0;
    height: 100%;
    background-image: linear-gradient(to right, transparent 5%,  #f60700 100%);
    transition: all 0.5s ease-in-out;
    clip-path: polygon(99% 0%, 100% 50%, 99% 100%, 0% 100%, 25% 50%, 0% 0%);
}

#delayImg {
    position: fixed;
    top: 20%;
    right: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0.7;
}
.blinkSecondary {
    animation: blink 2s infinite;
}
.noBlink {
    animation: none;
}
@keyframes blink {
    0% { opacity: 0.7; }
    49% { opacity: 0.7; }
    50% { opacity: 0.2; }
    51% { opacity: 0.2; }
    99% { opacity: 0.2; }
    100% { opacity: 0.7; }
}
</style>
