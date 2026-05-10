import { ThemeToggle } from '@/components/ThemeToggle';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { Activity, Calendar, Clock, Flame, Plus, Trash2 } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../../lib/api';

const RANGES = ['today', 'week', 'month', 'year'];
const RANGE_LABELS = { today: 'Today', week: 'Week', month: 'Month', year: 'Year' };

const INTENSITY_COLORS = {
  low: '#0F6E56',
  medium: '#BA7517',
  high: '#A32D2D',
};

function StatCard({ value, label, icon: Icon }) {
  return (
    <View className="flex-1 bg-card rounded-2xl p-4 border border-border items-center">
      <Icon size={20} color="#0D9488" style={{ marginBottom: 8 }} />
      <Text className="text-2xl font-bold text-foreground">{value}</Text>
      <Text className="text-xs text-muted-foreground mt-1 capitalize">{label}</Text>
    </View>
  );
}

function ActivityRow({ item, onRemove }) {
  const date = new Date(item.loggedAt);
  const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const borderColor = INTENSITY_COLORS[item.intensity] ?? '#94A3B8';

  return (
    <View
      className="bg-card rounded-xl p-4 mb-3 border border-border flex-row justify-between items-center"
      style={{ borderLeftWidth: 4, borderLeftColor: borderColor }}
    >
      <View className="flex-1 mr-4">
        <Text className="font-bold text-foreground text-base mb-1">{item.activityLabel}</Text>
        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center gap-1">
            <Clock size={14} color="#64748B" />
            <Text className="text-sm text-muted-foreground">{item.durationMinutes} min</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Flame size={14} color="#64748B" />
            <Text className="text-sm text-muted-foreground">{item.caloriesBurned} kcal</Text>
          </View>
        </View>
        {item.notes ? (
          <Text className="text-xs text-muted-foreground mt-2 italic" numberOfLines={1}>
            "{item.notes}"
          </Text>
        ) : null}
      </View>

      <View className="items-end">
        <Text className="text-xs font-medium text-muted-foreground mb-1">{dateStr}</Text>
        <Text className="text-xs text-muted-foreground mb-2">{timeStr}</Text>
        <TouchableOpacity
          onPress={() => onRemove(item._id)}
          className="p-2 bg-destructive/10 rounded-full"
          activeOpacity={0.7}
        >
          <Trash2 size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ActivitiesIndex() {
  const { colorScheme } = useColorScheme();
  const [range, setRange] = useState('today');
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchData(r) {
    setLoading(true);
    setError('');
    try {
      const [actRes, statRes] = await Promise.all([
        api.get(`/activities?range=${r}`),
        api.get(`/activities/stats?range=${r}`),
      ]);
      setActivities(actRes.data);
      setStats(statRes.data);
    } catch (err) {
      if (err.response?.status !== 401) {
        const msg = err.response?.data?.message;
        setError(Array.isArray(msg) ? msg.join('\n') : (msg || 'Failed to load activities.'));
      }
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(useCallback(() => { fetchData(range); }, [range]));

  function handleRemove(id) {
    Alert.alert('Remove Activity', 'Delete this entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/activities/${id}`);
            fetchData(range);
          } catch (err) {
            const msg = err.response?.data?.message;
            Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : (msg || 'Could not delete.'));
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      {/* Header */}
      <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-foreground">My Activities</Text>
        <ThemeToggle />
      </View>

      <FlatList
        data={activities}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 128, paddingTop: 16 }}
        ListHeaderComponent={
          <View className="gap-6">
            {/* Range Selector */}
            <View className="flex-row gap-2">
              {RANGES.map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRange(r)}
                  activeOpacity={0.7}
                  className={`flex-1 py-2.5 rounded-full items-center justify-center border ${
                    range === r ? 'bg-primary border-primary' : 'bg-card border-border'
                  }`}
                >
                  <Text className={`text-sm font-medium ${
                    range === r ? 'text-primary-foreground' : 'text-muted-foreground'
                  }`}>
                    {RANGE_LABELS[r]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Stats Section */}
            {loading ? (
              <View className="h-24 items-center justify-center">
                <ActivityIndicator size="small" color="#0D9488" />
              </View>
            ) : stats ? (
              <View className="gap-4">
                <View className="flex-row gap-3">
                  <StatCard value={stats.totalCalories} label="Kcal Burned" icon={Flame} />
                  <StatCard value={stats.totalMinutes} label="Active Min" icon={Clock} />
                  <StatCard value={stats.sessionCount} label="Sessions" icon={Activity} />
                </View>
                {stats.mostFrequent ? (
                  <View className="bg-secondary/50 rounded-xl p-3 flex-row items-center gap-3 border border-border">
                    <Activity size={18} color="#0D9488" />
                    <Text className="text-sm text-foreground">
                      Most frequent: <Text className="font-bold">{stats.mostFrequent}</Text>
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            {error ? <Text className="text-destructive text-center">{error}</Text> : null}

            {/* Section Title */}
            <Text className="text-lg font-bold text-foreground mt-2">Recent History</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ActivityRow item={item} onRemove={handleRemove} />
        )}
        ListEmptyComponent={
          !loading ? (
            <View className="items-center justify-center py-12">
              <Calendar size={48} color="#64748B" style={{ marginBottom: 16 }} />
              <Text className="text-foreground font-medium text-lg">No activities found</Text>
              <Text className="text-muted-foreground text-sm mt-1">Start logging your workouts!</Text>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <TouchableOpacity
        className="absolute bottom-8 right-6 bg-primary w-14 h-14 rounded-full items-center justify-center shadow-lg"
        onPress={() => router.push('/activities/add')}
        activeOpacity={0.8}
      >
        <Plus size={28} color={colorScheme === 'dark' ? '#000000' : '#ffffff'} strokeWidth={3} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
