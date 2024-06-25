<template>
  <main class="flex flex-col py-5 px-12 gap-5 max-w-[95rem] m-auto">

    <div class="flex justify-between">
      <h3 class="text-3xl font-bold">Timesheet Condenser</h3>
      <!-- <span class="material-symbols-outlined text-4xl">dark_mode</span> -->
    </div>

    <div class="flex gap-4">
      <div v-for="(_, index) in projects" class="rounded-3xl text-background bg-primary">
        <input type="text" v-model="projects[index]" v-autowidth placeholder="New Project"
          class="project-input px-5 py-3 rounded-3xl placeholder:text-background bg-primary peer">
        <button @click="projects.splice(index, 1)" @mousedown.prevent
          class="material-symbols-outlined align-text-bottom hidden peer-focus:inline">
          delete
        </button>
      </div>

      <button @click="addProject" class="px-5 py-3 rounded-3xl bg-secondary">+ Add Project</button>
    </div>

    <textarea ref="textarea" v-model="input" placeholder="Paste in your time log"
      class="bg-text text-background px-6 py-5 rounded-3xl border-4 border-secondary"></textarea>

    <div class="flex gap-5 justify-between">

      <div class="flex flex-col items-end gap-5">
        <table class="bg-secondary border-4 rounded-3xl border-separate border-spacing-5 h-min">
          <tr v-for="row in tableData">
            <td class="px-5 py-3 rounded-3xl text-background bg-text">{{ Math.floor(row.time / 1000 / 60) }} min</td>
            <td>
              <div v-if="row.gap" class="px-5 py-3 rounded-3xl text-background bg-text">GAP</div>
              <select v-else class="px-5 py-3 rounded-3xl text-background bg-text">
                <option selected disabled>Project</option>
                <option v-for="project in projects">{{ project }}</option>
              </select>
            </td>
            <td>{{ row.text }}</td>
          </tr>
        </table>

        <div class="bg-secondary px-4 py-1 rounded-3xl border-4 text-xl font-bold">
          Round to the nearest
          <input type="number" v-model="rounding" v-autowidth class="bg-secondary min-w-[50px]">
          hours
        </div>
      </div>

      <CirclePackingChart :chartData="testChartData" />
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
      projects: [],
      rounding: 0.25,
    };
  },

  computed: {
    testChartData() {
      return {
        project: 'Total',
        time: 8.25,
        children: [
          {
            project: 'Guardian',
            time: 4.5,
          },
          {
            project: 'Quest',
            time: 3.25,
          },
          {
            project: 'Admin',
            time: 0.25,
          },
        ],
      };
    },
    tableData() {
      const lines = this.input.split(/\r?\n/);
      const result = [];
      const maxTextLength = 30;
      let prevEndTime;
      let offset = 0;
      const twelveHours = 12 * 60 * 60 * 1000;

      for (let i = 0; i < lines.length; i++) {
        const matches = lines[i].match(/\d:/g);

        if (matches === null) {
          return result;
        }

        const lastIndex = lines[i].lastIndexOf(matches[matches.length - 1])
        const timeRangeString = lines[i].slice(0, lastIndex + 1)
        const message = lines[i].slice(lastIndex + 2);
        const [startTimeString, endTimeString] = timeRangeString.split('-');

        if (startTimeString === undefined || endTimeString === undefined) {
          return result;
        }

        let trimmedMessage = message.trim();
        if (trimmedMessage.length > maxTextLength) {
          trimmedMessage = trimmedMessage.slice(0, maxTextLength - 3) + '...';
        }

        let startTime = new Date('1970-01-01');
        startTime.setHours(...startTimeString.split(':'));
        startTime = new Date(startTime.getTime() + offset);

        while (startTime < prevEndTime) {
          offset += twelveHours;
          startTime = new Date(startTime.getTime() + twelveHours);
        }

        let endTime = new Date(startTime);
        endTime.setHours(...endTimeString.split(':'));

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
          text: trimmedMessage,
          gap: false,
        });

        prevEndTime = endTime;
      }

      return result;
    }
  },

  mounted() {
    this.input += ' ';
  },

  methods: {
    addProject() {
      this.projects.push('');
      this.$nextTick(() => {
        const inputs = document.querySelectorAll('.project-input');
        inputs[inputs.length - 1]?.focus();
      });
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
