<template>
    <div class="calendar-container">
        <div class="calendar-header">
            {{ currentMonth }} {{ currentYear }}
        </div>
        <div class="calendar-grid">
            <div v-for="day in daysOfWeek" :key="day" class="calendar-day-header">
                {{ day }}
            </div>
            <div
                v-for="(day, index) in calendarDays"
                :key="index"
                :class="['calendar-day', { 'past-day': day.isPast }]"
            >
                <div class="day-number">{{ day.date.getDate() }}</div>
                <div v-if="day.equipeGarde" :class="['garde-dot', day.equipeGarde]">-</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    calendar: {
        type: Array,
        required: true,
    },
});

const today = new Date();
const currentMonth = today.toLocaleString('fr-FR', { month: 'long' });
const currentYear = today.getFullYear();
const daysOfWeek = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];

const calendarDays = computed(() => {
    const daysInMonth = new Date(currentYear, today.getMonth() + 1, 0).getDate();
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(currentYear, today.getMonth(), i);
        const isPast = date < today;
        const garde = props.calendar.find((entry) => entry.Date === date.toISOString().split('T')[0]);
        days.push({
            date,
            isPast,
            equipeGarde: garde ? garde.equipeGarde : null,
        });
    }
    return days;
});
</script>

<style scoped>
.calendar-container {
    width: 100%;
    max-width: 100%;
    margin: auto;
    background: white;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    box-sizing: border-box;
}

.calendar-header {
    text-align: center;
    font-size: 0.8em;
    font-weight: bold;
    margin-bottom: 20px;
}

.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
}

.calendar-day-header {
    text-align: center;
    font-weight: bold;
    font-size: 0.8em;
}

.calendar-day {
    text-align: center;
    padding: 10px;
    border-radius: 5px;
    font-size: 0.5em;
}

.past-day {
    color: grey;
}

.day-number {
    font-size: 0.8em;
}

.garde-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin: auto;
    margin-top: 5px;
    display: block;
    color: transparent;
    font-size: 0.5em;
}

.garde-dot.A {
    background-color: #a02b93;
}

.garde-dot.B {
    background-color: #4ea72e;
}

.garde-dot.C {
    background-color: #ffc000;
}

.garde-dot.D {
    background-color: #e97132;
}

.garde-dot.E {
    background-color: #00b0f0;
}

.garde-dot.F {
    background-color: #ff0000;
}
</style>