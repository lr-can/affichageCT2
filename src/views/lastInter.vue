<template>
     <div id="Background">
        <img src="../assets/backgrounds/inter.jpg" alt="Véhicule" style="width: 110vw; height: 110vh;">
    </div>
    <div>
        <div id="Title">
            <h1>Opérationnel</h1>
        </div>
        <div class="interContainer" v-if="firstInter">
            <div>
                <img :src="giveLink()" alt="" srcset="">
            </div>
            <div class="Hundred">
                <div class="interInfo">
                    <div class="numInter" :style="{color: '#f60700', marginTop: '1.5rem'}">Intervention n°{{ firstInter.numeroInter }}</div> 
                    <div class="interTitle" :style="{fontSize : '1.7em', fontWeight : 'bold', color: '#f60700'}">
                       <span v-if="firstInter.notificationTitre.includes('DF20')" class="DV">DF20</span>
                       <span v-if="firstInter.notificationTitre.includes('DFE')" class="DV">DFE</span>
                        <span v-if="firstInter.notificationTitre.includes('DV')" class="DV">DV</span>
                        <span :style="['DF20', 'DFE', 'DV'].some(r => firstInter.notificationTitre.includes(r)) ? { marginLeft: '1rem' } : {}">{{ firstInter.notificationTitre.replace(/\|/g, '-').replace("DF20", "").replace("DV", "").replace("DFE", "").trim() }}</span>
                    </div>
                    <div>
                        Le <span class="bold">{{ new Date(firstInter.dateTime).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' }) }}</span> à <span class="bold">{{ new Date(firstInter.dateTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }}</span>
                    </div>
                    <div>
                        Sur la commune de <span class="bold capitalize">{{ firstInter.notificationVille }}</span>
                    </div>
                    <div>
                        Avec <span class="bold">{{ firstInter.notificationEngins }} engin{{ firstInter.notificationEngins > 1 ? 's' : '' }} engagé{{ firstInter.notificationEngins > 1 ? 's' : '' }}</span>
                    </div>
                </div>
                <div class="interInfo" v-if="FirstInterDisplay && okay">
                    <div>
                        <div class="bold" :style="{fontWeight: 'bold'}">Interventions récentes</div>
                    </div>
                    <div :key="FirstInterDisplay.numeroInter" class="displayInfo" :class="isSlider(1)">
                        <div class="date">{{ calculateDelta(FirstInterDisplay.dateTime) }}</div>
                        <div>N°{{ FirstInterDisplay.numeroInter }} - </div> 
                        <div>  {{ FirstInterDisplay.notificationTitre.replace(/\|/g, '-')  }} à </div>
                        <div> {{ FirstInterDisplay.notificationVille }}</div>
                    </div>
                    <div :key="SecInterDisplay.numeroInter" class="displayInfo" :class="isSlider(2)">
                        <div class="date"> {{ calculateDelta(SecInterDisplay.dateTime) }}</div>
                        <div>N°{{ SecInterDisplay.numeroInter }} - </div> 
                        <div>  {{ SecInterDisplay.notificationTitre.replace(/\|/g, '-')  }} à </div>
                        <div> {{ SecInterDisplay.notificationVille }}</div>
                    </div>
                    <div :key="ThirdInterDisplay.numeroInter" class="displayInfo" :class="isSlider(3)">
                        <div class="date"> {{ calculateDelta(ThirdInterDisplay.dateTime) }}</div>
                        <div>N°{{ ThirdInterDisplay.numeroInter }} - </div> 
                        <div>  {{ ThirdInterDisplay.notificationTitre.replace(/\|/g, '-')  }} à </div>
                        <div> {{ ThirdInterDisplay.notificationVille }}</div>
                    </div>
                </div>
                
            </div>
        </div>
    </div>
</template>
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
.interContainer {
    display: flex;
    align-items: center;
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
    background-color: #ffffffe5;
    overflow: hidden;
}
.interContainer > div:first-child {
    z-index: 4;
}
.Hundred {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    text-align: left;
    flex-direction: column;
}
.Hundred > div {
    padding-left: 3rem;
    padding-top: 1rem;
}
.interInfo {
    display: flex;
    align-items: flex-start;
    text-align: left;
    width: 100%;
    padding: 0.5rem;
    flex-direction: column;
    z-index: 3;
}
.interInfo:first-child {
    background-color: #ffffff76;
    margin-left: 0;
    padding-left: 3rem;
    padding-bottom: 1rem;
}
.interInfo > div {
    text-align: left;
    width: 100%;
    font-size: 1rem;
    padding: 0.3rem;
    color: #7b7b7b;
}

.numInter {
    padding: 0.2rem 0.5rem;
    border-bottom: 1px solid #f60700;
    margin-right: 0.5rem;
    width: fit-content;
    max-width: fit-content;
    padding: 0.2rem 0.5rem;
    font-size: 1.1rem;

}
.interTitle {
    font-size: 1.5em;
    margin-top: 0.5rem;
    font-weight: bold;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    text-align: left;
}
.bold{
    font-size: 1.3rem;
    color: #3a3a3a;
}
.capitalize {
    text-transform: capitalize;
}
.displayInfo {
    display: flex;
    align-items: center;
    text-align: left;
    padding: 0.5rem;
    padding-right: 1rem;
    flex-direction: row;
    width: fit-content;
    max-width: fit-content;
    transition: all 0.5s ease-in-out;
    margin-top: 0.7rem;
    flex-wrap: wrap;
}
.displayInfo > div {
    margin-left: 0.5rem;
    transition: all 0.5s ease-in-out;
}
.slider {
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1), 0px 6px 20px rgba(0, 0, 0, 0.1);
    padding: 1rem;
    border-radius: 10px;
    transition: all 0.5s ease-in-out;
}
.slider > div {
    font-size: 1.1rem;
    background: linear-gradient(to right bottom, #0078f3, #1f8d49);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    transition: all 0.5s ease-in-out;   
}
.date {
    font-size: 0.8rem;
    color: #7b7b7b;
    flex-basis: 100%;
}
.DV{
    font-size: 0.8rem;
    padding: 0.5rem;
    padding-left: 0.8rem;
    padding-right: 0.8rem;
    background-color: transparent;
    color: #f60700;
    border: 1px solid #f60700;
    border-radius: 3px;
}
</style>
<script setup>
import { computed, onMounted, ref } from 'vue'
import { useSmartemis } from '../store/smartemis';

const smartemis = useSmartemis();
const inters = ref([]);
const firstInter = ref(null);
const FirstInterDisplay = ref(null);
const SecInterDisplay = ref(null);
const ThirdInterDisplay = ref(null);
const okay = ref(false);

onMounted(async () => {
    const data = await smartemis.getInterNoFilter();
    const data2 = await data.sort((a, b) => b.numeroInter - a.numeroInter);
    const data3 = await data2.filter((inter, index, self) =>
        index === self.findIndex((t) => t.numeroInter === inter.numeroInter)
    );
    firstInter.value = data3[0];
    inters.value = data3;
    FirstInterDisplay.value = firstInter.value;
    SecInterDisplay.value = inters.value[1];
    ThirdInterDisplay.value = inters.value[2];
    setInterval(updateIntersDisplay, 5000);
    okay.value = true;
    console.log(inters.value);
});

const giveLink = () => {
    return `https://maps.geoapify.com/v1/staticmap?style=osm-liberty&width=350&height=800&center=lonlat:${firstInter.value.notificationLon},${firstInter.value.notificationLat}&zoom=14&marker=lonlat:${firstInter.value.notificationLon},${firstInter.value.notificationLat};type:circle;color:%23ff0000;size:x-large;icon:sos;icontype:material;iconsize:small;strokecolor:%23ff0000&scaleFactor=1&apiKey=75c6e5ac06e84d3a95473195e7af529d`;
};

let currentIndex = ref(0);

const isSlider = (index) => {
    return (currentIndex.value % inters.value.length) % 4 === index -1 ? 'slider' : '';
}

const updateIntersDisplay = () => {
    currentIndex.value = (currentIndex.value + 1) % inters.value.length;
    if (currentIndex.value % 4 == 0) {
        FirstInterDisplay.value = inters.value[(currentIndex.value) % inters.value.length];
        SecInterDisplay.value = inters.value[(currentIndex.value + 1) % inters.value.length];
        ThirdInterDisplay.value = inters.value[(currentIndex.value + 2) % inters.value.length];
    }
};

const calculateDelta = (dateTime) => {
    const delta = new Date() - new Date(dateTime);
    const minutes = Math.floor(delta / 60000);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dayBeforeYesterday = new Date();
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);

    if (new Date(dateTime).toDateString() === yesterday.toDateString()) {
        return 'Hier';
    }
    if (new Date(dateTime).toDateString() === dayBeforeYesterday.toDateString()) {
        return 'Avant-hier';
    }

    if (minutes < 60) {
        return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''} environ`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `Il y a ${hours} heure${hours > 1 ? 's' : ''} environ`;
    }
    const days = Math.floor(hours / 24);
    return `Il y a ${days} jour${days > 1 ? 's' : ''} environ`;
};

</script>