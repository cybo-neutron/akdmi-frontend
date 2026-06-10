import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const applyTheme = (theme: Theme) => {
    if (typeof window === 'undefined') return;

    const root = window.document.documentElement;

    // Remove existing classes
    root.classList.remove('light', 'dark');

    let effectiveTheme = theme;
    if (theme === 'system') {
        effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
    }

    root.classList.add(effectiveTheme);

    // Also set color-scheme for native elements
    root.style.colorScheme = effectiveTheme;
};

export const useTheme = create<ThemeState>()(
    persist(
        (set, get) => ({
            theme: 'system',
            setTheme: (theme: Theme) => set({ theme }),
            toggleTheme: () => {
                const { theme } = get();
                const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
                set({ theme: nextTheme });
            },
        }),
        {
            name: 'theme-preference',
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    applyTheme(state.theme);
                }
            },
        }
    )
);

// Subscribe to theme changes to apply them automatically
// This ensures that even useTheme.setState() works correctly
useTheme.subscribe((state) => {
    applyTheme(state.theme);
});

// Handle system theme changes automatically if theme is set to 'system'
if (typeof window !== 'undefined') {
    window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', () => {
            const { theme } = useTheme.getState();
            if (theme === 'system') {
                applyTheme('system');
            }
        });
}
