<template>
  <section
    class="consignes-page"
    :style="{
      '--alert-color': '#2596be',
      '--alert-color-2': '#fd4a45'
    }"
  >
    <div class="content">
      <!-- ASIDE : LOGOS -->
      <aside class="side">
        <figure class="logo-wrapper">
          <img src="../assets/smartemis.png" alt="SmartEmis Logo" />
        </figure>
        <figure class="logo-wrapper sdmis">
          <img src="../assets/sdmis.png" alt="SDMIS Logo" />
        </figure>
      </aside>

      <!-- MAIN SECTION -->
      <main class="details">

        <!-- BULLES DE CONSIGNES -->
        <section class="consignes-list">
          <article
            v-for="(item, index) in parsedInstructions"
            :key="index"
            class="consigne-bubble"
          >
            <header class="bubble-header">
              <h3 class="bubble-title">{{ item.titre }}</h3>
              <p class="bubble-meta">
                <strong>{{ item.origine }}</strong> • 
                <span>{{ item.nom }}</span>
              </p>
            </header>

            <p class="bubble-text">{{ item.texte }}</p>

            <footer class="bubble-footer">
              <p>
                <strong>Depuis :</strong> {{ item.relativeStart }}<br />
                <strong>Jusqu’à :</strong> {{ item.relativeEnd }}
              </p>
            </footer>
          </article>

          <p v-if="parsedInstructions.length === 0" class="empty-msg">
            Aucune consigne active pour le moment.
          </p>
        </section>
      </main>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';

/**
 * Props : liste d'objets d'instructions
 */
const props = defineProps({
  instructionData: {
    type: Array,
    default: () => []
  }
});

/**
 * Fonction de calcul du temps relatif (depuis / jusqu’à)
 */
function formatRelativeTime(dateString, isStart = true) {
  const date = new Date(dateString);
  const now = new Date();

  const diffMs = isStart ? now - date : date - now;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (isStart) {
    if (diffDays > 0)
      return `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0)
      return `${diffHours} h ${diffMin % 60} min`;
    return `${diffMin} min`;
  } else {
    const dayNames = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
    const targetDay = dayNames[date.getDay()];
    const hour = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');

    const today = now.toDateString() === date.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const isTomorrow = tomorrow.toDateString() === date.toDateString();

    if (today) return `aujourd’hui à ${hour} h ${min}`;
    if (isTomorrow) return `demain à ${hour} h ${min}`;
    return `${targetDay} à ${hour} h ${min}`;
  }
}

/**
 * Formattage final des données pour affichage
 */
const parsedInstructions = computed(() =>
  props.instructionData.map((inst) => ({
    ...inst,
    relativeStart: formatRelativeTime(inst.debut, true),
    relativeEnd: formatRelativeTime(inst.fin, false)
  }))
);
</script>

<style scoped>
.consignes-page {
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
  border-right: 4px solid #b30000;
}

.logo-wrapper {
  width: 150px;
  height: auto;
}
.logo-wrapper img {
  width: 100%;
  height: auto;
}
.logo-wrapper.sdmis img {
  width: 120px;
}

/* DETAILS */
.details {
  flex: 1 1 380px;
  padding: 1.5rem clamp(1.5rem, 4vw, 3rem);
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.title {
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
}

.subtitle {
  font-size: 1.2rem;
  opacity: 0.85;
  font-weight: 400;
  margin-bottom: 1rem;
}

/* BULLES DE CONSIGNES */
.consignes-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.consigne-bubble {
  background: #fff;
  color: #1a1a1a;
  padding: 1.25rem 1.5rem;
  border-radius: 16px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
  border-left: 6px solid #b30000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  animation: fadeIn 0.6s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bubble-title {
  font-weight: 700;
  color: #b30000;
  font-size: 1.25rem;
}

.bubble-meta {
  font-size: 0.9rem;
  color: #444;
  margin-bottom: 0.5rem;
}

.bubble-text {
  line-height: 1.5;
  white-space: pre-line;
}

.bubble-footer {
  font-size: 0.85rem;
  color: #555;
  margin-top: 0.5rem;
}

.empty-msg {
  text-align: center;
  opacity: 0.8;
  font-style: italic;
}

/* RESPONSIVE */
@media (max-width: 800px) {
  .side {
    flex: 1 1 100%;
    flex-direction: row;
    justify-content: center;
    gap: 2rem;
    border-right: none;
    border-bottom: 4px solid #b30000;
  }

  .details {
    padding: 2rem 1.25rem 3rem;
  }
}
</style>
