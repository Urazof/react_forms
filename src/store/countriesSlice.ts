import { createSlice } from '@reduxjs/toolkit';

const COUNTRIES: string[] = [
  'Австралия',
  'Австрия',
  'Аргентина',
  'Беларусь',
  'Бельгия',
  'Бразилия',
  'Великобритания',
  'Германия',
  'Греция',
  'Дания',
  'Израиль',
  'Индия',
  'Испания',
  'Италия',
  'Казахстан',
  'Канада',
  'Китай',
  'Мексика',
  'Нидерланды',
  'Норвегия',
  'Польша',
  'Португалия',
  'Россия',
  'США',
  'Турция',
  'Украина',
  'Финляндия',
  'Франция',
  'Швейцария',
  'Швеция',
  'Япония',
];

const countriesSlice = createSlice({
  name: 'countries',
  initialState: COUNTRIES,
  reducers: {},
});

export default countriesSlice.reducer;
