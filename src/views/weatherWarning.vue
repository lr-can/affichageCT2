<template>
  <section
    class="warning-page"
    :style="{
      '--alert-color': alertColor,
      '--alert-color-2': alertColor2,
      '--bg-icon': `url('${getImgUrl(lastIcon)}')`
    }"
  >
    <!-- BACKGROUND ICON -->
    <div class="bg-icon" aria-hidden="true" />

    <!-- MAIN FLEX LAYOUT -->
    <div class="content">
      <!-- ASIDE : MAP + QR -->
      <aside class="side">
        <figure class="map-wrapper" v-if="imgURL">
          <img :src="imgURL" alt="Carte vigilance" />
        </figure>

        <div class="qr-wrapper">
          <p class="qr-label">Plus d'infos&nbsp;:</p>
          <img :src="qrCodeURL" alt="QR Code Météo" />
        </div>
      </aside>

      <!-- MAIN DETAILS -->
      <main class="details">
        <header class="details-header">
          <h1 class="title">
            {{ weatherAlert?.alerteCouleur || 'Alerte Météo' }}
          </h1>

          <div class="alert-type" v-if="weatherAlert">
            <img
              v-for="type in iconList"
              :key="type"
              :src="getImgUrl(type)"
              :alt="type"
              class="alert-icon"
            />
            <h2>{{ weatherAlert.alerteType }}</h2>
          </div>
        </header>

        <section class="message" v-if="weatherAlert">
            <h3>Description</h3>
          <p>{{ weatherAlert.alerteMessage }}</p>
        </section>

        <section class="consignes" v-if="weatherAlert">
          <h3>Consignes</h3>
          <p>{{ weatherAlert.alertConsigne }}</p>
        </section>
      </main>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useWeather } from '../store/weather';

const weatherAlert = ref(null);
const weatherStore = useWeather();
const imgURL = ref('');
const qrCodeURL = ref(
  'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://vigilance.meteofrance.fr/fr/rhone'
);

/**
 * Palette dynamique selon la couleur d'alerte.
 */
const alertColor = computed(() => {
  if (!weatherAlert.value?.alerteCouleur) return '#1a1a1a';
  const couleur = weatherAlert.value.alerteCouleur.toLowerCase();
  if (couleur.includes('orange')) return '#b34000';
  if (couleur.includes('rouge') || couleur.includes('red')) return '#ce0500';
  if (couleur.includes('jaune') || couleur.includes('yellow')) return '#FFCA00';
  if (couleur.includes('vert') || couleur.includes('green')) return '#18753c';
  return '#1a1a1a';
});

const alertColor2 = computed(() => {
    if (!weatherAlert.value?.alerteCouleur) return '#1a1a1a';
    const couleur = weatherAlert.value.alerteCouleur.toLowerCase();
    if (couleur.includes('orange')) return '#fc5d00';
    if (couleur.includes('rouge') || couleur.includes('red')) return '#ff5655';
    if (couleur.includes('jaune') || couleur.includes('yellow')) return '#FFE552';
    if (couleur.includes('vert') || couleur.includes('green')) return '#27a658';
    return '#1a1a1a';
});

/**
 * Liste d'icônes dans les métadonnées.
 */
const iconList = computed(() => {
  return weatherAlert.value?.icon?.split(',').map((t) => t.trim()) ?? [];
});

/** Dernière icône (utilisée en fond) */
const lastIcon = computed(() => iconList.value.at(-1) || 'warning');

const getImgUrl = (alert) => {
  return new URL(`../assets/weather/${alert}.svg`, import.meta.url).href;
};

onMounted(async () => {
  const mapBlob = await weatherStore.vigilanceMap();
  imgURL.value = mapBlob instanceof Blob ? URL.createObjectURL(mapBlob) : mapBlob;
  weatherAlert.value = await weatherStore.alertWeather();
});
</script>

<style scoped>
/* ROOT */
.warning-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: stretch;
    background: linear-gradient(135deg, var(--alert-color-2), var(--alert-color));
  overflow: hidden;
  color: #fff;
background-size: 120% 120%;
animation: alertGradient 10s ease-in-out infinite;
}
/* Animated gradient background */
@keyframes alertGradient {
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

/* SUPER TRANSPARENT ICON BACKGROUND */
.bg-icon {
  position: absolute;
  inset: 0;
  background-image: var(--bg-icon);
  background-repeat: no-repeat;
  background-position: center;
  background-size: clamp(300px, 80vmin, 800px);
  opacity: 0.15; /* 75% transparent */
  filter: invert(1) brightness(2);
  transform: translateX(20%);
  pointer-events: none;
  z-index: 0;
}

/* FLEX LAYOUT */
.content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1400px;
  display: flex;
  flex-wrap: wrap;
  backdrop-filter: blur(4px);
  padding-top: 5rem;
}

/* ASIDE */
.side {
  background: #fff4f3;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  flex: 0 0 260px;
  transform: translateY(-3rem);
}

.map-wrapper{
    width: 100%;
    margin-top: 4rem;
    height: auto;
    border-radius: 12px;
    overflow: hidden;
}

.map-wrapper img {
  width: 100%;
  height: auto;
  border-radius: 12px;
  transform: scale(1.3);
}

.qr-wrapper img {
  width: 140px;
  height: 140px;
}

.qr-label {
  color: #1a1a1a;
  font-weight: 600;
  text-align: center;
  margin-bottom: 0.5rem;
}

/* DETAILS (MAIN) */
.details {
  flex: 1 1 380px;
  padding: 1.5rem clamp(1.5rem, 4vw, 3rem);
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.title {
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  margin: 0 0 1rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
}

.alert-type {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  font-weight: 500;
}

.alert-icon {
  width: 42px;
  height: 42px;
  filter: brightness(0) invert(1);

}

.message p,
.consignes p {
  margin: 0;
  line-height: 1.6;
  text-align: justify;
}

.consignes h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
}

/* RESPONSIVE */
@media (max-width: 800px) {
  .side {
    flex: 1 1 100%;
    flex-direction: row;
    justify-content: center;
    gap: 2rem;
  }

  .map-wrapper img {
    width: 140px;
  }

  .qr-wrapper img {
    width: 100px;
    height: 100px;
  }

  .details {
    padding: 2rem 1.25rem 3rem;
  }
}
</style>
