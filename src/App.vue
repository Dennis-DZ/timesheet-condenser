<template>
  <main class="flex flex-col py-5 px-12 gap-5 max-w-[95rem] m-auto">

    <div class="flex justify-between">
      <h3 class="text-3xl font-bold">Timesheet Condenser</h3>
      <button @click="toggleTheme"
        class="material-symbols-outlined text-4xl">{{ themeIcon }}</button>
    </div>

    <div class="flex gap-4 text-background">
      <div v-for="(_, index) in projects" class="rounded-3xl bg-primary">
        <input type="text" v-model="projects[index]" v-autowidth placeholder="New Project"
          class="project-input px-5 py-3 rounded-3xl placeholder:text-background bg-primary peer">
        <button @click="projects.splice(index, 1)" @mousedown.prevent
          class="material-symbols-outlined align-text-bottom hidden peer-focus:inline">
          delete
        </button>
      </div>

      <button @click="addProject" class="px-5 py-3 rounded-3xl dark:bg-secondary bg-accent dark:text-text">
        + Add Project
      </button>
    </div>

    <textarea ref="textarea" v-model="input" placeholder="Paste in your time log"
      class="dark:bg-text bg-background dark:text-background px-6 py-5 rounded-3xl border-4 dark:border-secondary"></textarea>

    <div class="flex gap-5 justify-between">

      <div class="flex flex-col items-end gap-5">
        <table v-if="tableData.length > 0"
          class="dark:bg-secondary border-4 rounded-3xl border-separate border-spacing-5 h-min">
          <tr v-for="(row, index) in tableData">
            <td class="px-5 py-3 rounded-3xl text-background dark:bg-text bg-accent">{{ Math.floor(row.time / 1000 / 60)
              }} min</td>
            <td>
              <div v-if="row.gap" class="px-5 py-3 rounded-3xl text-background dark:bg-text bg-accent">GAP</div>
              <select v-else v-model="projectSelections[index]"
                class="px-5 py-3 rounded-3xl text-background dark:bg-text bg-accent max-w-60">
                <option selected disabled value="undefined">Project</option>
                <option v-for="project in projects">{{ project }}</option>
              </select>
            </td>
            <td>{{ row.text }}</td>
          </tr>
        </table>

        <div class="dark:bg-secondary px-4 py-1 rounded-3xl border-4 text-xl font-bold">
          Exact total time: <span class="select-all">{{ totalTimeString }}</span>
        </div>

        <div class="dark:bg-secondary px-4 py-1 rounded-3xl border-4 text-xl font-bold">
          Round to the nearest
          <input type="number" v-model="rounding" v-autowidth class="dark:bg-secondary bg-background min-w-[50px]">
          hours
        </div>
      </div>

      <CirclePackingChart v-if="chartData.time > 0" :chartData="chartData" />
    </div>

  </main>
</template>

<script lang="ts">
// @ts-nocheck

import CirclePackingChart from './components/CirclePackingChart.vue';

export default {
  components: {
    CirclePackingChart,
  },

  data() {
    return {
      input: '8:50 - 9:10: Doing something\n9:10 - 12:30: Something else\n12:30 - 5:00: The third thing I was doing was ea sed dolore et sea diam aliquip vero dolor ut ut laoreet sed hendrerit sanctus voluptua kasd aliquyam rebum. Commodo clita feugiat aliquam eos no kasd labore lorem labore eu et stet et. Doming sit ea diam sit autem est dolore. No stet elitr amet gubergren ea. Amet magna et euismod ut quis et eos ipsum erat odio at rebum eirmod. Dolor takimata lorem et euismod sit sed stet dolore eum aliquyam voluptua feugait gubergren dolores et eos aliquam. Est consetetur sadipscing.',
      projects: ['Guardian', 'Quest', 'Admin'],
      rounding: 0.25,
      projectSelections: [],
      themeIcon: 'dark_mode',
    };
  },

  computed: {
    chartData() {
      return {
        project: 'Total',
        time: this.roundToHours(this.tableData.filter((_, i) => {
          return this.projectSelections[i] !== undefined;
        }).reduce((acc, curr) => acc += curr.time, 0)),
        children: Array.from(new Set(this.projectSelections.filter(p => p !== undefined)))
          .map(project => {
            return {
              project: project,
              time: this.roundToHours(this.tableData.filter((_, i) => {
                return this.projectSelections[i] === project;
              }).reduce((acc, curr) => acc += curr.time, 0)),
            };
          }),
      };
    },
    totalTimeString() {
      const totalTime = this.tableData.filter(el => !el.gap)
        .reduce((acc, curr) => acc += curr.time, 0);

      const totalMin = totalTime / 1000 / 60;
      const hours = Math.floor(totalMin / 60);
      const min = totalMin % 60;

      return `${hours} hrs ${min} min`
    },
    tableData() {
      const result = [];
      const maxTextLength = 30;
      let prevEndTime;
      let offset = 0;
      const twelveHours = 12 * 60 * 60 * 1000;

      for (const line of this.input.split(/\r?\n/)) {
        const matches = line.match(/^(\d{1,2}(:\d\d)?)\s*-\s*(\d{1,2}(:\d\d)?):\s*(.*)/);

        if (matches === null) {
          break;
        }

        let [, startTimeString, , endTimeString, , message] = matches;

        if (message.length > maxTextLength) {
          message = message.slice(0, maxTextLength - 3) + '...';
        }

        let startTime = new Date(0);
        startTime.setHours(...startTimeString.split(':'));
        startTime = new Date(startTime.getTime() + offset);

        while (startTime < prevEndTime) {
          offset += twelveHours;
          startTime = new Date(startTime.getTime() + twelveHours);
        }

        let endTime = new Date(0);
        endTime.setHours(...endTimeString.split(':'));
        endTime = new Date(endTime.getTime() + offset);

        while (endTime < startTime) {
          endTime = new Date(endTime.getTime() + twelveHours);
        }

        if (startTime > prevEndTime) {
          result.push({
            time: startTime - prevEndTime,
            text: '',
            gap: true,
          });
        }

        result.push({
          time: endTime - startTime,
          text: message,
          gap: false,
        });

        prevEndTime = endTime;
      }

      return result;
    },
  },

  mounted() {
    this.input += ' ';
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      this.toggleTheme();
    }
  },

  methods: {
    addProject() {
      this.projects.push('');
      this.$nextTick(() => {
        const inputs = document.querySelectorAll('.project-input');
        inputs[inputs.length - 1]?.focus();
      });
    },
    roundToHours(milliseconds) {
      return Math.round(milliseconds / 1000 / 60 / 60 / this.rounding) * this.rounding;
    },
    toggleTheme() {
      if (document.documentElement.classList.toggle('dark')) {
        this.themeIcon = 'dark_mode';
      } else {
        this.themeIcon = 'light_mode';
      }
    },
  },

  watch: {
    input() {
      this.$refs.textarea.style.height = 'auto';
      this.$nextTick(() => {
        this.$refs.textarea.style.height = (this.$refs.textarea.scrollHeight + 8) + 'px';
      });
    },
  },
};
</script>

<style>
/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type=number] {
  -moz-appearance: textfield;
}
</style>
