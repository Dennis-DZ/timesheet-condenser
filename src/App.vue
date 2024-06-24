<template>
  <main class="flex flex-col py-5 px-12 gap-5 max-w-[95rem] m-auto">

    <div class="flex justify-between">
      <h3 class="text-3xl font-bold">Timesheet Condenser</h3>
      <!-- <span class="material-symbols-outlined text-4xl">dark_mode</span> -->
    </div>

    <div class="flex gap-4">
      <input type="text" v-for="(_, index) in testProjects" v-model="testProjects[index]" v-autowidth
        class="project-input px-5 py-3 rounded-3xl text-background placeholder:text-background bg-primary"
        placeholder="New Project">
      <button @click="addProject" class="px-5 py-3 rounded-3xl bg-secondary">+ Add Project</button>
    </div>

    <textarea ref="textarea" v-model="input" placeholder="Paste in your time log"
      class="bg-text text-background px-6 py-5 rounded-3xl border-4 border-secondary"></textarea>

    <div class="flex gap-5 justify-between">

      <div class="flex flex-col items-end gap-5">
        <table class="bg-secondary border-4 rounded-3xl border-separate border-spacing-5 h-min">
          <tr v-for="row in testTableData">
            <td class="px-5 py-3 rounded-3xl text-background bg-text">{{ row.time }} min</td>
            <td>
              <select class="px-5 py-3 rounded-3xl text-background bg-text">
                <option selected disabled>Project</option>
                <option v-for="project in testProjects">{{ project }}</option>
              </select>
            </td>
            <td>{{ row.text }}</td>
          </tr>
        </table>

        <div class="bg-secondary px-5 py-3 rounded-3xl border-4 text-xl">
          Round to the nearest
          <input type="number" v-model="rounding" v-autowidth>
          hours
        </div>
      </div>

      <CirclePackingChart :chartData="testChartData" />
    </div>

  </main>
</template>

<script lang="ts">
import CirclePackingChart from './components/CirclePackingChart.vue';

export default {
  components: {
    CirclePackingChart,
  },

  data() {
    return {
      input: '8:50 - 9:10: Doing something\n9:10 - 12:30: Something else\n12:30 - 5:00: The third thing I was doing was ea sed dolore et sea diam aliquip vero dolor ut ut laoreet sed hendrerit sanctus voluptua kasd aliquyam rebum. Commodo clita feugiat aliquam eos no kasd labore lorem labore eu et stet et. Doming sit ea diam sit autem est dolore. No stet elitr amet gubergren ea. Amet magna et euismod ut quis et eos ipsum erat odio at rebum eirmod. Dolor takimata lorem et euismod sit sed stet dolore eum aliquyam voluptua feugait gubergren dolores et eos aliquam. Est consetetur sadipscing.',
      testProjects: [
        'Quest',
        '4.5',
        'Admin',
      ],
      testTableData: [
        {
          time: 20,
          text: 'Doing something',
        },
        {
          time: 200,
          text: 'Something else',
        },
        {
          time: 270,
          text: 'The third thing I was ...',
        },
      ],
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
            time: Number(this.testProjects[1]),
          },
          {
            project: this.testProjects[0],
            time: 3.25,
          },
          {
            project: 'Admin',
            time: 0.25,
          },
        ],
      };
    },
  },

  methods: {
    addProject() {
      this.testProjects.push('');
      this.$nextTick(() => {
        document.querySelector('.project-input:last-of-type')?.focus();
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
