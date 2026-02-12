<template>
  <div class="asup-view">
    <div class="panel">
      <header class="panel-header">
        <h1>Potentiel ASUP</h1>
        <p>Disponibilité des gestes dans le VSAV 1 et le VSAV 2</p>
        <span class="status-line" :class="{ 'status-error': errorMessage && !hasAnyData }">
          {{ statusText }}
        </span>
      </header>

      <div v-if="isLoading && !hasAnyData" class="state-message">
        Chargement des données ASUP...
      </div>

      <div v-else-if="errorMessage && !hasAnyData" class="state-message state-error">
        {{ errorMessage }}
      </div>

      <div v-else class="vsav-grid">
        <article v-for="card in vsavCards" :key="card.key" class="vsav-card">
          <div class="vsav-card-header">
            <h2>{{ card.label }}</h2>
            <span class="availability-badge" :class="card.badgeClass">{{ card.badgeLabel }}</span>
          </div>

          <div class="metrics-grid">
            <div class="metric">
              <span>Naloxone</span>
              <strong>{{ card.metrics.naloxone }}</strong>
            </div>
            <div class="metric">
              <span>Allergie</span>
              <strong>{{ card.metrics.allergie }}</strong>
            </div>
            <div class="metric">
              <span>Brumi. adulte</span>
              <strong>{{ card.metrics.brumisationAdulte }}</strong>
            </div>
            <div class="metric">
              <span>Brumi. enfant</span>
              <strong>{{ card.metrics.brumisationEnfant }}</strong>
            </div>
            <div class="metric metric-wide">
              <span>Brumisation totale max</span>
              <strong>{{ card.metrics.brumisationTotalMax }}</strong>
            </div>
          </div>

          <div class="stock-summary">
            <h3>Stock utilisable</h3>
            <div class="stock-grid">
              <div>
                <span>Nyxoid</span>
                <strong>{{ card.stock.nyxoid }}</strong>
              </div>
              <div>
                <span>Anapen total</span>
                <strong>{{ card.stock.anapenTotal }}</strong>
              </div>
              <div>
                <span>Salbutamol adulte</span>
                <strong>{{ card.stock.salbutamolAdulte }}</strong>
              </div>
              <div>
                <span>Salbutamol enfant</span>
                <strong>{{ card.stock.salbutamolEnfant }}</strong>
              </div>
              <div class="stock-wide">
                <span>NaCl</span>
                <strong>{{ card.stock.chlorureSodium }}</strong>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

const isLoading = ref(true);
const errorMessage = ref('');
const lastRefresh = ref(null);
const asupByVsav = ref({
  vsav1: null,
  vsav2: null,
});

const asNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getGestes = (vsavData, key) =>
  asNumber(vsavData?.gestesDisponiblesParActe?.[key]?.gestesDisponibles);

const getStock = (vsavData, key) => asNumber(vsavData?.stockUtilisable?.[key]);

const buildVsavCard = (key, label) => {
  const source = asupByVsav.value[key] || {};
  const metrics = {
    naloxone: getGestes(source, 'naloxone'),
    allergie: getGestes(source, 'allergie'),
    brumisationAdulte: getGestes(source, 'brumisationAdulte'),
    brumisationEnfant: getGestes(source, 'brumisationEnfant'),
    brumisationTotalMax: getGestes(source, 'brumisationTotalMax'),
  };

  const stock = {
    nyxoid: getStock(source, 'nyxoid'),
    anapenTotal: getStock(source, 'anapenTotal'),
    salbutamolAdulte: getStock(source, 'salbutamolAdulte'),
    salbutamolEnfant: getStock(source, 'salbutamolEnfant'),
    chlorureSodium: getStock(source, 'chlorureSodium'),
  };

  const globalPotential =
    metrics.naloxone + metrics.allergie + metrics.brumisationTotalMax;

  let badgeClass = 'badge-critical';
  let badgeLabel = 'Indisponible';
  if (globalPotential >= 8) {
    badgeClass = 'badge-good';
    badgeLabel = 'Disponible';
  } else if (globalPotential > 0) {
    badgeClass = 'badge-warning';
    badgeLabel = 'Sous tension';
  }

  return {
    key,
    label,
    metrics,
    stock,
    badgeClass,
    badgeLabel,
  };
};

const vsavCards = computed(() => [
  buildVsavCard('vsav1', 'VSAV 1'),
  buildVsavCard('vsav2', 'VSAV 2'),
]);

const hasAnyData = computed(
  () => Boolean(asupByVsav.value.vsav1) || Boolean(asupByVsav.value.vsav2)
);

const statusText = computed(() => {
  if (isLoading.value && !hasAnyData.value) {
    return 'Chargement des données ASUP...';
  }
  if (errorMessage.value && !hasAnyData.value) {
    return errorMessage.value;
  }
  if (errorMessage.value) {
    return `${errorMessage.value} (affichage de la dernière valeur connue)`;
  }
  if (!lastRefresh.value) {
    return 'Mise à jour en attente';
  }
  return `Mise à jour ${lastRefresh.value.toLocaleTimeString('fr-FR')}`;
});

const fetchAsupAvailability = async () => {
  if (!hasAnyData.value) {
    isLoading.value = true;
  }

  try {
    const response = await fetch('https://api.cms-collonges.fr/availableAsup', {
      headers: {
        accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    const parVSAV = payload?.data?.disponibiliteGestesAsup1?.parVSAV;

    if (!parVSAV || typeof parVSAV !== 'object') {
      throw new Error('Format de données ASUP inattendu');
    }

    asupByVsav.value = {
      vsav1: parVSAV.vsav1 || {},
      vsav2: parVSAV.vsav2 || {},
    };
    lastRefresh.value = new Date();
    errorMessage.value = '';
  } catch (error) {
    console.error('Erreur lors de la récupération du potentiel ASUP:', error);
    errorMessage.value = 'Impossible de récupérer le potentiel ASUP.';
  } finally {
    isLoading.value = false;
  }
};

let refreshTimer = null;

onMounted(async () => {
  await fetchAsupAvailability();
  refreshTimer = setInterval(fetchAsupAvailability, 60000);
});

onBeforeUnmount(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }
});
</script>

<style scoped>
.asup-view {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top, rgba(23, 48, 95, 0.95), rgba(8, 22, 49, 0.98));
}

.panel {
  width: 90%;
  height: 82%;
  border-radius: 24px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.panel-header {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.panel-header h1 {
  margin: 0;
  font-size: 2rem;
  color: #102441;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.panel-header p {
  margin: 0;
  color: #4d617d;
  font-size: 1.05rem;
}

.status-line {
  margin-top: 0.3rem;
  font-size: 0.9rem;
  color: #3b4a5e;
}

.status-error {
  color: #b52121;
}

.state-message {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #3b4a5e;
  font-size: 1.1rem;
  font-weight: 600;
}

.state-error {
  color: #b52121;
}

.vsav-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.2rem;
  flex: 1;
  min-height: 0;
}

.vsav-card {
  border-radius: 18px;
  background: linear-gradient(180deg, #f7f9fd 0%, #eef2f9 100%);
  border: 1px solid rgba(16, 36, 65, 0.1);
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  overflow: hidden;
}

.vsav-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
}

.vsav-card-header h2 {
  margin: 0;
  font-size: 1.6rem;
  color: #102441;
}

.availability-badge {
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.badge-good {
  background: rgba(26, 144, 73, 0.18);
  color: #0f7a3c;
}

.badge-warning {
  background: rgba(252, 93, 0, 0.18);
  color: #be4700;
}

.badge-critical {
  background: rgba(246, 7, 0, 0.16);
  color: #b52121;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
}

.metric {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 12px;
  padding: 0.55rem 0.7rem;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(16, 36, 65, 0.08);
}

.metric span {
  color: #4d617d;
  font-size: 0.88rem;
}

.metric strong {
  color: #102441;
  font-size: 1.1rem;
}

.metric-wide {
  grid-column: 1 / -1;
}

.stock-summary {
  margin-top: auto;
  border-radius: 12px;
  padding: 0.7rem;
  background: rgba(16, 36, 65, 0.04);
}

.stock-summary h3 {
  margin: 0 0 0.45rem 0;
  font-size: 0.92rem;
  color: #1c3b64;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stock-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.45rem 0.8rem;
}

.stock-grid > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.stock-grid span {
  color: #3b4a5e;
  font-size: 0.84rem;
}

.stock-grid strong {
  color: #102441;
  font-size: 0.98rem;
}

.stock-wide {
  grid-column: 1 / -1;
}
</style>
