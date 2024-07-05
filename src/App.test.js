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

test('Single invalid line in input', async () => {
  await wrapper.get('#timesheet-input').setValue(' ');
  checkTableRow(0, 0, 'Invalid formatting');
  checkTotalTime(0, 0);
});

test('Single valid line in input', async () => {
  await wrapper.get('#timesheet-input').setValue('9 - 4:37: test message');
  checkTableRow(0, 457, 'test message');
  checkTotalTime(7, 37);
});

test('Multiple valid lines in input', async () => {
  await wrapper.get('#timesheet-input').setValue('9-10:test message 1\n10-11:30: test message 2\n11:30-1:15:longer test message to check that');
  checkTableRow(0, 60, 'test message 1');
  checkTableRow(1, 90, 'test message 2');
  checkTableRow(2, 105, 'longer test message to chec...');
  checkTotalTime(4, 15);
});

test('Multiple valid lines with gap in input', async () => {
  await wrapper.get('#timesheet-input').setValue('9-10:test message 1\n10-11:30: test message 2\n3:15-5:00:');
  checkTableRow(0, 60, 'test message 1');
  checkTableRow(1, 90, 'test message 2');
  checkTableRow(2, 225, '', true);
  checkTableRow(3, 105, '');
  checkTotalTime(4, 15);
});

test('Multiple valid lines with one invalid in input', async () => {
  await wrapper.get('#timesheet-input').setValue('9-10:test message 1\ninvalid\n10-11:30: test message 2\n11:30-1:15:');
  checkTableRow(0, 60, 'test message 1');
  checkTableRow(1, 0, 'Invalid formatting');
  checkTableRow(2, 90, 'test message 2');
  checkTableRow(3, 105, '');
  checkTotalTime(4, 15);
});

test('All projects show up in dropdown', async () => {
  const addProjectButton = wrapper.get('[data-test="add-project"]');
  const projects = ['Project 1', 'Project 2', 'Project 3'];

  await projects.forEach(async (p, i) => {
    await addProjectButton.trigger('click');
    await wrapper.get(`#project-${i}`).setValue(p);
  });

  await wrapper.get('#timesheet-input').setValue('9-5:');

  const options = [...wrapper.get('#project-select-0').element.options];

  expect(options.map(option => option.text)).toEqual(['Project', ...projects]);
});

function checkTableRow(index, expectedMin, expectedMessage, gap = false) {
  const tableRows = wrapper.findAll('tr');
  const cells = tableRows[index].findAll('td');
  expect(cells).toHaveLength(3);

  expect(cells[0].text()).toBe(`${expectedMin} min`);
  expect(cells[2].text()).toBe(expectedMessage);

  if (gap) {
    expect(cells[1].text()).toBe('Gap');
  }
}

function checkTotalTime(hours, minutes) {
  expect(wrapper.get('output > span').text()).toBe(`${hours} hrs ${minutes} min`);
}
