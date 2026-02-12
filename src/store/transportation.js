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

  const parseDepartureMinutes = (value) => {
    if (!value || typeof value !== 'string') return Number.POSITIVE_INFINITY;
    if (value.trim().toLowerCase() === 'proche') return 0;
    const match = value.match(/(\d+)/);
    if (!match) return Number.POSITIVE_INFINITY;
    return Number.parseInt(match[1], 10);
  };

  // --- 🚏 Traitement TCL (Feuille 6) ---
  const processTCL = () => {
    const data = sheetsData.value['Feuille 6'] || [];
    const groupedStops = new Map();

    for (const curr of data) {
      if (!curr || !curr.arret || curr.arret.trim() === '') continue;
      const arret = curr.arret.trim();
      const ligne = curr.ligne ? String(curr.ligne).trim() : '';
      const key = `${arret}__${ligne}`;

      if (!groupedStops.has(key)) {
        groupedStops.set(key, {
          arret,
          ligne,
          service: curr.service,
          gid: curr.gid,
          buses: [],
        });
      }

      groupedStops.get(key).buses.push({
        gid: curr.gid,
        ligne,
        direction: curr.direction,
        prochainDepart: curr.prochainDepart,
        ensuiteDepart: curr.ensuiteDepart,
      });
    }

    tcl.value = Array.from(groupedStops.values())
      .map((stop) => ({
        ...stop,
        buses: stop.buses.sort(
          (a, b) => parseDepartureMinutes(a.prochainDepart) - parseDepartureMinutes(b.prochainDepart)
        ),
      }))
      .sort((a, b) => {
        const aNext = parseDepartureMinutes(a.buses[0]?.prochainDepart);
        const bNext = parseDepartureMinutes(b.buses[0]?.prochainDepart);
        return aNext - bNext;
      });
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
