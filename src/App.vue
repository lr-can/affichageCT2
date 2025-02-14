<template>
  <div class="clock-container">
    <clockComponent />
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
      <div class="backgroundWeather" v-if="backgroundIf('weather')" v-show="index == 1" key="BckGrndWeather"> 
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
      <div class="backgroundWeather" v-if="backgroundIf('traffic')" v-show="index == 4" key="BckGrndTraffic"> 
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
import todayView from './views/todayView.vue';
import trafficView from './views/trafficView.vue';
import interView from './views/interView.vue';
import lastInter from './views/lastInter.vue';
import weatherView from './views/weatherView.vue';
import vehiculeView from './views/vehiculeView.vue';
import vehiculeViewNight from './views/vehiculeViewNight.vue';
import { ref } from 'vue';
import { watchEffect } from 'vue';

const interventionCheck = ref(false);
const interventionData = ref({});
const initialize = ref(true);

watchEffect(() => {
  if (!initialize.value) return;
  const checkLoaded = setInterval(() => {
    if (document.readyState === 'complete') {
      initialize.value = false;
      clearInterval(checkLoaded);
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

const initializeApp = () => {
  const now = new Date();
  const minutes = now.getMinutes();
  const reloadTime = minutes > 40 ? 25 * 60 * 1000 : 20 * 60 * 1000;
  regularTimeout = setTimeout(() => {
    window.location.reload();
  }, reloadTime);
  console.log('App initialized, next update in ' + reloadTime / 1000 + ' seconds');
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
    //index.value = 4;
  }
}
main();

const backgroundIf = (viewName) => {
  const currentIndex = views.value.findIndex(view => view.viewName === viewName);
  const previousIndex = (index.value - 1 + views.value.length) % views.value.length;
  const nextIndex = (index.value + 1) % views.value.length;
  return index.value === currentIndex || previousIndex === currentIndex || nextIndex === currentIndex;
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
.backgroundWeather {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: black;
    z-index: -1;
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
  background-image: linear-gradient(120deg, #0078f3 0%, #0063cb 100%);
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
