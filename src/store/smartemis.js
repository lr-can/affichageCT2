import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useSmartemis = defineStore('smartemis', () => {
  // ---- CACHE GLOBAL DES FEUILLES ----
  const sheetsData = ref({});
  const lastSheetsUpdate = ref(null);

  const shouldReloadSheets = () => {
    if (!lastSheetsUpdate.value) return true;
    const diffSec = (new Date() - lastSheetsUpdate.value) / 1000;
    return diffSec > 15; // > 15 secondes
  };

  const fetchAllSheetsFromAPI = async () => {
    if (!shouldReloadSheets()) return;

    //console.log('♻️ Rechargement des feuilles via CMS API...');
    const response = await fetch(
      'https://api.cms-collonges.fr/getAllSheetsData/1-S_8VCPQ76y3XTiK1msvjoglv_uJVGmRNvUZMYvmCnE'
    );
    const result = await response.json();

    const map = {};
    for (const sheet of result) {
      const title = sheet.title.trim();
      const [headers, ...rows] = sheet.values;
      map[title] = rows.map((row) => {
        const obj = {};
        headers.forEach((h, i) => {
          obj[h] = row[i];
        });
        return obj;
      });
    }

    sheetsData.value = map;
    lastSheetsUpdate.value = new Date();
    //console.log('✅ Feuilles mises à jour à', lastSheetsUpdate.value.toLocaleTimeString());
  };

  // ---- REFS PRINCIPALES ----
  const statutsEngins = ref([]);
  const famillesEngins = ref([]);
  const lastUpdateEngins = ref();
  const personnelAvailable = ref({});
  const statutsExtract = ref([]);

  const agentsInterList = ref([]); // agents via getVehiculesandPeople

  // ---- STATUTS ENGIN (vehiculesStatuts.json) ----
  const getStatutsExtract = async () => {
    const data = await fetch('/vehiculesStatuts.json');
    const vehiculesStatutsExtract = await data.json();
    statutsExtract.value = vehiculesStatutsExtract.vehicleStates;
  };

  const getLibforStatutCode = (statutCode) => {
    const statut = statutsExtract.value.find((s) => s.code === statutCode);
    return statut ? statut.name : '';
  };

  // ---- ENGIN + STATUTS (Feuille 4) ----
  const getEnginsWithStatuts = async () => {
    statutsEngins.value = [];
    famillesEngins.value = [];

    await fetchAllSheetsFromAPI();
    await getStatutsExtract();

    const result = sheetsData.value['Feuille 4'] || [];
    if (!result.length) return;

    const [day, month, year, hour, minute, second] =
      result[0].latestUpdate.match(/\d+/g);
    lastUpdateEngins.value = new Date(
      `${year}-${month}-${day}T${hour}:${minute}:${second}`
    );
    personnelAvailable.value = {
      available: result[0].availablePersonCounter,
      total: result[0].totalPersonCounter,
    };

    for (const vehicule of result) {
        if (!vehicule.engLib) continue;

        // --- Génération du nom phonétique ---
        let nomPhonetique = '';
        if (vehicule.engLib.includes('+')) {
            nomPhonetique =
            vehicule.engLib.replace('+', '').split(' ')[0].split('').join(' ') +
            ' de remplacement';
        } else if (vehicule.engLib.includes('VSAV')) {
            nomPhonetique =
            'V S A V ' + vehicule.engLib.replace(' 0', ' ').split(' ')[1];
        } else if (vehicule.engLib.startsWith('L')) {
            const base = vehicule.engLib.split(' ')[0];
            const dict = {
            LBACHE: 'Lot bache',
            LBALIS: 'Lot balisage',
            LCTHER: 'Lot Caméra thermique',
            LDNOY: 'Lot dénoyage',
            LECLE: 'Lot éclairage',
            LTRON: 'Lot tronçonneuse',
            };
            nomPhonetique = dict[base] ? dict[base] + ' ' : 'Lot ' + base + ' ';
        } else {
            nomPhonetique = vehicule.engLib.split(' ')[0].split('').join(' ') + ' ';
        }

        // --- Objet engin ---
        const engin = {
            id: vehicule.engId,
            lib: vehicule.engLib,
            nomPhonetique,
            statut: vehicule.engStatusCod,
            statutLib: getLibforStatutCode(vehicule.engStatusCod),
            backgroundColor:
            vehicule.engStatusBgRgb === '0' ? 'black' : `#${vehicule.engStatusBgRgb}`,
            libColor:
            vehicule.engStatusFgRgb === '0' ? 'black' : `#${vehicule.engStatusFgRgb}`,
        };

        // --- 🔥 Regroupement par libellé de famille (corrigé) ---
        const famKey = vehicule.famEngLib || vehicule.famEngCod || 'Autre';
        let famille = famillesEngins.value.find((f) => f.famEngLib === famKey);

        if (!famille) {
            famille = {
            famEngCod: vehicule.famEngCod || 'NC',
            famEngLib: famKey,
            engins: [],
            };
            famillesEngins.value.push(famille);
        }

        famille.engins.push(engin);
        statutsEngins.value.push(engin);
        }

  };

  const filterEnginsInter = async () => {
    const interStatutsCodes = [
      'PA',
      'SL',
      'DE',
      'AT',
      'AR',
      'ND',
      'PP',
      'RE',
      'AL',
    ];
    await getEnginsWithStatuts();
    return statutsEngins.value.filter((engin) =>
      interStatutsCodes.includes(engin.statut)
    );
  };

  // ---- CASERNES GRAND LYON ----
  async function getFireStationsInRhone(lon, lat) {
    const url =
      'https://data.grandlyon.com/geoserver/service-departemental-metropolitain-d-incendie-et-de-secours-sdmis/ows?SERVICE=WFS&VERSION=2.0.0&request=GetFeature&typename=service-departemental-metropolitain-d-incendie-et-de-secours-sdmis:sdmis.caserne&outputFormat=application/json&SRSNAME=EPSG:4171&sortBy=gid';

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const fireStations = data.features.map((feature) => {
        const { coordinates } = feature.geometry;
        const { nom_officiel_site, type_site } = feature.properties;

        return {
          name: nom_officiel_site,
          type: type_site,
          lat: coordinates[1],
          lon: coordinates[0],
        };
      });

      function haversineDistance(coords1, coords2) {
        const [lon1, lat1] = coords1;
        const [lon2, lat2] = coords2;
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      }

      let withoutCollonges = fireStations.filter(
        (s) => s.name !== "Collonges-au-Mont-d'Or"
      );
      const collongesStation = fireStations.find(
        (s) => s.name === "Collonges-au-Mont-d'Or"
      );

      const closestToCollonges = withoutCollonges
        .map((station) => ({
          ...station,
          distance: haversineDistance(
            [collongesStation.lon, collongesStation.lat],
            [station.lon, station.lat]
          ),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10);

      const closestToCoordinates = withoutCollonges
        .map((station) => ({
          ...station,
          distance: haversineDistance(
            [lon, lat],
            [station.lon, station.lat]
          ),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10);

      const mergedList = [...closestToCollonges, ...closestToCoordinates]
        .filter(
          (v, i, self) =>
            i === self.findIndex((s) => s.name === v.name && s.lon === v.lon)
        )
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10);

      return mergedList;
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      return [];
    }
  }

  // ---- AGENTS SUR INTER (API CMS) ----
  const gradeOrder = {
    infirmiere: 1,
    capitaine: 2,
    lieutenant: 3,
    'adjudant-chef': 4,
    adjudant: 5,
    'sergent-chef': 6,
    sergent: 7,
    'caporal-chef': 8,
    caporal: 9,
    'Sap 1CL': 10,
    'Sap 2CL': 11,
  };

  const getAgentsInter = async () => {
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const response = await fetch(
      'https://api.cms-collonges.fr/getVehiculesandPeople',
      options
    );
    const result = await response.json();
    let agents = result.agentsData;
    agents = agents.map((agent) => ({
      ...agent,
      colorBgFul: '#' + agent.statusColor,
    }));
    
    // Dédupliquer les agents par matricule avant le tri
    const agentsMap = new Map();
    for (const agent of agents) {
      const matricule = (agent.matricule || '').toString().trim();
      if (matricule && !agentsMap.has(matricule)) {
        agentsMap.set(matricule, agent);
      }
    }
    agents = Array.from(agentsMap.values());
    
    agents = agents.sort(
      (a, b) =>
        gradeOrder[a.grade.toLowerCase()] -
        gradeOrder[b.grade.toLowerCase()]
    );
    agentsInterList.value = agents;
  };

  // ---- TYPE D’INTER (API CMS) ----
  const getInterventionType = async (notificationTitre) => {
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const response = await fetch(
      `https://api.cms-collonges.fr/interventionType/${encodeURI(
        notificationTitre
      )}`,
      options
    );
    const result = await response.json();
    try {
      if (!result || typeof result.type === "undefined" || result.type === null) {
        return "Unknown";
      }
    } catch (e) {
      return "Unknown";
    }
    return result.type;
  };

  // ---- INTERVENTIONS (Feuille 1) ----
  const getInterNoFilter = async () => {
    await fetchAllSheetsFromAPI();
    const result = sheetsData.value['Feuille 1'] || [];
    const mappedResult = result.map((intervention) => {
      const [day, month, year] = intervention.notificationDate.split('/');
      const [hour, minute] = intervention.notificationHeure.split(':');
      const dateTime = new Date(`${year}-${month}-${day}T${hour}:${minute}`);
      return { ...intervention, dateTime };
    });
    const sortedResult = mappedResult.sort(
      (a, b) => b.dateTime - a.dateTime
    );
    return sortedResult;
  };

  const getInterventionsList = async () => {
    const sortedResult = await getInterNoFilter();
    if (!sortedResult.length) {
      return { identifiant: 'Aucune intervention en cours' };
    }

    const initialDateTime = sortedResult[0].dateTime;
    let dateTimePlus15Min = new Date(sortedResult[0].dateTime);
    let verif = dateTimePlus15Min.setMinutes(
      dateTimePlus15Min.getMinutes() + 15
    );
    let now = new Date();
    if (now.getTime() > verif) {
      return {
        identifiant: 'Aucune intervention en cours',
      };
    }
    sortedResult[0].dateTime = initialDateTime;

    const typeInter = await getInterventionType(
      sortedResult[0].notificationTitre
    );
    const sortedMappedResult = sortedResult.map((intervention) => ({
      ...intervention,
      typeInter,
    }));
    console.log(sortedMappedResult[0]);
    return sortedMappedResult[0];
  };

  // ---- WRAPPERS ENGINS ----
  const getEngins = async () => {
    await getEnginsWithStatuts();
    return famillesEngins.value;
  };

  const getLastUpdateEngins = async () => {
    await getEnginsWithStatuts();
    return lastUpdateEngins.value;
  };

  const getAgentsAvailable = async () => {
    await getEnginsWithStatuts();
    return personnelAvailable.value;
  };

  const getStatus = async () => {
    await getEnginsWithStatuts();
    return statutsEngins.value;
  };

  // ---- TTS (EdenAI) ----
  const getTTS = async (message) => {
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization:
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNDBmODkwZTAtZWUwMi00NjgxLTlmNmItMzM2NmZjOGFkNWJlIiwidHlwZSI6ImFwaV90b2tlbiJ9.UJhTZXEbGdRH3FMDzEIBXDKL5yEw3VC-t5lUynA5vCA',
      },
      body: JSON.stringify({
        response_as_dict: true,
        attributes_as_list: false,
        show_original_response: false,
        rate: 5,
        pitch: 0,
        volume: 20,
        sampling_rate: 0,
        providers: 'google/fr-FR-Standard-B',
        language: 'fr',
        text: message,
        option: 'MALE',
      }),
    };
    const response = await fetch(
      'https://api.edenai.run/v2/audio/text_to_speech',
      options
    );
    const result = await response.json();
    console.log(result);
    return new Audio(result['google/fr-FR-Standard-B'].audio_resource_url);
  };

  const giveNomPhonetique = (label) => {
  const vehicule = {
    engLib: label,
  };
  let nomPhonetique = '';
  if (vehicule.engLib.includes('+')) {
      nomPhonetique =
      vehicule.engLib.replace('+', '').split(' ')[0].split('').join(' ') +
      ' de remplacement';
  } else if (vehicule.engLib.includes('VSAV')) {
      nomPhonetique =
      'V S A V ' + vehicule.engLib.replace(' 0', ' ').split(' ')[1];
  } else if (vehicule.engLib.startsWith('L')) {
      const base = vehicule.engLib.split(' ')[0];
      const dict = {
      LBACHE: 'Lot bache',
      LBALIS: 'Lot balisage',
      LCTHER: 'Lot Caméra thermique',
      LDNOY: 'Lot dénoyage',
      LECLE: 'Lot éclairage',
      LTRON: 'Lot tronçonneuse',
      };
      nomPhonetique = dict[base] ? dict[base] + ' ' : 'Lot ' + base + ' ';
  } else {
      nomPhonetique = vehicule.engLib.split(' ')[0].split('').join(' ') + ' ';
  }
  return nomPhonetique;
}

  // ---- INTER DETAIL (Feuille 9 + 10 + Artemis + Agents) ----
  const getInterDetail = async () => {
    await fetchAllSheetsFromAPI();

    const feuille9 = sheetsData.value['Feuille 9'] || [];
    const feuille10 = sheetsData.value['Feuille 10'] || [];

    if (!feuille9.length) return null;

    const casernes = await fetch('/artemisData.json');
    const casernesData = await casernes.json();
    const casernesDict = casernesData.fireunits.reduce((acc, caserne) => {
      acc[caserne.shortname] = {
        name: caserne.name,
        nomPhonetique: caserne.nomPhonetique
          ? caserne.nomPhonetique
          : caserne.shortname
            ? caserne.shortname.charAt(0).toUpperCase() + caserne.shortname.slice(1).toLowerCase()
            : undefined,
      };
      return acc;
    }, {});

    await getAgentsInter();
    const agents = agentsInterList.value;

    const row = feuille9[0];
    const parsedDetail = JSON.parse(row.ITV_detail);
    const parsedExt = JSON.parse(row.ITV_Ext);
    const updateTime = row.ITV_DT;

    const [day, month, year, hour, minute, second] =
      updateTime.match(/\d+/g);
    const updateDateTime = new Date(
      `${year}-${month}-${day}T${hour}:${minute}:${second}`
    );
    const now = new Date();
    const diffInMinutes = (now - updateDateTime) / (1000 * 60);
    const status = diffInMinutes < 20;

    const parsedMessages = feuille10.map((item) => ({
      time: new Date(item.Heure),
      message: item.Message,
    }));

    const formattedResult = {
      details: parsedDetail.map((detail) => {
        const caserneInfo = casernesDict[detail.depItvCsLib];
        // Utiliser name pour le nom complet (ex: "COLLONGES AU MONT D'OR")
        // et nomPhonetique pour le nom phonétique (ex: "Collonges")
        const stationFullName = caserneInfo?.name || detail.depItvCsLib;
        const stationNomPhonetique = caserneInfo?.nomPhonetique || caserneInfo?.name || detail.depItvCsLib;
        
        return {
          interventionId: detail.itvId,
          stationId: detail.depItvCsId,
          stationName: detail.depItvCsLib,
          stationFullName: stationFullName,
          stationNomPhonetique: stationNomPhonetique,
          vehicles: detail.depItvEngList.map((vehicle) => ({
            id: vehicle.engId,
            name: vehicle.engLib,
            status: vehicle.engStatusCod,
            backgroundColor: `#${vehicle.engStatusBgRgb}`,
            textColor: `#${vehicle.engStatusFgRgb}`,
            nomPhonetique: giveNomPhonetique(vehicle.engLib),
          })),
        };
      }),
      externalServices: parsedExt.map((service) => {
        // Convertir les couleurs RGB hex en format CSS, avec gestion des cas spéciaux
        // Extraire les valeurs brutes
        const rawBgRgb = service.srvStatusBgRgb;
        const rawFgRgb = service.srvStatusFgRgb;
        
        // Nettoyer et normaliser les valeurs (supprimer # si présent, trim, uppercase)
        let bgRgb = '';
        if (rawBgRgb != null && rawBgRgb !== '') {
          bgRgb = String(rawBgRgb).trim().replace(/^#/, '').toUpperCase();
        }
        
        let fgRgb = '';
        if (rawFgRgb != null && rawFgRgb !== '') {
          fgRgb = String(rawFgRgb).trim().replace(/^#/, '').toUpperCase();
        }
        
        // Convertir en format CSS avec validation stricte
        let backgroundColor = '#FFFFFF'; // Par défaut blanc
        if (bgRgb && bgRgb !== '0' && bgRgb.length === 6 && /^[0-9A-F]{6}$/.test(bgRgb)) {
          backgroundColor = `#${bgRgb}`;
        } else if (bgRgb && bgRgb.length === 3 && /^[0-9A-F]{3}$/.test(bgRgb)) {
          // Support des couleurs courtes (ex: FFF -> FFFFFF)
          backgroundColor = `#${bgRgb[0]}${bgRgb[0]}${bgRgb[1]}${bgRgb[1]}${bgRgb[2]}${bgRgb[2]}`;
        }
        
        let textColor = '#000000'; // Par défaut noir
        if (fgRgb && fgRgb !== '0' && fgRgb.length === 6 && /^[0-9A-F]{6}$/.test(fgRgb)) {
          textColor = `#${fgRgb}`;
        } else if (fgRgb && fgRgb.length === 3 && /^[0-9A-F]{3}$/.test(fgRgb)) {
          // Support des couleurs courtes (ex: 000 -> 000000)
          textColor = `#${fgRgb[0]}${fgRgb[0]}${fgRgb[1]}${fgRgb[1]}${fgRgb[2]}${fgRgb[2]}`;
        }
        
        // Correction automatique des contrastes pour la lisibilité
        if (backgroundColor === '#FFFFFF' && textColor === '#FFFFFF') {
          textColor = '#000000';
        }
        if (backgroundColor === '#000000' && textColor === '#000000') {
          textColor = '#FFFFFF';
        }
        
        return {
          id: service.srvCod,
          name: service.srvLib || service.srvCod,
          iconUrl: service.srvUrl,
          status: service.srvStatusCod,
          backgroundColor,
          textColor,
        };
      }),
      messages: parsedMessages,
      agents,
      status,
      update: updateDateTime,
    };
    return formattedResult;
  };

  // ---- MESSAGES RADIO (Feuille 10) ----
  const getMessagesRadio = async () => {
    await fetchAllSheetsFromAPI();
    const result = sheetsData.value['Feuille 10'] || [];
    const parsedMessages = result.map((item) => ({
      time: new Date(item.Heure),
      message: item.Message,
    }));
    return parsedMessages;
  };

  // ---- NOTIFICATION (MacroDroid) ----
  const sendNotification = async (message) => {
    //console.log('Sending notification with message:', message);

    const options = {
      method: 'POST',
      body: JSON.stringify(message),
    };
    const response = await fetch(
      'https://trigger.macrodroid.com/c09e260b-8ce5-48c3-b2b4-4a30d4f47c8b/enginsSmartemis',
      options
    );
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      return text;
    }
  };

  // ---- ARAH (Feuille 8) ----
  const isArah = async () => {
    await fetchAllSheetsFromAPI();
    const result = sheetsData.value['Feuille 8'] || [];
    return result[0]?.isArah === 'OUI';
  };

  // ---- DISPONIBILITÉS PERSONNES (Feuille 12 + 5) ----
  const getAvailablePeople = async () => {
    await fetchAllSheetsFromAPI();

    let result = sheetsData.value['Feuille 12'] || [];
    let interventionResult = sheetsData.value['Feuille 5'] || [];

    // Ajouter ceux en INTER qui ne sont pas dans la feuille 12
    for (const person of interventionResult) {
      let personFind = result.find(
        (p) => p.matricule === person.matricule
      );
      if (!personFind) {
        result.push({
          matricule: person.matricule,
          nom: person.nom,
          prenom: person.prenom,
          status: 'INTER',
          statusColor: 'FF0000',
          grade: person.grade,
        });
      }
    }

    const dict_status = {
      INTER: 0,
      GP: 1,
      DCT: 1,
      DP: 2,
      DIP: 3,
      AEC: 4,
      AOR: 5,
      IN: 6,
      IND: 7,
    };

    result = result.sort((a, b) => {
      if (dict_status[a.status] < dict_status[b.status]) {
        return -1;
      } else if (dict_status[a.status] > dict_status[b.status]) {
        return 1;
      } else {
        return 0;
      }
    });
    return result;
  };

  const getChangedPeople = async (original_status) => {
    const newPeople = await getAvailablePeople();
    let changedPeople = [];
    for (const newPerson of newPeople) {
      const originalPerson = original_status.find(
        (person) => person.matricule === newPerson.matricule
      );
      if (originalPerson && originalPerson.status !== newPerson.status) {
        changedPeople.push({
          ...newPerson,
          oldStatus: originalPerson.status,
        });
      }
    }
    return changedPeople;
  };

  // ---- CONSIGNES (Feuille 13) ----
  const getConsignes = async () => {
    await fetchAllSheetsFromAPI();
    const result = sheetsData.value['Feuille 13'] || [];
    return result;
  };

  // ---- PAVOISEMENT ET HOMMAGE (Feuille 14) ----
  const getPavoisementAndHommage = async () => {
    await fetchAllSheetsFromAPI();
    const result = sheetsData.value['Feuille 14'] || [];
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const today_ddmm = `${day}/${month}`;
    const today_ddmmyyyy = `${day}/${month}/${today.getFullYear()}`;
    const filteredResult = result.filter(
      (item) =>
        item.date === today_ddmm + "/1900" || item.date === today_ddmmyyyy
    );
    if (filteredResult.length === 0) {
      return null;
    }
    if (filteredResult.length === 1) {
      return filteredResult[0];
    }
    const currentYear = String(today.getFullYear());
    const withCurrentYear = filteredResult.find(
      (item) => item.date && item.date.includes(currentYear)
    );
    console.log('Pavoisement et hommage du jour:', withCurrentYear || filteredResult[0]);
    return withCurrentYear || filteredResult[0];
  }

  // ---- EXPORT ----
  return {
    // cache feuilles
    sheetsData,
    lastSheetsUpdate,
    fetchAllSheetsFromAPI,

    // refs principales
    statutsEngins,
    famillesEngins,
    lastUpdateEngins,
    personnelAvailable,
    agentsInterList,

    // fonctions "historiques" compatibles
    getEnginsWithStatuts,
    filterEnginsInter,
    getFireStationsInRhone,
    getAgentsInter,
    getInterventionsList,
    getEngins,
    getLastUpdateEngins,
    getAgentsAvailable,
    getInterNoFilter,
    getStatus,
    getTTS,
    getInterDetail,
    getInterventionType,
    sendNotification,
    getMessagesRadio,
    isArah,
    getAvailablePeople,
    getChangedPeople,
    getConsignes,
    getPavoisementAndHommage,
  };
});
