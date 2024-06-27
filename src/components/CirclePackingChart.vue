<template>
  <svg :width="height" :height="height">
    <g :transform="`translate(${this.borderWidth}, ${this.borderWidth})`">
      <circle
        v-for="circle in circles"
        :key="circle.data.project"
        :cx="circle.x"
        :cy="circle.y"
        :r="circle.r"
        :class="getCircleClasses(circle.depth)"
        :stroke-width="borderWidth"
      />
      <text
        v-for="circle in circles"
        :key="`text-${circle.data.project}`"
        :y="circle.depth === 0 ? 20 : circle.y"
        text-anchor="middle"
        :class="getTextClasses(circle.depth)"
      >
        <tspan :x="getX(circle.depth, circle.x)" dy="-0.6em">{{ circle.data.project }}</tspan>
        <tspan :x="getX(circle.depth, circle.x)" dy="1.2em">{{ pluralizeTime(circle.data.time) }}</tspan>
      </text>
    </g>
  </svg>
</template>

<script>
import * as d3 from 'd3';

export default {
  props: {
    chartData: {
      type: Object,
      required: true,
    },
    height: {
      type: Number,
      default: 500,
    },
    borderWidth: {
      type: Number,
      default: 4,
    },
  },

  computed: {
    hierarchy() {
      const min = 0.2 * this.chartData.time;
      return d3.hierarchy(this.chartData)
        .sum(d => Math.max(d.time, min))
        .sort((a, b) => b.value - a.value);
    },
    pack() {
      const size = this.height - (2 * this.borderWidth);
      return d3.pack()
        .size([size, size])
        .padding(20);
    },
    circles() {
      return this.pack(this.hierarchy).descendants();
    },
  },

  methods: {
    getCircleClasses(depth) {
      const classes = 'stroke-text';
      if (depth === 0) {
        return classes + ' dark:fill-secondary fill-background';
      }
      return classes + ' dark:fill-primary fill-accent';
    },
    getTextClasses(depth) {
      if (depth === 0) {
        return 'fill-text';
      }
      return 'dark:fill-text fill-background';
    },
    getX(depth, x) {
      return depth === 0 ? 50 : x;
    },
    pluralizeTime(time) {
      const timeString = time.toFixed(2);
      if (time === 1) {
        return timeString + ' hour';
      }
      return timeString + ' hours';
    },
  },
};
</script>
