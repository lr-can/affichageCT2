<template>
    <div class="clock-container">
        <div class="clock">
            <span class="heureMin">{{ nowHour.toString().replace("h", '') }}<span class="blink"> : </span>{{ nowMinute }}</span><span class="seconds">{{ nowSeconds }}</span>
        </div>
    </div>
</template>
<style scoped>
.clock-container {
    position: absolute;
    bottom: 1rem;
    right: 1rem;
    padding: 10px;
    font-size: 1.5rem;
    color: white;
    z-index: 50;
    background-color: #ffffff20;
    backdrop-filter: blur(10px) brightness(1);
    border-radius: 3rem;
    width: 10rem;
    box-shadow: 0 0 20px 10px rgba(0, 0, 0, 0.1);
    font-family: 'Roboto', monospace;
}
.clock > span {
    margin: 0 0.2rem;
}
.seconds {
    font-size: 1.2rem;
    color: grey;
}
.blink {
    animation: blink 2s infinite;
}
@keyframes blink {
    0% {
        opacity: 1;
    }
    49.9% {
        opacity: 1;
    }
    50% {
        opacity: 0;
    }
    99.9% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}

</style>
<script setup>
import { ref } from 'vue';
const nowHour = ref(new Date().getHours());
const nowMinute = ref(new Date().getMinutes());
const nowSeconds = ref(new Date().getSeconds());

setInterval(() => {
    nowHour.value = new Date().getHours().toString().padStart(2, '0');
    nowMinute.value = new Date().getMinutes().toString().padStart(2, '0');
    nowSeconds.value = new Date().getSeconds().toString().padStart(2, '0');
}, 1000);

</script>