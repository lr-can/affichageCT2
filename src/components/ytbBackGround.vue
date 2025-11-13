<script>
export default {
  name: "YouTubeBackground",
  props: {
    VidId: {
      type: String,
      required: true,
    },
  },
  mounted() {
    // Optionnel : Assurez-vous que l'API YouTube est chargée
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  },
};
</script>

<template>
  <div class="background-container">
    <iframe
      id="ytplayer"
      type="text/html"
      width="640"
      height="360"
      :src="`https://www.youtube.com/embed/${$props.VidId}?autoplay=1&mute=1&loop=1&playlist=${$props.VidId}&controls=0&showinfo=0&modestbranding=1&rel=0&vq=480`"
      frameborder="0"
      allow="autoplay; encrypted-media"
      allowfullscreen="0"
    ></iframe>
  </div>
</template>

<style scoped>
.background-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  z-index: 2;
}

iframe {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 640px;
  height: 360px;
  transform: translate(-50%, -50%) scale(1);
  pointer-events: none; /* Désactive les interactions avec la vidéo */
}
</style>
