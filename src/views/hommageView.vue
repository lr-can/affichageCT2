<template>
    <div v-if="evenement" class="hommage-container">
        <div class="left-image" :style="{ backgroundImage: `url(${backgroundImage})` }" />

        <div class="right-pane">
            <div class="header">
                <div class="flag" aria-hidden="true">
                    <span class="band blue" />
                    <span class="band white" />
                    <span class="band red" />
                </div>

                <div class="court-names">
                    <div class="court-short">{{ evenement.evenementNomCourt }}</div>
                    <div class="court-full">{{ evenement.evenementNom }}</div>
                </div>

                <div class="meta">
                    <span class="meta-item">{{ evenement.date?.replace("1900", "") }}</span>
                    <span class="meta-sep">•</span>
                    <span class="meta-item">{{ evenement.evenementType }}</span>
                </div>
            </div>

            <div class="body">
                <h3>Description</h3>
                <p>{{ evenement.evenementDescription }}</p>
                <div class="image" v-if="evenement.complementaryImage">
                    <img :src="evenement.complementaryImage" alt="Image complémentaire" loading="lazy" />
                </div>
            </div>
        </div>
    </div>
    <div v-else>
        <p>Aucun événement sélectionné.</p>
    </div>
</template>


<script setup>
import hommage from '../assets/backgrounds/hommage.jpeg';
import commemoration from '../assets/backgrounds/commemoration.jpeg';
import steBarbe from '../assets/backgrounds/steBarbe.jpeg';
import jNationale from '../assets/backgrounds/jNationale.jpeg';
import armistice from '../assets/backgrounds/armistice.jpeg';
import fNationale from '../assets/backgrounds/fNationale.jpeg';
import jEurope from '../assets/backgrounds/jEurope.jpeg';
import { ref } from 'vue';

const type = ref({
    "Commémoration": hommage,
    "Hommage": hommage,
    "Catastrophe commémorative": commemoration,
    "Fête patronale": steBarbe,
    "Journée nationale": jNationale,
    "Armistice": armistice,
    "Fête nationale": fNationale,
    "Journée européenne": jEurope
});

const { evenement } = defineProps({
    evenement: {
        type: Object,
        default: () => ({
            date: '13/11/2025',
            evenementType: 'Commémoration',
            evenementNom: 'Hommage aux victimes des attentats du 13 novembre 2015',
            evenementNomCourt: 'Hommage 13 novembre',
            evenementDrapeau: 'France',
            evenementHymne: 'France',
            complementaryImage: null,
            evenementDescription:
                'Le 13 novembre 2015, une série d’attentats terroristes frappait Paris et Saint-Denis, visant notamment le Bataclan, le Stade de France et plusieurs terrasses de café. Ces attaques coordonnées, revendiquées par l’organisation État islamique, ont fait 130 morts et plus de 400 blessés, marquant durablement la Nation. Dix ans plus tard, la France se souvient avec émotion de cette nuit tragique, en rendant hommage aux victimes, à leurs familles et à tous les intervenants des secours et de la sécurité. Les cérémonies rappellent la résilience collective, la solidarité et la défense des valeurs républicaines face à la barbarie.'
        })
    }
});
</script>

<style scoped>
.hommage-container {
    display: flex;
    height: 100vh;
    width: 100%;
    overflow: hidden;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
    color: #111;
}

/* Left image: 34% width */
.left-image {
    width: 34%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
}

/* Right pane: 66% width with the left image as a blurred, brighter background */
.right-pane {
    position: relative;
    width: 66%;
    padding: 32px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 18px;
    overflow: hidden;
    background: #fafafa; /* fallback while image loads */
}

/* blurred, slightly over-exposed background using the same asset */
.right-pane::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: url('../assets/backgrounds/hommage.jpeg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;

    /* blur + brighten to simulate more exposition */
    filter: blur(14px) brightness(1) contrast(1.05) saturate(1.05);

    /* slightly scale so blur doesn't show edges */
    transform: scale(1.06);
    z-index: 0;
    opacity: 0.15;
    pointer-events: none;
}

/* keep pane content above the decorative background */
.right-pane > * {
    position: relative;
    z-index: 1;
}

/* Header occupies up to 70% of the right pane height */
.header {
    margin-top: 10%;
    max-height: 70%;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

/* Thin French flag: 20px high, full width */
.flag {
    width: 40%;
    height: 10px;
    margin: auto;
    display: flex;
    border-radius: 2px;
    overflow: hidden;
    box-shadow: inset 0 0 0 1px rgba(0,0,0,0.02);
}

.band {
    display: block;
    flex: 1 1 0;
    height: 100%;
}
.band.blue { background: #0055A4; }
.band.white { background: #ffffff; }
.band.red { background: #EF4135; }

/* Court names */
.court-names {
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.court-short {
    padding-top: 10px;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 2rem;
    line-height: 1;
}
.court-full {
    font-size: 1.2rem;
    color: #333;
}

/* Meta row */
.meta {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #666;
    font-size: 0.9rem;
}
.meta-sep { color: #ccc; }

/* Body */
.body {
    overflow: auto;
    padding-top: 10%;
    border-top: 1px solid rgba(0,0,0,0.06);
}
.body h3 {
    margin: 0 0 8px 0;
    font-size: 1.2rem;
    display: none;
}
.body p {
    margin: 0;
    padding-left: 10%;
    padding-right: 10%;
    text-align: justify;
    line-height: 1.6;
    font-size: 1.2rem;
    color: #222;
    white-space: pre-wrap;
}

.image {
    margin-top: 50px;
    display: flex;
    justify-content: center;
}
.image img {
    max-width: 40%;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

/* Responsive: stack on small screens */
@media (max-width: 800px) {
    .hommage-container {
        flex-direction: column;
        height: auto;
    }
    .left-image, .right-pane {
        width: 100%;
    }
    .left-image { height: 200px; }
}
</style>
