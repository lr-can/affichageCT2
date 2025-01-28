<template>
    <div v-if="computedIconSrc">
        <img :src="computedIconSrc" alt="Weather Icon" :width="width" :height="height" />
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    iconSrc: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        default: 1
    }
});

const width = computed(() => 50 * props.size);
const height = computed(() => 50 * props.size);

// Générer un chemin valide pour l'image
const computedIconSrc = computed(() =>
    new URL(`../assets/weather/${props.iconSrc}.png`, import.meta.url).href
);
</script>

<style scoped>
div {
    width: 100%;
    height: 100%;
}
</style>
