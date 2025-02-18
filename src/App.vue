<template>
  <div class="clock-container">
    <clockComponent />
  </div>
  <div class="popup" v-if="showPopup && !interventionCheck">
    <popupComponent
      :img_url="popupInfo.img_url"
      :msg_part1="popupInfo.msg_part1"
      :msg_part2="popupInfo.msg_part2"
      :msg_part3="popupInfo.msg_part3"
      :color_part3="popupInfo.color_part3"
      :backgroundColor_part3="popupInfo.backgroundColor_part3"
      :persistency="popupPersistency"
      @popupClosed="popupIsClosed()"
    />
  </div>
  <div v-if="initialize" class="appear">
    <div class="loading">
      <div>
        <img src="./assets/logoCollongesModif.png" alt="" width="700px" height="auto" :style="{opacity: 0.2, filter: 'blur(3px)'}">
      </div>
      <div class="flexx">
        <div :style="{color: 'white', fontSize: '3rem'}">Chargement de l'affichage</div>
        <img src="./assets/Rhombus.gif" alt="" width="100px" height="auto" :style="{opacity: 0.8}">
      </div>
    </div>
  </div>
  <div v-if="interventionCheck" id="interView">
    <interView :data="interventionData" />
  </div>
  <div v-if="interventionCheck" class="blurAndShadow"></div>
  <div v-if="interventionCheck" class="logo"><img src="./assets/logoCollongesModif.png" alt="" width="700px" height="auto"></div>   
  <regularBackground />
  <div class="fullView" v-if="!interventionCheck">
    <div v-if="new Date().getHours() >= 21 || new Date().getHours() <= 6">
      <vehiculeViewNight />
    </div>
    <div v-else>
      <TransitionGroup name="cool">
      <div v-show="index == 0 || initialize" key="today">
        <todayView />
      </div>
      <div class="backgroundWeather" v-if="backgroundIf('weather')" v-show="index == 1" key="BckGrndWeather" :style="{width: '720px', height: '480px'}"> 
          <ytbBackGround  VidId="GZJiui6Lj78" />
      </div>
      <div v-show="index == 1 || initialize" key="weather"> 
        <weatherView />
      </div>
      <div v-show="index == 2 || initialize" key="vehicule" :v-if="backgroundIf('vehicule')">
        <vehiculeView />
      </div>
      <div v-show="index == 3 || initialize" key="lastInter">
        <lastInter />
      </div>
      <div class="backgroundTraffic" v-if="backgroundIf('traffic')" v-show="index == 4" key="BckGrndTraffic"> 
          <ytbBackGround  VidId="z545k7Tcb5o" />
      </div>
      <div v-show="index == 4 || initialize" key="traffic">
        <trafficView />
      </div>
      </TransitionGroup>
    </div>
  </div>
</template>
<script setup>
import clockComponent from './components/clockComponent.vue';
import ytbBackGround from './components/ytbBackGround.vue';
import regularBackground from './components/regularBackground.vue';
import popupComponent from './components/popupComponent.vue';
import todayView from './views/todayView.vue';
import trafficView from './views/trafficView.vue';
import interView from './views/interView.vue';
import lastInter from './views/lastInter.vue';
import weatherView from './views/weatherView.vue';
import vehiculeView from './views/vehiculeView.vue';
import vehiculeViewNight from './views/vehiculeViewNight.vue';
import { computed, ref } from 'vue';
import { watchEffect } from 'vue';
import { useWeather } from './store/weather';

import IT from './assets/sounds/IT.wav';
import Dl from './assets/sounds/Dl.wav';
import DM from './assets/sounds/DM.wav';

const weatherStore = useWeather();

const interventionCheck = ref(false);
const interventionData = ref({});
const initialize = ref(true);

const colorMapWeather = {
  "Advisory": '#f1c40f',
  "Watch": '#e67e22',
  "Warning": '#e74c3c',
}
const showPopup = ref(false);
const currentVehicules = ref([]);
const filteredVehicules = computed(() => {
  if (!currentVehicules.value) return [];
  const interStatutsCodes = ["DM", "Dl", "IN"];
  return currentVehicules.value.filter(vehicule => !interStatutsCodes.includes(vehicule.statut));
});
const alertData = ref(null);
const popupInfo = ref({});
const popupList = ref([]);

watchEffect(() => {
  if (!initialize.value) return;
  const checkLoaded = setInterval(() => {
    if (document.readyState === 'complete') {
      clearInterval(checkLoaded);
      setTimeout(() => {
      initialize.value = false;
    }, 2000);
    }
  }, 200);
});



const handleIntervention = (data) => {
  interventionData.value = data;
  interventionCheck.value = true;
};
import { useSmartemis } from './store/smartemis';

const smartemis = useSmartemis();

let regularTimeout = null;

const initializeApp = async () => {
  const now = new Date();
  const minutes = now.getMinutes();
  const reloadTime = minutes > 40 ? 25 * 60 * 1000 : 20 * 60 * 1000;
  regularTimeout = setTimeout(() => {
    window.location.reload();
  }, reloadTime);
  console.log('App initialized, next update in ' + reloadTime / 1000 + ' seconds');
  await new Promise((resolve) => setTimeout(resolve, 5000));
  currentVehicules.value = await smartemis.getStatus();
  alertData.value = await weatherStore.alertWeather();
  filterAndPushPopup();
  if (popupList.value.length > 0){
    popupInfo.value = popupList.value[0];
    showPopup.value = true;
  }
  
}
initializeApp();

const waitForInter = setInterval(async () => {
  const data = await smartemis.getInterventionsList();
  if (data.identifiant === 'Aucune intervention en cours'){
    return;
  }
  handleIntervention({
    lon: parseFloat(data.notificationLon),
    lat: parseFloat(data.notificationLat),
    libelleInter: data.notificationTitre,
    adresseInter: data.notificationAdresse.replace(data.notificationVille, ''),
    villeInter: data.notificationVille,
    typeInter: data.typeInter,
    numeroInter: data.numeroInter,
    enginsInter: data.notificationEngins,
    dateTimeInter: data.dateTime,
  });
  clearInterval(waitForInter);
  clearTimeout(regularTimeout);
  regularTimeout = setTimeout(() => {
    window.location.reload();
  }, 15 * 60 * 1000);
}, 10000);

const index = ref(0);
const views = ref([
  {viewName : 'today',
  time : 30},
  {viewName : 'weather',
  time : 40},
  {viewName : 'vehicule',
  time : 30},
  {viewName : 'lastInter',
  time : 40},
  {viewName : 'traffic',
  time : 45},
]);
const main = async () => {
  while (true){
    await new Promise((resolve) => setTimeout(resolve, views.value[index.value].time * 1000));
    index.value = (index.value + 1) % views.value.length;
    //index.value = 1;
  }
}
main();

const backgroundIf = (viewName) => {
  const currentIndex = views.value.findIndex(view => view.viewName === viewName);
  const previousIndex = (index.value - 1 + views.value.length) % views.value.length;
  const nextIndex = (index.value + 1) % views.value.length;
  return index.value === currentIndex || previousIndex === currentIndex || nextIndex === currentIndex;
}

const popupPersistency = computed(() => {
  return popupList.value && popupList.value.length == 1 && popupList.value[0].type != 'newVehicule';
});

const filterAndPushPopup = () => {
  if (alertData.value.alerteType){
    let findAlerte = popupList.value.find(popup => popup.msg_part1 === alertData.value.alerteType);
    if (!findAlerte) {
      popupList.value.push({
        img_url: './assets/meteo.png',
        msg_part1: alertData.value.alerteType,
        msg_part2: '',
        msg_part3: alertData.value.alerteCouleur,
        color_part3: 'white',
        backgroundColor_part3: colorMapWeather[alertData.value.alerteSeverite],
        type: 'weather'
      });
    }
     popupList.value.push({
       img_url: './assets/meteo.png',
       msg_part1: alertData.alerteCouleur,
       msg_part2: '',
       msg_part3: alertData.icon,
       color_part3: 'white',
       backgroundColor_part3: colorMapWeather[alertData.alerteSeverite],
      type: 'weather'
     });
   };
  if (filteredVehicules.value && filteredVehicules.value.length > 0){
    for (const vehicule of filteredVehicules.value){
      let findVehicule = popupList.value.find(popup => popup.msg_part1 === vehicule.lib);
      if (findVehicule) continue;
      popupList.value.push({
        img_url: `../assets/vehicules/statuts/${vehicule.statut}.png`,
        msg_part1: vehicule.lib,
        msg_part2: '',
        msg_part3: vehicule.statutLib,
        color_part3: vehicule.libColor,
        backgroundColor_part3: vehicule.backgroundColor,
        type: 'vehicule'
      });
    }
  }  
}

setTimeout(() => {setInterval(async () => {
  let newStatus = await smartemis.getStatus();
  let newStatusPopup = [];
  for (const vehicule of currentVehicules.value){
    let previousStatus = vehicule.statut;
    let newVehicule = await newStatus.find(engin => vehicule.lib === engin.lib);
    let newVehiculeStatus = newVehicule.statut;
    if (previousStatus !== newVehiculeStatus){
      console.log('New status detected for', vehicule.lib);
      newStatusPopup.push({
        img_url: giveEnginImg(newVehicule),
        msg_part1: newVehicule.lib,
        msg_part2: 'devient',
        msg_part3: newVehicule.statutLib,
        color_part3: newVehicule.libColor,
        backgroundColor_part3: newVehicule.backgroundColor,
        type: 'newVehicule'
      });
    }
  }
  let audioNotif = new Audio();
  if (newStatusPopup.length > 0){
    showPopup.value = false;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    popupList.value =  newStatusPopup;
    showPopup.value = true;
    popupInfo.value = popupList.value[0];
    console.log('New vehicules status detected', newStatusPopup);
    if (newStatusPopup.some(vehicule => vehicule.msg_part3 === 'Disponible Armé')){
      audioNotif = new Audio(Dl);
    } else if (newStatusPopup.some(vehicule => vehicule.msg_part3 === 'Disponible matériel' || vehicule.msg_part3 === 'Indisponible' || vehicule.msg_part3 === 'Réservé indisponible')){
      audioNotif = new Audio(DM);
    } else {
      audioNotif = new Audio(IT);
    }
    audioNotif.volume = 0.5;
    audioNotif.play();
  }
  currentVehicules.value = newStatus;
}, 15000);}, 30000);

const popupIsClosed = async () => {
  showPopup.value = false;
  await new Promise((resolve) => setTimeout(resolve, 1000));
  popupList.value.shift();
  filterAndPushPopup();
  if (popupList.value.length > 0){
    showPopup.value = true;
    popupInfo.value = popupList.value[0];
  }
}
const giveEnginImg = (engin) => {
    if (engin.statut == 'Dl'){
        if (engin.lib.startsWith('L')){
            return `../assets/vehicules/engins/LOTS.png`
        } else if (engin.lib.includes('MPRGP')){
            return`../assets/vehicules/engins/MPRGP.png`
        } else {
            return `../assets/vehicules/engins/Dl-${engin.lib.split(' ')[0]}.png`
        }
    } else if (engin.statut == "DM"){
        if (engin.lib.startsWith('L')){
            return `../assets/vehicules/engins/LOTS.png`
        } else if (engin.lib.includes('MPRGP')){
            return `../assets/vehicules/engins/MPRGP.png`
        } else {
            return `../assets/vehicules/engins/DM-${engin.lib.split(' ')[0]}.png`
        }
    } else {
        return `../assets/vehicules/statuts/${engin.statut}.png`
    }
}

</script>

<style scoped>
#interView {
  position: absolute;
  top: 0;
  left: 0;
  width: 100dvw;
  height: 100dvh;
  z-index: 100;
  background-color: transparent;
}
.backgroundTraffic {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(2.5);
    width: 100vw;
    height: 100vh;
    background-color: black;
    z-index: -1;
}
.backgroundWeather {
  position: absolute;
  width: 100dvw;
  height: 100dvh;
  background-color: black;
  z-index: -1;
  transform: translate(-82%, -58%) scale(2.5);
}
.blurAndShadow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100dvw;
  height: 100dvh;
  background-color: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 99;
}
.fullView {
  position: absolute;
  top: 0;
  left: 0;
  width: 100dvw;
  height: 100dvh;
  z-index: 1;
  overflow: hidden;
}
.logo{
    position: absolute;
    bottom: 20%;
    right: 0;
    opacity: 0.1;
    z-index: 99;
    filter: blur(3px);
    overflow: hidden;
}
.cool-enter-active, .cool-leave-active {
  transition: opacity 1s;
}
.cool-enter, .cool-leave-to {
  opacity: 0;
}
.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 105;
  width: 100dvw;
  height: 100dvh;
  background-size: 140% 140%;
  background-image: linear-gradient(120deg, #0078f3 0%, #004288 100%);
  animation : loading 2s infinite;
  overflow: hidden;
}
@keyframes loading {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
.loading > div {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.flexx {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
}
.appear{
  transition: all 3s ease-out;
}



</style>
