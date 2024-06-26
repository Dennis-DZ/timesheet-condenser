/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
// @ts-nocheck

import './assets/material-symbols.css';
import './assets/styles.css';

import { createApp } from 'vue';
import App from './App.vue';
import { plugin as VueInputAutowidth } from 'vue-input-autowidth';

createApp(App).use(VueInputAutowidth).mount('#app');
