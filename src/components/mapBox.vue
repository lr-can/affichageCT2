<script setup>
import { onMounted, ref } from 'vue';
import { MapboxMap } from '@studiometa/vue-mapbox-gl';
import { MapboxMarker } from '@studiometa/vue-mapbox-gl';
import { useSmartemis } from '../store/smartemis';

const smartemis = useSmartemis();
const fireUnits = ref([]);

async function getFireUnits(){
  fireUnits.value = await smartemis.getFireStationsInRhone();
  console.log(`found ${fireUnits.value.length} fire units`);
}

const mapCenter = ref([4.8473705, 45.8172767]);
const mapStyle = ref("mapbox://styles/mapbox/streets-v11");
const zoom = ref(10);
const customMarker = ref(null);
const props = defineProps({
  lon: Number,
  lat: Number,
  showRoute: {
    type: Boolean,
    default: false,
  },
});

let mapInstance = ref(null);

// Charger les casernes
onMounted(() => {
  // Mode itinéraire: plus léger, pas de casernes
  if (!props.showRoute) {
    getFireUnits();
  }
});


// Fonction pour déclencher un flyTo
const flyToLocation = (lng, lat, zoomLevel, pitch = 0, duration = 2000) => {
  if (mapInstance.value) {
    mapInstance.value.flyTo({
      center: [lng, lat],
      zoom: zoomLevel,
      speed: 1.5, // Vitesse d'animation
      curve: 2, // Courbure de l'animation
      easing: (t) => t, // Fonction d'adoucissement
      duration, // Durée en ms
      pitch: pitch, // Angle de vue
      
    });
  }
};

// Animations après instanciation de la carte
const handleMapReady = (map) => {
  mapInstance.value = map;
  console.log('Map ready!');

  map.on('load', async () => {
    // Ajout de la couche de bâtiments en 3D uniquement sur la carte principale
    if (!props.showRoute) {
      map.addLayer({
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        paint: {
          'fill-extrusion-color': '#aaa',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'min_height'],
          'fill-extrusion-opacity': 0.6,
        },
      });
    }

    const start = [4.8473705, 45.8172767];
    const end = [props.lon, props.lat];
    if (!end[0] || !end[1]) return;

    if (props.showRoute) {
      // Mode itinéraire: focus route + style clair
      mapStyle.value = 'mapbox://styles/mapbox/navigation-day-v1';
      zoom.value = 13;
      await addTruckRouteToMap(mapInstance.value, start, end);
      flyToLocation(end[0], end[1], 13, 0, 1200);
      customMarker.value = end;
      return;
    }

    // Mode principal: animation existante
    mapStyle.value = 'mapbox://styles/mapbox/streets-v11';
    setTimeout(() => {
      flyToLocation(start[0], start[1], 13, 10);
    }, 5000);
    setTimeout(async () => {
      await addTruckRouteToMap(mapInstance.value, start, end);
      flyToLocation(end[0], end[1], 13, 10);
      customMarker.value = end;
    }, 10000);
    setTimeout(() => {
      flyToLocation(end[0], end[1], 17.5, 60);
    }, 16000);
  });
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

const getStationCode = (name) => {
  if (!name) return 'CT';
  return `CT ${name}`;
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

// Fonction asynchrone pour calculer et afficher un itinéraire poids lourd
const addTruckRouteToMap = async (mapInstance, start, end) => {
  if (!mapInstance) {
    console.error('La carte Mapbox n\'est pas encore initialisée.');
    return;
  }

  const accessToken = 'pk.eyJ1IjoibHItY2FuIiwiYSI6ImNsdnc2aXhpMjFpMDkyaW53cmdpajg2aWQifQ.fQ6ILPhZRb05CfdWrsxOvQ';

  try {
    // Appel à l'API Directions de Mapbox
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&annotations=maxspeed,speed&overview=full&access_token=${accessToken}`
    );

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération de l'itinéraire : ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      throw new Error('Aucun itinéraire trouvé entre les points donnés.');
    }

    const route = data.routes[0];

    // Ajouter la trace de l'itinéraire à la carte
    mapInstance.addSource('truck-route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: route.geometry,
      },
    });

    mapInstance.addLayer({
      id: 'truck-route-line',
      type: 'line',
      source: 'truck-route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#f60700',
        'line-width': 5,
        'line-opacity': 0.3,
      },
    });

    console.log('Itinéraire ajouté à la carte.');
  } catch (error) {
    console.error('Erreur lors de la récupération ou de l\'affichage de l\'itinéraire :', error);
  }
};
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
    <MapboxMarker v-if="!props.showRoute" :lng-lat="mapCenter">
        <div class="everythingCentered Beating" style="background-color: #0078f3; width: 30px; height: 30px; border-radius: 50%">
          <div class="blue_growing_circle"></div>
          <img src="../assets/icons/firestation.svg" style="filter: invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%); width: 25px; height: 25px;" />
        </div>
        <div class="station-label-mapbox label-default">{{ getStationCode('Collonges-au-Mont-d\'Or') }}</div>
    </MapboxMarker>
    <MapboxMarker v-if="customMarker" :lng-lat="customMarker">
        <div class="everythingCentered Beating" style="background-color: #f60700; width: 50px; height: 50px; border-radius: 50%">
            <div class="red_growing_circle"></div>
            <img src="../assets/icons/sos.svg" style="filter: invert(100%) brightness(1000%); width: 20px; height: 20px;" />
        </div>
    </MapboxMarker>
    <MapboxMarker v-if="!props.showRoute" v-for="fireUnit in fireUnits" :key="fireUnit.id" :lng-lat="[fireUnit.lon, fireUnit.lat]">
        <div class="everythingCentered">
          <div class="fireunit-icon-container" :style="{ backgroundColor: getStationColor(fireUnit.type) }">
            <img src="../assets/icons/firestation.svg" style="width: 12px; height: 12px; filter: invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%);" />
          </div>
        </div>
        <div class="fireunit-label-mapbox" :class="getLabelClass(fireUnit.type)">{{ getStationCode(fireUnit.name) }}</div>
    </MapboxMarker>
  </MapboxMap>
</template>
<style scoped>
.everythingCentered {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.everythingCentered img,
.everythingCentered > div {
  position: absolute;
}
.red_growing_circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: transparent;
  border: 2px solid #f60700;
  animation: growing 2s infinite;
}
.blue_growing_circle {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background-color: transparent;
  border: 2px solid #0078f3;
  animation: growing 2s infinite;
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

.station-label-mapbox {
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

.fireunit-label-mapbox {
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

.map{
  transition: all 0.5s ease-in-out;
}
@keyframes growing {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    border-width: 1px;
  }
  60% {
    opacity: 0.5;
  }
  80% {
    opacity: 0.3;
    border-width: 0.5px;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}
.Beating {
  animation: beating 2s infinite;
}
@keyframes beating {
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.2);
  }
  50% {
    transform: scale(1);
  }
  100% {
    transform: scale(1);
  }
}
</style>