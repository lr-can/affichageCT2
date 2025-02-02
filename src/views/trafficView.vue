<template>
    <div id="Title">
        <h1>Trafic</h1>
    </div>
    <div class="interContainer"  v-show="asAwait">
        <div>
            <wazeView />
        </div>
    </div>
</template>
<script setup>
import { onMounted, ref } from 'vue';
import wazeView from '../components/wazeView.vue';
const asAwait = ref(false);

setTimeout(() => {
    asAwait.value = true;
}, 5000);
</script>
<style scoped>
#Title {
    position: absolute;
    top: 1.2rem;
    left: 2.5rem;
    z-index: 4;
    color: white;
    font-size: 1em;
    text-align: center;
    text-transform: uppercase;
}
.interContainer {
    display: flex;
    align-items: center;
    height: 70%;
    width: 60%;
    position: absolute;
    top: 53%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 3;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1), 0px 6px 20px rgba(0, 0, 0, 0.1);
    border-radius: 30px;
    backdrop-filter: blur(10px) brightness(1);
    background-color: #ffffffe5;
    opacity: 0.9;
    transition: all 3s;
    overflow: hidden;
    animation: hide 20s;
}
@keyframes hide {
    0% {
        opacity: 0.9;
    }
    49% {
        opacity: 0.9;
    }
    50% {
        opacity: 0.1;
    }
    99% {
        opacity: 0.1;
    }
    100% {
        opacity: 0.9;
    }
}
.interContainer > div:first-child {
    z-index: 10;
    width: 100%;
    height: 100%;
    padding: 0;
    scale: 1.2;
    transform: translateY(-10%);
    opacity: 0.8;
    transition: all 3s;
}
</style>