<template>
    <div id="Background">
        <img src="../assets/backgrounds/inter.jpg" alt="Véhicule" style="width: 110vw; height: 110vh;">
    </div>
    <div id="Title">
        <h1>Opérationnel</h1>
    </div>
    <div class="mainContainer" v-if="firstInter">
        <!-- Carte avec l'intervention principale -->
        <div class="card mapCard">
            <mapBox2 
                :lon="Number(firstInter.notificationLon)" 
                :lat="Number(firstInter.notificationLat)"
                :zoom="14"
                :show-marker="true"
                :marker-color="'#f60700'"
                :should-animate="shouldAnimate"
            />
        </div>
        
        <!-- Informations de l'intervention -->
        <div class="card infoCard">
            <div class="infoHeader">
                <div class="numInter">N°{{ firstInter.numeroInter }}</div>
                <span v-if="getRedLabel(firstInter.notificationTitre)" class="DV">{{ getRedLabel(firstInter.notificationTitre) }}</span>
                <div class="interTitle">
                {{ cleanTitle(firstInter.notificationTitre) }}
                </div>
            </div>
            <div class="infoGrid">
                <div class="infoRowHorizontal">
                    <div class="infoItem">
                        <div class="infoIcon">📅</div>
                        <div class="infoContent">
                            <div class="infoLabel">Date & Heure</div>
                            <div class="infoValue">{{ new Date(firstInter.dateTime).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' }) }}</div>
                            <div class="infoSubValue">{{ new Date(firstInter.dateTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }}</div>
                        </div>
                    </div>
                    <div class="infoItem">
                        <div class="infoIcon">🚒</div>
                        <div class="infoContent">
                            <div class="infoLabel">Engins</div>
                            <div class="infoValue">{{ firstInter.notificationEngins }} engin{{ firstInter.notificationEngins > 1 ? 's' : '' }}</div>
                        </div>
                    </div>
                </div>
                <div class="infoItem">
                    <div class="infoIcon">📍</div>
                    <div class="infoContent">
                        <div class="infoLabel">Commune</div>
                        <div class="infoValue capitalize">{{ firstInter.notificationVille }}</div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Interventions récentes -->
        <div class="card recentCard" v-if="FirstInterDisplay && okay">
            <div class="cardHeader">
                <div class="cardTitle">Interventions récentes</div>
            </div>
            <div class="recentList">
                <div :key="FirstInterDisplay.numeroInter" class="recentItem" :class="isSlider(1)">
                    <div class="recentDate">{{ calculateDelta(FirstInterDisplay.dateTime) }}</div>
                    <div class="recentContent">
                        <span class="recentNum">N°{{ FirstInterDisplay.numeroInter }}</span>
                        <span v-if="getRedLabel(FirstInterDisplay.notificationTitre)" class="DV-small">{{ getRedLabel(FirstInterDisplay.notificationTitre) }}</span>
                        <span class="recentTitle">{{ cleanTitle(FirstInterDisplay.notificationTitre) }}</span>
                        <span class="recentCity">{{ FirstInterDisplay.notificationVille }}</span>
                    </div>
                </div>
                <div :key="SecInterDisplay.numeroInter" class="recentItem" :class="isSlider(2)">
                    <div class="recentDate">{{ calculateDelta(SecInterDisplay.dateTime) }}</div>
                    <div class="recentContent">
                        <span class="recentNum">N°{{ SecInterDisplay.numeroInter }}</span>
                        <span v-if="getRedLabel(SecInterDisplay.notificationTitre)" class="DV-small">{{ getRedLabel(SecInterDisplay.notificationTitre) }}</span>
                        <span class="recentTitle">{{ cleanTitle(SecInterDisplay.notificationTitre) }}</span>
                        <span class="recentCity">{{ SecInterDisplay.notificationVille }}</span>
                    </div>
                </div>
                <div :key="ThirdInterDisplay.numeroInter" class="recentItem" :class="isSlider(3)">
                    <div class="recentDate">{{ calculateDelta(ThirdInterDisplay.dateTime) }}</div>
                    <div class="recentContent">
                        <span class="recentNum">N°{{ ThirdInterDisplay.numeroInter }}</span>
                        <span v-if="getRedLabel(ThirdInterDisplay.notificationTitre)" class="DV-small">{{ getRedLabel(ThirdInterDisplay.notificationTitre) }}</span>
                        <span class="recentTitle">{{ cleanTitle(ThirdInterDisplay.notificationTitre) }}</span>
                        <span class="recentCity">{{ ThirdInterDisplay.notificationVille }}</span>
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
.mainContainer {
    display: grid;
    grid-template-columns: 0.8fr 1.2fr;
    grid-template-rows: 1fr 1fr;
    gap: 1rem;
    width: 85%;
    height: 75%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 3;
}
.card {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.85) 100%);
    backdrop-filter: blur(12px) brightness(1.05);
    border-radius: 16px;
    box-shadow: 0px 6px 24px rgba(0, 0, 0, 0.12), 0px 2px 6px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.3);
    padding: 0.8rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    margin-top: 1.5rem;
}
.mapCard {
    grid-column: 1;
    grid-row: 1 / 3;
    padding: 0;
    min-height: 0;
}
.infoCard {
    grid-column: 2;
    grid-row: 1;
    align-self: start;
    height: fit-content;
    min-height: 45%;
}
.recentCard {
    grid-column: 2;
    grid-row: 2;
    align-self: start;
    height: fit-content;
    min-height: 0;
    overflow-y: auto;
    margin-top: 0;
}
.cardHeader {
    margin-bottom: 0.6rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid rgba(246, 7, 0, 0.2);
}
.cardTitle {
    font-size: 0.9em;
    font-weight: 700;
    color: #2c2c2c;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}
.infoHeader {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 0.6rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid rgba(246, 7, 0, 0.2);
}
.numInter {
    font-size: 0.95em;
    font-weight: 700;
    color: #f60700;
}
.interTitle {
    font-size: 1.15em;
    font-weight: 700;
    color: #2c2c2c;
    text-transform: uppercase;
    margin-bottom: 0.5rem;
    line-height: 1.3;
}
.infoGrid {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}
.infoRowHorizontal {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
}
.infoItem {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
}
.infoItem:hover {
    background: rgba(255, 255, 255, 0.8);
    transform: translateX(2px);
}
.infoIcon {
    font-size: 1.1em;
    flex-shrink: 0;
    margin-top: 0.1rem;
}
.infoContent {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
}
.infoLabel {
    font-size: 0.65em;
    color: #666;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}
.infoValue {
    font-size: 0.8em;
    color: #2c2c2c;
    font-weight: 600;
}
.infoSubValue {
    font-size: 0.75em;
    color: #666;
    font-weight: 500;
}
.capitalize {
    text-transform: capitalize;
}
.recentList {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
}
.recentItem {
    padding: 0.8rem;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.5);
    border: 1px solid rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
}
.recentItem.slider {
    background: linear-gradient(135deg, rgba(0, 120, 243, 0.1) 0%, rgba(31, 141, 73, 0.1) 100%);
    border: 2px solid rgba(0, 120, 243, 0.3);
    box-shadow: 0 4px 12px rgba(0, 120, 243, 0.2);
    transform: scale(1.02);
}
.recentDate {
    font-size: 0.7em;
    color: #7b7b7b;
    margin-bottom: 0.4rem;
    font-weight: 500;
}
.recentContent {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.85em;
    color: #2c2c2c;
}
.recentNum {
    font-weight: 700;
    color: #f60700;
}
.recentTitle {
    font-weight: 500;
}
.recentCity {
    color: #666;
    font-style: italic;
}
.DV {
    font-size: 0.7em;
    padding: 0.3rem 0.6rem;
    background-color: transparent;
    color: #f60700;
    border: 2px solid #f60700;
    border-radius: 6px;
    font-weight: 700;
    white-space: nowrap;
}
.DV-small {
    font-size: 0.65rem;
    padding: 0.2rem 0.4rem;
    background-color: transparent;
    color: #7b7b7b;
    border: 1.5px solid #7b7b7b;
    border-radius: 4px;
    font-weight: 700;
    white-space: nowrap;
}
</style>
<script setup>
import { computed, onMounted, ref } from 'vue'
import { useSmartemis } from '../store/smartemis';
import mapBox2 from '../components/mapBox2.vue';

const smartemis = useSmartemis();
const inters = ref([]);
const firstInter = ref(null);
const FirstInterDisplay = ref(null);
const SecInterDisplay = ref(null);
const ThirdInterDisplay = ref(null);
const okay = ref(false);
const shouldAnimate = ref(false);

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
    
    // Déclencher l'animation après que la carte soit prête
    setTimeout(() => {
        shouldAnimate.value = true;
    }, 300);
    //console.log(inters.value);
});


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

const getRedLabel = (title) => {
    if (!title) return '';
    if (title.includes('DF20')) return 'DF20';
    if (title.includes('DFE')) return 'DFE';
    if (title.includes('DFUR')) return 'DFUR';
    if (title.includes('DFU')) return 'DFU';
    if (title.includes('DV') && !title.includes('DF20') && !title.includes('DFE') && !title.includes('DFUR') && !title.includes('DFU')) return 'DV';
    return '';
};

const cleanTitle = (title) => {
    if (!title) return '';
    // Remplacer dans l'ordre : les plus longs d'abord pour éviter les problèmes (DFUR avant DFU)
    return title.replace(/\|/g, '-')
        .replace('DF20', '')
        .replace('DFE', '')
        .replace('DFUR', '')
        .replace('DFU', '')
        .replace('DV', '')
        .trim();
};

</script>