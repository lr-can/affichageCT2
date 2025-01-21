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
        return statutsEngins.value.filter(engin => interStatutsCodes.includes(engin.statut));
    }

    async function getFireStationsInRhone() {
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

            return fireStations.filter(fireStation => fireStation.name != "Collonges-au-Mont-d'Or");
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

    const getInterventionsList = async () => {
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
        let dateTime15Min = new Date();
        dateTime15Min.setMinutes(dateTime15Min.getMinutes() - 15);
        if (new Date() > dateTime15Min) {
            return {
                identifiant: "Aucune intervention en cours",
            }
        }
        const typeInter = await getInterventionType(sortedResult[0].notificationTitre);
        const sortedMappedResult = await sortedResult.map(intervention => {
            return {
                ...intervention,
                typeInter,
            };
        });
        return sortedMappedResult[0];
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
    };
});

