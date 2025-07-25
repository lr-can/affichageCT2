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
                <div :class="['day-number', day.isPast ? null : day.equipeGarde, day.isToday ? 'today' + day.equipeGarde : null]">{{ day.date ? day.date.getDate() : '' }}</div>
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
let yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const currentMonth = today.toLocaleString('fr-FR', { month: 'long' });
const currentYear = today.getFullYear();
const daysOfWeek = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];

const calendarDays = computed(() => {
    const daysInMonth = new Date(currentYear, today.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, today.getMonth(), 1).getDay();
    const days = [];

    // Adjust firstDayOfMonth to match the daysOfWeek array (Monday = 0, Sunday = 6)
    const adjustedFirstDay = (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1);

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < adjustedFirstDay; i++) {
        days.push({ date: null, isPast: false, equipeGarde: null });
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(currentYear, today.getMonth(), i);
        const isPast = date < yesterday;
        const isToday = date.toDateString() === today.toDateString();
        const garde = props.calendar.find((entry) => {
            const entryDate = new Date(entry.Date);
            return entryDate.toDateString() === date.toDateString();
        });
        days.push({
            date,
            isPast,
            isToday,
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
    margin-bottom: 10px;
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
    padding: 8px;
    border-radius: 5px;
    font-size: 0.8em;
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

.A {
    border-bottom: 2px solid #a02b93;
}

.B {
    border-bottom: 2px solid #4ea72e;
}

.C {
    border-bottom: 2px solid #ffc000;
}

.D {
    border-bottom: 2px solid #e97132;
}

.E {
    border-bottom: 2px solid #00b0f0;
}

.F {
    border-bottom: 2px solid #ff0000;
}

.todayA {
    background-color: #a02b93;
    color: white;
    font-weight: bold;
    border-radius: 5px;
    border-bottom: 2px solid transparent;
}
.todayB {
    background-color: #4ea72e;
    color: white;
    font-weight: bold;
    border-radius: 5px;
    border-bottom: 2px solid transparent;
}
.todayC {
    background-color: #ffc000;
    color: white;
    font-weight: bold;
    border-radius: 5px;
    border-bottom: 2px solid transparent;
}
.todayD {
    background-color: #e97132;
    color: white;
    font-weight: bold;
    border-radius: 5px;
    border-bottom: 2px solid transparent;
}
.todayE {
    background-color: #00b0f0;
    color: white;
    font-weight: bold;
    border-radius: 5px;
    border-bottom: 2px solid transparent;
}
.todayF {
    background-color: #ff0000;
    color: white;
    font-weight: bold;
    border-radius: 5px;
    border-bottom: 2px solid transparent;
}
</style>