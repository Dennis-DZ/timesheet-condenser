<template>
  <main class="flex flex-col py-5 px-12 gap-5 max-w-[95rem] m-auto">

    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">Timesheet Condenser</h1>

      <div class="flex gap-4">
        <button aria-label="Toggle Theme" @click="toggleTheme(true)" type="button"
          class="material-symbols-outlined text-4xl outline-text">{{ themeIcon }}</button>
        <button aria-label="Help" @click="this.$refs.help.showModal()" type="button"
          class="material-symbols-outlined text-4xl outline-text">help</button>
      </div>
    </div>

    <div class="flex flex-wrap gap-4 text-background">
      <div v-for="(_, index) in projects" class="rounded-3xl bg-primary group hover:-translate-y-1 transition-transform">
        <input :id="`project-${index}`" :aria-label="`Project ${index} Name`" type="text" v-model="projects[index]"
          v-autowidth placeholder="New Project" maxlength="20" @change="saveProjects" data-test="project-input"
          class="project-input px-5 py-3 rounded-3xl placeholder:text-background bg-primary outline-text">
        <button @click="removeProject(index)" :aria-label="`Remove Project ${index}`" type="button"
          class="material-symbols-outlined align-text-bottom sr-only group-focus-within:not-sr-only outline-text">
          delete
        </button>
      </div>

      <button @click="addProject" type="button"
        class="px-5 py-3 rounded-3xl dark:bg-secondary bg-accent dark:text-text outline-text hover:-translate-y-1 transition-transform">
        + Add Project
      </button>
    </div>

    <textarea aria-label="Paste in your time log" id="timesheet-input" ref="textarea" v-model="input"
      placeholder="Paste in your time log"
      class="dark:bg-text bg-background dark:text-background px-6 py-5 rounded-3xl border-4 dark:border-secondary outline-text">
    </textarea>

    <div class="flex gap-5 justify-between">

      <div class="flex flex-col items-end gap-5">
        <TimeTable :input="input" :projects="projects" :project-selections="projectSelections"
          @table-data="tableData = $event" />

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

    <dialog ref="help"
      class="bg-background px-7 py-6 rounded-3xl border-4 border-primary text-text max-w-[min(80vw,80rem)] absolute backdrop:backdrop-blur-sm max-h-fit my-[5vh]">
      <div class="flex flex-col gap-5">

        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-bold">Help</h2>

          <button aria-label="Close Help" @click="this.$refs.help.close()" type="button"
            class="material-symbols-outlined text-4xl outline-text">close</button>
        </div>

        <p>Timesheet Condenser is a tool to convert a sequential time log to a cumulative time sheet grouped by different projects. Using it involves three steps: inputting your projects, pasting in your time log, and choosing the project for each entry.</p>

        <p>
          To add your projects, simply click the <b>Add Project</b> button and type the name of a project into the new bubble. Projects can be deleted by selecting them and clicking the
          <span class="material-symbols-outlined align-text-bottom">delete</span>
          icon. Any projects you don't delete will be saved between sessions.
        </p>

        <p>Your time log can be pasted or typed into the main text area. Each line in the log should use the following format:</p>

        <p>Time - Time: Description</p>

        <p>For example, the following would be a valid entry:</p>

        <p>9:30 - 11: Reviewed documentation</p>

        <p>As soon as you input the time log, each line will be converted into a row in the table below. Each row will have the duration of the entry in minutes, a snippet of the description, and a box to select which project the entry belongs to. The box directly below the table shows the total time of all the entries. Once you begin selecting projects for the entries, a chart will be generated showing the total times for each project in hours along with the total time of categorized entries. The rounding for these totals can be controlled using the input below the exact total time.</p>

      </div>
    </dialog>

  </main>
</template>

<script>

import CirclePackingChart from './components/CirclePackingChart.vue';
import TimeTable from './components/TimeTable.vue';

export default {
  components: {
    CirclePackingChart,
    TimeTable,
  },

  data() {
    return {
      input: '',
      projects: [],
      tableData: [],
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
  },

  mounted() {
    if (localStorage.theme === 'light_mode' || (!('theme' in localStorage) && matchMedia('(prefers-color-scheme: light)').matches)) {
      this.toggleTheme(false);
    }

    this.input = '8:50 - 9:10: Doing something\n9:10 - 12:30: Something else\n12:30 - 5:00: The third thing I was doing was ea sed dolore et sea diam aliquip vero dolor ut ut laoreet sed hendrerit sanctus voluptua kasd aliquyam rebum. Commodo clita feugiat aliquam eos no kasd labore lorem labore eu et stet et. Doming sit ea diam sit autem est dolore. No stet elitr amet gubergren ea. Amet magna et euismod ut quis et eos ipsum erat odio at rebum eirmod. Dolor takimata lorem et euismod sit sed stet dolore eum aliquyam voluptua feugait gubergren dolores et eos aliquam. Est consetetur sadipscing.';

    // this.projects = ['Guardian', 'Quest', 'Admin'];

    if (localStorage.projects) {
      this.projects = localStorage.projects.split(',');
    }

    document.fonts?.ready.then(() => {
      this.$forceUpdate();
      this.adjustTextArea();
    });
  },

  methods: {
    addProject() {
      this.projects.push('');
      this.$nextTick(() => {
        const inputs = document.querySelectorAll('.project-input');
        inputs[inputs.length - 1]?.focus();
      });
      this.saveProjects();
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
      this.saveProjects();
    },
    roundToHours(milliseconds) {
      return Math.round(milliseconds / 1000 / 60 / 60 / this.rounding) * this.rounding;
    },
    toggleTheme(save) {
      if (document.documentElement.classList.toggle('dark')) {
        this.themeIcon = 'dark_mode';
      } else {
        this.themeIcon = 'light_mode';
      }

      if (save) {
        localStorage.theme = this.themeIcon;
      }
    },
    preventTrailingZeroes(event) {
      if (event.target.value.length > 4) {
        event.target.value = this.rounding;
      }
    },
    saveProjects() {
      localStorage.projects = this.projects;
    },
    adjustTextArea() {
      this.$refs.textarea.style.height = 'auto';
      this.$nextTick(() => {
        this.$refs.textarea.style.height = (this.$refs.textarea.scrollHeight + 8) + 'px';
      });
    },
  },

  watch: {
    input() {
      this.adjustTextArea();
    },
    rounding(newValue, oldValue) {
      // Prevent more than 4 digits from being put into the rounding input
      if (newValue.toString().length > 4) {
        this.rounding = oldValue;
      }
    },
    tableData() {
      // Make sure projectSelections is not longer than tableData
      this.projectSelections = this.projectSelections.slice(0, this.tableData[this.tableData.length - 1].index + 1);
    },
  },
};
</script>
