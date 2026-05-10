import { vars } from "nativewind";

export interface ThemeFonts {
  heading: {
    family: string;
    weights: Record<string, string>;
  };
  body: {
    family: string;
    weights: Record<string, string>;
  };
  mono: {
    family: string;
    weights: Record<string, string>;
  };
}

export const themeFonts: ThemeFonts = {
  heading: {
    family: 'Inter',
    weights: {
      normal: 'Inter_400Regular',
      medium: 'Inter_500Medium',
      semibold: 'Inter_600SemiBold',
      bold: 'Inter_700Bold',
    },
  },
  body: {
    family: 'Inter',
    weights: {
      normal: 'Inter_400Regular',
      medium: 'Inter_500Medium',
      semibold: 'Inter_600SemiBold',
    },
  },
  mono: {
    family: 'JetBrainsMono',
    weights: {
      normal: 'JetBrainsMono_400Regular',
      medium: 'JetBrainsMono_500Medium',
    },
  },
};

// Modern Teal Theme for Fitness App
export const lightTheme = vars({
  "--radius": "14",

  "--background": "255 255 255",
  "--foreground": "15 23 42",

  "--card": "255 255 255",
  "--card-foreground": "15 23 42",

  "--popover": "255 255 255",
  "--popover-foreground": "15 23 42",

  "--primary": "13 148 136", // Teal-600
  "--primary-foreground": "255 255 255",

  "--secondary": "240 249 255", // Light cyan/teal tint
  "--secondary-foreground": "15 23 42",

  "--muted": "241 245 249",
  "--muted-foreground": "100 116 139",

  "--accent": "240 249 255",
  "--accent-foreground": "15 23 42",

  "--destructive": "220 38 38",

  "--border": "226 232 240",
  "--input": "241 245 249",
  "--ring": "13 148 136",

  "--chart-1": "13 148 136",
  "--chart-2": "45 212 191",
  "--chart-3": "20 184 166",
  "--chart-4": "94 234 212",
  "--chart-5": "153 246 228",

  "--sidebar": "250 250 250",
  "--sidebar-foreground": "15 23 42",
  "--sidebar-primary": "13 148 136",
  "--sidebar-primary-foreground": "255 255 255",
  "--sidebar-accent": "240 249 255",
  "--sidebar-accent-foreground": "15 23 42",
  "--sidebar-border": "226 232 240",
  "--sidebar-ring": "13 148 136",
});

export const darkTheme = vars({
  "--radius": "14",

  "--background": "15 23 42",
  "--foreground": "248 250 252",

  "--card": "30 41 59",
  "--card-foreground": "248 250 252",

  "--popover": "30 41 59",
  "--popover-foreground": "248 250 252",

  "--primary": "45 212 191", // Teal-400 (lighter for dark mode)
  "--primary-foreground": "15 23 42",

  "--secondary": "51 65 85",
  "--secondary-foreground": "248 250 252",

  "--muted": "51 65 85",
  "--muted-foreground": "148 163 184",

  "--accent": "51 65 85",
  "--accent-foreground": "248 250 252",

  "--destructive": "248 113 113",

  "--border": "51 65 85",
  "--input": "51 65 85",
  "--ring": "45 212 191",

  "--chart-1": "45 212 191",
  "--chart-2": "20 184 166",
  "--chart-3": "13 148 136",
  "--chart-4": "94 234 212",
  "--chart-5": "153 246 228",

  "--sidebar": "15 23 42",
  "--sidebar-foreground": "248 250 252",
  "--sidebar-primary": "45 212 191",
  "--sidebar-primary-foreground": "15 23 42",
  "--sidebar-accent": "51 65 85",
  "--sidebar-accent-foreground": "248 250 252",
  "--sidebar-border": "51 65 85",
  "--sidebar-ring": "45 212 191",
});