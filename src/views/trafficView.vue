<template>
    <div id="Title">
        <h1>Trafic & Transports</h1>
    </div>
    <div class="interContainer" v-show="asAwait">
        <div>
            <wazeView />
        </div>
    </div>
    <div class="transportation" v-show="asAwait">
        <div class="tcl">
            <div class="logo">
                <img src="../assets/transport/TCL.svg" alt="" width="50px" height="auto">
                Réseau TCL
            </div>
            <div v-if="tcl && tcl.length > 1" class="tcl-info">
                <div v-for="stop in tcl" :key="stop.arrêt" class="stop">
                    <div class="sameRow">
                        <img :src="giveSource(stop.line)" alt="" height="20px" width="auto">
                        <div>
                            {{ stop.arrêt }}
                        </div>
                    </div>
                    <div>
                        <div v-for="bus in stop.buses" :class="giveBusClass(bus.prochainDepart)" :key="bus.direction" class="sameRow2">
                            <div class="bus-direction"><i>{{ bus.direction }}</i></div>
                            <span class="next-departure" :class="giveBlinkClass(bus.prochainDepart)">{{ bus.prochainDepart == 'Fin de service' ? '' : bus.prochainDepart}}</span>
                            <span class="ensuite-departure">{{ bus.ensuiteDepart == 'Fin de service' ? '': bus.ensuiteDepart }}</span>
                        </div>
                    </div>
            </div>
            </div>
        </div>
        <div class="sncf">
            <div class="logo">
                <img src="../assets/transport/SNCF.svg" alt="" width="50px" height="auto">
                Gare de {{ displayInfo3 ? 'Collonges-Fontaines' : 'Lyon Part-Dieu'}}
            </div>
            <div class="sncf-info">
                <div v-for="train in sncf" :key="train.numTrain" class="sameRow3" :style="train.comment == 'parti' ? {opacity: 0.5} : {}" :class="giveClass('container', train.comment)" style="margin-left: 1rem;">
                    <div class="networkLogo">
                        <img :src="giveLogo(train.service)" alt="" width="30px" height="auto">
                    </div>
                    <div class="trainNumber" :class="giveClass('comment', train.comment)">
                        <div v-if="displayInfo1" :class="giveClass('cancelled', train.comment)">{{ train.numTrain }}</div>
                        <div v-else>{{ train.comment }}</div>
                    </div>
                    <div class="trainHour" :class="giveClass('comment', train.comment)">
                        <div v-if="displayInfo1" :class="giveClass('late', train.comment)">{{ train.baseDepart }}</div>
                        <div v-else :class="giveClass('cancelled', train.comment)">{{ train.realDepart }}</div>
                    </div>
                    <div class="trainDirection" :class="giveClass('comment', train.comment)">
                        <template v-if="train === sncf[0]">
                            <div style="display: flex; flex-direction: column;">
                                <div>
                                    <div v-if="train.disruption && !displayInfo2" class="gares_container">
                                        <div class="auto-scroll" style="font-size: 1.1rem;">
                                            {{ train.disruption }}
                                        </div>
                                    </div>
                                    <div v-else :class="giveClass('cancelled', train.comment)" style="font-size: 1.1rem;">
                                        {{ train.destination }}
                                    </div>
                                </div>
                                <div class="gares_container">
                                    <div class="gares">
                                        {{ train.prochainsArrets }}
                                    </div>
                                </div>
                            </div>
                        </template>
                        <template v-else>
                            <div style="display: flex; flex-direction: column;">
                                <div :class="giveClass('cancelled', train.comment)">
                                    {{ train.destination }}
                                </div>
                                <div v-if="train.disruption" class="gares_container">
                                    <div class="auto-scroll" style="font-size: 0.8rem;">
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
</template>
<script setup>
import { onMounted, ref } from 'vue';
import wazeView from '../components/wazeView.vue';
import { useTransportation } from '../store/transportation';
const tcl = ref();
const sncf = ref();
const sncfLYD = ref();
const sncfCol = ref();
const displayInfo1 = ref(true);
const asAwait = ref(false);
const displayInfo2 = ref(false);
const displayInfo3 = ref(false);
const transportation = useTransportation();
onMounted(async () => {
    await transportation.getData();
    tcl.value = transportation.tcl;
    sncfCol.value = transportation.sncf;
    sncf.value = transportation.sncf;
    sncfLYD.value = transportation.sncfLYD;
});
setTimeout(() => {
    asAwait.value = true;
}, 5000);
setInterval( async () => {
    await transportation.getData();
    tcl.value = transportation.tcl;
    sncf.value = transportation.sncf;
    displayInfo2.value = !displayInfo2.value;
}, 15000);
setInterval(() => {
    displayInfo3.value = !displayInfo3.value;
    if (displayInfo3.value) {
        sncf.value = sncfCol.value
    } else {
        sncf.value = sncfLYD.value;
    };
    }, 30000);
setInterval(() => {
    displayInfo1.value = !displayInfo1.value;
}, 3000);

const giveSource = (ligne) => {
    return new URL(`../assets/transport/${ligne}.svg`, import.meta.url).href;
}
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
const giveBusClass = (direction) => {
    if (direction == 'Fin de service' || direction == '-' || direction == 'HS'){
        return 'noData'
    }
    return '';
}
const giveBlinkClass = (prochainDepart) => {
    if (prochainDepart === '1 min' || prochainDepart === '2 min' || prochainDepart === 'Proche'){
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
import ouigo_url from '../assets/transport/TGV.svg';
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
    "TGV": ouigo_url,
    "additional service": sncf_url,
    "SNCF": sncf_url,
}

const giveLogo = (service) => {
    return commercial_modes[service] || sncf_url;
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
    width: 60%;
    position: absolute;
    top: 53%;
    left: 32%;
    transform: translate(-50%, -50%);
    z-index: 3;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1), 0px 6px 20px rgba(0, 0, 0, 0.1);
    border-radius: 30px;
    backdrop-filter: blur(10px) brightness(1);
    background-color: #ffffffe5;
    opacity: 0.9;
    transition: all 3s;
    overflow: hidden;
    animation: hide 20s;
}
.transportation {
    position: absolute;
    top: 53%;
    left: 80%;
    transform: translate(-50%, -50%);
    z-index: 3;
    height: 70%;
    width: 35%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1), 0px 6px 20px rgba(0, 0, 0, 0.1);
    border-radius: 30px;
    backdrop-filter: blur(10px) brightness(1);
    background-color: #ffffffe5;
    opacity: 0.9;
    transition: all 3s;
    overflow: hidden;
    text-align: left;
}

.interContainer > div:first-child {
    z-index: 10;
    width: 100%;
    height: 100%;
    padding: 0;
    scale: 1.2;
    transform: translateY(-10%);
    opacity: 0.8;
    transition: all 3s;
}
.tcl, .sncf {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
    padding: 1rem;
    width: 100%;
    height: 100%;
    color: #666666;
}
.sameRow {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 30px;
    font-weight: bold;
    margin-top: 1rem;
    margin-bottom: 1rem;
}
.sameRow2 {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 30px;
    flex-wrap: wrap;
}
.sameRow:first-child {
    border-bottom: 1px solid #666666;
    padding-bottom: 0.5rem;
}
.sameRow2 > div {
    margin: 0;
    padding: 0;
}
.next-departure, .ensuite-departure {
    width: 20%;
    text-align: center;
}
.next-departure {
    color: red;
}
.ensuite-departure {
    color: #878787;
}
.logo {
    width: 80%;
    margin-bottom: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-transform: uppercase;
    font-weight: bold;
}
.bus-direction {
    width: 40%;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.crossedText {
    text-decoration: line-through;
}
.hardDelayBorder {
    border-left: 2px solid #e74c3c;
    animation: hardDelay 2s infinite ease-in-out;
}
@keyframes hardDelay {
    0% {
        border-left: 2px solid #e74c3c;
    }
    50% {
        border-left: 2px solid #f6080000;
    }
    100% {
        border-left: 2px solid #e74c3c;
    }
}

.delayBorder {
    border-left: 2px solid #fc5d00;
    animation: delay 2s infinite ease-in-out;
}
@keyframes delay {
    0% {
        border-left: 2px solid #fc5d00;
    }
    50% {
        border-left: 2px solid #fc5d0000;
    }
    100% {
        border-left: 2px solid #fc5d00;
    }
}
.goneBorder {
    border-left: 2px solid #3a3a3a;
}
@keyframes gone {
    0% {
        border-left: 2px solid #3a3a3a;
    }
    50% {
        border-left: 2px solid #3a3a3a00;
    }
    100% {
        border-left: 2px solid #3a3a3a;
    }
}
.onTimeBorder {
    border-left: 2px solid #0078f3;
}
@keyframes onTime {
    0% {
        border-left: 2px solid #0078f3;
    }
    50% {
        border-left: 2px solid #0078f300;
    }
    100% {
        border-left: 2px solid #0078f3;
    }
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
    border-left: 2px solid #f60700;
}
.cancelled {
    color: #f60700;
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

.networkLogo {
    width: 5%;
    padding-left: 0.5rem;
}
.trainNumber {
    width: 30%;
}
.trainDirection {
    width: 60%;
    max-width: 60%;
    text-align: left;
    padding-left: 1rem;
    overflow: hidden;
    white-space: nowrap;
}
.trainHour {
    width: 5%;
}
.sameRow3 {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 30px;
    font-weight: bold;
    margin-top: 1rem;
    margin-bottom: 1rem;
    font-weight: normal;
    text-align: center;
}
.sncf-info {
    width: 100%;
    height: 100%;
    padding: 0;
    padding-left: 1rem;
    padding-right: 1rem;
    margin-top: 0;
}
.noData{
    display: none;
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
    animation: scroll 10s ease-in-out infinite;
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
    padding-left: 1rem;
    max-width: 80%;
    overflow: hidden;
    white-space: nowrap;
}
.gares {
    font-size: 0.8em;
    color: #666666;
    overflow: hidden;
    white-space: nowrap;
    width: fit-content;
    animation: scroll 25s linear infinite;
}
.voie {
    width: 5%;
    margin-right: 0.5rem;
    text-align: center;
    font-weight: bold;
    color: #0078f3;
    padding: 0.5rem;
    padding-top: 0.2rem;
    padding-bottom: 0.2rem;
    border-radius: 5px;
    border: 1px solid #0078f3;
}
.voie_empty {
    width: 5%;
    margin-right: 0.5rem;
    text-align: center;
    font-weight: bold;
    color: transparent;
    padding: 0.5rem;
    padding-top: 0.2rem;
    padding-bottom: 0.2rem;
    border-radius: 5px;
    border: 1px solid transparent;
}
</style>