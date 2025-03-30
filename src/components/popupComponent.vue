<template>
    <div class="popup" :class="giveClass(showInfo)">
      <div class="popup-content">
        <div>
            <img :src="img_url.replace('..', 'https://raw.githubusercontent.com/lr-can/affichageCT2/refs/heads/master/src')" alt="popup" style="width: 70px; height: auto;" :style="img_url.includes('weather') ? {filter: 'brightness(0) invert(1)', width: '50px'} : ''">
        </div>
        <div>{{ msg_part1 }}</div>
        <div v-if="msg_part2">{{ msg_part2 }}</div>
        <div :style="{color: color_part3, backgroundColor: backgroundColor_part3,fontSize: '1rem', borderRadius : '1rem', padding: '0.5rem', paddingLeft: '1rem', paddingRight: '1rem', marginRight: '0'}">{{ msg_part3 }}</div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, defineEmits, onMounted } from 'vue';
  const props = defineProps({
    img_url: String,
    msg_part1: String,
    msg_part2: String,
    msg_part3: String,
    color_part3: String,
    backgroundColor_part3: String,
    persistency: Boolean
  });
  const isNight = ref(false);
  const emit = defineEmits(['popupClosed']);
  const showInfo = ref(true);

  const checkNight = () => {
    const date = new Date();
    const hour = date.getHours();
    isNight.value = hour < 6 || hour > 21;
  };

  onMounted(() => {
    checkNight();
  });
  
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

  
  const giveClass = (show) => {
    let suffix = '';
    if (isNight.value){
      suffix = ' night';      
    }
    return show ? 'show' + suffix : 'hide' + suffix;
  };
  
  </script>
  
  <style scoped>
  .popup {
    position: fixed;
    top: 1rem;
    left: 45%;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px) brightness(1);
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
  .night {
    background-color: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 20px 10px rgba(255, 255, 255, 0.1);
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
        width: 32vw;
    }
 }
@keyframes disappear {
    0% {
        transform: translateY(0);
        width:  32vw;
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
  
