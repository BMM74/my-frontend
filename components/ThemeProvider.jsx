import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { darkTheme, lightTheme } from '../theme';

export function ThemeProvider({ children }) {
  const { colorScheme } = useColorScheme();

  const themeVars = colorScheme === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const root = document.documentElement;
    const vars = themeVars.__cssVars ?? themeVars;
    const prev = {};
    for (const [key, value] of Object.entries(vars)) {
      prev[key] = root.style.getPropertyValue(key);
      root.style.setProperty(key, String(value));
    }
    root.classList.remove('light', 'dark');
    if (colorScheme) root.classList.add(colorScheme);
    return () => {
      for (const key of Object.keys(vars)) {
        if (prev[key]) root.style.setProperty(key, prev[key]);
        else root.style.removeProperty(key);
      }
    };
  }, [themeVars, colorScheme]);

  return (
    <View style={themeVars} className={`${colorScheme} flex-1 bg-background`}>
      {children}
    </View>
  );
}
