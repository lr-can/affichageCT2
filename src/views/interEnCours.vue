<template>
    <div class="dashboard">
      <!-- Background Blur -->
      <div class="dashboard__background"></div>
  
      <!-- Header -->
      <header class="dashboard__header" v-if="clear">
        <div class="dashboard__header-content">
          <h1 class="dashboard__title">Intervention n°{{ numInter }}</h1>
          <p class="dashboard__subtitle" v-if="isFinished">✅ Terminée</p>
          <p class="dashboard__subtitle" v-if="!isFinished">🚨 Depuis {{ dureeInter }}</p>
        </div>
      </header>
  
      <!-- Main Content -->
      <main class="dashboard__content" v-if="clear">
        <!-- Notification Info -->
        <section class="card card--info">
          <h3 class="card__title" :style="{ textTransform: 'uppercase', whiteSpace: 'pre-wrap', fontSize: '1.1rem' }">{{ firstInter.notificationTitre }}</h3>
          <div class="left-align" :style="{textAlign: 'left'}">
          <p class="card__meta">
            <img class="icon-address" src="../assets/icons/address.svg"  style="height: 1.5rem; width: auto ; text-transform: uppercase; margin-right: 0.75rem;" />
            <span> {{ firstInter.notificationVille }}</span>
          </p>
        </div>
        </section>

        <!-- Stations & Vehicles -->
        <section class="card card--stations custom2" v-if="dataInter.details?.length">
            <div class="custom1" :class="{ 'compact-view': dataInter.details.length > 4 }">
          <h2 class="card__title">Véhicules</h2>
          <div class="stations" :class="{ 'stations-compact': dataInter.details.length > 4 }">
            <article
              v-for="st in dataInter.details"
              :key="st.stationId"
              class="station"
              :class="{ 'station-compact': dataInter.details.length > 4 }"
            >
              <h3 class="station__name" :class="{ 'station__name-compact': dataInter.details.length > 4 }" :style="{display: 'flex', flexDirection: dataInter.details.length > 4 ? 'row' : 'column', textAlign: 'left', gap: '0.2rem', alignItems: dataInter.details.length > 4 ? 'center' : 'flex-start'}">
                <span :style="{display: 'block', fontSize: dataInter.details.length > 4 ? '0.65rem' : '0.7rem', color: '#a7a7a7', lineHeight: '1', marginRight: dataInter.details.length > 4 ? '0.5rem' : '0'}">{{ st.stationName }}</span>
                <span v-if="dataInter.details.length <= 4" :style="{fontSize: '0.9rem', lineHeight: '1', marginBottom: '0.3rem'}">
                  {{ st.stationFullName.length > 30 ? st.stationFullName.substring(0, 20) + '...' : st.stationFullName }}
                </span>
              </h3>
              <div class="vehicles" :class="{ 'vehicles-compact': dataInter.details.length > 4 }" :style="{ fontSize: getVehicleFontSize(st.vehicles?.length || 0) }">
                <span
                  v-for="v in st.vehicles"
                  :key="v.id"
                  class="chip"
                  :class="{ 'chip-compact': dataInter.details.length > 4 }"
                  :style="{ backgroundColor: v.backgroundColor, color: v.textColor }"
                >
                  {{ v.name }}
                </span>
              </div>
            </article>
          </div>
        </div>
        </section>

        <section class="card card--stations custom2 fifty" v-if="!dataInter.details?.length">
            <div class="custom1">
            <h2 class="card__title">Véhicules</h2>
            <p :style="{color: '#666', fontStyle: 'italic'}">Aucun véhicule engagé</p>
            </div>
        </section>
  
        <!-- External Services -->
        <section class="card card--services" v-if="dataInter.externalServices?.length">
          <h2 class="card__title">Services externes</h2>
          <div class="services">
            <span
              v-for="svc in dataInter.externalServices"
              :key="svc.id"
              class="chip"
              :style="{ backgroundColor: svc.backgroundColor, color: svc.textColor }"
            >
              {{ svc.name || svc.id }}
            </span>
          </div>
        </section>

        <section class="card card--services fifty" v-if="!dataInter.externalServices?.length">
            <h2 class="card__title">Services externes</h2>
            <p :style="{color: '#666', fontStyle: 'italic'}">Aucun service externe engagé</p>
        </section>

        <section class="card card--messages custom3" v-if="dataInter.details?.length">
            <img :src="img_url()" style="height: 150px; width: 150px; border-radius: 8px;" />
        </section>

        
        <!-- Agents -->
        <section class="card card--agents" v-if="dataInter.agents?.length">
          <h2 class="card__title">Agents engagés</h2>
          <div class="agents">
            <div
              v-for="agent in dataInter.agents"
              :key="agent.matricule"
              class="agent"
              :style="{ borderBottom: '2px solid '+ agent.colorBgFul, backgroundColor: 'white' }"
            >
              <img :src="giveAgentGrade(agent.grade)" :alt="agent.grade" class="agent__icon" />
              <p class="agent__name">{{ agent.nom }} {{ agent.prenom }}</p>
            </div>
          </div>
        </section>
        <section class="card card--agents fifty" v-if="!dataInter.agents?.length">
            <h2 class="card__title">Agents engagés</h2>
            <p :style="{color: '#666', fontStyle: 'italic'}">Aucun agent engagé</p>
        </section>

        <section class="card custom2" style="border: none; box-shadow: none;"></section>
  
        <!-- Messages Carousel -->
        <section class="card card--messages" v-if="dataInter.messages?.length">
          <h2 class="card__title">Messages</h2>
          <div class="message-slider">
            <Transition name="message" mode="out-in">
              <div 
                v-if="currentMsg !== null" 
                :key="currentMsg"
                class="message"
              >
                <time class="message__time">Il y a {{ calculateDuree(new Date(dataInter.messages[currentMsg].time)) }}</time>
                <p class="message__content">{{ dataInter.messages[currentMsg].message }}</p>
              </div>
            </Transition>
            <div class="dots" v-if="dataInter.messages.length > 1">
              <span
                v-for="(_, idx) in dataInter.messages"
                :key="idx"
                class="dot"
                :class="{ 'dot--active': idx === currentMsg }"
              ></span>
            </div>
          </div>
        </section>
        <section class="card card--messages fifty" v-if="!dataInter.messages?.length">
            <h2 class="card__title">Messages</h2>
            <p :style="{color: '#666', fontStyle: 'italic'}">Aucun message</p>
        </section>

                        <!-- Map -->
        <section class="card card--map custom2" v-if="firstInter">
          <mapBox2 
                :lon="Number(firstInter.notificationLon)" 
                :lat="Number(firstInter.notificationLat)"
                :zoom="14"
                :show-marker="true"
                :marker-color="'#f60700'"
                :should-animate="shouldAnimate"
            />
        </section>

      </main>
      <div class="updateTime">Mise à jour il y a {{ dureeMaJ }}</div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed, watch, Transition } from 'vue';
  import { useSmartemis } from '../store/smartemis';
  import mapBox2 from '../components/mapBox2.vue';
  
  const smartemis = useSmartemis();
  const clear = ref(false);
  const firstInter = ref({});
  const numInter = ref(0);
  const dureeInter = ref('');
  const dataInter = ref({ externalServices: [], details: [], agents: [], messages: [] });
  const currentMsg = ref(0);
  const isFinished = ref(false);
  const lengthMessages = ref(0);
  const shouldAnimate = ref(false);
  const lastMessageCount = ref(0);
  const messageAudioPlayed = ref(new Set());
  
  // Audio pour les nouveaux messages
  import introNotif from '../assets/sounds/introNotif.mp3';
  const newMessageAudio = new Audio(introNotif);
  
  // Fonction pour calculer la taille de police en fonction du nombre d'engins
  const getVehicleFontSize = (vehicleCount) => {
    if (vehicleCount <= 3) return '0.8rem';
    if (vehicleCount <= 6) return '0.75rem';
    if (vehicleCount <= 10) return '0.7rem';
    return '0.65rem';
  };
  
  onMounted(async () => {
    const raw = await smartemis.getInterNoFilter();
    const sorted = raw.sort((a, b) => b.numeroInter - a.numeroInter);
    const unique = sorted.filter((v,i,a) => a.findIndex(t => t.numeroInter===v.numeroInter)==i);
    firstInter.value = unique[0]||{};
    numInter.value = firstInter.value.numeroInter||0;
  
    await updateData();
    updateDuration();
    lastMessageCount.value = dataInter.value.messages?.length || 0;
    setInterval(() => { updateDuration(); updateData(); }, 30000);
    setInterval(() => { cycleMsg(); updateDuree()}, 10000);
    clear.value = true;

        // Déclencher l'animation après que la carte soit prête
    setTimeout(() => {
        shouldAnimate.value = true;
    }, 300);
  });
  
  // Watch pour détecter les nouveaux messages
  watch(() => dataInter.value.messages?.length, (newLength, oldLength) => {
    if (newLength > oldLength && newLength > 0) {
      // Nouveau message détecté
      const newMessages = dataInter.value.messages.slice(oldLength);
      newMessages.forEach((msg, index) => {
        const messageId = `${msg.time}-${msg.message}`;
        if (!messageAudioPlayed.value.has(messageId) && newMessageAudio) {
          messageAudioPlayed.value.add(messageId);
          // Jouer le son une seule fois avec un petit délai pour éviter les doublons
          setTimeout(() => {
            if (newMessageAudio) {
              newMessageAudio.currentTime = 0;
            }
          }, index * 100);
        }
      });
    }
  });
  
  async function updateData() {
    const details = await smartemis.getInterDetail();
    if(details) dataInter.value = details;
    engins_Collonges_all.value = await smartemis.getStatus();
    const intervention_status = Object.keys(statusOrder);
    const enginsInIntervention = engins_Collonges_all.value.filter(engin => intervention_status.includes(engin.statut));
    isFinished.value = enginsInIntervention.length === 0 ? true : false;
    const vehicule_collonges = dataInter.value.details.filter(station => station.stationName === 'COLLONGE')[0]?.vehicles || [];
    vehicule_collonges.forEach(vehicule => {
      const matchingEngin = engins_Collonges_all.value.find(engin => engin.lib === vehicule.name);
      if (matchingEngin && matchingEngin.statut != vehicule.status) {
        vehicule.status = matchingEngin.statut;
        vehicule.backgroundColor = status_color[vehicule.status]?.backgroundColor || 'white';
        vehicule.textColor = status_color[vehicule.status]?.textColor || 'black';
      }
    });
  }
  
  function updateDuration() {
    const interDetails = dataInter.value.details.filter(inter => inter.numeroInter === firstInter.value.numeroInter);
    let start = new Date(firstInter.value.dateTime);
    if (interDetails.length > 0) {
      const earliestInter = interDetails.reduce((earliest, current) => {
        const currentDate = new Date(current.dateTime);
        return currentDate < new Date(earliest.dateTime) ? current : earliest;
      });
      start = new Date(earliestInter.dateTime);
    }
    const diff = Date.now() - start;
    const m = Math.floor(diff / 60000);
    const h = Math.floor(m / 60);
    const min = String(m % 60).padStart(2,'0');
    dureeInter.value = h<1?`${min} min`:`${h} h ${min} min`;
  }
  
  function cycleMsg() {
    if(dataInter.value.messages.length>1) {
      currentMsg.value = (currentMsg.value+1) % dataInter.value.messages.length;
    }
  }

  // Grades icons import
  import Sap2CL from '../assets/grades/Sap 2CL.png';
  import Sap1CL from '../assets/grades/Sap 1CL.png';
  import Caporal from '../assets/grades/Caporal.png';
  import CaporalChef from '../assets/grades/Caporal-Chef.png';
  import Sergent from '../assets/grades/Sergent.png';
  import SergentChef from '../assets/grades/Sergent-Chef.png';
  import Adjudant from '../assets/grades/Adjudant.png';
  import AdjudantChef from '../assets/grades/Adjudant-Chef.png';
  import Lieutenant from '../assets/grades/Lieutenant.png';
  import Capitaine from '../assets/grades/Capitaine.png';
  import Commandant from '../assets/grades/Commandant.png';
  import Professeur from '../assets/grades/Professeur.png';
  import Infirmiere from '../assets/grades/Infirmière.png';
  
  const gradeIcons = {
    'Sap 2CL': Sap2CL,
    'Sap 1CL': Sap1CL,
    "Caporal": Caporal,
    'Caporal-Chef': CaporalChef,
    "Sergent": Sergent,
    'Sergent-Chef': SergentChef,
    "Adjudante": Adjudant,
    'Adjudant-Chef': AdjudantChef,
    "Lieutenant": Lieutenant,
    "Capitaine": Capitaine,
    "Commandant": Commandant,
    "Professeur": Professeur,
    "Infirmière": Infirmiere,
  };

  const statusOrder = {
    'A': 0,
    'RE': 1,
    'RV': 1,
    'AL': 2,
    'DE': 3,
    "PP": 3,
    "PA": 4,
    "SL": 5,
    "TH": 6,
    "AH": 7,
    "PC": 8,
    "QH": 9,
    "RD": 10,
    "RI": 11,
    "MD": 12,
    "MI": 13,
}

  const img_url = () => {
    const engins_COLLONGES = dataInter.value.details.filter(station => station.stationName === 'COLLONGE')[0]?.vehicles || [];
    let statut = 'A';
    for (const engin of engins_COLLONGES) {
        let current_statut = engin.status;
        if (statusOrder[current_statut] > statusOrder[statut]) {
            statut = current_statut;
        }
    }
    if (statut === 'A') {
        return new URL(`../assets/vehicules/statuts/finish.gif`, import.meta.url).href
    }
    return new URL(`../assets/vehicules/statuts/${statut}.gif`, import.meta.url).href
  } 

  const engins_Collonges_all = ref([]);
  const status_color = {
    "Dl": {backgroundColor: "#9CFF9C", textColor: "#00000"},
    "DM": {backgroundColor: "#C3C3C3", textColor: "#00000"},
  }

  const giveAgentGrade = (grade) => gradeIcons[grade]||'';
  
  function calculateDuree(date) {
    const diff = Date.now() - date;
    const m = Math.floor(diff/60000);
    const h = Math.floor(m/60);
    const min = String(m%60).padStart(2,'0');
    return h<1?`${min} min`:`${h} h ${min} min`;
  }

  const dureeMaJ = ref('');

  const updateDuree = () => {
    const duree = new Date(dataInter.value.update);
    const diff = Date.now() - duree;
    const s = Math.floor((diff / 1000) % 60 / 10) * 10;
    const m = Math.floor(diff / 60000);
    const h = Math.floor(m / 60);
    const min = String(m % 60).padStart(2, '0');
    const sec = String(s).padStart(2, '0');
    if (h < 1 && m < 1) {
      dureeMaJ.value = `${sec} s environ`;
    } else if (h < 1) {
      dureeMaJ.value = `${min} min ${sec} s environ`;
    } else {
      dureeMaJ.value = `${h} h ${min} min ${sec} s environ`;
    }

  }

  </script>
  
  <style scoped>
  .dashboard {
    position: relative;
    overflow: hidden;
    min-height: 100vh;
    color: #1a1a1a;
    background: #f5f7fa;
  }
  .dashboard__background {
    position: absolute;
    inset: 0;
    background: url('../assets/backgrounds/interEnCours.jpg') center/cover no-repeat;
    filter: blur(4px) brightness(1.2);
    transform: scale(1.05);
    z-index: 1;
    opacity: 0.4;
  }
  .dashboard__header {
    position: relative;
    z-index: 2;
    padding: 1.5rem 2rem;
  }
  .dashboard__header-content {
    max-width: 315px;
    min-width: 315px;
    margin: 0;
    text-align: left;
    background: #ffffff;
    border-radius: 0.75rem;
    padding: 1rem 1.25rem;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05);
    border-bottom: 3px solid #f60700;
  }
  .dashboard__title {
    font-size: 1.3rem;
    margin: 0;
    text-transform: uppercase;
    font-weight: 700;
    color: #f60700;
    letter-spacing: 0.05em;
  }
  .dashboard__subtitle {
    font-size: 0.9rem;
    margin: 0.4rem 0 0;
    color: #666;
    font-weight: 500;
  }
  .dashboard__content {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.25rem;
    padding: 1.5rem 2rem;
    transform: translateY(-2rem);
  }
  .card {
    background: #ffffff;
    border-radius: 0.75rem;
    padding: 1.25rem;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    border: 1px solid rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
  }
  .card:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
  .card__title {
    font-size: 0.95rem;
    margin: 0 0 0.65rem;
    text-transform: uppercase;
    font-weight: 700;
    color: #f60700;
    letter-spacing: 0.05em;
    padding-bottom: 0.45rem;
    border-bottom: 2px solid #f60700;
  }
  .card--map {
    overflow: hidden;
    padding: 0;
    height: 100%;
    min-height: 300px;
  }
  .card--map :deep(.map) {
    width: 100%;
    height: 100%;
    min-height: 300px;
    border-radius: 0.75rem;
  }
  .services {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
    overflow-x: auto;
  }
  .vehicles {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
    overflow-x: auto;
  }
  .vehicles-compact {
    gap: 0.35rem;
  }
  .card--stations {
    max-height: 200px;
    scrollbar-width: none;
  }
  .card--stations::-webkit-scrollbar {
    display: none;
  }
  .chip {
    padding: 0.35rem 0.65rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    white-space: nowrap;
    min-width: 2.5rem;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
  }
  .chip-compact {
    padding: 0.25rem 0.5rem;
    font-size: 0.65rem;
    min-width: 2rem;
  }
  .chip:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
  .chip:first-child {
    margin-left: 0;
  }
  .stations-compact {
    flex-direction: column;
    gap: 0.5rem;
  }
  .station {
    flex: 1 1 200px;
    margin-bottom: 0.85rem;
    padding: 0.85rem;
    background-color: #ffffff;
    border-radius: 0.625rem;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
    border: 1px solid rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
  }
  .station-compact {
    margin-bottom: 0.5rem;
    padding: 0.6rem 0.75rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }
  .station:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
  .station__name {
    margin: 0 0 0.65rem;
    font-size: 0.9rem;
    text-align: left;
    padding-left: 0;
    font-weight: 600;
    color: #1a1a1a;
  }
  .station__name-compact {
    margin: 0;
    font-size: 0.8rem;
    flex: 0 0 auto;
  }
  .agents {
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    gap: 0.45rem;
    scrollbar-width: none; 
  }
  .agents::-webkit-scrollbar {
    display: none;
  }
  .agent {
    display: flex;
    align-items: center;
    padding: 0.65rem;
    border-radius: 0.5rem;
    background: #ffffff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
    border: 1px solid rgba(0, 0, 0, 0.05);
  }
  .agent:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(246, 7, 0, 0.15), 0 1px 3px rgba(246, 7, 0, 0.1);
    background: rgba(255, 250, 250, 1);
  }
  .agent__icon {
    width: 22px;
    height: 22px;
    margin-right: 0.65rem;
    border-radius: 0.375rem;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
  }
  .agent__name {
    font-size: 0.85rem;
    font-weight: 500;
    text-align: left;
    margin: 0;
    color: #1a1a1a;
  }
  .message-slider {
    position: relative;
    overflow: hidden;
    min-height: 80px;
  }
  .message {
    padding: 0.85rem;
    background: #ffffff;
    border-radius: 0.625rem;
    border: 1px solid rgba(0, 0, 0, 0.05);
  }
  .message-enter-active {
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .message-leave-active {
    transition: all 0.3s ease;
  }
  .message-enter-from {
    opacity: 0;
    transform: translateX(30px) scale(0.95);
  }
  .message-leave-to {
    opacity: 0;
    transform: translateX(-30px) scale(0.95);
  }
  .message__time {
    font-size: 0.7rem;
    color: #666;
    margin-bottom: 0.65rem;
    font-weight: 500;
  }
  .message__content {
    font-size: 0.85rem;
    color: #1a1a1a;
    line-height: 1.5;
    font-weight: 400;
  }
  .dots {
    display: flex;
    justify-content: center;
    gap: 0.25rem;
    margin-top: 0.5rem;
  }
  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #e0e0e0;
    transition: all 0.2s ease;
  }
  .dot--active {
    background: #f60700;
    box-shadow: 0 0 0 2px rgba(246, 7, 0, 0.2);
    transform: scale(1.2);
  }
  @media (max-width: 600px) {
    .dashboard__content {
      grid-template-columns: 1fr;
      padding: 1rem;
    }
    .dashboard__title {
      font-size: 1.5rem;
    }
  }
  .custom2 {
    background-color: transparent;
    box-shadow: none;
    padding: 0;
  }
  .custom1 {
    background: #ffffff;
    border-radius: 0.75rem;
    padding: 1.25rem;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    min-height: 480px;
    max-height: 480px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
  }
  .custom1.compact-view {
    min-height: 400px;
    max-height: 400px;
  }
  .custom1::-webkit-scrollbar {
    width: 6px;
  }
  .custom1::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom1::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }
  .custom1::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
  }
  .card--agents{
    min-height: 280px;
  }
  .card--info{
    min-width: 300px;
  }
  .card__meta{
    display: flex;
    align-items: center;
    font-size: 0.85rem;
    color: #1a1a1a;
    font-weight: 500;
  }
  .custom3 {
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .fifty {
    opacity: 0.5;
  }
  .updateTime {
    position: fixed;
    bottom: 1.25rem;
    left: 1.75rem;
    padding: 0.65rem 1.1rem;
    font-size: 0.75rem;
    color: #666;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 0.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    z-index: 10;
    font-weight: 500;
    border: 1px solid rgba(0, 0, 0, 0.05);
  }
    
  </style>
  
