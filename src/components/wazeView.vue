<template>
    <div class="waze-view">
        <iframe
            width="100%"
            height="100%"
            frameborder="0"
            style="border:0"
            :src="wazeUrl"
            allowfullscreen
        ></iframe>
    </div>
</template>

<script>
export default {
    name: 'WazeView',
    computed: {
        wazeUrl() {
            return `https://embed.waze.com/iframe?zoom=14&lat=45.818473&lon=4.878860`;
        }
    }
}
</script>

<style scoped>
.waze-view {
    width: 100vw;
    height: 100vh;
}
</style>