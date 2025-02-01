<template>
  <div class="clock-container">
    <clockComponent />
  </div>
  <div v-if="interventionCheck" id="interView">
    <interView :data="interventionData" />
  </div>
  <div v-if="interventionCheck" class="blurAndShadow"></div>
  <div v-if="interventionCheck" class="logo"><img src="./assets/logoCollongesModif.png" alt="" width="700px" height="auto"></div>   
  <regularBackground />
  <div class="fullView">
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
    <div v-show="index == 2 || initialize" key="vehicule">
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
import { ref } from 'vue';

const interventionCheck = ref(false);
const interventionData = ref({});
const initialize = ref(true);

setTimeout(() => {
  initialize.value = false;
}, 10000);



const handleIntervention = (data) => {
  interventionData.value = data;
  interventionCheck.value = true;
};
import { useSmartemis } from './store/smartemis';

const smartemis = useSmartemis();

let regularTimeout = null;

const initialize = () => {
  const now = new Date();
  const minutes = now.getMinutes();
  const reloadTime = minutes > 40 ? 25 * 60 * 1000 : 20 * 60 * 1000;
  regularTimeout = setTimeout(() => {
    window.location.reload();
  }, reloadTime);
}
initialize();

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
  time : 20},
  {viewName : 'weather',
  time : 20},
  {viewName : 'vehicule',
  time : 30},
  {viewName : 'lastInter',
  time : 30},
  {viewName : 'traffic',
  time : 20},
]);
const main = async () => {
  while (true){
    await new Promise((resolve) => setTimeout(resolve, views.value[index.value].time * 1000));
    index.value = (index.value + 1) % views.value.length;
    //index.value = 0;
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

</style>
