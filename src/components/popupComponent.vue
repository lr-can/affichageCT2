<template>
    <div class="popup" :class="giveClass(showInfo)">
      <div class="popup-content">
        <div>
          <img :src="computeUrl(img_url)" alt="popup" style="width: 70px; height: auto;">
        </div>
        <div>{{ msg_part1 }}</div>
        <div v-if="msg_part2">{{ msg_part2 }}</div>
        <div :style="{color: color_part3, backgroundColor: backgroundColor_part3,fontSize: '1rem', borderRadius : '1rem', padding: '0.5rem', paddingLeft: '1rem', paddingRight: '1rem', marginRight: '0'}">{{ msg_part3 }}</div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, defineEmits } from 'vue';
  const props = defineProps({
    img_url: String,
    msg_part1: String,
    msg_part2: String,
    msg_part3: String,
    color_part3: String,
    backgroundColor_part3: String,
    persistency: Boolean
  });
  
  const emit = defineEmits(['popupClosed']);
  const showInfo = ref(true);

  
  const checkInterval = setInterval(() => {
    if (!props.persistency) {
    clearInterval(checkInterval);
    setTimeout(() => {
    showInfo.value = false;
  }, 20000);
    setTimeout(() => {
        emit('popupClosed');
        }, 22000);
    }
  }, 5000);

  
  const computeUrl = (url) => {
      try {
        return new URL(url, import.meta.url).href;
      } catch (error) {
        console.error("Error computing URL:", error);
        return url; // Fallback to the original URL if there's an error
      }
    };

  const giveClass = (show) => {
    return show ? 'show' : 'hide';
  };
  
  </script>
  
  <style scoped>
  .popup {
    position: fixed;
    top: 1rem;
    left: 45%;
    background-color: black;
    backdrop-filter: blur(10px) brightness(0.1);
    border-radius: 3rem;
    min-width: 1rem;
    box-shadow: 0 0 20px 10px rgba(0, 0, 0, 0.1);
    color: white;
    z-index: 50;
    padding: 10px;
    padding-left: 2rem;
    padding-right: 2rem;
    overflow: hidden;
  }
  
  .popup-content {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }
  
  .popup-content > div {
    margin-right: 1.5rem;
  }
  
  .popup-content > div:nth-child(2) {
    font-size: 1.5rem;
    font-weight: bold;
  }
  
  .popup-content > div:nth-child(3) {
    font-size: 0.8rem;
  }
  

.show {
    animation: appear 1s ease-in-out forwards;
}
.hide {
    animation: disappear 1s ease-in-out forwards;
}
 @keyframes appear {
    0% {
        opacity: 0;
        transform: translateY(-10vw);
        width: 3rem;
    }
    15% {
        opacity: 1;
    }
    30% {
        transform: translateY(0);
        width: 3rem;
    }
    50% {
        width: 3rem;
    }
    100% {
        width: 30vw;
    }
 }
@keyframes disappear {
    0% {
        transform: translateY(0);
        width:  30vw;
    }

    70% {
        transform: translateY(0);
        width: 3rem;
    }
    50% {
        width: 3rem;
    }
    85% {
        opacity: 1;;
    }
    100% {
        transform: translateY(-10vw);
        width: 3rem;
        opacity: 0;
    
}
}
  </style>
  