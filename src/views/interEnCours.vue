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
          <h3 class="card__title" :style="{ textTransform: 'uppercase', whiteSpace: 'pre-wrap', fontSize: '1.3rem' }">{{ firstInter.notificationTitre }}</h3>
          <div class="left-align" :style="{textAlign: 'left'}">
          <p class="card__meta">
            <img class="icon-address" src="../assets/icons/address.svg"  style="height: 2rem; width: auto ; text-transform: uppercase; margin-right: 1rem;" />
            <span> {{ firstInter.notificationVille }}</span>
          </p>
        </div>
        </section>

        <!-- Stations & Vehicles -->
        <section class="card card--stations custom2" v-if="dataInter.details?.length">
            <div class="custom1">
          <h2 class="card__title">Véhicules</h2>
          <div class="stations">
            <article
              v-for="st in dataInter.details"
              :key="st.stationId"
              class="station"
            >
              <h3 class="station__name" :style="{display: 'flex', flexDirection: 'column', textAlign: 'left', gap: '0.2rem'}">
                <span style="display: block; font-size: 0.7rem; color: #a7a7a7; line-height: 1;">{{ st.stationName }}</span>
                <span style="font-size: 1rem; line-height: 1; margin-bottom: 0.3rem;">
                  {{ st.stationFullName.length > 30 ? st.stationFullName.substring(0, 20) + '...' : st.stationFullName }}
                </span>
              </h3>
              <div class="vehicles">
                <span
                  v-for="v in st.vehicles"
                  :key="v.id"
                  class="chip"
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
            <p :style="{color: 'dimgray', fontStyle: 'italic'}">Aucun véhicule engagé</p>
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
            <p :style="{color: 'dimgray', fontStyle: 'italic'}">Aucun service externe engagé</p>
        </section>

        <section class="card card--messages custom3" v-if="dataInter.details?.length">
            <img :src="img_url()" style="height: 170px; width: 170px; border-radius: 8px;" />
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
            <p :style="{color: 'dimgray', fontStyle: 'italic'}">Aucun agent engagé</p>
        </section>

        <section class="card custom2"></section>
  
        <!-- Messages Carousel -->
        <section class="card card--messages" v-if="dataInter.messages?.length">
          <h2 class="card__title">Messages</h2>
          <div class="message-slider">
            <div class="message" v-if="currentMsg !== null" :style="{backgroundColor : 'white', borderBottom: '1px solid dimgrey', borderRadius: '1rem'}">
              <time class="message__time">Il y a {{ calculateDuree(new Date(dataInter.messages[currentMsg].time)) }}</time>
              <p class="message__content">{{ dataInter.messages[currentMsg].message }}</p>
            </div>
            <div class="dots" v-if="dataInter.messages.length > 1">
              <span
                v-for="(_, idx) in dataInter.messages"
                :key="idx"
                class="dot"
                :class="{ 'dot--active': idx === currentMsg }"
                :style="{backgroundColor : 'white', borderBottom: '1px solid dimgrey'}"
              ></span>
            </div>
          </div>
        </section>
        <section class="card card--messages fifty" v-if="!dataInter.messages?.length">
            <h2 class="card__title">Messages</h2>
            <p :style="{color: 'dimgray', fontStyle: 'italic'}">Aucun message</p>
        </section>

                        <!-- Map Image -->
        <section class="card card--map custom2">
          <img :src="giveLink()" alt="Carte de l'intervention" />
        </section>

      </main>
      <div class="updateTime">Mise à jour il y a {{ dureeMaJ }}</div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useSmartemis } from '../store/smartemis';
  
  const smartemis = useSmartemis();
  const clear = ref(false);
  const firstInter = ref({});
  const numInter = ref(0);
  const dureeInter = ref('');
  const dataInter = ref({ externalServices: [], details: [], agents: [], messages: [] });
  const currentMsg = ref(0);
  const isFinished = ref(false);
  
  onMounted(async () => {
    const raw = await smartemis.getInterNoFilter();
    const sorted = raw.sort((a, b) => b.numeroInter - a.numeroInter);
    const unique = sorted.filter((v,i,a) => a.findIndex(t => t.numeroInter===v.numeroInter)==i);
    firstInter.value = unique[0]||{};
    numInter.value = firstInter.value.numeroInter||0;
  
    await updateData();
    updateDuration();
    setInterval(() => { updateDuration(); updateData(); }, 30000);
    setInterval(() => { cycleMsg(); updateDuree()}, 10000);
    clear.value = true;
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
      const matchingEngin = engins_Collonges_all.value.find(engin => engin.engLib === vehicule.engLib);
      if (matchingEngin && matchingEngin.statut == 'Dl' || matchingEngin.statut == 'DM') {
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
  
  const giveLink = () => {
    return `https://maps.geoapify.com/v1/staticmap?style=osm-liberty&width=800&height=800&center=lonlat:${firstInter.value.notificationLon},${firstInter.value.notificationLat}&zoom=16&marker=lonlat:${firstInter.value.notificationLon},${firstInter.value.notificationLat};type:circle;color:%23ff0000;icon:sos;icontype:material;iconsize:small;strokecolor:%23ff0000&scaleFactor=1&apiKey=75c6e5ac06e84d3a95473195e7af529d`;
};

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
    color: #525252;
  }
  .dashboard__background {
    position: absolute;
    inset: 0;
    background: url('../assets/backgrounds/interEnCours.jpg') center/cover no-repeat;
    filter: blur(8px) brightness(0.9);
    transform: scale(1.1);
    z-index: 1;
  }
  .dashboard__header {
    position: relative;
    z-index: 2;
    padding: 2rem;
  }
  .dashboard__header-content {
    max-width: 315px;
    min-width: 315px;
    margin: 0;
    text-align: left;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 12px;
    padding: 1rem;
  }
  .dashboard__title {
    font-size: 1.5rem;
    margin: 0;
    text-transform: uppercase;
  }
  .dashboard__subtitle {
    font-size: 1.25rem;
    margin: 0.25rem 0 0;
  }
  .dashboard__content {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    padding: 2rem;
    transform: translateY(-2rem);
  }
  .card {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 12px;
    padding: 1.25rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .card__title {
    font-size: 1.2rem;
    margin: 0 0 0.5rem;
    text-transform: uppercase;
  }
  .card--map {
    overflow: hidden;

  }
  .card--map img {
    width: 100%;
    border-radius: 8px;
    scale: 2.3;
  }
  .services {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    overflow-x: auto;
  }
  .vehicles {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    overflow-x: auto;
  }
  .card--stations {
    max-height: 220px;
    scrollbar-width: none;
  }
  .card--stations::-webkit-scrollbar {
    display: none; /* For Chrome, Safari, and Edge */
  }
  .chip {
    padding: 0.25rem 0.4rem;
    border-radius: 999px;
    font-size: 0.8rem;
    white-space: nowrap;
    min-width: 3rem;
  }
  .chip:first-child {
    margin-left: 1rem;
  }
  .station {
    flex: 1 1 200px;
    margin-bottom: 1rem;
    padding: 0.3rem;
    padding-bottom: 0.5rem;
    padding-left: 0.3rem;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  }
  .station__name {
    margin: 0 0 0.2rem;
    font-size: 1.1rem;
    text-align: left;
    padding-left: 0.2rem;
    font-weight: normal;
    
  }
  .agents {
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    gap: 0.5rem;
    scrollbar-width: none; 
  }
  .agents::-webkit-scrollbar {
    display: none; /* For Chrome, Safari, and Edge */
  }
  .agent {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    border-radius: 8px;
    transition: transform 0.2s ease;
  }
  .agent:hover {
    transform: translateY(-4px);
  }
  .agent__icon {
    width: 20px;
    height: 20px;
    margin-bottom: 0.25rem;
    margin-right: 1rem;
    border-radius: 3px;

  }
  .agent__name {
    font-size: 0.9rem;
    text-align: center;
    margin: 0;
  }
  .message-slider {
    position: relative;
    overflow: hidden;
  }
  .message {
    padding: 0.75rem;
  }
  .message__time {
    font-size: 0.8rem;
    color: #666;
    margin-bottom: 0.5rem;
  }
  .message__content {
    font-size: 1rem;
    color: #333;
    line-height: 1.4;
  }
  .dots {
    display: flex;
    justify-content: center;
    gap: 0.25rem;
    margin-top: 0.5rem;
  }
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ccc;
  }
  .dot--active {
    background: #333;
  }
  @media (max-width: 600px) {
    .dashboard__content {
      grid-template-columns: 1fr;
      padding: 1rem;
    }
    .dashboard__title {
      font-size: 2rem;
    }
  }
  .custom2 {
    background-color: transparent;
    box-shadow: none;
    padding: 0;
  }
  .custom1 {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 12px;
    padding: 1.25rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    min-height: 575px;
    max-height: 575px;
    overflow-y: auto;
    scrollbar-width: none;
  }
    .custom1::-webkit-scrollbar {
        display: none; /* For Chrome, Safari, and Edge */
    }
    .card--agents{
        min-height: 330px;
    }
    .card--info{
        min-width: 300px;
    }
    .card__meta{
        display: flex;
        align-items: center;
        font-size: 0.9rem;
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
        bottom: 1rem;
        left: 3rem;
        padding: 1rem;
        font-size: 0.8rem;
        color: white;
        margin: 1rem;
        z-index: 2;
    }
    
  </style>
  
