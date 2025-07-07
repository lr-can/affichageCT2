import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useSmartemis = defineStore('smartemis', () => {
    const statutsEngins = ref([]);
    const famillesEngins = ref([]);
    const lastUpdateEngins = ref();
    const personnelAvailable = ref({});
    const statutsExtract = ref([]);

    const getStatutsExtract = async () => {
        const data = await fetch('/vehiculesStatuts.json');
        const vehiculesStatutsExtract = await data.json();
        statutsExtract.value = vehiculesStatutsExtract.vehicleStates;
    }
    const getLibforStatutCode = (statutCode) => {
        const statut = statutsExtract.value.find(statut => statut.code === statutCode);
        return statut ? statut.name : '';
    }
    const getEnginsWithStatuts = async () => {
        statutsEngins.value = [];
        famillesEngins.value = [];

        await getStatutsExtract();
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };
        const response = await fetch('https://opensheet.elk.sh/1-S_8VCPQ76y3XTiK1msvjoglv_uJVGmRNvUZMYvmCnE/Feuille%204', options);
        const result = await response.json();
        const [day, month, year, hour, minute, second] = result[0].latestUpdate.match(/\d+/g);
        lastUpdateEngins.value = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
        personnelAvailable.value = {
            available: result[0].availablePersonCounter,
            total: result[0].totalPersonCounter,
        };
        for (const vehicule of result) {
            let nomPhonetique = "";
            if (vehicule.engLib.includes('+')){
                nomPhonetique = vehicule.engLib.replace('+', '').split(' ')[0].split('').join(' ') + " de remplacement";
            } else if (vehicule.engLib.includes('VSAV')){
                nomPhonetique = "V S A V " + vehicule.engLib.replace(' 0', ' ').split(' ')[1];
            } else if (vehicule.engLib.startsWith('L')){
                let nomPhonetiqueBase = vehicule.engLib.split(' ')[0];
                let nomPhonetiqueDict = {
                    "LBACHE" : "Lot bache",
                    "LBALIS": "Lot balisage",
                    "LCTHER": "Lot Caméra thermique",
                    "LDNOY": "Lot dénoyage",
                    "LECLE": "Lot éclairage",
                    "LTRON": "Lot tronçonneuse",
                }
                if (nomPhonetiqueDict[nomPhonetiqueBase]){
                    nomPhonetique = nomPhonetiqueDict[nomPhonetiqueBase] + " ";
                } else {
                    nomPhonetique = "Lot " + nomPhonetiqueBase + " ";
                }
            } else {
                nomPhonetique = vehicule.engLib.split(' ')[0].split('').join(' ') + ' ';
            }
            const engin = {
                id: vehicule.engId,
                lib: vehicule.engLib,
                nomPhonetique: nomPhonetique,
                statut: vehicule.engStatusCod,
                statutLib: getLibforStatutCode(vehicule.engStatusCod),
                backgroundColor: `${vehicule.engStatusBgRgb == '0' ? 'black' : '#' + vehicule.engStatusBgRgb}`,
                libColor: `${vehicule.engStatusFgRgb == '0' ? 'black' : '#' + vehicule.engStatusFgRgb}`,
            };
            const existingFamille = famillesEngins.value.find(famille => famille.famEngCod === vehicule.famEngCod);
            if (!existingFamille) {
                famillesEngins.value.push({
                    famEngCod: vehicule.famEngCod,
                    famEngLib: vehicule.famEngLib,
                    engins: [],
                });
            } 
            famillesEngins.value.find(famille => famille.famEngCod === vehicule.famEngCod).engins.push(engin);
            statutsEngins.value.push(engin);
        };
    };
    const filterEnginsInter = async () => {
        const interStatutsCodes = ["PA", "SL", "DE", "AT", "AR", "ND", "PP", "RE", "AL"];
        await getEnginsWithStatuts();
        console.log("Statuts engins", statutsEngins.value);
        return statutsEngins.value.filter(engin => interStatutsCodes.includes(engin.statut));
    }

    async function getFireStationsInRhone(lon, lat) {
        const url = "https://data.grandlyon.com/geoserver/service-departemental-metropolitain-d-incendie-et-de-secours-sdmis/ows?SERVICE=WFS&VERSION=2.0.0&request=GetFeature&typename=service-departemental-metropolitain-d-incendie-et-de-secours-sdmis:sdmis.caserne&outputFormat=application/json&SRSNAME=EPSG:4171&sortBy=gid";
    
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const data = await response.json();
    
            // Extraction des informations des casernes
            const fireStations = data.features.map(feature => {
                const { coordinates } = feature.geometry;
                const { nom_officiel_site, type_site, adresse_physique, code_postal, commune, photo } = feature.properties;
    
                return {
                    name: nom_officiel_site,
                    type: type_site,
                    lat: coordinates[1],
                    lon: coordinates[0]
                };
            });
    
            // Fonction pour calculer la distance entre deux points géographiques
            function haversineDistance(coords1, coords2) {
                const [lon1, lat1] = coords1;
                const [lon2, lat2] = coords2;
                const R = 6371; // Rayon de la Terre en kilomètres
                const dLat = (lat2 - lat1) * Math.PI / 180;
                const dLon = (lon2 - lon1) * Math.PI / 180;
                const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                          Math.sin(dLon / 2) * Math.sin(dLon / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                return R * c;
            }
    
            // Filtrer les casernes sans "Collonges-au-Mont-d'Or"
            let withoutCollonges = fireStations.filter(fireStation => fireStation.name !== "Collonges-au-Mont-d'Or");
    
            // Trouver la caserne "Collonges-au-Mont-d'Or"
            const collongesStation = fireStations.find(fireStation => fireStation.name === "Collonges-au-Mont-d'Or");
    
            // Filtrer les 10 casernes les plus proches de "Collonges-au-Mont-d'Or"
            const closestToCollonges = withoutCollonges
                .map(station => ({
                    ...station,
                    distance: haversineDistance([collongesStation.lon, collongesStation.lat], [station.lon, station.lat])
                }))
                .sort((a, b) => a.distance - b.distance)
                .slice(0, 10);
    
            // Filtrer les 10 casernes les plus proches des coordonnées fournies
            const closestToCoordinates = withoutCollonges
                .map(station => ({
                    ...station,
                    distance: haversineDistance([lon, lat], [station.lon, station.lat])
                }))
                .sort((a, b) => a.distance - b.distance)
                .slice(0, 10);
    
            // Fusionner les deux listes et éliminer les doublons
            const mergedList = [...new Set([...closestToCollonges, ...closestToCoordinates])]
                .sort((a, b) => a.distance - b.distance)
                .slice(0, 10);
    
            // Retourner la liste fusionnée
            return mergedList;
    
        } catch (error) {
            console.error("Erreur lors de la récupération des données:", error);
            return [];
        }
    }
    

    const agentsInterList = ref([]);
    const gradeOrder = {
        "infirmiere": 1,
        "capitaine": 2,
        "lieutenant": 3,
        "adjudant-chef": 4,
        "adjudant": 5,
        "sergent-chef": 6,
        "sergent": 7,
        "caporal-chef": 8,
        "caporal": 9,
        "Sap 1CL": 10,
        "Sap 2CL": 11,
    }
    const getAgentsInter = async () => {
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };
        const response = await fetch('https://api.cms-collonges.fr/getVehiculesandPeople', options);
        const result = await response.json();
        let agents = result.agentsData;
        agents = agents.map(agent => {
            return {
                ...agent,
                colorBgFul: "#" + agent.statusColor,
            }
        });
        agents = agents.sort((a, b) => {
            return gradeOrder[a.grade.toLowerCase()] - gradeOrder[b.grade.toLowerCase()];
        });
        agentsInterList.value = agents;
    }

    const getInterventionType = async (notificationTitre) => {
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };
        const response = await fetch(`https://api.cms-collonges.fr/interventionType/${encodeURI(notificationTitre)}`, options);
        const result = await response.json();
        return result.type;
    }

    const getInterNoFilter = async () => {
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };
        const response = await fetch('https://opensheet.elk.sh/1-S_8VCPQ76y3XTiK1msvjoglv_uJVGmRNvUZMYvmCnE/Feuille%201', options);
        const result = await response.json();
        const mappedResult = result.map(intervention => {
            const [day, month, year] = intervention.notificationDate.split('/');
            const [hour, minute] = intervention.notificationHeure.split(':');
            const dateTime = new Date(`${year}-${month}-${day}T${hour}:${minute}`);

            return {
                ...intervention,
                dateTime,
            };
        });
        const sortedResult = await mappedResult.sort((a, b) => b.dateTime - a.dateTime);
        return sortedResult;
    };

    const getInterventionsList = async () => {
        const sortedResult = await getInterNoFilter();
        const initialDateTime = sortedResult[0].dateTime;
        let dateTimePlus15Min = new Date(sortedResult[0].dateTime);
        let verif = dateTimePlus15Min.setMinutes(dateTimePlus15Min.getMinutes() + 15);
        let now = new Date();
        if (now.getTime() > verif) {
            return {
                identifiant: "Aucune intervention en cours",
            }
        }
        sortedResult[0].dateTime = initialDateTime;
        //if (now.getTime() > verif) {
        //    sortedResult[0].dateTime = new Date(now.getTime() - 8 * 60 * 1000); // Simulate 4 minutes ago
        //}
        const typeInter = await getInterventionType(sortedResult[0].notificationTitre);
        const sortedMappedResult = await sortedResult.map(intervention => {
            return {
                ...intervention,
                typeInter,
            };
        });
        return sortedMappedResult[0];
    }



        const getEngins = async () => {
            await getEnginsWithStatuts();
            return famillesEngins.value;
        }
        const getLastUpdateEngins = async () => {
            await getEnginsWithStatuts();
            return lastUpdateEngins.value;
        }
        const getAgentsAvailable = async () => {
            await getEnginsWithStatuts();
            return personnelAvailable.value;
        }
        const getStatus = async () => {
            await getEnginsWithStatuts();
            return statutsEngins.value;
        }

        const getTTS = async (message) => {
            const options = {
                method: 'POST',
                headers: {
                  accept: 'application/json',
                  'content-type': 'application/json',
                  authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNDBmODkwZTAtZWUwMi00NjgxLTlmNmItMzM2NmZjOGFkNWJlIiwidHlwZSI6ImFwaV90b2tlbiJ9.UJhTZXEbGdRH3FMDzEIBXDKL5yEw3VC-t5lUynA5vCA'
                },
                body: JSON.stringify({
                  response_as_dict: true,
                  attributes_as_list: false,
                  show_original_response: false,
                  rate: 5,
                  pitch: 0,
                  volume: 20,
                  sampling_rate: 0,
                  providers: "google/fr-FR-Standard-B",
                  language: 'fr',
                  text: message,
                  option: 'MALE'
                })
              };
            const response = await fetch('https://api.edenai.run/v2/audio/text_to_speech', options);
            const result = await response.json();
            return new Audio(result['google/fr-FR-Standard-B'].audio_resource_url);
        }
    
    const getInterDetail = async () => {
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };
        const response1 = await fetch('https://opensheet.elk.sh/1-S_8VCPQ76y3XTiK1msvjoglv_uJVGmRNvUZMYvmCnE/Feuille%209', options);
        const response2 = await fetch('https://opensheet.elk.sh/1-S_8VCPQ76y3XTiK1msvjoglv_uJVGmRNvUZMYvmCnE/Feuille%2010', options);
        const casernes = await fetch('/artemisData.json');
        const casernesData = await casernes.json();
        const casernesDict = casernesData.fireunits.reduce((acc, caserne) => {
            acc[caserne.shortname] = caserne.name;
            return acc;
        }
        , {});
        await getAgentsInter();
        const agents = agentsInterList.value;
        const result = await response1.json();
        const result2 = await response2.json();
        const parsedDetail = JSON.parse(result[0].ITV_detail);
        const parsedExt = JSON.parse(result[0].ITV_Ext);
        const updateTime = result[0].ITV_DT;
        const [day, month, year, hour, minute, second] = updateTime.match(/\d+/g);
        const updateDateTime = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
        const now = new Date();
        const diffInMinutes = (now - updateDateTime) / (1000 * 60);
        const status = diffInMinutes < 20;
        const parsedMessages = result2.map(item => ({
            time: new Date(item.Heure),
            message: item.Message,
        }));

        const formattedResult = {
            details: parsedDetail.map(detail => ({
                interventionId: detail.itvId,
                stationId: detail.depItvCsId,
                stationName: detail.depItvCsLib,
                stationFullName: casernesDict[detail.depItvCsLib] || detail.depItvCsLib,
                vehicles: detail.depItvEngList.map(vehicle => ({
                    id: vehicle.engId,
                    name: vehicle.engLib,
                    status: vehicle.engStatusCod,
                    backgroundColor: `#${vehicle.engStatusBgRgb}`,
                    textColor: `#${vehicle.engStatusFgRgb}`,
                })),
            })),
            externalServices: parsedExt.map(service => ({
                id: service.srvCod,
                name: service.srvLib,
                iconUrl: service.srvUrl,
                status: service.srvStatusCod,
                backgroundColor: `#${service.srvStatusBgRgb}`,
                textColor: `#${service.srvStatusFgRgb}`,
            })),
            messages: parsedMessages,
            agents: agents,
            status: status,
            update: updateDateTime,
        };
        return formattedResult;
    }

    const getMessagesRadio = async () => {
                const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        };
        const response = await fetch('https://opensheet.elk.sh/1-S_8VCPQ76y3XTiK1msvjoglv_uJVGmRNvUZMYvmCnE/Feuille%2010', options);
        const result = await response.json();
        const parsedMessages = result.map(item => ({
            time: new Date(item.Heure),
            message: item.Message,
        }));
        return parsedMessages
    }

    const sendNotification = async (message) => {
        console.log("Sending notification with message:", message);

        const options = {
            method: 'POST',
            body: JSON.stringify(message),
        };
        const response = await fetch('https://trigger.macrodroid.com/c09e260b-8ce5-48c3-b2b4-4a30d4f47c8b/enginsSmartemis', options);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        // The response may not be JSON, so use .text() first and try to parse as JSON
        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch (e) {
            return text;
        }
    }

    return {
        statutsEngins,
        famillesEngins,
        lastUpdateEngins,
        personnelAvailable,
        getEnginsWithStatuts,
        filterEnginsInter,
        getFireStationsInRhone,
        agentsInterList,
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
    };
});

