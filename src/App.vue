<template>
  <main class="flex flex-col py-5 px-12 gap-5 max-w-[95rem] m-auto">

    <div class="flex justify-between">
      <h1 class="text-3xl font-bold">Timesheet Condenser</h1>
      <button aria-label="Toggle Theme" @click="toggleTheme" type="button"
        class="material-symbols-outlined text-4xl outline-text">{{ themeIcon }}</button>
    </div>

    <div class="flex flex-wrap gap-4 text-background">
      <div v-for="(_, index) in projects" class="rounded-3xl bg-primary">
        <input :id="`project-${index}`" :aria-label="`Project ${index} Name`" type="text" v-model="projects[index]"
          v-autowidth placeholder="New Project" maxlength="20"
          class="project-input px-5 py-3 rounded-3xl placeholder:text-background bg-primary peer outline-text">
        <button @click="removeProject(index)" @mousedown.prevent :aria-label="`Remove Project ${index}`" type="button"
          class="material-symbols-outlined align-text-bottom sr-only peer-focus:not-sr-only focus:not-sr-only outline-text">
          delete
        </button>
      </div>

      <button @click="addProject" type="button" class="px-5 py-3 rounded-3xl dark:bg-secondary bg-accent dark:text-text outline-text">
        + Add Project
      </button>
    </div>

    <textarea aria-label="Paste in your time log" id="timesheet-input" ref="textarea" v-model="input"
      placeholder="Paste in your time log"
      class="dark:bg-text bg-background dark:text-background px-6 py-5 rounded-3xl border-4 dark:border-secondary outline-text"></textarea>

    <div class="flex gap-5 justify-between">

      <div class="flex flex-col items-end gap-5">
        <table v-if="input.length > 0"
          class="dark:bg-secondary border-4 rounded-3xl border-separate border-spacing-5 h-min">
          <tr v-for="row in tableData">
            <td class="px-5 py-3 rounded-3xl text-background dark:bg-text bg-accent">
              {{ Math.floor(row.time / 1000 / 60) }} min</td>
            <td>
              <div v-if="row.gap" class="px-5 py-3 rounded-3xl text-background dark:bg-text bg-accent">Gap</div>
              <select v-else v-model="projectSelections[row.index]" :aria-label="`Project selection for: ${row.text}`"
                :id="`project-select-${row.index}`" class="px-5 py-3 rounded-3xl text-background dark:bg-text bg-accent outline-text">
                <option selected value="undefined">Project</option>
                <option v-for="(project, index) in projects" :value="index">{{ project }}</option>
              </select>
            </td>
            <td>{{ row.text }}</td>
          </tr>
        </table>

        <output v-if="input.length > 0" class="dark:bg-secondary px-4 py-1 rounded-3xl border-4 text-xl font-bold">
          Exact total time: <span class="select-all">{{ totalTimeString }}</span>
        </output>

        <label class="dark:bg-secondary px-4 py-1 rounded-3xl border-4 text-xl font-bold">
          Round to the nearest
          <input type="number" v-model="rounding" @input="preventTrailingZeroes" id="rounding"
            class="dark:bg-secondary bg-background w-[50px] outline-text">
          hours
        </label>
      </div>

      <CirclePackingChart v-if="chartData.time > 0" :chartData="chartData" />
    </div>

  </main>
</template>

<script>

import CirclePackingChart from './components/CirclePackingChart.vue';

export default {
  components: {
    CirclePackingChart,
  },

  data() {
    return {
      input: '',
      projects: [],
      rounding: 0.25,
      projectSelections: [],
      themeIcon: 'dark_mode',
    };
  },

  computed: {
    chartData() {
      return {
        project: 'Total',
        time: this.roundToHours(this.tableData.filter(row =>
          this.projectSelections[row.index] !== undefined,
        ).reduce((acc, curr) => acc + curr.time, 0)),
        children: this.projects.map((p, i) => ({
          project: p,
          time: this.roundToHours(this.tableData.filter(row =>
            this.projectSelections[row.index] === i,
          ).reduce((sum, row) => sum + row.time, 0)),
        })).filter(node => node.time !== 0),
      };
    },
    totalTimeString() {
      const totalTime = this.tableData.filter(el => !el.gap)
        .reduce((acc, curr) => acc + curr.time, 0);

      const totalMin = totalTime / 1000 / 60;
      const hours = Math.floor(totalMin / 60);
      const min = totalMin % 60;

      return `${hours} hrs ${min} min`;
    },
    tableData() {
      const result = [];
      const maxTextLength = 30;
      let prevEndTime;
      let offset = 0;
      const twelveHours = 12 * 60 * 60 * 1000;
      const lines = this.input.split(/\r?\n/);

      for (let i = 0; i < lines.length; i++) {
        // Try to parse current line according to the intended format
        const matches = lines[i].match(/^(\d{1,2}(:\d\d)?)\s*-\s*(\d{1,2}(:\d\d)?):\s*(.*)/);

        // Add an invalid row if the line doesn't match the format,
        // then skip to the next line
        if (matches === null) {
          result.push({
            time: 0,
            text: 'Invalid formatting',
            gap: false,
            index: i,
          });
          continue;
        }

        // Get the relevant values from the line
        let [, startTimeString, , endTimeString, , message] = matches;

        // Trim the message if it's too long
        if (message.length > maxTextLength) {
          message = message.slice(0, maxTextLength - 3) + '...';
        }

        // Set the start time according to the given time
        let startTime = new Date(0);
        startTime.setHours(...startTimeString.split(':'));
        startTime = new Date(startTime.getTime() + offset);

        // Add 12 hours to the start time until it's greater than the last end time
        // This makes it possible to calculate the gaps
        while (startTime < prevEndTime) {
          offset += twelveHours;
          startTime = new Date(startTime.getTime() + twelveHours);
        }

        // Set the end time
        let endTime = new Date(0);
        endTime.setHours(...endTimeString.split(':'));
        endTime = new Date(endTime.getTime() + offset);

        // Add 12 hours to the end time until it's greater than the start time
        // This is so we can calculate the duration of the period
        while (endTime < startTime) {
          endTime = new Date(endTime.getTime() + twelveHours);
        }

        // Add a gap row if there's time between the current start time and
        // the last end time
        if (startTime > prevEndTime) {
          result.push({
            time: startTime - prevEndTime,
            gap: true,
          });
        }

        // Add the current period
        result.push({
          time: endTime - startTime,
          text: message,
          gap: false,
          index: i,
        });

        prevEndTime = endTime;
      }

      return result;
    },
  },

  mounted() {
    this.input = '8:50 - 9:10: Doing something\n9:10 - 12:30: Something else\n12:30 - 5:00: The third thing I was doing was ea sed dolore et sea diam aliquip vero dolor ut ut laoreet sed hendrerit sanctus voluptua kasd aliquyam rebum. Commodo clita feugiat aliquam eos no kasd labore lorem labore eu et stet et. Doming sit ea diam sit autem est dolore. No stet elitr amet gubergren ea. Amet magna et euismod ut quis et eos ipsum erat odio at rebum eirmod. Dolor takimata lorem et euismod sit sed stet dolore eum aliquyam voluptua feugait gubergren dolores et eos aliquam. Est consetetur sadipscing.';

    this.projects = ['Guardian', 'Quest', 'Admin'];

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
    removeProject(index) {
      this.projects.splice(index, 1);
      this.projectSelections = this.projectSelections.map(p => {
        if (p < index) {
          return p;
        }
        if (p > index) {
          return p - 1;
        }
        return undefined;
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
    preventTrailingZeroes(event) {
      if (event.target.value.length > 4) {
        event.target.value = this.rounding;
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
    rounding(newValue, oldValue) {
      if (newValue.toString().length > 4) {
        this.rounding = oldValue;
      }
    },
    tableData() {
      this.projectSelections = this.projectSelections.slice(0, this.tableData[this.tableData.length - 1].index + 1);
    },
  },
};
</script>
