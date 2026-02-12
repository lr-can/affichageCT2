<template>
    <div id="Title">
        <h1>Trafic & Transports</h1>
    </div>
    <div class="interContainer" v-show="asAwait">
        <div>
            <wazeView />
        </div>
    </div>
    <div class="grid-layout" v-show="asAwait">
        <!-- Ligne du haut : TCL -->
        <div class="top-row">
            <!-- TCL - Haut à droite -->
            <div class="grid-item tcl-container">
            <div class="section-header">
                <img src="../assets/transport/TCL.svg" alt="" width="32px" height="auto">
                <h2>Réseau TCL</h2>
            </div>
            <div v-if="tcl && tcl.length > 0" class="tcl-info">
                <div v-for="stop in validTCLStops" :key="`${stop.arret}-${stop.ligne}`" class="stop-card">
                    <div class="stop-header">
                        <img v-if="stop.ligne" :src="giveSource(stop.ligne)" :alt="`Ligne ${stop.ligne}`" class="line-icon">
                        <div class="stop-name">{{ stop.arret || 'Arrêt inconnu' }}</div>
                    </div>
                    <div v-if="stop.buses && stop.buses.length > 0" class="buses-list">
                        <div v-for="bus in stop.buses" :key="`${bus.gid || bus.direction}-${bus.prochainDepart}-${bus.ensuiteDepart}`"
                             :class="[giveBusClass(bus.prochainDepart), { 'bus-hors-service': isBusHorsService(bus) }]" 
                             class="bus-item">
                            <div class="bus-direction"><i>{{ bus.direction || 'Direction inconnue' }}</i></div>
                            <span v-if="!isBusHorsService(bus)" class="next-departure" :class="giveBlinkClass(bus.prochainDepart)">
                                {{ formatDepartureTime(bus.prochainDepart) }}
                            </span>
                            <span v-else class="next-departure hs-message">HS</span>
                            <span v-if="!isBusHorsService(bus)" class="ensuite-departure">{{ formatDepartureTime(bus.ensuiteDepart) }}</span>
                            <span v-else class="ensuite-departure hs-message">HS</span>
                        </div>
                    </div>
                    <div v-else class="no-departure-message">
                        <p>Pas de départ dans l'heure à cet arrêt</p>
                    </div>
                </div>
            </div>
            <div v-else-if="tcl && tcl.length === 0" class="tcl-info">
                <div class="no-data-message">
                    <p>Aucune donnée TCL disponible</p>
                </div>
            </div>
        </div>
        </div>

        <!-- Ligne du bas : SNCF Part-Dieu et Collonges -->
        <div class="bottom-row">
            <!-- SNCF Part-Dieu - Bas à gauche -->
            <div class="grid-item sncf-container">
            <div class="section-header">
                <img src="../assets/transport/SNCF.svg" alt="" width="32px" height="auto">
                <h2 class="station-name">
                    <span class="station-indicator partdieu"></span>
                    Gare de Lyon Part-Dieu
                </h2>
            </div>
            <div class="sncf-info">
                <div v-for="train in sncfLYD" :key="train.numTrain" 
                     class="train-card" 
                     :style="train.comment == 'parti' ? {opacity: 0.5} : {}" 
                     :class="giveClass('container', train.comment)">
                    <div class="networkLogo">
                        <img :src="giveLogo(train.service)" alt="" width="24px" height="auto">
                    </div>
                    <div class="trainNumber" :class="giveClass('comment', train.comment)">
                        <div v-if="displayInfo1" :class="giveClass('cancelled', train.comment)">{{ train.numTrain }}</div>
                        <div v-else>{{ train.comment }}</div>
                    </div>
                    <div class="trainHour" :class="giveClass('comment', train.comment)">
                        <div v-if="displayInfo1" :class="giveClass('late', train.comment)">{{ train.baseDepart }}</div>
                        <div v-else :class="giveClass('cancelled', train.comment)">{{ train.realDepart }}</div>
                    </div>
                    <div class="trainDirection train-text" :class="giveClass('comment', train.comment)">
                        <template v-if="train === sncfLYD[0]">
                            <div class="train-destination-wrapper">
                                <div class="destination-main">
                                    <div v-if="train.disruption && !displayInfo2" class="gares_container">
                                        <div class="auto-scroll train-disruption" :style="{ animationDuration: getScrollDuration(train.disruption) }">
                                            {{ train.disruption }}
                                        </div>
                                    </div>
                                    <div v-else :class="giveClass('cancelled', train.comment)" class="train-destination">
                                        {{ train.destination }}
                                    </div>
                                </div>
                                <div class="gares_container">
                                    <div class="gares" :style="{ animationDuration: getScrollDuration(train.prochainsArrets) }">
                                        {{ train.prochainsArrets }}
                                    </div>
                                </div>
                            </div>
                        </template>
                        <template v-else>
                            <div class="train-destination-wrapper">
                                <div :class="giveClass('cancelled', train.comment)" class="train-destination">
                                    {{ train.destination }}
                                </div>
                                <div v-if="train.disruption" class="gares_container">
                                    <div class="auto-scroll train-disruption" :style="{ animationDuration: getScrollDuration(train.disruption) }">
                                        {{ train.disruption }}
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>
                    <div v-if="train.voie && train.voie !== ''" class="voie">
                        {{ train.voie }}
                    </div>
                    <div v-else class="voie_empty">
                        X
                    </div>
                </div>
            </div>
            </div>

            <!-- SNCF Collonges - Bas à droite -->
            <div class="grid-item sncf-container">
            <div class="section-header">
                <img src="../assets/transport/SNCF.svg" alt="" width="32px" height="auto">
                <h2 class="station-name">
                    <span class="station-indicator collonges"></span>
                    Gare de Collonges-Fontaines
                </h2>
            </div>
            <div class="sncf-info">
                <div v-for="train in sncfCol" :key="train.numTrain" 
                     class="train-card" 
                     :style="train.comment == 'parti' ? {opacity: 0.5} : {}" 
                     :class="giveClass('container', train.comment)">
                    <div class="networkLogo">
                        <img :src="giveLogo(train.service)" alt="" width="24px" height="auto">
                    </div>
                    <div class="trainNumber" :class="giveClass('comment', train.comment)">
                        <div v-if="displayInfo1" :class="giveClass('cancelled', train.comment)">{{ train.numTrain }}</div>
                        <div v-else>{{ train.comment }}</div>
                    </div>
                    <div class="trainHour" :class="giveClass('comment', train.comment)">
                        <div v-if="displayInfo1" :class="giveClass('late', train.comment)">{{ train.baseDepart }}</div>
                        <div v-else :class="giveClass('cancelled', train.comment)">{{ train.realDepart }}</div>
                    </div>
                    <div class="trainDirection train-text" :class="giveClass('comment', train.comment)">
                        <template v-if="train === sncfCol[0]">
                            <div class="train-destination-wrapper">
                                <div class="destination-main">
                                    <div v-if="train.disruption && !displayInfo2" class="gares_container">
                                        <div class="auto-scroll train-disruption" :style="{ animationDuration: getScrollDuration(train.disruption) }">
                                            {{ train.disruption }}
                                        </div>
                                    </div>
                                    <div v-else :class="giveClass('cancelled', train.comment)" class="train-destination">
                                        {{ train.destination }}
                                    </div>
                                </div>
                                <div class="gares_container">
                                    <div class="gares" :style="{ animationDuration: getScrollDuration(train.prochainsArrets) }">
                                        {{ train.prochainsArrets }}
                                    </div>
                                </div>
                            </div>
                        </template>
                        <template v-else>
                            <div class="train-destination-wrapper">
                                <div :class="giveClass('cancelled', train.comment)" class="train-destination">
                                    {{ train.destination }}
                                </div>
                                <div v-if="train.disruption" class="gares_container">
                                    <div class="auto-scroll train-disruption" :style="{ animationDuration: getScrollDuration(train.disruption) }">
                                        {{ train.disruption }}
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>
                    <div v-if="train.voie && train.voie !== ''" class="voie">
                        {{ train.voie }}
                    </div>
                    <div v-else class="voie_empty">
                        X
                    </div>
                </div>
            </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { onMounted, ref, computed } from 'vue';
import wazeView from '../components/wazeView.vue';
import { useTransportation } from '../store/transportation';
const tcl = ref();
const sncf = ref();
const sncfLYD = ref();
const sncfCol = ref();
const displayInfo1 = ref(true);
const asAwait = ref(false);
const displayInfo2 = ref(false);
const transportation = useTransportation();
const lineAssets = import.meta.glob('../assets/transport/*.svg', {
    eager: true,
    import: 'default',
});
onMounted(async () => {
    await transportation.fetchAllSheetsFromAPI();
    tcl.value = transportation.tcl;
    console.log(tcl.value);
    sncfCol.value = transportation.sncf;
    sncfLYD.value = transportation.sncfLYD;
});
setTimeout(() => {
    asAwait.value = true;
}, 5000);
setInterval( async () => {
    await transportation.fetchAllSheetsFromAPI();
    tcl.value = transportation.tcl;
    sncfCol.value = transportation.sncf;
    sncfLYD.value = transportation.sncfLYD;
    displayInfo2.value = !displayInfo2.value;
}, 15000);
setInterval(() => {
    displayInfo1.value = !displayInfo1.value;
}, 3000);

const giveSource = (ligne) => {
    const normalizedLine = ligne ? String(ligne).trim() : '';
    if (normalizedLine === '') return lineAssets['../assets/transport/TCL.svg'];
    return lineAssets[`../assets/transport/${normalizedLine}.svg`] || lineAssets['../assets/transport/TCL.svg'];
};
const giveClass = (type, comment) => {
    if (type === 'container') {
        if (comment.includes(' h ')) {
            return 'hardDelayBorder';
        } else if (comment.includes('min')) {
            return 'delayBorder';
        } else if (comment === 'parti') {
            return 'goneBorder';
        } else if (comment === 'supprimé'){
            return 'cancelledBorder';
        } else {
            return 'onTimeBorder';
        }
    } else if (type === 'comment') {
        if (comment.includes(' h ')) {
            return 'hardDelay';
        } else if (comment.includes('min')) {
            return 'delay';
        } else if (comment === 'parti') {
            return 'gone';
        } else if (comment === 'supprimé') {
            return 'cancelled';
        } else {
            return '';
        }
    } else if (type === 'cancelled') {
        return comment === 'supprimé' ? 'crossedText' : '';
    } else if (type === 'late') {
        return comment.includes('retard') || comment.includes('supprimé') ? 'crossedText' : '';
    }
}
// Filtre les arrêts valides (avec nom d'arrêt)
const validTCLStops = computed(() => {
    if (!tcl.value || !Array.isArray(tcl.value)) return [];
    return tcl.value.filter(
        (stop) => stop && stop.arret && stop.arret.trim() !== '' && Array.isArray(stop.buses) && stop.buses.length > 0
    );
});

// Vérifie si un bus est hors service (HS)
const isBusHorsService = (bus) => {
    if (!bus) return true;
    const hsValues = ['HS', 'Fin de service', '-', '', null, undefined];
    const prochainIsHS = !bus.prochainDepart || hsValues.includes(bus.prochainDepart);
    const ensuiteIsHS = !bus.ensuiteDepart || hsValues.includes(bus.ensuiteDepart);
    return prochainIsHS && ensuiteIsHS;
};

// Formate l'heure de départ (gère les cas spéciaux)
const formatDepartureTime = (time) => {
    if (!time) return '';
    const noDataValues = ['Fin de service', '-', 'HS', 'Pas de départ dans l\'heure à cet arrêt'];
    if (noDataValues.includes(time)) return '';
    return time;
};

const giveBusClass = (prochainDepart) => {
    if (!prochainDepart) return '';
    const noDataValues = ['Fin de service', '-', 'HS', 'Pas de départ dans l\'heure à cet arrêt'];
    if (noDataValues.includes(prochainDepart)) {
        return '';
    }
    return '';
}
const giveBlinkClass = (prochainDepart) => {
    if (!prochainDepart) return '';
    if (prochainDepart === '0 min' || prochainDepart === '1 min' || prochainDepart === '2 min' || prochainDepart === 'Proche'){
        return 'blinkTime';
    }
    return '';
}

import ter_url from '../assets/transport/TER.svg';
import lyria_url from '../assets/transport/LYRIA.svg';
import intercite_url from '../assets/transport/INTERCITE.svg';
import db_url from '../assets/transport/DB.svg';
import inoui_url from '../assets/transport/INOUI.svg';
import ouigo_url from '../assets/transport/OUIGO.svg';
import tgv_url from '../assets/transport/TGV.svg';
import sncf_url from "../assets/transport/SNCF.svg";

const commercial_modes = {
    "DB SNCF": db_url,
    "Rémi": ter_url,
    "REGIONAURA": ter_url,
    "MOBIGO": ter_url,
    "Intercités": intercite_url,
    "TER": ter_url,
    "TGV LYRIA": lyria_url,
    "TGV INOUI": inoui_url,
    "OUIGO": ouigo_url,
    "TGV": tgv_url,
    "additional service": sncf_url,
    "SNCF": sncf_url,
}

const giveLogo = (service) => {
    return commercial_modes[service] || sncf_url;
}

// Calcule la durée de défilement basée sur la longueur du texte
const getScrollDuration = (text) => {
    if (!text || typeof text !== 'string') return '15s';
    const length = text.length;
    // Durée minimale : 8s, maximale : 40s
    // Facteur : environ 0.15s par caractère
    const duration = Math.max(8, Math.min(40, length * 0.15));
    return `${duration}s`;
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
.interContainer {
    display: flex;
    align-items: center;
    height: 70%;
    width: 40%;
    position: absolute;
    top: 53%;
    left: 32%;
    transform: translate(-60%, -47.5%);
    z-index: 10;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1), 0px 6px 20px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    backdrop-filter: blur(10px) brightness(1);
    background-color: #ffffffe5;
    opacity: 0.9;
    transition: all 3s;
    overflow: hidden;
    animation: hide 20s;
}

.interContainer > div:first-child {
    z-index: 10;
    width: 100%;
    height: 100%;
    padding: 0;
    scale: 1;
    transform: translateY(-20%);
    opacity: 0.8;
    transition: all 3s;
}

.grid-layout {
    position: absolute;
    top: 10%;
    left: 50%;
    right: 2%;
    bottom: 2%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    z-index: 3;
}

.top-row {
    display: flex;
    gap: 1rem;
    flex: 0 0 auto;
    height: 40%;
}

.bottom-row {
    display: flex;
    gap: 1rem;
    flex: 0 0 auto;
    height: 48.5%;
    min-height: 0;
}

.grid-item {
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1), 0px 2px 6px rgba(0, 0, 0, 0.08);
    border-radius: 12px;
    backdrop-filter: blur(12px) brightness(1);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%);
    opacity: 0.95;
    transition: all 3s;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.3);
    padding: 0.6rem;
    display: flex;
    flex-direction: column;
}

.tcl-container {
    flex: 1;
    min-width: 0;
}

.sncf-container {
    flex: 1;
    min-width: 0;
}

.section-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    padding-bottom: 0.4rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.section-header h2 {
    margin: 0;
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.2px;
    color: #1a1a1a;
    display: flex;
    align-items: center;
    gap: 0.4rem;
}

.station-name {
    position: relative;
}

.station-indicator {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 0.4rem;
    animation: pulse 2s ease-in-out infinite;
}

.station-indicator.collonges {
    background-color: #4a90e2;
    box-shadow: 0 0 8px rgba(74, 144, 226, 0.6);
}

.station-indicator.partdieu {
    background-color: #e74c3c;
    box-shadow: 0 0 8px rgba(231, 76, 60, 0.6);
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
        transform: scale(1);
    }
    50% {
        opacity: 0.7;
        transform: scale(1.1);
    }
}

.stop-card {
    background: rgba(255, 255, 255, 0.6);
    border-radius: 7px;
    padding: 0.35rem;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    min-height: 0;
}

.stop-card:hover {
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
}

.stop-header {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-weight: 600;
    margin-bottom: 0.2rem;
    padding-bottom: 0.25rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    font-size: 0.62rem;
    color: #1a1a1a;
}

.line-icon {
    height: 14px;
    width: auto;
    flex-shrink: 0;
}

.stop-name {
    flex: 1;
    font-size: 0.62rem;
    line-height: 1.1;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.buses-list {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
}

.bus-item {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    align-items: center;
    gap: 0.3rem;
    padding: 0.2rem 0.25rem;
    background: rgba(0, 0, 0, 0.02);
    border-radius: 5px;
    transition: all 0.2s ease;
}

.bus-item:hover {
    background: rgba(0, 0, 0, 0.03);
}

.next-departure, .ensuite-departure {
    min-width: 34px;
    text-align: center;
    font-weight: 600;
    font-size: 0.6rem;
}

.next-departure {
    color: #e74c3c;
}

.ensuite-departure {
    color: #878787;
    font-size: 0.56rem;
}

.bus-direction {
    flex: 1;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.6rem;
    color: #333;
}
.crossedText {
    text-decoration: line-through;
}
.hardDelayBorder {
    border-left: 3px solid #e74c3c;
    animation: hardDelay 2s infinite ease-in-out;
    background: linear-gradient(90deg, rgba(231, 76, 60, 0.05) 0%, transparent 100%);
}

@keyframes hardDelay {
    0% {
        border-left: 3px solid #e74c3c;
    }
    50% {
        border-left: 3px solid rgba(231, 76, 60, 0.3);
    }
    100% {
        border-left: 3px solid #e74c3c;
    }
}

.delayBorder {
    border-left: 3px solid #fc5d00;
    animation: delay 2s infinite ease-in-out;
    background: linear-gradient(90deg, rgba(252, 93, 0, 0.05) 0%, transparent 100%);
}

@keyframes delay {
    0% {
        border-left: 3px solid #fc5d00;
    }
    50% {
        border-left: 3px solid rgba(252, 93, 0, 0.3);
    }
    100% {
        border-left: 3px solid #fc5d00;
    }
}

.goneBorder {
    border-left: 3px solid #3a3a3a;
    background: linear-gradient(90deg, rgba(58, 58, 58, 0.05) 0%, transparent 100%);
}

.onTimeBorder {
    border-left: 3px solid #0078f3;
    background: linear-gradient(90deg, rgba(0, 120, 243, 0.05) 0%, transparent 100%);
}
.hardDelay {
    color: #e74c3c;
}

.delay {
    color: #fc5d00;
}

.gone {
    color: #3a3a3a;
}

.onTime {
    color: #0078f3;
}

.cancelledBorder {
    border-left: 3px solid #f60700;
}

.cancelled {
    color: #f60700;
}

/* Uniformisation des couleurs pour les disruptions et destinations */
.train-text .auto-scroll,
.train-text .train-disruption,
.train-text .train-destination {
    color: #333 !important;
}

.train-text.hardDelay .train-destination,
.train-text.delay .train-destination,
.train-text.cancelled .train-destination {
    color: #333 !important;
}

/* Les disruptions gardent la couleur du texte principal */
.gares_container .auto-scroll {
    color: #333 !important;
}
@keyframes cancelled {
    0% {
        border-left: 2px solid #f60700;
    }
    50% {
        border-left: 2px solid #f6070000;
    }
    100% {
        border-left: 2px solid #f60700;
    }
    
}

.train-card {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    margin-bottom: 0.4rem;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    position: relative;
}

.train-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateX(4px);
}

.networkLogo {
    flex-shrink: 0;
    width: 28px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.trainNumber {
    min-width: 55px;
    max-width: 55px;
    font-weight: 600;
    font-size: 0.7rem;
}

.trainDirection {
    flex: 1;
    text-align: left;
    padding-left: 0.4rem;
    overflow: hidden;
    min-width: 0;
}

.train-text {
    color: #333 !important;
}

.train-destination-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    width: 100%;
}

.train-destination {
    font-size: 0.75rem;
    font-weight: 500;
    color: #333 !important;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.train-disruption {
    font-size: 0.7rem;
    color: #333 !important;
    font-weight: 500;
}

.trainHour {
    min-width: 40px;
    text-align: center;
    font-weight: 600;
    font-size: 0.7rem;
}

.sncf-info {
    width: 100%;
    flex: 1;
    overflow-y: auto;
    padding: 0;
    margin-top: 0;
    padding-right: 0.4rem;
    min-height: 0;
}
.noData{
    display: none;
}

.bus-hors-service {
    opacity: 0.6;
}

.hs-message {
    color: #878787;
    font-style: italic;
    font-size: 0.65rem;
}
.blinkTime {
    animation: blink2 2s infinite ease-in-out;
}
@keyframes blink2 {
    0% {
        opacity: 1;
    }
    50% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}
.auto-scroll {
    overflow: hidden;
    white-space: nowrap;
    width: fit-content;
    animation: scroll ease-in-out infinite;
    color: #333 !important;
}

@keyframes scroll {
    from {
        transform: translateX(100%);
    }
    to {
        transform: translateX(-100%);
    }
}

.gares_container {
    padding-left: 0.4rem;
    max-width: 100%;
    overflow: hidden;
    white-space: nowrap;
    margin-top: 0.2rem;
}

.gares {
    font-size: 0.65rem;
    color: #666 !important;
    overflow: hidden;
    white-space: nowrap;
    width: fit-content;
    animation: scroll linear infinite;
    font-weight: 400;
}
.voie {
    flex-shrink: 0;
    min-width: 10px;
    text-align: center;
    font-weight: 700;
    color: #0078f3;
    padding: 0.25rem 0.4rem;
    border-radius: 5px;
    border: 2px solid #0078f3;
    background: rgba(0, 120, 243, 0.1);
    font-size: 0.65rem;
}

.voie_empty {
    flex-shrink: 0;
    min-width: 10px;
    text-align: center;
    font-weight: bold;
    color: transparent;
    padding: 0.25rem 0.4rem;
    border-radius: 5px;
    border: 2px solid transparent;
}

.no-departure-message,
.no-data-message {
    padding: 0.75rem;
    margin: 0.5rem 0;
    text-align: center;
    color: #878787;
    font-style: italic;
    background: rgba(0, 0, 0, 0.03);
    border-radius: 8px;
    border: 1px dashed rgba(135, 135, 135, 0.25);
    transition: all 0.3s ease;
}

.no-departure-message:hover,
.no-data-message:hover {
    background: rgba(0, 0, 0, 0.05);
    border-color: rgba(135, 135, 135, 0.4);
}

.no-departure-message p,
.no-data-message p {
    margin: 0;
    font-size: 0.7rem;
}

.tcl-container,
.sncf-container {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
}

.tcl-info {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    grid-auto-rows: min-content;
    gap: 0.35rem;
    align-content: start;
    overflow-y: auto;
    padding-right: 0.25rem;
    min-height: 0;
}

.tcl-info::-webkit-scrollbar,
.sncf-info::-webkit-scrollbar {
    width: 5px;
}

.tcl-info::-webkit-scrollbar-track,
.sncf-info::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 10px;
}

.tcl-info::-webkit-scrollbar-thumb,
.sncf-info::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
}

.tcl-info::-webkit-scrollbar-thumb:hover,
.sncf-info::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
}
</style>