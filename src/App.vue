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
    <div class="backgroundWeather" v-if="!switchC" key="weatherBckGrnd"> 
        <weatherBckGrnd />
    </div>
    <div v-show="!switchC" key="weather"> 
      <weatherView />
    </div>
    <div v-show="switchC" key="vehicule">
      <vehiculeView />
    </div>
    </TransitionGroup>
  </div>
</template>
<script setup>
import clockComponent from './components/clockComponent.vue';
import weatherBckGrnd from './components/weatherBckGrnd.vue';
import regularBackground from './components/regularBackground.vue';
import interView from './views/interView.vue';
import weatherView from './views/weatherView.vue';
import vehiculeView from './views/vehiculeView.vue';
import { ref } from 'vue';

const interventionCheck = ref(false);
const interventionData = ref({});
const switchC = ref(false);

setInterval(() => {
  switchC.value = !switchC.value;
}, 15000);



const handleIntervention = (data) => {
  interventionData.value = data;
  interventionCheck.value = true;
};
import { useSmartemis } from './store/smartemis';

const smartemis = useSmartemis();

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
}, 10000);

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
  transition: opacity 0.5s;
}
.cool-enter, .cool-leave-to {
  opacity: 0;
}

</style>
