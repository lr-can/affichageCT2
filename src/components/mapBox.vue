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
const mapStyle = ref('mapbox://styles/mapbox/dark-v11');
const width = ref(100);
const height = ref(100);
const zoom = ref(10);
const customMarker = ref(null);
const props = defineProps({
  lon: Number,
  lat: Number,
});

let mapInstance = ref(null);

onMounted(() => {
  getFireUnits();
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

  // Ajout de la couche de bâtiments en 3D
  map.on('load', () => {
    map.addLayer({
      id: '3d-buildings',
      source: 'composite',
      'source-layer': 'building',
      filter: ['==', 'extrude', 'true'], // Filtre uniquement les bâtiments avec extrusion
      type: 'fill-extrusion',
      paint: {
        'fill-extrusion-color': '#aaa', // Couleur des bâtiments
        'fill-extrusion-height': ['get', 'height'], // Hauteur des bâtiments
        'fill-extrusion-base': ['get', 'min_height'], // Base des bâtiments
        'fill-extrusion-opacity': 0.6, // Opacité des bâtiments
      },
    });
  });

  setTimeout(() => {
    flyToLocation(4.8473705, 45.8172767, 13, 10); // Premier flyTo
  }, 5000);
  // Déclenche les animations flyTo
  setTimeout(() => {
    addTruckRouteToMap(mapInstance.value, [4.8473705, 45.8172767], [props.lon, props.lat]);
    flyToLocation(props.lon, props.lat, 13, 10); // Premier flyTo
    customMarker.value = [props.lon, props.lat];
  }, 10000);
  setTimeout(() => {
    flyToLocation(props.lon, props.lat, 17.5, 60); // Deuxième flyTo
  }, 16000);
};

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
    :style="`width: 100vw; height: 100vh;`"
    access-token="pk.eyJ1IjoibHItY2FuIiwiYSI6ImNsdnc2aXhpMjFpMDkyaW53cmdpajg2aWQifQ.fQ6ILPhZRb05CfdWrsxOvQ"
    class="map"
    :map-style="mapStyle"
    :center="mapCenter"
    :zoom="zoom"
    @mb-created="handleMapReady"
  >
    <MapboxMarker :lng-lat="mapCenter">
        <div class="everythingCentered Beating" style="background-color: #0078f3; width: 30px; height: 30px; border-radius: 50%">
          <div class="blue_growing_circle"></div>
          <img src="../assets/icons/firestation.svg" style="filter: invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%); width: 25px; height: 25px;" />
        </div>
    </MapboxMarker>
    <MapboxMarker v-if="customMarker" :lng-lat="customMarker">
        <div class="everythingCentered Beating" style="background-color: #f60700; width: 50px; height: 50px; border-radius: 50%">
            <div class="red_growing_circle"></div>
            <img src="../assets/icons/sos.svg" style="filter: invert(100%) brightness(1000%); width: 20px; height: 20px;" />
        </div>
    </MapboxMarker>
    <MapboxMarker v-for="fireUnit in fireUnits" :key="fireUnit.id" :lng-lat="[fireUnit.lon, fireUnit.lat]">
        <div class="everythingCentered">
          <img src="../assets/icons/firestation.svg" style="width: 15px; height: 15;" :class="giveFireUnitClass(fireUnit.type)" />
        </div>
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
.site_EM {
  filter: brightness(0) saturate(100%) invert(18%) sepia(100%) saturate(7422%) hue-rotate(0deg) brightness(95%) contrast(102%);
  opacity: 0.9;
}

.site_GPJ {
  filter: brightness(0) saturate(100%) invert(84%) sepia(63%) saturate(686%) hue-rotate(51deg) brightness(95%) contrast(88%);
  opacity: 0.9;
}

.site_GP24 {
  filter: brightness(0) saturate(100%) invert(56%) sepia(91%) saturate(2098%) hue-rotate(9deg) brightness(100%) contrast(97%);
  opacity: 0.9;
}

.site_SPV {
  filter: brightness(0) saturate(100%) invert(30%) sepia(17%) saturate(1556%) hue-rotate(210deg) brightness(89%) contrast(95%);
  opacity: 0.9;
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