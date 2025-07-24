import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useTransportation = defineStore('transportation', () => {
    const tcl = ref([]);
    const sncf = ref([]);
    const sncfLYD = ref([]);

    const getData = async () => {
        const options = {
            method: 'GET',
            headers: {accept: 'application/json', 'accept-encoding': 'deflate, gzip, br'}
          };
        const responseTCL = await fetch('https://opensheet.elk.sh/1-S_8VCPQ76y3XTiK1msvjoglv_uJVGmRNvUZMYvmCnE/Feuille%206', options)
        const resultTCL = await responseTCL.json();
        const responseSNCF = await fetch('https://opensheet.elk.sh/1-S_8VCPQ76y3XTiK1msvjoglv_uJVGmRNvUZMYvmCnE/Feuille%207', options)
        const responseSNCF_LYD = await fetch('https://opensheet.elk.sh/1-S_8VCPQ76y3XTiK1msvjoglv_uJVGmRNvUZMYvmCnE/Feuille%2011', options);
        const resultSNCF = await responseSNCF.json();
        const resultSNCF_LYD = await responseSNCF_LYD.json();
        tcl.value = resultTCL.reduce((acc, curr) => {
            let stop = acc.find(item => item.arrêt === curr.arret);
            if (!stop) {
            stop = { arrêt: curr.arret, line: curr.ligne, buses: [] };
            acc.push(stop);
            }
            stop.buses.push({
            direction: curr.direction,
            prochainDepart: curr.prochainDepart,
            ensuiteDepart: curr.ensuiteDepart
            });
            return acc;
        }, []);
        sncf.value = resultSNCF
        sncfLYD.value = resultSNCF_LYD
    }

return {
    tcl,
    sncf,
    sncfLYD,
    getData
};
});