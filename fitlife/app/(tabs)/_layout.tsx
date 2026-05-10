import { Tabs } from 'expo-router';
import { Activity, Home, User, Utensils } from 'lucide-react-native';
import { cssInterop, useColorScheme } from 'nativewind';


cssInterop(Home, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(Utensils, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(Activity, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(User, { className: { target: 'style', nativeStyleToProp: { color: true } } });

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#0f172a' : '#ffffff',
          borderTopColor: isDark ? '#1e293b' : '#f1f5f9',
        },
        tabBarActiveTintColor: isDark ? '#2dd4bf' : '#0d9488', // Teal primary
        tabBarInactiveTintColor: isDark ? '#64748b' : '#94a3b8',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <Home className={focused ? 'text-primary' : 'text-muted-foreground'} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="meals"
        options={{
          title: 'Meals',
          tabBarIcon: ({ focused }) => (
            <Utensils className={focused ? 'text-primary' : 'text-muted-foreground'} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="activities"
        options={{
          title: 'Activity',
          tabBarIcon: ({ focused }) => (
            <Activity className={focused ? 'text-primary' : 'text-muted-foreground'} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <User className={focused ? 'text-primary' : 'text-muted-foreground'} size={24} />
          ),
        }}
      />
    </Tabs>
  );
}