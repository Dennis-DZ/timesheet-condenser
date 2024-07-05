import {
  assert, test, expect, beforeEach,
} from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import App from './App.vue';

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

test('Help modal defaults to hidden', async () => {
  expect(wrapper.get('dialog').element.open).toBe(false);
});

test('Help modal opens and closes', async () => {
  await wrapper.get('[aria-label="Help"]').trigger('click');
  expect(wrapper.get('dialog').element.open).toBe(true);

  await wrapper.get('[aria-label="Close Help"]').trigger('click');
  expect(wrapper.get('dialog').element.open).toBe(false);
});

test('Add Project button adds a project', async () => {
  await wrapper.get('[data-test="add-project"]').trigger('click');
  expect(wrapper.findAll('[data-test="project-input"]')).toHaveLength(1);
});

test('Delete button deletes a project', async () => {
  await wrapper.get('[data-test="add-project"]').trigger('click');
  await wrapper.get('[data-test="delete-project"]').trigger('click');
  expect(wrapper.find('[data-test="project-input"]').exists()).toBe(false);
});
