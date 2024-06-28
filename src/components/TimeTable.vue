<template>
  <table class="dark:bg-secondary border-4 rounded-3xl border-separate border-spacing-5 h-min">
    <tr v-for="row in tableData">
      <td class="px-5 py-3 rounded-3xl text-background dark:bg-text bg-accent">
        {{ Math.floor(row.time / 1000 / 60) }} min</td>
      <td>
        <div v-if="row.gap" class="px-5 py-3 rounded-3xl text-background dark:bg-text bg-accent">Gap</div>
        <!-- eslint-disable-next-line vue/no-mutating-props -->
        <select v-else v-model="projectSelections[row.index]" :aria-label="`Project selection for: ${row.text}`"
          :id="`project-select-${row.index}`"
          class="px-5 py-3 rounded-3xl text-background dark:bg-text bg-accent outline-text">
          <option selected :value="undefined">Project</option>
          <option v-for="(project, index) in projects" :value="index">{{ project }}</option>
        </select>
      </td>
      <td>{{ row.text }}</td>
    </tr>
  </table>
</template>

<script>
export default {
  props: {
    input: {
      type: String,
      required: true,
    },
    projects: {
      type: Array,
      required: true,
    },
    projectSelections: {
      type: Array,
      required: true,
    },
  },

  computed: {
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

      this.$emit('table-data', result);
      return result;
    },
  },
};
</script>
