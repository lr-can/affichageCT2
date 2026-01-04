<template>
  <navigationMenu 
    v-if="!interventionCheck"
    :views="views"
    :current-index="index"
    @view-change="handleViewChange"
  />
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
    <div class="loading" :style="giveBackgroundColor()">
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
    <div v-if="new Date().getHours() >= 23 || new Date().getHours() < 6">
      <vehiculeViewNight :instruction-data="consignesData"/>
    </div>
    <div v-else>
      <TransitionGroup name="cool">
      <div v-show="index == 0 || initialize" key="today">
        <todayView />
      </div>
      <div class="backgroundWeather" v-if="backgroundIf('weather')" v-show="index == 1" key="BckGrndWeather" :style="{width: '720px', height: '480px'}"> 
          <ytbBackGround  VidId="twUVtuuaVFw" />
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
      <div v-show="index == 5 || initialize" key="interEnCours">
        <interEnCours />
      </div>
      <div v-show="index == 6 || initialize" key="weatherWarning">
        <weatherWarning />
      </div>
      <div v-show="(index == 7 || initialize) && consignesData && consignesData.length > 0" key="consignes">
        <consignesView :instruction-data="consignesData" />
      </div>
      <div v-show="(index == 8 || initialize) && pavoisementAndHommage" key="hommage">
        <hommageView :evenement="pavoisementAndHommage" />
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
import navigationMenu from './components/navigationMenu.vue';
import todayView from './views/todayView.vue';
import trafficView from './views/trafficView.vue';
import interView from './views/interView.vue';
import lastInter from './views/lastInter.vue';
import weatherView from './views/weatherView.vue';
import vehiculeView from './views/vehiculeView.vue';
import vehiculeViewNight from './views/vehiculeViewNight.vue';
import weatherWarning from './views/weatherWarning.vue';
import consignesView from './views/consignesView.vue';
import hommageView from './views/hommageView.vue';
import { computed, ref } from 'vue';
import { watchEffect } from 'vue';
import { useWeather } from './store/weather';
import { useSmartemis } from './store/smartemis';
import InterEnCours from './views/interEnCours.vue';
const smartemis = useSmartemis();

import IT from './assets/sounds/IT.wav';
import Dl from './assets/sounds/Dl.wav';
import DM from './assets/sounds/DM.wav';
import RE from './assets/sounds/RE.wav';
import AL from './assets/sounds/AL.mp3';
import lessPeople from './assets/sounds/lessPeople.wav'
import morePeople from './assets/sounds/morePeople.wav';
import consigne from './assets/sounds/consigne.mp3';

const weatherStore = useWeather();

const interventionCheck = ref(false);
const interventionData = ref({});
const initialize = ref(true);
const numberOfMessagesRadio = ref(0);
const isArah = ref(false);

const agentList = ref([]);
const changedAgents = ref([]);
const familles = ref([]);
const consignesData = ref([]);
const pavoisementAndHommage = ref([]);

const colorMapWeather = {
  "Advisory": '#f1c40f',
  "Watch": '#e67e22',
  "Warning": '#e74c3c',
}
const showPopup = ref(false);
const currentVehicules = ref([]);
const filteredVehicules = computed(() => {
  if (!currentVehicules.value) return [];
  const interStatutsCodes = ["DM", "Dl", "IN", "XX"];
  return currentVehicules.value.filter(vehicule => !interStatutsCodes.includes(vehicule.statut));
});
const connectionProblem = computed(() => {
    if (!currentVehicules.value) return [];
  const interStatutsCodes = ["XX"];
  return currentVehicules.value.filter(vehicule => interStatutsCodes.includes(vehicule.statut)).length > 0;
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

const getTTS = async (message) => {
            const options = {
                method: 'POST',
                headers: {
                  accept: 'application/json',
                  'content-type': 'application/json',
                  authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNDBmODkwZTAtZWUwMi00NjgxLTlmNmItMzM2NmZjOGFkNWJlIiwidHlwZSI6ImFwaV90b2tlbiJ9.UJhTZXEbGdRH3FMDzEIBXDKL5yEw3VC-t5lUynA5vCA'
                },
                body: JSON.stringify({
                  response_as_dict: true,
                  attributes_as_list: false,
                  show_original_response: false,
                  rate: 5,
                  pitch: -10,
                  volume: 20,
                  sampling_rate: 0,
                  providers: "amazon/fr-FR_Lea_Standard",
                  language: 'fr',
                  text: message,
                  option: 'FEMALE'
                })
              };
            const response = await fetch('https://api.edenai.run/v2/audio/text_to_speech', options);
            const result = await response.json();
            return new Audio(result['amazon/fr-FR_Lea_Standard'].audio_resource_url);
        }

let regularTimeout = null;

const initializeApp = async () => {
  await smartemis.fetchAllSheetsFromAPI();
  await updateConsignes();
  const now = new Date();
  const minutes = now.getMinutes();
  const reloadTime = minutes > 40 ? 25 * 60 * 1000 : 20 * 60 * 1000;
  isArah.value = await smartemis.isArah();
  regularTimeout = setTimeout(() => {
    window.location.reload();
  }, reloadTime);
  //console.log('App initialized, next update in ' + reloadTime / 1000 + ' seconds');
  await new Promise((resolve) => setTimeout(resolve, 5000));
  currentVehicules.value = await smartemis.getStatus();
  familles.value = await smartemis.getEngins();
  alertData.value = await weatherStore.alertWeather();
  agentList.value = await smartemis.getAvailablePeople();
  pavoisementAndHommage.value = await smartemis.getPavoisementAndHommage();
  filterAndPushPopup();
  if (popupList.value.length > 0){
    popupInfo.value = popupList.value[0];
    showPopup.value = true;
  }
  const details = await smartemis.getInterDetail();
  //console.log('Intervention details:', details);
  if (details){
    if (details.status && !isArah.value){
      views.value = views.value.map(view => {
        if (view.viewName === 'interEnCours') {
          return { ...view, time: 75 };
        }
        return view;
      });
      views.value = views.value.map(view => {
        if (view.viewName === 'lastInter') {
          return { ...view, time: 10 };
        }
        return view;
      });
    }
  }
  if (pavoisementAndHommage.value){
    views.value = views.value.map(view => {
      if (view.viewName === 'hommage') {
        return { ...view, time: 60 };
      }
      return view;
    });
  }
  
}
initializeApp();

const waitForInter = setInterval(async () => {
  await smartemis.fetchAllSheetsFromAPI();
  const data = await smartemis.getInterventionsList();
  if (data.identifiant === 'Aucune intervention en cours'){
    return;
  }
  if (!/^🚧 N°\d+\/1 - /.test(data.notification)) {
    //console.log("Intervention is not first ordre départ.")
    let currentAlerteVehicule = currentVehicules.value.filter(vehicule => vehicule.statut == 'AL' || vehicule.statut == 'RE' || vehicule.statut == 'PP' || vehicule.statut == 'DE');
    if (!currentAlerteVehicule || currentAlerteVehicule.length == 0){
      return;
    }
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
}, 15000);

const index = ref(0);
const isManualMode = ref(false);
const views = ref([
  {viewName : 'today',
  time : 30},
  {viewName : 'weather',
  time : 40},
  {viewName : 'vehicule',
  time : 45},
  {viewName : 'lastInter',
  time : 40},
  {viewName : 'traffic',
  time : 75},
  {viewName : 'interEnCours',
    time: 0},
  {viewName : 'weatherWarning',
    time: 0},
  {viewName : 'consignes',
    time: 0},
  {viewName : 'hommage',
    time: 0},
]);

const handleViewChange = (newIndex) => {
  if (newIndex >= 0 && newIndex < views.value.length) {
    index.value = newIndex;
    isManualMode.value = true;
    // Réactiver le mode automatique après 60 secondes d'inactivité manuelle
    setTimeout(() => {
      isManualMode.value = false;
    }, 60000);
  }
};

const main = async () => {
  while (true){
    if (!isManualMode.value) {
      await new Promise((resolve) => setTimeout(resolve, views.value[index.value].time * 1000));
      let next_index = (index.value + 1) % views.value.length;
      if (views.value[next_index].time === 0) { // if suivant time is 0, skip to next
        next_index = (next_index + 1) % views.value.length;
        if (views.value[next_index.time === 0]){ // if next next time is also 0, skip again
          next_index = (next_index + 1) % views.value.length;
        }
      }
      index.value = next_index;
    } else {
      // En mode manuel, attendre un peu avant de vérifier à nouveau
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    //index.value = 8; // FOR TESTING ONLY
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

const updateConsignes = async () => {
  const consignes = await smartemis.getConsignes();
  consignesData.value = consignes;
  if (consignesData.value && consignesData.value.length > 0){
    views.value = views.value.map(view => {
      if (view.viewName === 'consignes') {
        return { ...view, time: 45 };
      }
      return view;
    });
  } else {
    views.value = views.value.map(view => {
      if (view.viewName === 'consignes') {
        return { ...view, time: 0 };
      }
      return view;
    });
  }
}

const filterAndPushPopup = () => {
  if (alertData.value && alertData.value.alerteType){
    let findAlerte = popupList.value.find(popup => popup.msg_part1 === alertData.value.alerteType);
    if (!findAlerte) {
      popupList.value.push({
        img_url: `../assets/weather/${alertData.value.icon.split(', ')[0]}.svg`,
        msg_part1: alertData.value.alerteType,
        msg_part2: '',
        msg_part3: alertData.value.alerteCouleur,
        color_part3: 'white',
        backgroundColor_part3: colorMapWeather[alertData.value.alerteSeverite],
        type: 'weather'
      });
      if (alertData.value.alerteSeverite && ["Watch", "Warning"].includes(alertData.value.alerteSeverite)){
        views.value = views.value.map(view => {
          if (view.viewName === 'weatherWarning') {
            return { ...view, time: 60 };
          }
          return view;
        });
      }
    }
  }
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
  if (consignesData.value && consignesData.value.length > 0){
    let findConsignes = popupList.value.find(popup => popup.type === 'consignes');
    if (!findConsignes) {
      popupList.value.push({
        img_url: `../assets/smartemis.png`,
        msg_part1: 'Consignes opérationnelles',
        msg_part2: '',
        msg_part3: `${consignesData.value.length} consignes actives`,
        color_part3: 'white',
        backgroundColor_part3: '#fd4a45',
        type: 'consignes',
      });
    }
  }
  if (pavoisementAndHommage.value){
    let findPavoisement = popupList.value.find(popup => popup.type === 'pavoisementAndHommage');
    if (!findPavoisement) {
      popupList.value.push({
        img_url: `../assets/flags/${pavoisementAndHommage.value.evenementDrapeau}.png`,
        msg_part1: pavoisementAndHommage.value.evenementType,
        msg_part2: '',
        msg_part3: pavoisementAndHommage.value.evenementNomCourt,
        color_part3: 'white',
        backgroundColor_part3: '#34495e',
        type: 'pavoisementAndHommage',
      });
    }
  }
  if (connectionProblem.value){
    popupList.value.push({
      img_url: `../assets/vehicules/statuts/XX.png`,
      msg_part1: "Données",
      msg_part2: "L'application fonctionne avec des données limitées",
      msg_part3: "",
      color_part3: "transparent",
      backgroundColor_part3: "transparent",
      type: 'vehicule'
    });
    views.value = views.value.map(view => {
      if (view.viewName === 'vehicule') {
        return { ...view, time: 0 };
      }
      return view;
    });
  } else {
    views.value = views.value.map(view => {
      if (view.viewName === 'vehicule' && view.time === 0) {
        return { ...view, time: 30 };
      }
      return view;
    });
  }
}


setTimeout(() => {setInterval(async () => {
  if (interventionCheck.value) return;
  let newStatus = await smartemis.getStatus();
  familles.value = await smartemis.getEngins();
  let messages = await smartemis.getMessagesRadio();
  isArah.value = await smartemis.isArah();
  let previousConsignes = consignesData.value ? [...consignesData.value] : [];
  await updateConsignes();
  changedAgents.value = await smartemis.getChangedPeople(agentList.value);
  if (isArah.value){
    clearInterval(waitForInter);
    views.value = views.value.map(view => {
        if (
        view.viewName === 'vehicule' ||
        view.viewName === 'interEnCours' ||
        view.viewName === 'interView' ||
          view.viewName === 'lastInter'
        ) {
        return { ...view, time: 0 };
        }
        return view;
      });
  }
  if (messages && messages.length > 0){
        numberOfMessagesRadio.value = messages.length;
        let newMsg = messages.pop();
        if (newMsg && (Date.now() - new Date(newMsg.time)) < 10 * 60 * 1000) {
        await smartemis.sendNotification({
          newEngins: "null",
          newMessage: newMsg.message,
          pharmacie: "null",
        })
        let audio = new Audio("https://github.com/lr-can/affichageCT/raw/refs/heads/main/engChange.mp3");
        audio.play();
      }
    } else if (messages && messages.length < numberOfMessagesRadio.value){
        numberOfMessagesRadio.value = messages.length;
    } else {
        numberOfMessagesRadio.value = 0
    };
  let newStatusPopup = [];
  let newStatusNotif = "";
  for (const vehicule of currentVehicules.value){
    let previousStatus = vehicule.statut;
    let newVehicule = await newStatus.find(engin => vehicule.lib === engin.lib);
    let newVehiculeStatus = newVehicule.statut;
    if (previousStatus !== newVehiculeStatus){
      //console.log('New status detected for', vehicule.lib);
      newStatusPopup.push({
        img_url: giveEnginImg(newVehicule),
        msg_part1: newVehicule.lib,
        msg_part2: 'devient',
        msg_part3: newVehicule.statutLib,
        color_part3: newVehicule.libColor,
        backgroundColor_part3: newVehicule.backgroundColor,
        type: 'newVehicule',
        nomPhonetique: newVehicule.nomPhonetique,
      });
    }
  }
  if (changedAgents.value && changedAgents.value.length > 0 && changedAgents.value.length <= 10){
      for (const agent of changedAgents.value){
        newStatusPopup.push({
          img_url: `../assets/grades/${agent.grade}.png`,
          msg_part1: agent.nom + ' ' + agent.prenom,
          msg_part2: 'passe en',
          msg_part3: agent.status,
          color_part3: agent.statusColor && agent.statusColor.length ? (parseInt(agent.statusColor.replace('#',''),16) > 0x999999 ? '#111' : '#fff') : '#000',
          backgroundColor_part3: "#" + agent.statusColor,
          type: 'newVehicule',
        });
      }
      agentList.value = await smartemis.getAvailablePeople();
      changedAgents.value = [];
  }
  if (previousConsignes.length !== consignesData.value.length){
    if (consignesData.value.length > previousConsignes.length){
      newStatusPopup.push({
        img_url: `../assets/smartemis.png`,
        msg_part1: 'Nouvelle consigne',
        msg_part2: '',
        msg_part3: `${consignesData.value.length} consignes actives`,
        color_part3: 'white',
        backgroundColor_part3: '#fd4a45',
        type: 'consignes',
      });
    }
  }
  if (newStatusPopup.length > 0){
    const statusMap = {};
    for (const vehicule of newStatusPopup) {
        if (!statusMap[vehicule.msg_part3]) {
            statusMap[vehicule.msg_part3] = [];
        }
        if (!statusMap[vehicule.msg_part3].includes(vehicule.msg_part1)){
          statusMap[vehicule.msg_part3].push(vehicule.msg_part1);
        };
  }
    for (const status of Object.keys(statusMap)){
    if (statusMap[status].length > 1){
      const lastVehicule = statusMap[status].pop();
      newStatusNotif += `${statusMap[status].join(', ')} et ${lastVehicule} deviennent ${status} \n`;
      } else {
        newStatusNotif += `${statusMap[status][0]} devient ${status} \n`;
      }
    }
  }
  
  if (newStatusNotif !== ""){
    smartemis.sendNotification({
      newEngins: newStatusNotif,
      newMessage: "null",
      pharmacie: "null"
    })
  }
  let audioNotif = new Audio();
  if (newStatusPopup.length > 0){
    if (isArah.value){
      //console.log('Arah mode, no audio notification');
    } else {
    showPopup.value = false;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    popupList.value =  newStatusPopup;
    showPopup.value = true;
    popupInfo.value = popupList.value[0];
    let audioNotif2 = null;
    //console.log('New vehicules status detected', newStatusPopup);
    if (interventionCheck.value){
      //console.log('Intervention ongoing, no audio notification');
    } else {
      if (newStatusPopup.some(vehicule => vehicule.msg_part3 === 'Retenu')){
      let message = `${newStatusPopup.filter(v => v.msg_part3 === 'Retenu').map(v => v.nomPhonetique).join(' , ')} . Retenu`;
      audioNotif = new Audio(RE);
      audioNotif2 = await getTTS(message);
    } else if (newStatusPopup.some(vehicule => vehicule.msg_part3 === 'Alerte')){
      let message = `${newStatusPopup.filter(v => v.msg_part3 === 'Alerte').map(v => v.nomPhonetique).join(' , ')} . Alerte`;
      audioNotif = new Audio(AL);
      audioNotif2 = await getTTS(message);
    } else if (newStatusPopup.some(vehicule => vehicule.msg_part3 === 'Disponible Armé')){
      audioNotif = new Audio(Dl);
    } else if (newStatusPopup.some(vehicule => vehicule.msg_part3 === 'Disponible matériel' || vehicule.msg_part3 === 'Indisponible' || vehicule.msg_part3 === 'Réservé indisponible')){
      audioNotif = new Audio(DM);
    } else if (newStatusPopup.some(vehicule => vehicule.msg_part3 === 'DP' || vehicule.msg_part3 === 'DIP' || vehicule.msg_part3 === 'AOR' || vehicule.msg_part3 === "AEC")){
      audioNotif = new Audio(morePeople);
    } else if (newStatusPopup.some(vehicule => vehicule.msg_part3 === 'IN' || vehicule.msg_part3 === 'IND')){
      audioNotif = new Audio(lessPeople);
    } else if (newStatusPopup.some(vehicule => vehicule.type === 'consignes')){
      audioNotif = new Audio(consigne);
    } else {
      audioNotif = new Audio(IT);
    }
    audioNotif.volume = 0.5;
    audioNotif.play();
    audioNotif.onended = () => {
      if (audioNotif2){
        audioNotif2.volume = 0.7;
        audioNotif2.play();
  }
    }
  }
    }
  }

  currentVehicules.value = newStatus;
}, 17000);}, 30000);

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
        if (engin.lib.startsWith('L') || engin.lib.includes('MPRGP')){
            const vtutStatut = familles.value.find(famille => famille.engins.some(engin => engin.lib.includes("VTUT") && engin.statut === 'Dl'));
            const vlcdgStatut = familles.value.find(famille => famille.engins.some(engin => engin.lib.includes("VLCDG") && engin.statut === 'Dl'));
            if (vlcdgStatut && engin.lib.includes("LCTHER")){
                return `../assets/vehicules/engins/Dl-${engin.lib.split(' ')[0]}.png`
            } else if (vtutStatut && !engin.lib.includes("LCTHER")){
                return `../assets/vehicules/engins/Dl-${engin.lib.split(' ')[0]}.png`
            }
            return `../assets/vehicules/engins/DM-${engin.lib.split(' ')[0]}.png`
        } else {
            return `../assets/vehicules/engins/Dl-${engin.lib.split(' ')[0]}.png`
        }
    } else if (engin.statut == "DM"){
        if (engin.lib.startsWith('L') || engin.lib.includes('MPRGP')){
            const vtutStatut = familles.value.find(famille => famille.engins.some(engin => engin.lib.includes("VTUT") && engin.statut === 'Dl'));
            const vlcdgStatut = familles.value.find(famille => famille.engins.some(engin => engin.lib.includes("VLCDG") && engin.statut === 'Dl'));
            if (vlcdgStatut && engin.lib.includes("LCTHER")){
                return `../assets/vehicules/engins/Dl-${engin.lib.split(' ')[0]}.png`
            } else if (vtutStatut && !engin.lib.includes("LCTHER")){
                return `../assets/vehicules/engins/Dl-${engin.lib.split(' ')[0]}.png`
            }
            return `../assets/vehicules/engins/DM-${engin.lib.split(' ')[0]}.png`
        } else {
            return `../assets/vehicules/engins/DM-${engin.lib.split(' ')[0]}.png`
        }
    } else {
        return `../assets/vehicules/statuts/${engin.statut}.png`
    }
}
const giveBackgroundColor = () => {
  const gradients = [
    "linear-gradient(120deg, #0078f3 0%, #0063cb 100%)",
    "linear-gradient(120deg, #1f8d49 0%, #18753c 100%)",
    "linear-gradient(120deg, #d64d00 0%, #b34000 100%)",
    "linear-gradient(120deg, #f60700 0%, #ce0500 100%)",
    "linear-gradient(120deg, #009081 0%, #37635f 100%)",
    "linear-gradient(120deg, #A558A0 0%, #6E445A 100%)",
    "linear-gradient(120deg, #C08C65 0%, #845d48 100%)",
  ];

  return {
    backgroundImage: gradients[Math.floor(Math.random() * gradients.length)]
  };
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
