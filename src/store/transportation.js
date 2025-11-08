import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useTransportation = defineStore('transportation', () => {
  // --- 🧠 CACHE GLOBAL ---
  const sheetsData = ref({});
  const lastUpdate = ref(null);

  // --- 🚍 Données transport ---
  const tcl = ref([]);
  const sncf = ref([]);
  const sncfLYD = ref([]);

  // --- ⏱️ Vérification si on doit recharger ---
  const shouldReload = () => {
    if (!lastUpdate.value) return true;
    return (new Date() - lastUpdate.value) / 1000 > 15;
  };

  // --- 🌐 Récupération via ton API globale CMS ---
  const fetchAllSheetsFromAPI = async () => {
    if (!shouldReload()) return;

    //console.log('♻️ Mise à jour des données transports (CMS API)...');
    const response = await fetch(
      'https://api.cms-collonges.fr/getAllSheetsData/1-S_8VCPQ76y3XTiK1msvjoglv_uJVGmRNvUZMYvmCnE'
    );
    const result = await response.json();

    // Conversion en dictionnaire : { "Feuille 6": [objets], ... }
    const map = {};
    for (const sheet of result) {
      const title = sheet.title.trim();
      const [headers, ...rows] = sheet.values;
      map[title] = rows.map((row) => {
        const obj = {};
        headers.forEach((h, i) => (obj[h] = row[i]));
        return obj;
      });
    }

    sheetsData.value = map;
    lastUpdate.value = new Date();

    processTCL();
    processSNCF();
    processSNCF_LYD();

    //console.log('✅ Données transports mises à jour à', lastUpdate.value.toLocaleTimeString());
  };

  // --- 🚏 Traitement TCL (Feuille 6) ---
  const processTCL = () => {
    const data = sheetsData.value['Feuille 6'] || [];

    // Regrouper par arrêt
    tcl.value = data.reduce((acc, curr) => {
      let stop = acc.find((item) => item.arret === curr.arret);
      if (!stop) {
        stop = {
          arret: curr.arret,
          ligne: curr.ligne,
          service: curr.service,
          buses: [],
        };
        acc.push(stop);
      }

      stop.buses.push({
        direction: curr.direction,
        prochainDepart: curr.prochainDepart,
        ensuiteDepart: curr.ensuiteDepart,
      });
      return acc;
    }, []);
  };

  // --- 🚄 Traitement SNCF (Feuille 7) ---
  const processSNCF = () => {
    sncf.value = sheetsData.value['Feuille 7'] || [];
  };

  // --- 🚅 Traitement SNCF Lyon-Duchère (Feuille 11) ---
  const processSNCF_LYD = () => {
    sncfLYD.value = sheetsData.value['Feuille 11'] || [];
  };

  // --- 🚀 Accès simplifié ---
  const getTCL = () => tcl.value;
  const getSNCF = () => sncf.value;
  const getSNCF_LYD = () => sncfLYD.value;

  // --- EXPORT ---
  return {
    // Données
    sheetsData,
    lastUpdate,
    tcl,
    sncf,
    sncfLYD,

    // Fonctions
    fetchAllSheetsFromAPI,
    getTCL,
    getSNCF,
    getSNCF_LYD,
  };
});
