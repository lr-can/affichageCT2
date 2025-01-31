<template>
    <div id="Background">
        <img src="../assets/backgrounds/CTA.jpg" alt="Véhicule" style="width: 100vw; height: 100vh;">
    </div>
    <div>
        <div id="Title">
            <h1>Synoptique des engins</h1>
        </div>
        <div id="vehiculeContainer">
            
        </div>
    </div>
</template>
<script setup>
import { ref } from 'vue';
</script>
<style scoped>
#Background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    z-index: 1;
    filter: blur(1px) brightness(0.7);
}
#Title {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2;
    color: white;
    text-shadow: 2px 2px 4px #0000008b;
    text-transform: uppercase;
}
</style>