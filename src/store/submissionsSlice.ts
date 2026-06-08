import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Submission } from '../types';

type SubmissionInput = Omit<Submission, 'id' | 'isNew'>;

const submissionsSlice = createSlice({
  name: 'submissions',
  initialState: [] as Submission[],
  reducers: {
    addSubmission(state, action: PayloadAction<SubmissionInput>) {
      state.push({ ...action.payload, id: crypto.randomUUID(), isNew: true });
    },
    markAsRead(state, action: PayloadAction<string>) {
      const item = state.find((s) => s.id === action.payload);
      if (item) item.isNew = false;
    },
  },
});

export const { addSubmission, markAsRead } = submissionsSlice.actions;
export default submissionsSlice.reducer;
