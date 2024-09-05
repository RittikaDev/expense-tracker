import { createStore, select, withProps } from '@ngneat/elf';
import { localStorageStrategy, persistState } from '@ngneat/elf-persist-state';
import { debounceTime } from 'rxjs';

// TYPE DEFINITION FOR THEME
export type ITheme = 'dark' | 'light'; // THE THEME CAN BE EITHER 'dark' OR 'light'

// INTERFACE DEFINITION FOR THEME REPOSITORY
export interface IThemeProps {
  theme: ITheme; // PROPERTIES EXPECTED BY COMPONENT
}

// INITIAL VALUES FOR THEME
export const THEME_INITIAL_VALUES: IThemeProps = {
  theme: 'dark', // INITIAL THEME SET TO 'dark'
};

// CREATE THEME STORE INSTANCE
export const themeStore = createStore(
  { name: 'theme' }, // STORE NAME
  withProps<IThemeProps>(THEME_INITIAL_VALUES) // INITIAL PROPS
);

// PERSIST STATE TO LOCAL STORAGE WITH CUSTOM STRATEGY
persistState(themeStore, {
  key: 'theme', // STORAGE KEY
  storage: localStorageStrategy, // LOCAL STORAGE STRATEGY
  source: () => themeStore.pipe(debounceTime(1000)), // OPTIONAL DEBOUNCE TIME
});

// OBSERVABLE FOR EXTERNAL COMPONENTS TO SUBSCRIBE TO THEME STATE
export const theme$ = themeStore.pipe(select((state) => state.theme));

// FUNCTION TO UPDATE THEME STATE
export const updateThemeState = (theme: IThemeProps['theme']) => {
  themeStore.update((state) => ({
    ...state,
    theme,
  }));
};
