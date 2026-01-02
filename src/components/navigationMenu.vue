<template>
  <nav 
    class="navigation-menu" 
    :class="{ 'menu-visible': isVisible }"
    :style="{ '--current-view-color': getCurrentViewColor() }"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <div class="menu-content">
      <div class="menu-header">
        <h3>Navigation</h3>
        <div class="menu-indicator">
          <span class="indicator-dot" :style="{ backgroundColor: getCurrentViewColor() }"></span>
          <span class="indicator-text">{{ getCurrentViewName() }}</span>
        </div>
      </div>
      
      <ul class="menu-list">
        <li 
          v-for="view in availableViews" 
          :key="view.name"
          class="menu-item"
          :class="{ 'active': currentViewIndex === view.index, 'disabled': view.time === 0 }"
          @click="selectView(view.index)"
        >
          <div class="menu-item-content">
            <span class="menu-item-icon">{{ view.icon }}</span>
            <span class="menu-item-label">{{ view.label }}</span>
            <span v-if="view.time === 0" class="menu-item-badge">Inactif</span>
          </div>
          <div class="menu-item-progress" v-if="currentViewIndex === view.index">
            <div class="progress-bar" :style="{ width: `${progressPercentage}%` }"></div>
          </div>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  views: {
    type: Array,
    required: true
  },
  currentIndex: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['view-change']);

const isVisible = ref(false);
const progressPercentage = ref(0);
const progressInterval = ref(null);
const startTime = ref(Date.now());
const hideTimeout = ref(null);
const MOUSE_INACTIVITY_DELAY = 3000; // 3 secondes d'inactivité avant de cacher

const viewLabels = {
  'today': { label: 'Aujourd\'hui', icon: '📅', color: '#0078f3' },
  'weather': { label: 'Météo', icon: '🌤️', color: '#00b0f0' },
  'vehicule': { label: 'Véhicules', icon: '🚒', color: '#f60700' },
  'lastInter': { label: 'Dernière intervention', icon: '🚨', color: '#e67e22' },
  'traffic': { label: 'Trafic', icon: '🚦', color: '#ffc000' },
  'interEnCours': { label: 'Intervention en cours', icon: '🔥', color: '#e74c3c' },
  'weatherWarning': { label: 'Alerte météo', icon: '⚠️', color: '#f1c40f' },
  'consignes': { label: 'Consignes', icon: '📋', color: '#fd4a45' },
  'hommage': { label: 'Hommage', icon: '🇫🇷', color: '#34495e' }
};

const availableViews = computed(() => {
  return props.views
    .map((view, index) => ({
      name: view.viewName,
      index: index,
      label: viewLabels[view.viewName]?.label || view.viewName,
      icon: viewLabels[view.viewName]?.icon || '📄',
      time: view.time,
      color: viewLabels[view.viewName]?.color || '#666'
    }))
    .filter(view => view.time > 0 || props.currentIndex === view.index);
});

const currentViewIndex = computed(() => props.currentIndex);

const showMenu = () => {
  isVisible.value = true;
  // Annuler le timeout de masquage s'il existe
  if (hideTimeout.value) {
    clearTimeout(hideTimeout.value);
    hideTimeout.value = null;
  }
};

const hideMenu = () => {
  if (hideTimeout.value) {
    clearTimeout(hideTimeout.value);
  }
  hideTimeout.value = setTimeout(() => {
    isVisible.value = false;
  }, MOUSE_INACTIVITY_DELAY);
};

const onMouseEnter = () => {
  showMenu();
};

const onMouseLeave = () => {
  hideMenu();
};

const handleMouseMove = () => {
  showMenu();
  hideMenu(); // Redémarrer le timer
};

const selectView = (index) => {
  if (props.views[index].time === 0 && props.currentIndex !== index) return;
  emit('view-change', index);
  // Garder le menu visible après sélection pendant 5 secondes
  showMenu();
  if (hideTimeout.value) {
    clearTimeout(hideTimeout.value);
  }
  hideTimeout.value = setTimeout(() => {
    isVisible.value = false;
  }, 5000);
};

const getCurrentViewName = () => {
  const currentView = availableViews.value.find(v => v.index === currentViewIndex.value);
  return currentView ? currentView.label : 'Inconnu';
};

const getCurrentViewColor = () => {
  const currentView = availableViews.value.find(v => v.index === currentViewIndex.value);
  return currentView ? currentView.color : '#666';
};

const updateProgress = () => {
  if (!props.views[currentViewIndex.value]) {
    progressPercentage.value = 0;
    return;
  }
  
  const currentView = props.views[currentViewIndex.value];
  if (!currentView || currentView.time === 0) {
    progressPercentage.value = 0;
    return;
  }
  
  const elapsed = (Date.now() - startTime.value) / 1000;
  const total = currentView.time;
  progressPercentage.value = Math.min((elapsed / total) * 100, 100);
};

onMounted(() => {
  startTime.value = Date.now();
  progressInterval.value = setInterval(updateProgress, 100);
  
  // Écouter les mouvements de la souris sur tout le document
  document.addEventListener('mousemove', handleMouseMove);
});

onUnmounted(() => {
  if (progressInterval.value) {
    clearInterval(progressInterval.value);
  }
  if (hideTimeout.value) {
    clearTimeout(hideTimeout.value);
  }
  document.removeEventListener('mousemove', handleMouseMove);
});

// Réinitialiser le timer quand la vue change
watch(() => props.currentIndex, () => {
  startTime.value = Date.now();
  updateProgress();
});
</script>

<style scoped>
.navigation-menu {
  position: fixed;
  top: 1.5rem;
  left: 1.5rem;
  z-index: 1000;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.navigation-menu.menu-visible {
  pointer-events: all;
}

.menu-content {
  width: 320px;
  max-height: 0;
  overflow: hidden;
  background: rgba(20, 20, 30, 0.85);
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3),
              0 8px 24px rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
  pointer-events: none;
}

.navigation-menu.menu-visible .menu-content {
  max-height: 80vh;
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: all;
  padding: 1.5rem;
}

.menu-header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 1rem;
}

.menu-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  letter-spacing: -0.02em;
}

.menu-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  font-size: 0.875rem;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-shadow: 0 0 12px currentColor;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.2); }
}

.indicator-text {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: calc(80vh - 200px);
  overflow-y: auto;
  padding-right: 0.5rem;
}

.menu-list::-webkit-scrollbar {
  width: 6px;
}

.menu-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.menu-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.menu-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.menu-item {
  position: relative;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.menu-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: currentColor;
  transform: scaleY(0);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateX(4px);
}

.menu-item:hover::before {
  transform: scaleY(1);
}

.menu-item.active {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.menu-item.active::before {
  transform: scaleY(1);
}

.menu-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.menu-item.disabled:hover {
  transform: none;
  background: rgba(255, 255, 255, 0.05);
}

.menu-item-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  position: relative;
  z-index: 1;
}

.menu-item-icon {
  font-size: 1.25rem;
  line-height: 1;
  flex-shrink: 0;
}

.menu-item-label {
  flex: 1;
  color: white;
  font-size: 0.9375rem;
  font-weight: 500;
  letter-spacing: -0.01em;
}

.menu-item-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.menu-item-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, 
    var(--current-view-color, #0078f3) 0%,
    var(--current-view-color, #0078f3) 50%,
    rgba(255, 255, 255, 0.3) 100%);
  transition: width 0.1s linear;
  box-shadow: 0 0 8px var(--current-view-color, #0078f3);
}


@media (max-width: 768px) {
  .menu-content {
    width: calc(100vw - 3rem);
    max-width: 320px;
  }
}
</style>

