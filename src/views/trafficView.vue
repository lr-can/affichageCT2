<template>
    <div id="Title">
        <h1>Trafic & Transports en commun</h1>
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
                        <div v-for="bus in stop.buses" :class="giveBusClass(bus.direction)" :key="bus.direction" class="sameRow2">
                            <div class="bus-direction"><i>{{ bus.direction }}</i></div>
                            <span class="next-departure" :class="giveBlinkClass(bus.prochainDepart)">{{ bus.prochainDepart }}</span>
                            <span class="ensuite-departure">{{ bus.ensuiteDepart }}</span>
                        </div>
                    </div>
            </div>
            </div>
        </div>
        <div class="sncf">
            <div class="logo">
                <img src="../assets/transport/SNCF.svg" alt="" width="50px" height="auto">
                Gare de Collonges - Fontaines
            </div>
            <div class="sncf-info">
                <div v-for="train in sncf" :key="train.numTrain" class="sameRow3" :class="giveClass('container', train.comment)">
                    <div class="networkLogo">
                        <img src="../assets/transport/TER.svg" alt="" width="30px" height="auto">
                    </div>
                    <div class="trainNumber"><span v-show="displayInfo1">{{ train.numTrain }}</span><span v-show="!displayInfo1" :class="giveClass('comment', train.comment)">{{ train.comment }}</span></div>
                    <div class="trainHour"><span v-show="displayInfo1" :class="giveClass('late', train.comment)">{{ train.baseDepart }}</span><span v-show="!displayInfo1" :class="giveClass('comment', train.comment)">{{ train.realDepart }}</span></div>
                    <div class="trainDirection">{{ train.destination }}</div>
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
const displayInfo1 = ref(true);
const asAwait = ref(false);
const transportation = useTransportation();
onMounted(async () => {
    await transportation.getData();
    tcl.value = transportation.tcl;
    sncf.value = transportation.sncf;
});
setTimeout(() => {
    asAwait.value = true;
}, 5000);
setInterval( async () => {
    await transportation.getData();
    tcl.value = transportation.tcl;
    sncf.value = transportation.sncf;
}, 15000);
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
        } else {
            return '';
        }
    } else if (type === 'late') {
        return comment.includes('retard') ? 'crossedText' : '';
    }
}
const giveBusClass = (direction) => {
    if (direction == 'Fin de service'){
        return 'noData'
    }
    return '';
}
const giveBlinkClass = (prochainDepart) => {
    if (prochainDepart === '1 min' || prochainDepart === '2 min'){
        return blinkTime;
    }
    return '';
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
    animation: hide 20s;
    text-align: left;
}
@keyframes hide {
    0% {
        opacity: 0.9;
    }
    49% {
        opacity: 0.9;
    }
    50% {
        opacity: 0.1;
    }
    99% {
        opacity: 0.1;
    }
    100% {
        opacity: 0.9;
    }
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
    border-left: 2px solid #f60700;
    animation: hardDelay 3s infinite ease-in-out;
}
@keyframes hardDelay {
    0% {
        border-left: 2px solid #f60700;
    }
    50% {
        border-left: 2px solid #f6080000;
    }
    100% {
        border-left: 2px solid #ff0000;
    }
}

.delayBorder {
    border-left: 2px solid #fc5d00;
    animation: delay 3s infinite ease-in-out;
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
    animation: gone 3s infinite ease-in-out;
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
    animation: onTime 3s infinite ease-in-out;
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
    color: #f60700;
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
.networkLogo {
    width: 5%;
    padding-left: 0.5rem;
}
.trainNumber {
    width: 30%;
}
.trainDirection {
    width: 60%;
    text-align: left;
    padding-left: 1rem;
    overflow: hidden;
    text-overflow: ellipsis;
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
    visibility: hidden;
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
</style>