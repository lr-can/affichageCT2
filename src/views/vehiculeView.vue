<template>
    <div id="Background">
        <img src="../assets/backgrounds/CTA.jpg" alt="Véhicule" style="width: 110vw; height: 110vh;">
    </div>
    <div>
        <div id="Title">
            <h1>Synoptique des engins</h1>
        </div>
        <div class="agents" :style="{ backgroundColor: giveBackground(agents.available), color: giveForeground(agents.available) }" v-if="agents">
            <span :style="{fontSize : '2rem', fontWeight : 'bold'}">🧑‍🚒{{ agents.available }}</span> / {{ agents.total }}
        </div>
        <div class="vehiculeContainer" v-if="familles.length > 0 && giveNumberOfEngin() < numberOfEngins + 5">
            <div class="famille" v-for="famille in familles" :key="famille.famEngCod">
                <div class="familleTitle">
                    {{ famille.famEngLib }}
                </div>
                <div class="engins">
                    <div class="animation" v-for="engin in famille.engins" :key="engin.engCod">
                        <div class="enginContainer">
                            <div class="enginTitle" :style="{ backgroundColor: engin.backgroundColor, color: engin.libColor, borderBottom: `1px solid ${colorConvert(engin.libColor)}` }">
                                {{ engin.lib }}
                            </div>
                            <div class="img">
                                <img :src="giveEnginImg(engin)" alt="engin" style="height: 60px; width: auto;">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="vehiculeContainer" v-else style="display: flex; justify-content: center; align-items: center; flex-direction: column;">
            <div style="margin-top: 1rem"><img src="../assets/vehiculeLoader.gif" alt="" width="150px" height="auto"></div>
            <div style="margin-top: 1rem; color: black; font-size: 1.5rem;">Chargement des engins...</div>
        </div>
        <div class="info">
            <p> Mise à jour : Il y a {{ timeElapsed }} environ.</p>
        </div>
    </div>
</template>
<script setup>
import { onMounted, ref } from 'vue';
import { useSmartemis } from '../store/smartemis';

const smartemis = useSmartemis();
const familles = ref([]);
const miseAJour = ref();
const timeElapsed = ref();
const agents = ref();
const numberOfEngins = ref(0);

onMounted(async () => {
    familles.value = await smartemis.getEngins();
    for (let i = 0; i < familles.value.length; i++){
        for (let j = 0; j < familles.value[i].engins.length; j++){
            numberOfEngins.value += 1;
        }
    }
    console.log("Found" + numberOfEngins.value + "engins");
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
        familles.value = await smartemis.getEngins();
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
.vehiculeContainer {
    color: white;
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    margin-top: 100px;
    width: 85%;
    height: 65%;
    padding: 1rem;
    border-radius: 30px;
    background-color: #ffffffe7;
    backdrop-filter: blur(10px);
    z-index: 3;
}
.enginContainer {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 20px;
    margin-top: 20px;
    padding: 1rem;
    width: 100%;
}
.agents {
    position: absolute;
    top: 1.2rem;
    right: 2.5rem;
    z-index: 4;
    color: black;
    font-size: 1rem;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1), 0px 6px 20px rgba(0, 0, 0, 0.1);
    background-color: #ffffff2a;
    backdrop-filter: blur(10px);
    padding: 1rem;
    border-radius: 1rem;
}
.famille{
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1), 0px 6px 20px rgba(0, 0, 0, 0.1);
    opacity: 0;
    border-radius: 1rem;
    animation: slideIn 0.5s ease-out forwards;
    min-width: 20%;
}
@keyframes slideIn {
    from {
        transform: translateX(-20%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
.famille:nth-child(1){
    animation-delay: 0.1s;
}
.famille:nth-child(2){
    animation-delay: 0.2s;
}
.famille:nth-child(3){
    animation-delay: 0.3s;
}
.famille:nth-child(4){
    animation-delay: 0.4s;
}
.famille:nth-child(5){
    animation-delay: 0.5s;
}
.famille:nth-child(6){
    animation-delay: 0.6s;
}
.famille:last-child {
    flex-basis: 100%;
}
.famille .engins {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    padding-left: 0.7rem;
    padding-right: 0.7rem;
    margin-left: 0.7rem;
    margin-right: 0.7rem;
}
.animation{
    opacity: 0;
    animation: slideIn 0.5s ease-out forwards;
}
.animation:nth-child(1){
    animation-delay: 0.5s;
}
.animation:nth-child(2){
    animation-delay: 0.6s;
}
.animation:nth-child(3){
    animation-delay: 0.7s;
}
.animation:nth-child(4){
    animation-delay: 0.8s;
}
.animation:nth-child(5){
    animation-delay: 0.9s;
}
.animation:nth-child(6){
    animation-delay: 1s;
}
.animation:nth-child(7){
    animation-delay: 1.1s;
}
.animation:nth-child(8){
    animation-delay: 1.2s;
}
.animation:nth-child(9){
    animation-delay: 1.3s;
}
.animation:nth-child(10){
    animation-delay: 1.4;
}
.animation:nth-child(11){
    animation-delay: 1.5s;
}
.animation:nth-child(12){
    animation-delay: 1.6s;
}
.enginTitle{
    border-radius: 1rem;
    padding: 0.3rem;
    padding-left: 0.7rem;
    padding-right: 0.7rem;
    min-width: 4rem;
}
.familleTitle {
    text-align: left;
    color: #666666;
    border-bottom: 1px solid #666666;
    padding: 0.5rem;
}
.info{
    position: absolute;
    bottom: 1.2rem;
    left: 2.5rem;
    z-index: 4;
    color: white;
    font-size: 0.8rem;
}
</style>
