<template>
    <div :class="giveClass">
        <div class="maps">
            <div id="map"><mapBox :lon="lon" :lat="lat" /></div>
            <div id="routeMap" v-if="showRouteMap && giveClass == 'interConfig'"><mapBox :lon="lon" :lat="lat" :showRoute="true" /></div>
        </div>
        <div v-if="giveClass == 'interConfig'" class="info">
            <div class="infoHeader">
                <div class="infoHeaderLeft">
                    <span v-if="false" :class="typeInterClass">{{ typeInter }}</span>
                    <span v-if="hasRedLabel" class="redLabel">{{ redLabelText }}</span>
                    <span id="interLibelle">{{ cleanLibelleInter }}</span>
                </div>
                <div v-if="displayDelay && !isAllParti" class="delayIcon">
                    <img src="../assets/vehicules/statuts/DE.png" alt="" width="40px" height="auto">
                </div>
            </div>

            <div v-if="hasConsignes" class="consignesPopover">
                <div v-for="(item, idx) in parsedConsignes.slice(0, 2)" :key="idx" class="consigneMini">
                    <div class="consigneMiniTitle">{{ item.titre }}</div>
                    <div class="consigneMiniMeta">
                        <span><strong>{{ item.origine }}</strong> – {{ item.nom }}</span>
                        <span>• {{ item.relativeStart }} → {{ item.relativeEnd }}</span>
                    </div>
                    <div class="consigneMiniText">{{ item.texte }}</div>
                </div>
            </div>
            <div class="infoDetail"><span><img src="../assets/icons/number.svg" style="height: 1rem; width: auto;" /></span><span>N°<span style="color: #1a1a1a; font-weight: 600;">{{ numeroInter }}</span></span></div>
            <div class="infoDetail"><span><img src="../assets/icons/citySign.svg" style="height: 1rem; width: auto;" /></span><span style="color: #1a1a1a;">{{ villeInter.toUpperCase() }}</span></div>
            <div class="infoDetailRow">
                <div class="infoDetail"><span><img src="../assets/icons/address.svg" style="height: 1rem; width: auto;" /></span><span style="color: #1a1a1a;">{{ adresseInter.toUpperCase() }}</span></div>
                <div class="infoDetailsRight">
                    <img v-if="statusImage" :src="statusImage" alt="" width="80px" height="auto">
                </div>
            </div>
            <div v-if="interDetail && interDetail.externalServices && interDetail.externalServices.length" class="infoDetailRow">
                <div class="infoDetail extServicesInfo">
                    <span><img src="../assets/icons/fireEngine.svg" style="height: 1rem; width: auto;" /></span>
                    <span class="extServicesList">
                        <span v-for="svc in interDetail.externalServices" :key="svc.id" class="serviceChipInline" :style="{ backgroundColor: svc.backgroundColor, color: svc.textColor }">
                            {{ svc.name || svc.id }}
                        </span>
                    </span>
                </div>
                <div class="infoDetailsRight">
                    <img v-if="statusImage" :src="statusImage" alt="" width="80px" height="auto">
                </div>
            </div>
        </div>
        <div class="infoVehicule" v-if="giveClass == 'interConfig'">
            <div class="vehiculeHeader" style="color: #f60700; margin-bottom: 0.5rem; padding-bottom: 0.4rem; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Moyens engagés</div>

            <div v-if="interDetail && interDetail.details && interDetail.details.length" class="moyensList">
                <!-- Collonges en premier, une ligne avec signification des statuts -->
                <div v-for="st in interDetail.details.filter(s => isHomeStation(s))" :key="st.stationId" class="stationCard homeStation homeStationLine">
                    <div class="stationHeader">
                        <div class="stationCodeChip">{{ st.stationName }}</div>
                        <div class="stationFull">{{ st.stationFullName }}</div>
                    </div>
                    <div class="stationVehicles">
                        <span v-for="v in st.vehicles" :key="v.id" class="vehicleChip" :class="{ blink: isBlinkVehicle(v.name) }" :style="{ backgroundColor: v.backgroundColor, color: v.textColor }">
                            {{ v.name }} <span class="statusLabel">{{ getStatusLabel(v.status) }}</span>
                        </span>
                    </div>
                </div>

                <!-- Autres casernes compactées, plusieurs par ligne -->
                <div class="otherStationsGrid">
                    <div v-for="st in displayedOtherStations" :key="st.stationId" class="stationCard compactStation">
                        <div class="stationHeader">
                            <div class="stationCodeChip">{{ st.stationName }}</div>
                            <div class="stationFull">{{ st.stationFullName }}</div>
                        </div>
                        <div class="stationVehicles">
                            <span v-for="v in st.vehicles" :key="v.id" class="vehicleChip" :class="{ blink: isBlinkVehicle(v.name) }" :style="{ backgroundColor: v.backgroundColor, color: v.textColor }">
                                {{ v.name }}
                            </span>
                        </div>
                    </div>
                    <div v-if="remainingStationsInfo" class="remainingStationsInfo">
                        {{ remainingStationsInfo.vehicleCount }} autre{{ remainingStationsInfo.vehicleCount > 1 ? 's' : '' }} engin{{ remainingStationsInfo.vehicleCount > 1 ? 's' : '' }} de {{ remainingStationsInfo.stationCount }} caserne{{ remainingStationsInfo.stationCount > 1 ? 's' : '' }}
                    </div>
                </div>

                <div class="updateInfo">MàJ {{ deltaUpdate.tempsTotal < 25 ? "à l'instant" : "il y a " + deltaUpdate.displayTemps  }}</div>
            </div>

            <div v-else class="vehiculeList">
                <div class="loading" v-if="vehicules.length == 0">
                    <div style="margin-top: 0.5rem"><img src="../assets/vehiculeLoader.gif" alt="" width="80px" height="auto"></div>
                    <div style="color: #666; font-size: 0.85rem;"><span>En attente de véhicules...</span></div>
                </div>
                <div v-else id="vehiculeList">
                    <div v-for="vehicule in vehicules" :key="vehicule.id" class="vehicule">
                        <div class="vehStatut" :style="{ color: vehicule.libColor, backgroundColor: vehicule.backgroundColor }">{{ vehicule.lib }}</div>
                        <div class="vehiculeStatutLib">{{ vehicule.statutLib }}</div>
                    </div>
                </div>
                <div class="updateInfo">MàJ {{ deltaUpdate.tempsTotal < 25 ? "à l'instant" : "il y a " + deltaUpdate.displayTemps  }}</div>
            </div>
        </div>
        <div class="infoAgents" v-if="giveClass == 'interConfig'">
            <div class="vehiculeHeader" style="color: #f60700; margin-bottom: 0.4rem; padding-bottom: 0.3rem; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Agents engagés</div>
            <div class="vehiculeList">
                <div class="loading" v-if="agentList.length == 0">
                    <div style="margin-top: 0.5rem">
                        <img src="../assets/vehiculeLoader.gif" alt="" width="80px" height="auto">
                    </div>
                    <div style="color: #666; font-size: 0.85rem;">
                        <span>En attente d'agents...</span>
                    </div>
                </div>
                <div v-else id="agentList" style="min-height: auto;">
                    <div v-for="agent in agentList" :key="agent.matricule" class="agent">
                        <div class="agentGrade">
                            <img :src="giveAgentGrade(agent.grade)" alt="" width="20px" height="auto">
                        </div>
                        <div class="agentNom">{{ agent.nom }} {{ agent.prenom }}</div>
                        <div v-if="agent.status && !alternateDisplay" class="agentStatusDot" :style="{backgroundColor: giveStatusColor(agent.status)}"></div>
                    </div>
                </div>
                <div style="color: #666;font-size: 0.8rem;">
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
import { ref, computed, onMounted, defineExpose } from 'vue';
import { useSmartemis } from '../store/smartemis';
import mapBox from '../components/mapBox.vue';
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
import DFU from '../assets/sounds/DFU.mp3';
import DVR from '../assets/sounds/DVR.mp3';
import DFUR from '../assets/sounds/DFUR.mp3';
import DFUnuit from '../assets/sounds/DFUnuit.mp3';
import DVRnuit from '../assets/sounds/DVRnuit.mp3';
import DFURnuit from '../assets/sounds/DFURnuit.mp3';
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
    'VUrbx': VUrbxnuit,
    'DFU': DFUnuit,
    'DVR': DVRnuit,
    'DFUR': DFURnuit
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
    'VUrbx': VUrbx,
    'DFU': DFU,
    'DVR': DVR,
    'DFUR': DFUR
};
const libelleInter = ref();
const adresseInter = ref();
const villeInter = ref();
const typeInter = ref();
const numeroInter = ref();
const enginsInter = ref();
const dateTimeInter = ref();
const lon = ref();
const lat = ref();
const endingTime = ref();
const startEnd = ref(0);
const loaderWidth = ref("0%");
const showRouteMap = ref(false);
onMounted(() => {
    // Vérifier si les données sont présentes dans les props
    const hasData = props.data && 
                    props.data.libelleInter && 
                    props.data.villeInter && 
                    props.data.numeroInter;
    
    if (hasData) {
        // Utiliser les données réelles
        libelleInter.value = props.data.libelleInter;
        adresseInter.value = props.data.adresseInter;
        villeInter.value = props.data.villeInter;
        typeInter.value = props.data.typeInter;
        numeroInter.value = props.data.numeroInter;
        enginsInter.value = props.data.enginsInter;
        dateTimeInter.value = props.data.dateTimeInter;
        lon.value = props.data.lon;
        lat.value = props.data.lat;
        
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
            } else if (libelleInter.value.includes("DFU")){
                audio.src = typeInterAudio['DFU'];
                audio_type = 'DFU';
            } else if (libelleInter.value.includes("DVR")){
                audio.src = typeInterAudio['DVR'];
                audio_type = 'DVR';
            } else if (libelleInter.value.includes("DFUR")){
                audio.src = typeInterAudio['DFUR'];
                audio_type = 'DFUR';
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
        
        // Consignes + détails intervention (moyens engagés)
        updateConsignesLocal();
        updateInterDetail();
        setInterval(updateConsignesLocal, 60000);
        setInterval(updateInterDetail, 60000);

        // Initialiser avec les vraies données après 15 secondes
        setTimeout(() => {
            getStatus();
            getAgents();
            giveClass.value = 'interConfig';
            // À l’arrivée en layout réduit, afficher la carte itinéraire en inset
            showRouteMap.value = true;
            setInterval(async () => {
                await getStatus();
            }, 15000);
            setInterval(async ()=> {
                await getAgents();
            }, 30000);
        }, 15000);
        
        setTimeout(() => {
            audioNotifs();
        }, 0); // audioNotifs attend maintenant 1 min 10 en interne
    } else {
        // Pas de données, démarrer la simulation
        console.log('Aucune donnée dans les props, démarrage de la simulation...');
        updateConsignesLocal();
        updateInterDetail();
        simulateData();
    }
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

// ---- Consignes (affichage automatique) ----
const consignes = ref([]);
const hasConsignes = computed(() => consignes.value && consignes.value.length > 0);

function formatRelativeTime(dateString, isStart = true) {
    const date = new Date(dateString);
    const now = new Date();

    const diffMs = isStart ? now - date : date - now;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (isStart) {
        if (diffDays > 0) return `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
        if (diffHours > 0) return `${diffHours} h ${diffMin % 60} min`;
        return `${diffMin} min`;
    } else {
        const dayNames = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
        const targetDay = dayNames[date.getDay()];
        const hour = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');

        const today = now.toDateString() === date.toDateString();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        const isTomorrow = tomorrow.toDateString() === date.toDateString();

        if (today) return `aujourd’hui à ${hour} h ${min}`;
        if (isTomorrow) return `demain à ${hour} h ${min}`;
        return `${targetDay} à ${hour} h ${min}`;
    }
}

const parsedConsignes = computed(() =>
    (consignes.value || []).map((inst) => ({
        ...inst,
        relativeStart: formatRelativeTime(inst.debut, true),
        relativeEnd: formatRelativeTime(inst.fin, false),
    }))
);

const updateConsignesLocal = async () => {
    try {
        consignes.value = await smartemis.getConsignes();
    } catch (e) {
        // silencieux
    }
};

// ---- Détails intervention (moyens engagés / externes) ----
const interDetail = ref(null);
const HOME_STATION = 'COLLONGE';

const updateInterDetail = async () => {
    try {
        const detail = await smartemis.getInterDetail();
        if (detail && detail.details) {
            // Nettoyer les doublons dans les détails (par stationId)
            const seenStationIds = new Set();
            detail.details = detail.details.filter(st => {
                if (seenStationIds.has(st.stationId)) {
                    return false;
                }
                seenStationIds.add(st.stationId);
                
                // Nettoyer les doublons dans les véhicules de chaque station (par id)
                if (st.vehicles) {
                    const seenVehicleIds = new Set();
                    st.vehicles = st.vehicles.filter(v => {
                        if (seenVehicleIds.has(v.id)) {
                            return false;
                        }
                        seenVehicleIds.add(v.id);
                        return true;
                    });
                }
                
                return true;
            });
            
            // Nettoyer les doublons dans les services externes (par id)
            if (detail.externalServices) {
                const seenServiceIds = new Set();
                detail.externalServices = detail.externalServices.filter(svc => {
                    if (seenServiceIds.has(svc.id)) {
                        return false;
                    }
                    seenServiceIds.add(svc.id);
                    return true;
                });
            }
        }
        interDetail.value = detail;
    } catch (e) {
        // silencieux
    }
};

const normalizeName = (s) => (s || '').toString().trim().toUpperCase().replace(/\s+/g, ' ');
const isHomeStation = (st) => normalizeName(st?.stationName) === HOME_STATION;

// Historique des statuts AL/PA pour chaque engin
const vehicleStatusHistory = ref(new Map());

const isBlinkVehicle = (vehicleName) => {
    if (!vehicleName || vehicules.value.length === 0) return false;
    const target = normalizeName(vehicleName);
    const found = vehicules.value.some(v => {
        const normalized = normalizeName(v?.lib);
        if (normalized === target) {
            // Mettre à jour l'historique si l'engin est en AL ou PA
            if (v.statut === 'AL' || v.statut === 'PA') {
                if (!vehicleStatusHistory.value.has(v.id)) {
                    vehicleStatusHistory.value.set(v.id, []);
                }
                const history = vehicleStatusHistory.value.get(v.id);
                if (!history.includes(v.statut)) {
                    history.push(v.statut);
                }
            }
            // Clignoter si l'engin a déjà été en AL ou PA
            const history = vehicleStatusHistory.value.get(v.id) || [];
            return history.includes('AL') || history.includes('PA');
        }
        return false;
    });
    return found;
};

// Dictionnaire des statuts pour afficher leur signification
const statusLabels = {
    'RD': 'Retour Disponible',
    'PA': 'Parti/intervention',
    'SL': 'Sur les lieux',
    'TH': 'Transport Hôpital',
    'AH': 'Arrivée Hôpital',
    'QH': 'Quitte Hôpital',
    'PC': 'Prise en charge vict',
    'RE': 'Retenu',
    'RI': 'Retour Indisponible',
    'AL': 'Alerte',
    'DE': 'Départ',
    'PP': 'Problème Départ',
    'MD': 'Manoeuvre disponible',
    'MI': 'Manoeuvre indispo.',
    'SD': 'S.Lieux disponible',
    'SG': 'Regroupement',
    'AT': 'En Attente',
    'AG': 'Alerte/GI',
    'CG': 'Sur les lieux GI',
    'EP': 'En prévision GI',
    'PS': 'Prompt Secours',
    'RS': 'Réservé disponible',
    'RV': 'Réservé indisponible',
    'OD': 'Opération différée',
    'TE': 'Engin/itv rentre',
    'AR': 'Engin/itv arrêté',
    'ND': 'Non Départ : Refus',
    'IN': 'Indisponible',
    'RP': 'Remplace',
    'SLR': 'Sur les lieux ss rem',
    'XX': 'Pb connect. smartemis <-> affichage'
};

const getStatusLabel = (statusCode) => {
    return statusLabels[statusCode] || '';
};

// Image de statut selon les engins de Collonges
const statusImage = computed(() => {
    if (!vehicules.value || vehicules.value.length === 0) return null;
    
    const statuts = vehicules.value.map(v => v.statut);
    
    // Si certains sont en AL
    if (statuts.some(s => s === 'AL')) {
        return '../assets/vehicules/statuts/AL.gif';
    }
    
    // Si tous sont PA
    if (statuts.every(s => s === 'PA')) {
        return '../assets/vehicules/statuts/PA.gif';
    }
    
    // Si tous sont SL
    if (statuts.every(s => s === 'SL')) {
        return '../assets/vehicules/statuts/SL.gif';
    }
    
    // Si certains sont PA (même si d'autres sont SL)
    if (statuts.some(s => s === 'PA')) {
        return '../assets/vehicules/statuts/PA.gif';
    }
    
    // Si certains sont SL (même si d'autres sont différents)
    if (statuts.some(s => s === 'SL')) {
        return '../assets/vehicules/statuts/SL.gif';
    }
    
    return null;
});

// Limiter l'affichage à 3 casernes (hors Collonges)
const displayedOtherStations = computed(() => {
    if (!interDetail.value || !interDetail.value.details) return [];
    const otherStations = interDetail.value.details.filter(s => !isHomeStation(s));
    return otherStations.slice(0, 3);
});

const remainingStationsInfo = computed(() => {
    if (!interDetail.value || !interDetail.value.details) return null;
    const otherStations = interDetail.value.details.filter(s => !isHomeStation(s));
    if (otherStations.length <= 3) return null;
    
    const remaining = otherStations.slice(3);
    const totalVehicles = remaining.reduce((sum, st) => sum + (st.vehicles?.length || 0), 0);
    return {
        vehicleCount: totalVehicles,
        stationCount: remaining.length
    };
});

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

// Gestion des libellés rouges (DV, DFUR, DFU, DFE, DF20)
const hasRedLabel = computed(() => {
    if (!libelleInter.value) return false;
    return libelleInter.value.includes('DF20') || 
           libelleInter.value.includes('DFE') || 
           libelleInter.value.includes('DFUR') || 
           libelleInter.value.includes('DFU') || 
           (libelleInter.value.includes('DV') && !libelleInter.value.includes('DF20') && !libelleInter.value.includes('DFE') && !libelleInter.value.includes('DFUR') && !libelleInter.value.includes('DFU'));
});

const redLabelText = computed(() => {
    if (!libelleInter.value) return '';
    // Vérifier dans l'ordre : les plus spécifiques d'abord (DFUR avant DFU)
    if (libelleInter.value.includes('DF20')) return 'DF20';
    if (libelleInter.value.includes('DFE')) return 'DFE';
    if (libelleInter.value.includes('DFUR')) return 'DFUR';
    if (libelleInter.value.includes('DFU')) return 'DFU';
    if (libelleInter.value.includes('DV') && !libelleInter.value.includes('DF20') && !libelleInter.value.includes('DFE') && !libelleInter.value.includes('DFUR') && !libelleInter.value.includes('DFU')) return 'DV';
    return '';
});

const cleanLibelleInter = computed(() => {
    if (!libelleInter.value) return '';
    return libelleInter.value.toUpperCase()
        .replace(/\|/g, '-')
        .replace('DF20', '')
        .replace('DFE', '')
        .replace('DFUR', '')
        .replace('DFU', '')
        .replace('DV', '')
        .trim();
});
const props = defineProps({
    data: Object,
});

// Fonction de simulation de données d'intervention (3 minutes)
// La simulation dure 3 minutes et met à jour progressivement les véhicules et agents
const simulateData = () => {
    const startTime = new Date();
    const totalDuration = 3 * 60 * 1000; // 3 minutes en millisecondes
    const interval = 5000; // Mise à jour toutes les 5 secondes
    
    // Initialiser les données de base si elles n'existent pas
    if (!libelleInter.value) {
        libelleInter.value = 'INC Incendie dans un immeuble';
        adresseInter.value = '15 Rue de la République';
        villeInter.value = 'COLLONGES-AU-MONT-D\'OR';
        typeInter.value = 'Incendie';
        numeroInter.value = 'INT2024001';
        enginsInter.value = 3;
        dateTimeInter.value = startTime.toISOString();
        // Coordonnées pour Collonges-au-Mont-d'Or (approximatives)
        lon.value = 4.8431;
        lat.value = 45.8222;
    }
    
    // Données initiales simulées
    const simulatedVehicules = [
        { id: 'V1', lib: 'VSAV 02', statut: 'EN', statutLib: 'En route', backgroundColor: '#1f8d49', libColor: '#ffffff', nomPhonetique: 'Vé S A V zéro un' },
        { id: 'V2', lib: 'FPT 01', statut: 'EN', statutLib: 'En route', backgroundColor: '#f60700', libColor: '#ffffff', nomPhonetique: 'F P T zéro un' },
        { id: 'V3', lib: 'VLCG', statut: 'EN', statutLib: 'En route', backgroundColor: '#0078f3', libColor: '#ffffff', nomPhonetique: 'V L C G' }
    ];
    
    const simulatedAgents = [
        { matricule: 'V30001', nom: 'DUPONT', prenom: 'Jean', grade: 'Capitaine', status: 'DIP' },
        { matricule: 'V30002', nom: 'MARTIN', prenom: 'Pierre', grade: 'Lieutenant', status: 'DIP' },
        { matricule: 'V30003', nom: 'BERNARD', prenom: 'Marie', grade: 'Sergent-Chef', status: 'DIP' }
    ];
    
    // Initialiser avec les premières données
    vehicules.value = [...simulatedVehicules];
    agentList.value = [...simulatedAgents];
    
    // Simuler interDetail avec les mêmes engins pour que le clignotement fonctionne
    interDetail.value = {
        details: [
            {
                interventionId: 999999,
                stationId: '063',
                stationName: 'COLLONGE',
                stationFullName: 'Collonges-Au-Mont-d\'Or',
                vehicles: simulatedVehicules.map(v => ({
                    id: v.id,
                    name: v.lib, // Même nom que dans vehicules.value pour que le clignotement fonctionne
                    status: v.statut,
                    backgroundColor: v.backgroundColor,
                    textColor: v.libColor
                }))
            }
        ],
        externalServices: [],
        messages: [],
        agents: simulatedAgents,
        status: true,
        update: new Date()
    };
    
    // Initialiser le temps de mise à jour
    deltaUpdate.value = { tempsTotal: 0, tempsMin: 0, displayTemps: '0 sec env.' };
    
    // Initialiser le loader
    endingTime.value = new Date(dateTimeInter.value).getTime() + 10 * 60 * 1000;
    let delta = endingTime.value - new Date().getTime();
    let deltaSec = Math.floor(delta / 1000);
    startEnd.value = deltaSec;
    
    // Démarrer le loader
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
    
    // Passer en mode interConfig immédiatement
    giveClass.value = 'interConfig';
    
    let elapsed = 0;
    const simulationInterval = setInterval(() => {
        elapsed += interval;
        const progress = elapsed / totalDuration;
        
        // Simuler l'évolution des statuts des véhicules
        if (progress > 0.2 && vehicules.value[0].statut === 'EN') {
            vehicules.value[0].statut = 'PA';
            vehicules.value[0].statutLib = 'Parti';
            vehicules.value[0].backgroundColor = '#27a658';
        }
        if (progress > 0.4 && vehicules.value[1].statut === 'EN') {
            vehicules.value[1].statut = 'PA';
            vehicules.value[1].statutLib = 'Parti';
            vehicules.value[1].backgroundColor = '#27a658';
        }
        if (progress > 0.6 && vehicules.value[2].statut === 'EN') {
            vehicules.value[2].statut = 'PA';
            vehicules.value[2].statutLib = 'Parti';
            vehicules.value[2].backgroundColor = '#27a658';
        }
        
        // Ajouter des agents progressivement
        if (progress > 0.3 && agentList.value.length < 5) {
            agentList.value.push({
                matricule: 'V30004',
                nom: 'DURAND',
                prenom: 'Sophie',
                grade: 'Caporal',
                status: 'DIP'
            });
        }
        if (progress > 0.5 && agentList.value.length < 6) {
            agentList.value.push({
                matricule: 'V30005',
                nom: 'LAMBERT',
                prenom: 'Thomas',
                grade: 'Sap 1CL',
                status: 'DIP'
            });
        }
        
        // Mettre à jour le temps écoulé
        const deltaSec = Math.floor(elapsed / 1000);
        const deltaMin = Math.floor(deltaSec / 60);
        const displayTemps = deltaMin < 1 ? deltaSec + ' sec env.' : deltaMin + ' min';
        deltaUpdate.value = { tempsTotal: deltaSec, tempsMin: deltaMin, displayTemps: displayTemps };
        
        // Arrêter après 3 minutes
        if (elapsed >= totalDuration) {
            clearInterval(simulationInterval);
            console.log('Simulation terminée après 3 minutes');
        }
    }, interval);
    
    return () => clearInterval(simulationInterval); // Retourner une fonction pour arrêter la simulation
};

const vehiculePhonetiques = ref("");
const interAudio = ref(null);
import introNotif from '../assets/sounds/introNotif.mp3';

const introNotifAudio = new Audio(introNotif);

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

// Générer le message pour les autres moyens engagés
const generateOtherMeansMessage = () => {
    if (!interDetail.value || !interDetail.value.details) return '';
    
    const otherStations = interDetail.value.details.filter(s => !isHomeStation(s));
    if (otherStations.length === 0) return '';
    
    const stationsToAnnounce = otherStations.slice(0, 3);
    const remainingStations = otherStations.slice(3);
    
    let message = 'Autres moyens engagés sur l\'intervention : ';
    
    for (const station of stationsToAnnounce) {
        if (station.vehicles && station.vehicles.length > 0) {
            const vehicleNames = station.vehicles.map(v => v.nomPhonetique || v.name).join(' , ');
            const stationName = station.stationNomPhonetique || station.stationName || station.stationFullName;
            message += `${vehicleNames}, ${stationName} . `;
        }
    }
    
    if (remainingStations.length > 0) {
        const totalRemainingVehicles = remainingStations.reduce((sum, st) => sum + (st.vehicles?.length || 0), 0);
        message += `et ${totalRemainingVehicles} autre${totalRemainingVehicles > 1 ? 's' : ''} engin${totalRemainingVehicles > 1 ? 's' : ''} de ${remainingStations.length} caserne${remainingStations.length > 1 ? 's' : ''} . `;
    }
    
    return message;
};

const audioNotifs = async () => {
    // Attendre 1 min 10 (70 secondes) avant de générer le TTS
    await new Promise(resolve => setTimeout(resolve, 70000));
    
    // Vérifier que les valeurs sont des chaînes avant d'utiliser .split()
    if (!dateTimeInter.value || typeof dateTimeInter.value !== 'string') {
        console.error('dateTimeInter.value n\'est pas une chaîne valide:', dateTimeInter.value);
        return;
    }
    if (!villeInter.value || typeof villeInter.value !== 'string') {
        console.error('villeInter.value n\'est pas une chaîne valide:', villeInter.value);
        return;
    }
    if (!libelleInter.value || typeof libelleInter.value !== 'string') {
        console.error('libelleInter.value n\'est pas une chaîne valide:', libelleInter.value);
        return;
    }
    
    const timePart = dateTimeInter.value.split('T')[1];
    const timeParts = timePart ? timePart.split(':') : ['00', '00'];
    let message = `Déclenché à, ${timeParts[0]}:${timeParts[1]}, pour, `;
    message += `${libelleInter.value.replace("DF20", "").replace("DFE", "").replace("DV", "").replace("DFUR", "").replace("DFU", "").toLowerCase().replace("aggrave", "aggravé").replace("alteration", "altération")},`;
    message += `sur ${villeInter.value.replace("ST-", "SAINT").toLowerCase().split('-').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join('-')} .`;
    message += `Moyens engagés : ${vehiculePhonetiques.value || ''} .`;
     
    // Ajouter les autres moyens engagés si Collonges n'est pas la seule caserne
    const otherMeansMessage = generateOtherMeansMessage();
    if (otherMeansMessage) {
        message += ' ' + otherMeansMessage;
    }
    
    interAudio.value = await smartemis.getTTS(message);
    
    // Ajuster les délais : le premier était à 15s, maintenant on a attendu 70s, donc on joue immédiatement
    // Les suivants sont à 2 min et 4 min après le début (donc 50s et 2min50s après le premier)
    const playAudio = () => {
        if (interAudio.value) {
            interAudio.value.play().catch(err => {
                console.error('Erreur lors de la lecture audio:', err);
            });
        } else {
            console.warn('interAudio.value n\'est pas défini');
        }
    };

    setTimeout(() => {
        introNotifAudio.play();
        introNotifAudio.onended = () => {
            playAudio();
        };
    }, 0);
    setTimeout(()=>{
        introNotifAudio.play();
        introNotifAudio.onended = () =>{
            playAudio();
        };
    }, 50 * 1000); // 50 secondes après le premier (2 min total depuis le début)
    setTimeout(()=>{
        introNotifAudio.play();
        introNotifAudio.onended = () =>{
            playAudio();
        };
    }, 2 * 60000 + 50 * 1000); // 2 min 50 après le premier (4 min total depuis le début)
    setTimeout(()=>{
        introNotifAudio.play();
        introNotifAudio.onended = () =>{
            playAudio();
        };
    }, 4 * 60000); // 4 min après le premier (6 min total depuis le début)
    setTimeout(()=>{
        introNotifAudio.play();
        introNotifAudio.onended = () =>{
            playAudio();
        };
    }, 6 * 60000); // 6 min après le premier (8 min total depuis le début)
};

const isAllParti = ref(false);

const getStatus = async () => {
    alternateDisplay.value = !alternateDisplay.value;
    let newVehicules = await smartemis.filterEnginsInter();
    
    // Éviter les doublons dans newVehicules
    const uniqueNewVehicules = [];
    const seenIds = new Set();
    for (let vehicule of newVehicules) {
        if (!seenIds.has(vehicule.id)) {
            seenIds.add(vehicule.id);
            uniqueNewVehicules.push(vehicule);
        }
    }
    
    for (let vehicule of uniqueNewVehicules){
        let found_vehicule = vehicules.value.find(v => v.id === vehicule.id);
        if (found_vehicule){
            found_vehicule.statut = vehicule.statut;
            found_vehicule.statutLib = vehicule.statutLib;
            found_vehicule.backgroundColor = vehicule.backgroundColor;
            found_vehicule.libColor = vehicule.libColor;
        } else {
            vehicules.value.push(vehicule);
            console.log("New vehicle added:", vehicule);
            if (vehicule.nomPhonetique && typeof vehicule.nomPhonetique === 'string') {
                vehiculePhonetiques.value = (vehiculePhonetiques.value || "") + " , " + vehicule.nomPhonetique;
            }
        } 
    }
    
    // Nettoyer les doublons et garder uniquement ceux présents dans newVehicules
    const uniqueIds = new Set(uniqueNewVehicules.map(nv => nv.id));
    vehicules.value = vehicules.value.filter((v, index, self) => 
        uniqueIds.has(v.id) && self.findIndex(veh => veh.id === v.id) === index
    );
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
        condition4.value = false;
        endTimeAudio.play();
        console.log("Playing endTimeAudio");
        return;
    }
};

const getAgents = async () => {
    await smartemis.getAgentsInter();
    const newAgents = smartemis.agentsInterList;
    
    // Dédupliquer newAgents en utilisant un Map basé sur le matricule
    const uniqueNewAgentsMap = new Map();
    for (let agent of newAgents) {
        const matricule = (agent.matricule || '').toString().trim();
        if (matricule && !uniqueNewAgentsMap.has(matricule)) {
            uniqueNewAgentsMap.set(matricule, agent);
        }
    }
    const uniqueNewAgents = Array.from(uniqueNewAgentsMap.values());
    
    // Mettre à jour ou ajouter les agents
    for (let agent of uniqueNewAgents){
        const matricule = (agent.matricule || '').toString().trim();
        let found_agent = agentList.value.find(a => (a.matricule || '').toString().trim() === matricule);
        if (found_agent){
            found_agent.statut = agent.statut;
        } else {
            agentList.value.push(agent);
        }
    }
    
    // Nettoyer les doublons dans agentList.value en utilisant un Map
    const agentMap = new Map();
    for (let agent of agentList.value) {
        const matricule = (agent.matricule || '').toString().trim();
        if (matricule && !agentMap.has(matricule)) {
            agentMap.set(matricule, agent);
        }
    }
    agentList.value = Array.from(agentMap.values());
    
    // S'assurer qu'on garde uniquement les agents présents dans uniqueNewAgents
    const validMatricules = new Set(uniqueNewAgents.map(na => (na.matricule || '').toString().trim()));
    agentList.value = agentList.value.filter(a => validMatricules.has((a.matricule || '').toString().trim()));
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

// Exposer la fonction pour qu'elle soit accessible depuis l'extérieur
defineExpose({
    simulateData
});
</script>
<style scoped>
div {
    color: #1a1a1a;
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
.maps{
    position: relative;
}
.newInter > .maps {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transition: all 1s ease-in-out;
    z-index: 99;
}
.newInter > .maps > #map {
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
    background: rgba(255, 255, 255, 0.95);
    overflow: hidden;
    display: grid;
    grid-template-columns: 2fr 2.5fr 1.2fr;
    grid-template-rows: auto 1fr auto;
    gap: 0.75rem;
    padding: 0.75rem;
    box-sizing: border-box;
}

.interConfig > .maps {
    grid-column: 1 / 2;
    grid-row: 1 / -1;
    overflow: hidden;
    border-radius: 0.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05);
    transition: all 1s ease-in-out;
    position: relative;
}

.interConfig > .maps > #map{
    width: 100%;
    height: 100%;
}
.interConfig > .maps > #routeMap {
    position: absolute;
    right: 0.75rem;
    bottom: 0.75rem;
    width: 42%;
    height: 38%;
    overflow: hidden;
    border-radius: 0.5rem;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(246, 7, 0, 0.18);
    opacity: 0;
    animation: fadeIn 0.35s ease-in-out forwards;
    z-index: 5;
}

@keyframes fadeIn {
    to {
        opacity: 1;
    }
}

.interConfig > .info {
    grid-column: 2 / -1;
    grid-row: 1;
    margin: 0;
    background: rgba(255, 255, 255, 1);
    border-radius: 0.5rem;
    padding: 0.75rem;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05);
    overflow-y: auto;
    max-height: 100%;
}

.interConfig > .infoAgents {
    grid-column: 2 / -1;
    grid-row: 3;
    width: 100%;
    height: 100%;
    margin: 0;
    background: rgba(255, 255, 255, 1);
    border-radius: 0.5rem;
    padding: 0.5rem;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05);
    overflow-y: auto;
    overflow-x: hidden;
    max-height: 300px;
    min-width: 0;
    max-width: 100%;
    box-sizing: border-box;
}

.loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    gap: 0.5rem;
}

.interConfig > .infoVehicule {
    grid-column: 2 / -1;
    grid-row: 2;
    width: 100%;
    min-width: 0;
    max-width: 100%;
    min-height: 0;
    max-height: 100%;
    margin: 0;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 1);
    border-radius: 0.5rem;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05);
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}
.infoHeader{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding-bottom: 0.75rem;
}
.infoHeaderLeft{
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
    flex: 1 1 auto;
}
.delayIcon{
    flex: 0 0 auto;
}
.consignesPopover{
    margin: 0.5rem 0 0.75rem 0;
    background: rgba(255,255,255,1);
    border-radius: 0.5rem;
    padding: 0.6rem;
    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    max-height: 160px;
    overflow: auto;
}
.consigneMini{
    padding: 0.4rem 0.5rem;
    border-radius: 0.4rem;
    background: rgba(255,250,250,1);
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.consigneMini + .consigneMini{
    margin-top: 0.5rem;
}
.consigneMiniTitle{
    font-weight: 800;
    font-size: 0.85rem;
    color: #f60700;
    margin-bottom: 0.2rem;
}
.consigneMiniMeta{
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem 0.6rem;
    font-size: 0.75rem;
    color: #555;
    margin-bottom: 0.25rem;
}
.consigneMiniText{
    font-size: 0.85rem;
    color: #1a1a1a;
    line-height: 1.25;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.moyensList{
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-height: 0;
    min-width: 0;
    max-width: 100%;
    flex: 1;
}
.stationCard{
    padding: 0.4rem 0.5rem;
    border-radius: 0.4rem;
    background: rgba(255,255,255,1);
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
    box-sizing: border-box;
}
.stationCard.homeStation{
    background: rgba(255,244,243,1);
    box-shadow: 0 4px 12px rgba(246,7,0,0.12), 0 1px 3px rgba(0,0,0,0.06);
}
.stationCard.homeStationLine{
    width: 100%;
    max-width: 100%;
    min-width: 0;
    overflow: hidden;
}
.stationCard.compactStation{
    flex: 1 1 calc(33.333% - 0.4rem);
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
}
.stationHeader{
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.3rem;
}
.stationCodeChip{
    padding: 0.15rem 0.4rem;
    border-radius: 999px;
    font-size: 0.65rem;
    font-weight: 700;
    color: #666;
    background: #e5e5e5;
    letter-spacing: 0.03em;
    white-space: nowrap;
    flex: 0 0 auto;
}
.stationFull{
    font-size: 0.85rem;
    color: #1a1a1a;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    text-align: left;
}
.stationCard.homeStation .stationFull{
    color: #1a1a1a;
    font-weight: 700;
}
.stationVehicles{
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
    min-width: 0;
    max-width: 100%;
    width: 100%;
    overflow: hidden;
    box-sizing: border-box;
    margin-top: 0.5rem;
    margin-bottom: 0.3rem;
    margin-left: 1rem;
}
.vehicleChip{
    padding: 0.4rem 0.5rem;
    border-radius: 999px;
    font-size: 0.85rem;
    font-weight: 600;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    white-space: nowrap;
    line-height: 1.2;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    box-sizing: border-box;
    flex-shrink: 1;
    min-width: 0;
}
.statusLabel{
    font-size: 0.65rem;
    font-weight: 500;
    opacity: 0.85;
    margin-left: 0.25rem;
}
.otherStationsGrid{
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.4rem;
    min-width: 0;
    max-width: 100%;
}

@media (max-width: 1200px) {
    .otherStationsGrid{
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 800px) {
    .otherStationsGrid{
        grid-template-columns: 1fr;
    }
}
.remainingStationsInfo{
    grid-column: 1 / -1;
    font-size: 0.75rem;
    color: #666;
    font-style: italic;
    padding: 0.3rem 0.5rem;
    text-align: center;
}
.vehicleChip.blink{
    animation: blinkOpacity 2.5s ease-in-out infinite;
}
@keyframes blinkOpacity{
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}
.extServicesInfo{
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.extServicesList{
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
    align-items: center;
}
.serviceChipInline{
    padding: 0.15rem 0.35rem;
    border-radius: 999px;
    font-size: 0.65rem;
    font-weight: 600;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    white-space: nowrap;
    line-height: 1.2;
}
.SSUAP {
    background-color: #1f8d49;
    color: white;
    padding: 0.25rem 0.4rem;
    border-radius: 0.25rem;
    margin-right: 0.4rem;
    font-size: 0.75rem;
}
.INC {
    background-color: #f60700;
    color: white;
    padding: 0.25rem 0.4rem;
    border-radius: 0.25rem;
    margin-right: 0.4rem;
    font-size: 0.75rem;
}
.PPBE {
    background-color: #A558A0;
    color: white;
    padding: 0.25rem 0.4rem;
    border-radius: 0.25rem;
    margin-right: 0.4rem;
    font-size: 0.75rem;
}
.ACC {
    background-color: #C3992A;
    color: white;
    padding: 0.25rem 0.4rem;
    border-radius: 0.25rem;
    margin-right: 0.4rem;
    font-size: 0.75rem;
}
.Div {
    background-color: #009081;
    color: white;
    padding: 0.25rem 0.4rem;
    border-radius: 0.25rem;
    margin-right: 0.4rem;
    font-size: 0.75rem;
}
.matricule{
    color: #666;
    font-size: 0.7rem;
    font-style: italic;
}
.Vurbs {
    background-color: #E4794A;
    color: white;
    padding: 0.25rem 0.4rem;
    border-radius: 0.25rem;
    margin-right: 0.4rem;
    font-size: 0.75rem;
}
.VUrbG {
    background-color: #FF732C;
    color: white;
    padding: 0.25rem 0.4rem;
    border-radius: 0.25rem;
    margin-right: 0.4rem;
    font-size: 0.75rem;
}
.redLabel {
    font-size: 0.9rem;
    font-weight: 700;
    color: #ffffff;
    border-radius: 4px;
    padding: 0.3rem 0.6rem;
    margin-left: 0;
    margin-right: 0.5rem;
    background-color: #f60700;
    box-shadow: 0 2px 8px rgba(246, 7, 0, 0.3), 0 1px 3px rgba(246, 7, 0, 0.2);
    letter-spacing: 0.05em;
}
#interLibelle {
    font-size: 1.8rem;
    margin-left: 0;
    font-weight: 700;
    letter-spacing: 0.02em;
    color: #f60700;
    line-height: 1.2;
}
.infoDetailsRow {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-top: 0.5rem;
}
.infoDetailsRow .infoDetail {
    flex: 1;
    margin-top: 0;
}
.infoDetailsRight {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
}
.infoDetail {
    display: flex;
    justify-content: left;
    align-items: center;
    margin-top: 0;
    margin-left: 0;
    padding: 0.4rem 0.6rem;
    background: rgba(255, 255, 255, 1);
    border-radius: 0.4rem;
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.infoDetail:first-child {
    margin-top: 0;
}
.infoDetail:hover {
    background: rgba(255, 250, 250, 1);
    box-shadow: 0 2px 8px rgba(246, 7, 0, 0.15), 0 1px 3px rgba(246, 7, 0, 0.1);
}
.infoDetail span {
    height: 1rem;
    font-size: 0.9rem;
    margin-right: 0.6rem;
    opacity: 1;
    filter: invert(0%) brightness(0%);
}
.infoDetail span:last-child {
    font-size: 0.9rem;
    font-weight: 500;
    opacity: 1;
    color: #1a1a1a;
    filter: none;
}
.infoVehicule{
    background: rgba(255, 255, 255, 1);
    color: #1a1a1a;
    padding: 0.75rem;
    border-radius: 0.5rem;
    margin: 0;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05);
}
.vehicule{
    display: flex;
    justify-content: left;
    align-items: center;
    margin-top: 0.4rem;
    padding: 0.4rem 0.6rem;
    background: rgba(255, 255, 255, 1);
    border-radius: 0.4rem;
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.vehicule:hover {
    background: rgba(255, 250, 250, 1);
    box-shadow: 0 2px 8px rgba(246, 7, 0, 0.15), 0 1px 3px rgba(246, 7, 0, 0.1);
}
.vehStatut{
    padding: 0.3rem 0.5rem;
    border-radius: 0.35rem;
    margin-right: 0.6rem;
    font-weight: 600;
    font-size: 0.75rem;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}
.vehiculeStatutLib {
    font-size: 0.85rem;
    color: #1a1a1a;
}
.vehiculeHeader{
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    margin-bottom: 0.5rem;
    letter-spacing: 0.05em;
    color: #f60700;
    padding-bottom: 0.4rem;
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.agent {
    display: flex;
    justify-content: left;
    align-items: center;
    padding: 0.3rem 0.5rem;
    width: 100%;
    flex-wrap: wrap;
    background: rgba(255, 255, 255, 1);
    border-radius: 0.35rem;
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
    box-sizing: border-box;
    margin-bottom: 0.3rem;
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.agent:hover {
    background: rgba(255, 250, 250, 1);
    box-shadow: 0 2px 8px rgba(246, 7, 0, 0.15), 0 1px 3px rgba(246, 7, 0, 0.1);
}
.agentGrade {
    margin-right: 0.5rem;
    border-radius: 0.3rem;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}
.agentNom {
    margin-right: 0.5rem;
    font-weight: 500;
    font-size: 0.8rem;
    color: #1a1a1a;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1 1 auto;
}
.agentStatut {
    padding: 0.15rem;
    border-radius: 0.3rem;
    font-size: 0.65rem;
    margin-right: 0.3rem;
    color: #666;
}
.agentStatusDot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-left: 0.3rem;
    flex: 0 0 auto;
}
#agentList {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    row-gap: 0.3rem;
    column-gap: 0.4rem;
    padding-bottom: 0.3rem;
    padding-left: 0;
    z-index: 102;
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
    box-sizing: border-box;
}
.updateInfo {
    color: #666;
    font-size: 0.8rem;
    margin-top: 0.75rem;
    padding-top: 0.5rem;
    border-top: 1px solid rgba(0, 0, 0, 0.08);
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

.delayIcon {
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 1;
    animation: blinkSecondary 2s infinite;
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
