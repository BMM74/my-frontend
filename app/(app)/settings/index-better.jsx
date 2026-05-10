import { ThemeToggle } from '@/components/ThemeToggle';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { Bell, Calendar, ChevronRight, Edit2, LogOut, Ruler, Settings, Shield, Target, User, Weight } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../../lib/api';
import { removeToken } from '../../../lib/auth';

function initials(name, email) {
  if (name) return name.split(' ').slice(0, 2).map((w) => w[0].toUpperCase()).join('');
  if (email) return email[0].toUpperCase();
  return '?';
}

const MENU_ITEMS = [
  { id: '1', label: 'Edit Profile', icon: Edit2, href: '/settings/edit-profile' },
  { id: '2', label: 'Preferences', icon: Settings, href: '/meals/preferences' },
  { id: '3', label: 'My Plan', icon: Target, href: '/meals/plan' },
  { id: '4', label: 'Notifications', icon: Bell, href: null },
  { id: '5', label: 'Privacy', icon: Shield, href: null },
];

export default function SettingsIndex() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      async function load() {
        setLoading(true);
        try {
          const res = await api.get('/users/me');
          if (active) setUser(res.data.user);
        } catch (_) {}
        finally { if (active) setLoading(false); }
      }
      load();
      return () => { active = false; };
    }, [])
  );

  async function handleLogout() {
    await removeToken();
    router.replace('/(auth)/welcome');
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 128 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-foreground">Profile</Text>
          <ThemeToggle />
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 48 }} size="large" color="#0D9488" />
        ) : (
          <>
            {/* Profile Section */}
            <View className="px-6 pt-4 pb-2">
              <View className="flex-row items-center gap-4 mb-6">
                <View className="w-20 h-20 bg-primary rounded-full items-center justify-center border-2 border-primary">
                  <Text className="text-primary-foreground text-2xl font-bold">
                    {initials(user?.name, user?.email)}
                  </Text>
                </View>
                <View>
                  <Text className="text-2xl font-bold text-foreground">{user?.name ?? user?.email ?? '—'}</Text>
                  {user?.name ? (
                    <Text className="text-muted-foreground mt-1">{user.email}</Text>
                  ) : null}
                </View>
              </View>

              {/* Stat Badges */}
              <View className="flex-row flex-wrap gap-2">
                {user?.age ? (
                  <View className="bg-secondary rounded-full px-3 py-1.5 flex-row items-center gap-1.5">
                    <Calendar size={14} color="#0D9488" />
                    <Text className="text-sm font-medium text-foreground">{user.age} yrs</Text>
                  </View>
                ) : null}
                {user?.weight ? (
                  <View className="bg-secondary rounded-full px-3 py-1.5 flex-row items-center gap-1.5">
                    <Weight size={14} color="#0D9488" />
                    <Text className="text-sm font-medium text-foreground">{user.weight} kg</Text>
                  </View>
                ) : null}
                {user?.height ? (
                  <View className="bg-secondary rounded-full px-3 py-1.5 flex-row items-center gap-1.5">
                    <Ruler size={14} color="#0D9488" />
                    <Text className="text-sm font-medium text-foreground">{user.height} cm</Text>
                  </View>
                ) : null}
                {user?.gender ? (
                  <View className="bg-secondary rounded-full px-3 py-1.5 flex-row items-center gap-1.5">
                    <User size={14} color="#0D9488" />
                    <Text className="text-sm font-medium text-foreground">{user.gender}</Text>
                  </View>
                ) : null}
                {user?.goal ? (
                  <View className="bg-secondary rounded-full px-3 py-1.5 flex-row items-center gap-1.5">
                    <Target size={14} color="#0D9488" />
                    <Text className="text-sm font-medium text-foreground">{user.goal}</Text>
                  </View>
                ) : null}
              </View>
            </View>

            {/* Menu Section */}
            <View className="px-6 mt-4">
              <Text className="text-lg font-semibold text-foreground mb-3">Account</Text>
              <View className="bg-card rounded-2xl border border-border overflow-hidden">
                {MENU_ITEMS.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => item.href && router.push(item.href)}
                    className={`flex-row items-center justify-between p-4 ${
                      index !== MENU_ITEMS.length - 1 ? 'border-b border-border' : ''
                    }`}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center gap-3">
                      <View className="w-8 h-8 rounded-full bg-secondary items-center justify-center">
                        <item.icon size={18} color="#64748B" />
                      </View>
                      <Text className="text-base text-foreground font-medium">{item.label}</Text>
                    </View>
                    <ChevronRight size={20} color="#94A3B8" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Logout */}
            <View className="px-6 mt-6">
              <TouchableOpacity
                className="flex-row items-center justify-center gap-2 p-4 bg-destructive/10 rounded-2xl"
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <LogOut size={20} color="#EF4444" />
                <Text className="text-base font-semibold text-destructive">Log Out</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
