<template>
  <div class="asup-view">
    <div class="panel">
      <header class="panel-header">
        <h1>Potentiel ASUP</h1>
      </header>

      <div v-if="isLoading && !hasAnyData" class="state-message">
        Chargement des données ASUP...
      </div>

      <div v-else-if="errorMessage && !hasAnyData" class="state-message state-error">
        {{ errorMessage }}
      </div>

      <div v-else class="content-layout">
        <div class="vsav-grid">
          <article v-for="card in vsavCards" :key="card.key" class="vsav-card">
            <div class="vsav-card-header">
              <h2>{{ card.label }}</h2>
              <span class="availability-badge" :class="card.badgeClass">{{ card.badgeLabel }}</span>
            </div>

            <div class="metrics-grid">
              <div class="metric" :class="getMetricClass(card.metrics.naloxone)">
                <span>Naloxone</span>
                <strong>{{ card.metrics.naloxone }}</strong>
              </div>
              <div class="metric" :class="getMetricClass(card.metrics.allergie)">
                <span>Allergie</span>
                <strong>{{ card.metrics.allergie }}</strong>
              </div>
              <div class="metric" :class="getMetricClass(card.metrics.brumisationAdulte)">
                <span>Brumi. adulte</span>
                <strong>{{ card.metrics.brumisationAdulte }}</strong>
              </div>
              <div class="metric" :class="getMetricClass(card.metrics.brumisationEnfant)">
                <span>Brumi. enfant</span>
                <strong>{{ card.metrics.brumisationEnfant }}</strong>
              </div>
              <div class="metric metric-wide" :class="getMetricClass(card.metrics.brumisationTotalMax)">
                <span>Brumisation totale max</span>
                <strong>{{ card.metrics.brumisationTotalMax }}</strong>
              </div>
            </div>

            <div class="stock-summary">
              <h3>Stock utilisable</h3>
              <div class="stock-grid">
                <div>
                  <span>Nyxoid</span>
                  <strong :class="getStockTextClass(card.stock.nyxoid)">{{ card.stock.nyxoid }}</strong>
                </div>
                <div>
                  <span>Anapen 150</span>
                  <strong :class="getStockTextClass(card.stock.anapen150)">{{ card.stock.anapen150 }}</strong>
                </div>
                <div>
                  <span>Anapen 300</span>
                  <strong :class="getStockTextClass(card.stock.anapen300)">{{ card.stock.anapen300 }}</strong>
                </div>
                <div>
                  <span>Anapen 500</span>
                  <strong :class="getStockTextClass(card.stock.anapen500)">{{ card.stock.anapen500 }}</strong>
                </div>
                <div>
                  <span>Anapen total</span>
                  <strong :class="getStockTextClass(card.stock.anapenTotal)">{{ card.stock.anapenTotal }}</strong>
                </div>
                <div>
                  <span>Salbutamol adulte</span>
                  <strong :class="getStockTextClass(card.stock.salbutamolAdulte)">{{ card.stock.salbutamolAdulte }}</strong>
                </div>
                <div>
                  <span>Salbutamol enfant</span>
                  <strong :class="getStockTextClass(card.stock.salbutamolEnfant)">{{ card.stock.salbutamolEnfant }}</strong>
                </div>
                <div class="stock-wide">
                  <span>NaCl</span>
                  <strong :class="getStockTextClass(card.stock.chlorureSodium)">{{ card.stock.chlorureSodium }}</strong>
                </div>
              </div>
            </div>
          </article>
        </div>

        <section class="gestures-section">
          <div class="gestures-header">
            <h2>3 derniers gestes ASUP</h2>
          </div>

          <div v-if="isGesturesLoading && !hasLatestGestures" class="gestures-state">
            Chargement des derniers gestes...
          </div>

          <div v-else-if="gesturesErrorMessage && !hasLatestGestures" class="gestures-state state-error">
            {{ gesturesErrorMessage }}
          </div>

          <div v-else class="gestures-grid">
            <article v-for="gesture in latestGestureCards" :key="gesture.idUtilisation" class="gesture-card">
              <div class="gesture-card-top">
                <span class="gesture-acte">{{ gesture.acteSoinLabel }}</span>
              </div>

              <div class="gesture-main-row">
                <div class="gesture-field">
                  <span>Intervention</span>
                  <strong>{{ gesture.interventionLabel }}</strong>
                </div>
                <div class="gesture-field">
                  <span>Commune</span>
                  <strong class="text-ellipsis">{{ gesture.communeLabel }}</strong>
                </div>
              </div>

              <div class="gesture-main-row">
                <div class="gesture-field">
                  <span>Agent</span>
                  <div class="agent-inline">
                    <img
                      v-if="gesture.agentGradeImage"
                      :src="gesture.agentGradeImage"
                      alt=""
                      class="agent-grade-icon"
                    >
                    <strong class="text-ellipsis">{{ gesture.agentLabel }}</strong>
                  </div>
                </div>
                <div class="gesture-field gesture-field-wide">
                  <span>Médecin prescripteur</span>
                  <strong class="text-ellipsis">{{ gesture.medecinLabel }}</strong>
                </div>
              </div>

              <div v-if="gesture.notificationTitre" class="gesture-context">
                {{ gesture.notificationTitre }}
              </div>

              <div v-if="gesture.commentaire" class="gesture-comment">
                {{ gesture.commentaire }}
              </div>
            </article>
          </div>

          <div v-if="gesturesErrorMessage && hasLatestGestures" class="gestures-warning">
            {{ gesturesErrorMessage }} (affichage de la dernière valeur connue)
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
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

const isLoading = ref(true);
const errorMessage = ref('');
const isGesturesLoading = ref(true);
const gesturesErrorMessage = ref('');
const asupByVsav = ref({
  vsav1: null,
  vsav2: null,
});
const latestGesturesRaw = ref([]);

const gradeImages = {
  'Sap 2CL': Sap2CL,
  'Sap 1CL': Sap1CL,
  Caporal,
  'Caporal-Chef': CaporalChef,
  Sergent,
  'Sergent-Chef': SergentChef,
  Adjudant,
  'Adjudant-Chef': AdjudantChef,
  Lieutenant,
  Capitaine,
  Commandant,
  Infirmiere,
  'Infirmière': Infirmiere,
  Professeur,
};

const asNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getGestes = (vsavData, key) =>
  asNumber(vsavData?.gestesDisponiblesParActe?.[key]?.gestesDisponibles);

const getStock = (vsavData, key) => asNumber(vsavData?.stockUtilisable?.[key]);

const getMetricClass = (value) => {
  if (value === 0) {
    return 'metric-critical';
  }
  if (value < 3) {
    return 'metric-warning';
  }
  return 'metric-good';
};

const getStockTextClass = (value) => {
  if (value === 0) {
    return 'stock-critical';
  }
  if (value < 3) {
    return 'stock-warning';
  }
  return 'stock-good';
};

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
    anapen150: getStock(source, 'anapen150'),
    anapen300: getStock(source, 'anapen300'),
    anapen500: getStock(source, 'anapen500'),
    anapenTotal: getStock(source, 'anapenTotal'),
    salbutamolAdulte: getStock(source, 'salbutamolAdulte'),
    salbutamolEnfant: getStock(source, 'salbutamolEnfant'),
    chlorureSodium: getStock(source, 'chlorureSodium'),
  };

  const gestureCapacity = metrics.brumisationTotalMax;

  let badgeClass = 'badge-critical';
  let badgeLabel = 'Indisponible';
  if (gestureCapacity >= 3) {
    badgeClass = 'badge-good';
    badgeLabel = 'Disponible';
  } else if (gestureCapacity > 0) {
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

const hasLatestGestures = computed(() => latestGesturesRaw.value.length > 0);

const hasAnyData = computed(() => {
  return (
    Boolean(asupByVsav.value.vsav1) ||
    Boolean(asupByVsav.value.vsav2) ||
    hasLatestGestures.value
  );
});

const formatActeSoin = (value) => {
  const code = (value || '').toString().trim();
  if (!code) {
    return 'Acte inconnu';
  }
  const labelMap = {
    ecg: 'ECG',
    naloxone: 'Naloxone',
    allergie: 'Allergie',
    paracetamol: 'Paracétamol',
    asthme: 'Brumisation',
    glucagon: 'Glucagon',
    methoxyflurane: 'Methoxyflurane',
  };
  return labelMap[code] || `${code.charAt(0).toUpperCase()}${code.slice(1)}`;
};

const normalizeText = (value) => (value || '').toString().trim();
const simplifyCivilite = (value) =>
  normalizeText(value)
    .replace(/^Docteur$/i, 'Dr')
    .replace(/^Docteure$/i, 'Dr');

const getGradeImage = (grade) => {
  const raw = normalizeText(grade);
  if (!raw) {
    return null;
  }
  if (gradeImages[raw]) {
    return gradeImages[raw];
  }
  const normalized = raw
    .replace(/\s*-\s*/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
  return gradeImages[normalized] || null;
};

const latestGestureCards = computed(() => {
  return latestGesturesRaw.value.slice(0, 3).map((gesture) => {
    const agentName = [gesture?.agent?.prenomAgent, gesture?.agent?.nomAgent]
      .map(normalizeText)
      .filter(Boolean)
      .join(' ');
    const agentGrade = normalizeText(gesture?.agent?.grade);
    const medecinLabel = [
      simplifyCivilite(gesture?.medecinPrescripteur?.civiliteExercice),
      normalizeText(gesture?.medecinPrescripteur?.prenomExercice),
      normalizeText(gesture?.medecinPrescripteur?.nomExercice),
    ]
      .filter(Boolean)
      .join(' ');

    const interventionLabel = gesture?.numIntervention || gesture?.interventionDetails?.numeroInter
      ? `N°${gesture?.numIntervention || gesture?.interventionDetails?.numeroInter}`
      : 'Non renseignée';

    return {
      idUtilisation: gesture?.idUtilisation || `${gesture?.dateActe || ''}-${interventionLabel}`,
      acteSoinLabel: formatActeSoin(gesture?.acteSoin),
      interventionLabel,
      communeLabel: normalizeText(gesture?.interventionDetails?.notificationVille) || 'Non renseignée',
      agentLabel: agentName || normalizeText(gesture?.matriculeAgent) || 'Inconnu',
      agentGradeImage: getGradeImage(agentGrade),
      medecinLabel: medecinLabel || 'Non renseigné',
      notificationTitre: normalizeText(gesture?.interventionDetails?.notificationTitre),
      commentaire: normalizeText(gesture?.commentaire),
    };
  });
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
    errorMessage.value = '';
  } catch (error) {
    console.error('Erreur lors de la récupération du potentiel ASUP:', error);
    errorMessage.value = 'Impossible de récupérer le potentiel ASUP.';
  } finally {
    isLoading.value = false;
  }
};

const fetchLastAsupGestures = async () => {
  if (!hasLatestGestures.value) {
    isGesturesLoading.value = true;
  }

  try {
    const response = await fetch('https://api.cms-collonges.fr/getLastAsupGestures', {
      headers: {
        accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    const list = Array.isArray(payload?.data) ? payload.data : [];
    latestGesturesRaw.value = [...list]
      .sort((a, b) => new Date(b.dateActe) - new Date(a.dateActe))
      .slice(0, 3);
    gesturesErrorMessage.value = '';
  } catch (error) {
    console.error('Erreur lors de la récupération des derniers gestes ASUP:', error);
    gesturesErrorMessage.value = 'Impossible de récupérer les derniers gestes ASUP.';
  } finally {
    isGesturesLoading.value = false;
  }
};

const fetchAllAsupData = async () => {
  await Promise.all([fetchAsupAvailability(), fetchLastAsupGestures()]);
};

let refreshTimer = null;

onMounted(async () => {
  await fetchAllAsupData();
  refreshTimer = setInterval(fetchAllAsupData, 60000);
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
  align-items: stretch;
  justify-content: stretch;
  padding: 0.7rem;
  background: radial-gradient(circle at top, rgba(23, 48, 95, 0.95), rgba(8, 22, 49, 0.98));
}

.panel {
  width: 100%;
  height: 100%;
  border-radius: 16px;
  padding: 0.6rem;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  overflow: hidden;
}

.content-layout {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 0.45rem;
  flex: 1;
  min-height: 0;
}

.panel-header {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.panel-header h1 {
  margin: 0;
  font-size: 1.15rem;
  color: #102441;
  text-transform: uppercase;
  letter-spacing: 0.04em;
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
  gap: 0.45rem;
  align-items: start;
  min-height: 0;
}

.vsav-card {
  border-radius: 12px;
  background: linear-gradient(180deg, #f7f9fd 0%, #eef2f9 100%);
  border: 1px solid rgba(16, 36, 65, 0.1);
  padding: 0.65rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  overflow: hidden;
  height: auto;
}

.vsav-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
}

.vsav-card-header h2 {
  margin: 0;
  font-size: 1rem;
  color: #102441;
}

.availability-badge {
  padding: 0.2rem 0.45rem;
  border-radius: 999px;
  font-size: 0.64rem;
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
  gap: 0.35rem;
}

.metric {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 9px;
  padding: 0.32rem 0.45rem;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(16, 36, 65, 0.08);
}

.metric.metric-good {
  background: rgba(26, 144, 73, 0.1);
  border-color: rgba(26, 144, 73, 0.25);
}

.metric.metric-warning {
  background: rgba(252, 93, 0, 0.12);
  border-color: rgba(252, 93, 0, 0.3);
}

.metric.metric-critical {
  background: rgba(246, 7, 0, 0.12);
  border-color: rgba(246, 7, 0, 0.3);
}

.metric span {
  color: #4d617d;
  font-size: 0.72rem;
}

.metric strong {
  color: #102441;
  font-size: 0.88rem;
}

.metric.metric-good strong {
  color: #0f7a3c;
}

.metric.metric-warning strong {
  color: #be4700;
}

.metric.metric-critical strong {
  color: #b52121;
}

.metric-wide {
  grid-column: 1 / -1;
}

.stock-summary {
  margin-top: 0.2rem;
  border-radius: 10px;
  padding: 0.35rem;
  background: rgba(16, 36, 65, 0.04);
}

.stock-summary h3 {
  margin: 0 0 0.3rem 0;
  font-size: 0.7rem;
  color: #1c3b64;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stock-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.18rem 0.45rem;
}

.stock-grid > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.3rem;
}

.stock-grid span {
  color: #3b4a5e;
  font-size: 0.66rem;
}

.stock-grid strong {
  color: #102441;
  font-size: 0.74rem;
}

.stock-grid strong.stock-good {
  color: #0f7a3c;
}

.stock-grid strong.stock-warning {
  color: #be4700;
}

.stock-grid strong.stock-critical {
  color: #b52121;
}

.stock-wide {
  grid-column: 1 / -1;
}

.gestures-section {
  border-radius: 12px;
  padding: 0.4rem;
  background: rgba(16, 36, 65, 0.06);
  border: 1px solid rgba(16, 36, 65, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-height: 0;
}

.gestures-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
}

.gestures-header h2 {
  margin: 0;
  font-size: 0.78rem;
  color: #102441;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.gestures-state {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #3b4a5e;
  font-weight: 500;
  font-size: 0.8rem;
}

.gestures-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.34rem;
  min-height: 0;
  overflow-y: auto;
  padding-right: 0.1rem;
}

.gesture-card {
  border-radius: 10px;
  padding: 0.4rem;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.95), rgba(240, 246, 255, 0.96));
  border: 1px solid rgba(16, 36, 65, 0.1);
  box-shadow: 0 8px 20px rgba(16, 36, 65, 0.08);
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.gesture-card-top {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.gesture-acte {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 0.16rem 0.4rem;
  border-radius: 999px;
  color: #0f7a3c;
  background: rgba(26, 144, 73, 0.18);
}

.gesture-main-row {
  display: flex;
  gap: 0.3rem;
}

.gesture-field {
  display: flex;
  flex-direction: column;
  gap: 0.08rem;
  flex: 1;
}

.gesture-field span {
  font-size: 0.62rem;
  color: #5a6d8a;
}

.gesture-field strong {
  font-size: 0.72rem;
  color: #102441;
}

.gesture-field-wide {
  flex: 1;
}

.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gesture-context {
  font-size: 0.64rem;
  color: #1f4c7c;
  background: rgba(31, 76, 124, 0.08);
  border-radius: 7px;
  padding: 0.25rem 0.35rem;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}

.gesture-comment {
  font-size: 0.64rem;
  color: #3b4a5e;
  background: rgba(16, 36, 65, 0.05);
  border-radius: 7px;
  padding: 0.25rem 0.35rem;
  white-space: pre-line;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}

.agent-inline {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  min-width: 0;
}

.agent-grade-icon {
  width: 15px;
  height: 15px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
}

.gestures-warning {
  font-size: 0.64rem;
  color: #b52121;
}

@media (max-width: 1500px) {
  .gestures-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 980px) {
  .vsav-grid,
  .gestures-grid {
    grid-template-columns: 1fr;
  }
}
</style>
