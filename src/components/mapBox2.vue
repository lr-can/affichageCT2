<script setup>
import { onMounted, ref, watch } from 'vue';
import { MapboxMap } from '@studiometa/vue-mapbox-gl';
import { MapboxMarker } from '@studiometa/vue-mapbox-gl';
import { useSmartemis } from '../store/smartemis';

const smartemis = useSmartemis();
const fireUnits = ref([]);
const stationMarker = ref([4.8473705, 45.8172767]); // Caserne de départ
const interventionMarker = ref(null);

const props = defineProps({
  lon: {
    type: Number,
    required: true
  },
  lat: {
    type: Number,
    required: true
  },
  zoom: {
    type: Number,
    default: 14
  },
  showMarker: {
    type: Boolean,
    default: true
  },
  markerColor: {
    type: String,
    default: '#f60700'
  },
  mapStyle: {
    type: String,
    default: 'mapbox://styles/mapbox/streets-v11'
  },
  shouldAnimate: {
    type: Boolean,
    default: false
  }
});

const mapCenter = ref([4.8473705, 45.8172767]); // Caserne par défaut
const mapInstance = ref(null);

async function getFireUnits(){
  fireUnits.value = await smartemis.getFireStationsInRhone();
}

const giveFireUnitClass = (type) => {
  if(type === 'Site Etat-Major'){
    return 'site_EM';
  }else if(type === 'Caserne à garde postée Jour'){
    return 'site_GPJ';
  }else if(type === 'Caserne à garde postée 24/24'){
    return 'site_GP24';
  }else if(type === 'Caserne de volontaires'){
    return 'site_SPV';
  }
};

// Charger les casernes
onMounted(() => {
  getFireUnits();
});

const getStationCode = (name) => {
  if (!name) return 'CT';
  return `CT ${name}`;
};

// Fonction pour obtenir la couleur selon le type de caserne
const getStationColor = (type) => {
  if (!type) return '#6c757d'; // Gris par défaut
  
  if (type === 'Site Etat-Major') {
    return '#d32f2f'; // Rouge
  } else if (type === 'Caserne à garde postée Jour') {
    return '#f57c00'; // Orange
  } else if (type === 'Caserne à garde postée 24/24') {
    return '#fbc02d'; // Jaune
  } else if (type === 'Caserne de volontaires') {
    return '#388e3c'; // Vert
  }
  
  return '#6c757d'; // Gris par défaut
};

// Fonction pour obtenir la classe CSS du label selon le type de caserne
const getLabelClass = (type) => {
  if (!type) return 'label-default';
  
  if (type === 'Site Etat-Major') {
    return 'label-EM';
  } else if (type === 'Caserne à garde postée Jour') {
    return 'label-GPJ';
  } else if (type === 'Caserne à garde postée 24/24') {
    return 'label-GP24';
  } else if (type === 'Caserne de volontaires') {
    return 'label-SPV';
  }
  
  return 'label-default';
};

// Fonction pour déclencher un flyTo
const flyToLocation = (lng, lat, zoomLevel, pitch = 0, duration = 2000) => {
  if (mapInstance.value) {
    mapInstance.value.flyTo({
      center: [lng, lat],
      zoom: zoomLevel,
      speed: 1.5,
      curve: 2,
      easing: (t) => t,
      duration,
      pitch: pitch,
    });
  }
};

// Mettre à jour le centre si les props changent
watch(() => [props.lon, props.lat], ([newLon, newLat]) => {
  if (mapInstance.value && newLon && newLat) {
    const start = [4.8473705, 45.8172767]; // Caserne
    const end = [newLon, newLat];
    
    // Animation de la caserne vers l'intervention
    setTimeout(() => {
      flyToLocation(start[0], start[1], 13, 10, 2000);
    }, 500);
    setTimeout(() => {
      flyToLocation(end[0], end[1], props.zoom, 10, 2000);
    }, 2500);
  }
});

const handleMapReady = (map) => {
  mapInstance.value = map;
  
  map.on('load', () => {
    if (props.lon && props.lat) {
      const start = [4.8473705, 45.8172767]; // Caserne
      const end = [props.lon, props.lat]; // Intervention
      interventionMarker.value = end;
      
      // Déclencher l'animation si shouldAnimate est déjà true
      if (props.shouldAnimate) {
        triggerAnimation(start, end);
      }
    }
  });
};

const triggerAnimation = (start, end) => {
  if (!mapInstance.value) return;
  
  // Réinitialiser le marqueur
  interventionMarker.value = end;
  
  // Animation de la caserne vers l'intervention
  setTimeout(() => {
    flyToLocation(start[0], start[1], 13, 10, 2000);
  }, 500);
  setTimeout(() => {
    flyToLocation(end[0], end[1], props.zoom, 10, 2000);
  }, 2500);
};

// Watch pour déclencher l'animation quand shouldAnimate change
watch(() => props.shouldAnimate, (newVal) => {
  if (newVal && mapInstance.value && props.lon && props.lat) {
    const start = [4.8473705, 45.8172767];
    const end = [props.lon, props.lat];
    // Vérifier que la carte est chargée
    if (mapInstance.value.loaded()) {
      triggerAnimation(start, end);
    } else {
      // Attendre que la carte soit chargée
      mapInstance.value.once('load', () => {
        triggerAnimation(start, end);
      });
    }
  }
});
</script>

<template>
  <MapboxMap
    :style="`width: 100%; height: 100%;`"
    access-token="pk.eyJ1IjoibHItY2FuIiwiYSI6ImNsdnc2aXhpMjFpMDkyaW53cmdpajg2aWQifQ.fQ6ILPhZRb05CfdWrsxOvQ"
    class="map"
    :map-style="mapStyle"
    :center="mapCenter"
    :zoom="zoom"
    @mb-created="handleMapReady"
  >
    <!-- Marqueur caserne de départ -->
    <MapboxMarker :lng-lat="stationMarker">
      <div class="station-marker">
        <div class="blue_growing_circle"></div>
        <img src="../assets/icons/firestation.svg" class="station-icon" />
        <div class="station-label label-default">{{ getStationCode('Collonges-au-Mont-d\'Or') }}</div>
      </div>
    </MapboxMarker>
    
    <!-- Marqueur intervention -->
    <MapboxMarker v-if="showMarker && interventionMarker" :lng-lat="interventionMarker">
      <div class="marker-container" :style="{ backgroundColor: markerColor }">
        <div class="marker-pulse" :style="{ borderColor: markerColor }"></div>
        <img src="../assets/icons/sos.svg" class="marker-icon" />
      </div>
    </MapboxMarker>
    
    <!-- Marqueurs autres casernes -->
    <MapboxMarker v-for="fireUnit in fireUnits" :key="fireUnit.id || fireUnit.name" :lng-lat="[fireUnit.lon, fireUnit.lat]">
      <div class="fireunit-marker">
        <div class="fireunit-icon-container" :style="{ backgroundColor: getStationColor(fireUnit.type) }">
          <img src="../assets/icons/firestation.svg" class="fireunit-icon" />
        </div>
        <div class="fireunit-label" :class="getLabelClass(fireUnit.type)">{{ getStationCode(fireUnit.name) }}</div>
      </div>
    </MapboxMarker>
  </MapboxMap>
</template>

<style scoped>
.map {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.marker-container {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  animation: markerBeat 2s infinite;
}

.marker-icon {
  width: 30px;
  height: 30px;
  filter: invert(100%) brightness(1000%);
  position: relative;
  z-index: 2;
}

.marker-pulse {
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid;
  animation: markerPulse 2s infinite;
  z-index: 1;
}

@keyframes markerBeat {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes markerPulse {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(2);
  }
}

.station-marker {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #0078f3;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  animation: markerBeat 2s infinite;
}

.station-icon {
  width: 20px;
  height: 20px;
  filter: invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%);
  position: relative;
  z-index: 2;
}

.blue_growing_circle {
  position: absolute;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: transparent;
  border: 2px solid #0078f3;
  animation: markerPulse 2s infinite;
  z-index: 1;
}

.fireunit-marker {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
}

.fireunit-icon-container {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.fireunit-icon {
  width: 12px;
  height: 12px;
  filter: invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%);
}

.fireunit-label {
  font-size: 0.65em;
  font-weight: 700;
  color: #ffffff;
  padding: 0.15rem 0.3rem;
  border-radius: 4px;
  margin-top: 0.2rem;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 0, 0, 0.1);
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
}

.station-label {
  font-size: 0.7em;
  font-weight: 700;
  color: #ffffff;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  margin-top: 0.3rem;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 0, 0, 0.1);
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
}

/* Classes pour les fonds selon le type de caserne */
.label-EM {
  background: #d32f2f; /* Rouge pour Etat-Major */
}

.label-GPJ {
  background: #f57c00; /* Orange pour Garde Postée Jour */
}

.label-GP24 {
  background: #fbc02d; /* Jaune pour Garde Postée 24/24 */
}

.label-SPV {
  background: #388e3c; /* Vert pour Volontaires */
}

.label-default {
  background: rgba(255, 255, 255, 0.95);
  color: #2c2c2c;
}

</style>

