<template>
    <div class="affichage-manoeuvre" v-if="data.info">
      <!-- Header avec infos manœuvre -->
      <div class="header-manoeuvre">
        <div class="info-manoeuvre">
          <h1 class="numero-manoeuvre">{{ data.info.numManoeuvre }}</h1>
          <h2 class="titre-manoeuvre">{{ data.info.titleManoeuvre }}</h2>
          <p class="adresse-manoeuvre">{{ data.info.adresseManoeuvre }}</p>
        </div>
        <div class="qr-code-header">
          <QRCodeVue3 
            :value="qrCodeUrl" 
            :width="100"
            :height="100"
            :dotsOptions="{ color: '#1a1a1a' }"
            :cornerSquareOptions="{ color: '#f60700' }"
          />
          <p class="qr-text-header">cms-collonges.fr<br>→ Telex</p>
        </div>
      </div>
  
      <!-- Contenu principal en deux colonnes -->
      <div class="main-content">
        <!-- Section Engins (Gauche) -->
        <div class="section-engins">
          <h3 class="section-title">Moyens Engagés</h3>
          
          <div class="engins-container">
            <!-- Section Collonges - Engins de base -->
            <TransitionGroup name="fade-slide" tag="div" class="engins-container-transition">
              <div 
                v-if="enginsCollongesManoeuvre.length > 0"
                key="collonges-base"
                class="caserne-group collonges-base"
              >
                <div class="caserne-header">
                  <span class="caserne-name">Collonges</span>
                </div>
                <div class="engins-list engins-base-list">
                  <TransitionGroup name="stagger" tag="div" class="engins-list-inner">
                    <div 
                      v-for="(engin, index) in enginsCollongesManoeuvre" 
                      :key="engin.matricule"
                      class="engin-chip engin-base"
                      :style="{ '--delay': index * 0.1 + 's' }"
                    >
                      <span class="engin-lib">{{ engin.engin }}</span>
                      <span class="engin-gfo" v-if="engin.statusAlerte && engin.statusAlerte !== 'RE'">{{ engin.gfo }}</span>
                    </div>
                  </TransitionGroup>
                </div>
              </div>
    
              <!-- Engins des autres casernes -->
              <div 
                v-for="(engins, caserne) in autresCaserne" 
                :key="caserne"
                class="caserne-group"
              >
                <div class="caserne-header">
                  <span class="caserne-name">{{ caserne }}</span>
                </div>
                <div class="engins-list">
                  <TransitionGroup name="stagger" tag="div" class="engins-list-inner">
                    <div 
                      v-for="(engin, index) in engins" 
                      :key="engin.matricule"
                      class="engin-chip"
                      :style="{ ...getEnginStyle(engin), '--delay': index * 0.1 + 's' }"
                    >
                      <span class="engin-lib">{{ engin.engin }}</span>
                      <span class="engin-gfo" v-if="engin.statusAlerte && engin.statusAlerte !== 'RE'">{{ engin.gfo }}</span>
                    </div>
                  </TransitionGroup>
                </div>
              </div>
            </TransitionGroup>
          </div>
        </div>
    
        <!-- Section Agents (Droite) -->
        <div class="section-agents">
          <h3 class="section-title">Agents Engagés</h3>
          
          <TransitionGroup name="stagger-agents" tag="div" class="agents-grid">
            <div 
              v-for="(agent, index) in agentsManoeuvre" 
              :key="agent.matricule"
              class="agent-card"
              :style="{ ...getAgentStyle(agent), '--delay': index * 0.05 + 's' }"
            >
              <img :src="getGradeImage(agent.grade)" class="agent-grade" />
              <div class="agent-info">
                <div class="agent-nom">
                  <span class="agent-nom-text">{{ agent.nom }}</span>
                  <span class="agent-prenom">{{ agent.prenom }}</span>
                </div>
                <div class="agent-matricule">{{ agent.matricule }}</div>
              </div>
              <div class="agent-engin" v-if="agent.statusAlerte && agent.statusAlerte !== 'RE'">{{ agent.engin }}</div>
            </div>
          </TransitionGroup>
        </div>
      </div>
  
      <!-- Timer footer -->
      <div class="footer-timer">
        <div class="timer-bar" :style="{ width: timerProgress + '%' }"></div>
      </div>
    </div>
  
    <!-- Vue par défaut si pas de manœuvre -->
    <div class="no-manoeuvre" v-else>
      <img src="../assets/backgrounds/CTA.jpg" class="background-image" />
      <div class="no-manoeuvre-content">
        <h2>Aucune manœuvre en cours</h2>
        <p>En attente d'une nouvelle intervention...</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed, ref, onMounted, onUnmounted, watch, TransitionGroup } from 'vue';
  import QRCodeVue3 from 'qrcode-vue3';
  
  // Import des grades (même chose que dans vehiculeView.vue)
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
  import Infirmiere from '../assets/grades/Infirmière.png';
  
  const dict_grades = {
    'SAP': Sap1CL,
    'CAP': Caporal,
    'CCH': CaporalChef,
    'SGT': Sergent,
    'SCHE': SergentChef,
    'ADJ': Adjudant,
    'ADC': AdjudantChef,
    'LTN': Lieutenant,
    'CNE': Capitaine,
    'CDT': Commandant,
    'INF': Infirmiere,
  };
  
  // Props
  const props = defineProps({
    data: {
      type: Object,
      required: true
    }
  });
  
  // État local
  const qrCodeUrl = 'https://www.cms-collonges.fr/';
  const timerProgress = ref(0);
  let timerInterval = null;
  
  // Computed
  const enginsParCaserne = computed(() => {
    if (!props.data.manoeuvrants) return {};
    
    const grouped = {};
    
    for (const [key, agent] of Object.entries(props.data.manoeuvrants)) {
      const caserne = agent.caserne || 'Inconnu';
      if (!grouped[caserne]) {
        grouped[caserne] = [];
      }
      
      // Vérifier si l'engin est déjà dans la liste
      const existingEngin = grouped[caserne].find(e => e.engin === agent.engin);
      if (!existingEngin) {
        grouped[caserne].push({
          engin: agent.engin,
          gfo: agent.gfo,
          caserne: agent.caserne,
          statusAlerte: agent.statusAlerte,
          matricule: agent.matricule,
        });
      }
    }
    
    return grouped;
  });

  // Engins de Collonges dans la manœuvre (engins de base)
  const enginsCollongesManoeuvre = computed(() => {
    if (!props.data.manoeuvrants) return [];
    
    const collongesEngins = [];
    const seen = new Set();
    
    for (const agent of Object.values(props.data.manoeuvrants)) {
      if (agent.caserne === 'Collonges' || agent.caserne?.toLowerCase().includes('collonges')) {
        const key = `${agent.engin}-${agent.gfo}`;
        if (!seen.has(key)) {
          seen.add(key);
          collongesEngins.push({
            engin: agent.engin,
            gfo: agent.gfo,
            caserne: agent.caserne,
            matricule: agent.matricule,
            statusAlerte: agent.statusAlerte,
          });
        }
      }
    }
    
    return collongesEngins;
  });

  // Autres casernes (hors Collonges)
  const autresCaserne = computed(() => {
    const grouped = enginsParCaserne.value;
    const filtered = {};
    
    for (const [caserne, engins] of Object.entries(grouped)) {
      if (caserne !== 'Collonges' && !caserne?.toLowerCase().includes('collonges')) {
        filtered[caserne] = engins;
      }
    }
    
    return filtered;
  });
  
  const agentsManoeuvre = computed(() => {
    if (!props.data.manoeuvrants) return [];
    
    return Object.values(props.data.manoeuvrants).map(agent => ({
      ...agent,
      connected: agent.statusConnexion === 'OK'
    }));
  });
  
  // Fonctions
  const getGradeImage = (grade) => {
    return dict_grades[grade] || Sap1CL;
  };
  
  const getEnginStyle = (engin) => {
    // Statut RE (Retenu) par défaut
    let bgColor = '#1f8d49';
    let textColor = '#000';
    
    if (engin.statusAlerte === 'DONE') {
      // AL (Alerte)
      bgColor = '#FFCA00';
      textColor = '#f60700';
    } else if (engin.statusAlerte === 'RECEIVED') {
      // PA (Parti) - RECEIVED = agent a cliqué sur départ
      bgColor = '#f60700';
      textColor = '#fff';
    }
    
    return {
      backgroundColor: bgColor,
      color: textColor
    };
  };
  
  const getAgentStyle = (agent) => {
    if (!agent.connected) {
      return { 
        filter: 'grayscale(100%)', 
        opacity: '0.6',
        backgroundColor: 'transparent',
        color: '#1a1a1a'
      };
    }
    
    let bgColor = 'transparent';
    let textColor = '#1a1a1a';
    
    if (agent.statusAlerte === 'DONE') {
      // Agent en alerte
      bgColor = '#FFCA00';
      textColor = '#f60700';
    } else if (agent.statusAlerte === 'RECEIVED') {
      // Agent parti
      bgColor = '#f60700';
      textColor = '#fff';
    }
    
    return {
      backgroundColor: bgColor,
      color: textColor
    };
  };
  
  // Timer de progression (15 minutes)
  const startTimerProgress = () => {
    const duration = 15 * 60 * 1000; // 15 minutes
    const startTime = Date.now();
    
    timerInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      timerProgress.value = Math.min((elapsed / duration) * 100, 100);
      
      if (timerProgress.value >= 100) {
        window.location.reload();
      }
    }, 1000);
  };
  
  // Lifecycle
  onMounted(() => {
    startTimerProgress();
  });
  
  onUnmounted(() => {
    if (timerInterval) clearInterval(timerInterval);
  });
  
  // Watch pour refresh à la fin de la manœuvre
  watch(() => props.data.info, (newVal, oldVal) => {
    // Si on passe de "manœuvre active" à "pas de manœuvre"
    if (oldVal && !newVal) {
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  });
  </script>
  
  <style scoped>
  /* Layout moderne avec fond sobre */
  .affichage-manoeuvre {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #f5f7fa;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    z-index: 100;
  }

  .main-content {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    overflow: hidden;
    min-height: 0;
  }
  
  .header-manoeuvre {
    background: #ffffff;
    padding: 1rem 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border-bottom: 3px solid #f60700;
    animation: slideDown 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    transform: translateY(-100%);
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 2rem;
  }

  .info-manoeuvre {
    flex: 1;
  }

  .qr-code-header {
    background: #ffffff;
    padding: 0.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    border: 2px solid #f60700;
    text-align: center;
    flex-shrink: 0;
    animation: rotateIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s forwards;
    opacity: 0;
    transform: rotate(-10deg) scale(0.8);

  }
  .qr-code-header:hover {
    transform: rotate(0deg) scale(2);
  }

  .qr-text-header {
    margin-top: 0.35rem;
    font-size: 0.6rem;
    color: #666;
    font-weight: 600;
    line-height: 1.2;
  }

  @keyframes slideDown {
    to {
      transform: translateY(0);
    }
  }
  
  .numero-manoeuvre {
    font-size: 2rem;
    font-weight: 900;
    color: #f60700;
    margin: 0 0 0.5rem 0;
    letter-spacing: 0.08em;
    text-shadow: 0 2px 8px rgba(246, 7, 0, 0.2);
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      text-shadow: 0 2px 8px rgba(246, 7, 0, 0.2);
    }
    50% {
      text-shadow: 0 4px 16px rgba(246, 7, 0, 0.4);
    }
  }
  
  .titre-manoeuvre {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 0.5rem 0;
    letter-spacing: 0.02em;
    animation: fadeIn 0.8s ease-out 0.3s forwards;
    opacity: 0;
  }

  @keyframes fadeIn {
    to {
      opacity: 1;
    }
  }
  
  .adresse-manoeuvre {
    font-size: 1rem;
    color: #666;
    margin: 0;
    font-weight: 500;
    letter-spacing: 0.02em;
    animation: fadeIn 0.8s ease-out 0.5s forwards;
    opacity: 0;
  }
  
  .section-engins {
    background: #ffffff;
    padding: 2rem;
    overflow-y: auto;
    border-right: 2px solid #e8ebef;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .section-agents {
    background: #fafbfc;
    padding: 2rem;
    overflow-y: auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
  
  .section-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 1.5rem 0;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid #f60700;
    animation: fadeInUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    opacity: 0;
    transform: translateY(20px);
    flex-shrink: 0;
  }

  @keyframes fadeInUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .engins-container {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    flex: 1;
    min-height: 0;
  }

  .engins-container-transition {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
  
  .caserne-group {
    background: #fafbfc;
    border-radius: 0.75rem;
    padding: 1.5rem;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    border: 1px solid #e8ebef;
    animation: slideInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    opacity: 0;
    transform: translateY(30px);
  }

  @keyframes slideInUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .caserne-group:hover {
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
    transform: translateY(-4px) scale(1.01);
  }
  
  .collonges-base {
    background: #f0f9f4;
    border: 2px solid #1f8d49;
    animation-delay: 0.1s;
  }
  
  .caserne-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #f60700;
    gap: 1rem;
  }
  
  .caserne-name {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1a1a1a;
    letter-spacing: 0.03em;
  }
  
  .caserne-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #fff;
    background: #f60700;
    padding: 0.3rem 0.875rem;
    border-radius: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .engins-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.875rem;
    align-items: flex-start;
  }

  .engins-list-inner {
    display: flex;
    flex-wrap: wrap;
    gap: inherit;
    align-items: inherit;
  }
  
  .engins-base-list {
    gap: 1rem;
  }
  
  .engin-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.875rem;
    border-radius: 1.25rem;
    font-weight: 600;
    font-size: 0.85rem;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    cursor: default;
    animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    opacity: 0;
    transform: scale(0.8);
    animation-delay: var(--delay, 0s);
  }

  @keyframes scaleIn {
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  .engin-chip:hover {
    transform: translateY(-5px) scale(1.05) rotate(1deg);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }
  
  .engin-base {
    background: #1f8d49;
    color: #fff;
    font-weight: 700;
    border: 2px solid #1a7a3d;
    position: relative;
    overflow: hidden;
  }

  .engin-base::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transform: rotate(45deg);
    transition: all 0.6s;
    opacity: 0;
  }

  .engin-base:hover::before {
    animation: shine 0.6s;
  }

  @keyframes shine {
    0% {
      transform: translateX(-100%) translateY(-100%) rotate(45deg);
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      transform: translateX(100%) translateY(100%) rotate(45deg);
      opacity: 0;
    }
  }
  
  .engin-base:hover {
    background: #2ba85a;
    box-shadow: 0 4px 12px rgba(31, 141, 73, 0.3);
    border-color: #1f8d49;
  }
  
  .engin-lib {
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.01em;
  }
  
  .engin-gfo, .engin-status {
    font-size: 0.75rem;
    opacity: 0.95;
    font-weight: 600;
    padding: 0.15rem 0.5rem;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 0.75rem;
  }
  
  .engin-base .engin-gfo {
    background: rgba(255, 255, 255, 0.25);
    color: #fff;
  }
  
  .engin-dm .engin-status {
    background: rgba(0, 0, 0, 0.1);
    color: #1a1a1a;
  }
  
  @keyframes rotateIn {
    to {
      opacity: 1;
      transform: rotate(0deg) scale(1);
    }
  }
  
  .agents-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 0.75rem;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }
  
  .agent-card {
    background: #ffffff;
    border-radius: 0.625rem;
    padding: 0.875rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    border: 1px solid #e8ebef;
    animation: slideInRight 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    opacity: 0;
    transform: translateX(-30px);
    animation-delay: var(--delay, 0s);
  }

  @keyframes slideInRight {
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  .agent-card:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.25);
  }
  
  .agent-grade {
    width: 42px;
    height: 42px;
    object-fit: contain;
    border-radius: 0.5rem;
    flex-shrink: 0;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    background: #ffffff;
    padding: 0.2rem;
  }
  
  .agent-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }
  
  .agent-nom {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    line-height: 1.2;
  }

  .agent-nom-text {
    font-size: 0.95rem;
    font-weight: 700;
    color: inherit;
    letter-spacing: 0.01em;
  }

  .agent-prenom {
    font-size: 0.75rem;
    font-weight: 500;
    color: #666;
    letter-spacing: 0.01em;
  }
  
  .agent-matricule {
    display: inline-block;
    background: #FFCA00;
    color: #000;
    padding: 0.2rem 0.6rem;
    border-radius: 0.75rem;
    font-size: 0.7rem;
    font-weight: 700;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    letter-spacing: 0.03em;
    width: fit-content;
  }
  
  .agent-engin {
    font-size: 0.8rem;
    font-weight: 600;
    color: #666;
    padding: 0.25rem 0.6rem;
    background: #f0f2f5;
    border-radius: 0.5rem;
    display: inline-block;
    width: fit-content;
    flex-shrink: 0;
  }
  
  .footer-timer {
    height: 6px;
    background: #e8ebef;
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
  }
  
  .timer-bar {
    height: 100%;
    background: linear-gradient(90deg, #f60700, #ff9000);
    transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .timer-bar::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% {
      left: -100%;
    }
    100% {
      left: 100%;
    }
  }
  
  .no-manoeuvre {
    width: 100vw;
    height: 100vh;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .background-image {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(0.4);
  }
  
  .no-manoeuvre-content {
    position: relative;
    z-index: 2;
    text-align: center;
    color: #fff;
  }
  
  .no-manoeuvre-content h2 {
    font-size: 3rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
  }
  
  .no-manoeuvre-content p {
    font-size: 1.5rem;
    opacity: 0.8;
  }

  /* Transitions Vue pour les groupes */
  .fade-slide-enter-active,
  .fade-slide-leave-active {
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .fade-slide-enter-from {
    opacity: 0;
    transform: translateY(40px) scale(0.9);
  }

  .fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }

  .stagger-enter-active {
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    transition-delay: var(--delay, 0s);
  }

  .stagger-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .stagger-enter-from {
    opacity: 0;
    transform: scale(0.6) rotate(-5deg);
  }

  .stagger-leave-to {
    opacity: 0;
    transform: scale(0.8) rotate(5deg);
  }

  .stagger-move {
    transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .stagger-agents-enter-active {
    transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    transition-delay: var(--delay, 0s);
  }

  .stagger-agents-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .stagger-agents-enter-from {
    opacity: 0;
    transform: translateX(-50px) scale(0.9);
  }

  .stagger-agents-leave-to {
    opacity: 0;
    transform: translateX(50px) scale(0.9);
  }

  .stagger-agents-move {
    transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  </style>