<template>
    <div class="background-container">
    </div>

</template>
<script setup>
import { ref } from 'vue'
</script>
<style scoped>
.background-container {
    background-color: white;
    width: 100dvw;
    height: 100dvh;
    position: absolute;
    top: 0;
    left: 0;
    z-index: -100;
}

</style>