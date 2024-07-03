import {
  assert, test, vi, expect, beforeEach
} from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import App from './App.vue';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

let wrapper;

beforeEach(async () => {
  wrapper = mount(App);
  await nextTick();
});

test('Text area defaults to empty', async () => {
  assert.isEmpty(wrapper.get('#timesheet-input').element.value);
});

test('No projects by default', async () => {
  expect(wrapper.find('[data-test="project-input"]').exists()).toBe(false);
});

test('Dark mode by default', async () => {
  expect(wrapper.get('[aria-label="Toggle Theme"]').text()).toBe('dark_mode');
});
