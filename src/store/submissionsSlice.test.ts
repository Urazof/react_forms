import { describe, it, expect } from 'vitest';
import reducer, { addSubmission, markAsRead } from './submissionsSlice';

const input = {
  name: 'Иван',
  age: 25,
  email: 'ivan@example.com',
  gender: 'male' as const,
  terms: true,
  country: 'Россия',
  image: 'data:image/png;base64,abc',
  password: 'Pass1!',
};

describe('submissionsSlice', () => {
  it('returns empty array as initial state', () => {
    expect(reducer(undefined, { type: '@@init' })).toEqual([]);
  });

  it('addSubmission appends entry with generated id and isNew:true', () => {
    const state = reducer([], addSubmission(input));
    expect(state).toHaveLength(1);
    expect(state[0]).toMatchObject({ ...input, isNew: true });
    expect(typeof state[0].id).toBe('string');
    expect(state[0].id.length).toBeGreaterThan(0);
  });

  it('addSubmission generates unique ids for each entry', () => {
    let state = reducer([], addSubmission(input));
    state = reducer(state, addSubmission(input));
    expect(state[0].id).not.toBe(state[1].id);
  });

  it('addSubmission accumulates multiple entries', () => {
    let state = reducer([], addSubmission(input));
    state = reducer(state, addSubmission({ ...input, name: 'Мария' }));
    expect(state).toHaveLength(2);
    expect(state[1].name).toBe('Мария');
  });

  it('markAsRead sets isNew to false for the matching entry', () => {
    const state = reducer([], addSubmission(input));
    const id = state[0].id;
    const updated = reducer(state, markAsRead(id));
    expect(updated[0].isNew).toBe(false);
  });

  it('markAsRead does not affect other entries', () => {
    let state = reducer([], addSubmission(input));
    state = reducer(state, addSubmission({ ...input, name: 'Мария' }));
    const firstId = state[0].id;
    const updated = reducer(state, markAsRead(firstId));
    expect(updated[0].isNew).toBe(false);
    expect(updated[1].isNew).toBe(true);
  });

  it('markAsRead with unknown id leaves state unchanged', () => {
    const state = reducer([], addSubmission(input));
    const updated = reducer(state, markAsRead('nonexistent-id'));
    expect(updated[0].isNew).toBe(true);
  });
});
