import React, { useState, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';
import skinLogService from '../services/skinLogService';
import { BASE_SERVER_URL } from '../services/api';
import { Colors, Typography, Spacing, Radius, Shadow } from '../utils/theme';

const SkinDiaryScreen = ({ navigation }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await skinLogService.getMySkinLogs(user.token);
      setLogs(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch skin logs');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLogs();
    }, [])
  );

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this skin diary entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await skinLogService.deleteSkinLog(id, user.token);
              setLogs((prev) => prev.filter((log) => log._id !== id));
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'Failed to delete entry');
            }
          },
        },
      ]
    );
  };

  const renderLogEntry = ({ item }) => {
    const d = new Date(item.date);
    const dateString = d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.dateText}>{dateString}</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={() => navigation.navigate('AddSkinLog', { logId: item._id })}
              style={styles.iconBtn}
            >
              <Ionicons name="pencil-outline" size={18} color={Colors.secondary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(item._id)}
              style={styles.iconBtn}
            >
              <Ionicons name="trash-outline" size={18} color={Colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Image
            source={{ uri: `${BASE_SERVER_URL}${item.imageUrl}` }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.details}>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, { backgroundColor: Colors.primaryLight }]}>
                <Text style={styles.badgeText}>Hydration: {item.hydration}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: item.acne === 'None' ? Colors.success : Colors.warning }]}>
                <Text style={styles.badgeText}>Acne: {item.acne}</Text>
              </View>
            </View>
            
            {item.productsUsed && item.productsUsed.length > 0 && (
              <Text style={styles.productsText} numberOfLines={2}>
                <Text style={{ fontWeight: '600' }}>Products: </Text>
                {item.productsUsed.join(', ')}
              </Text>
            )}

            {item.notes ? (
              <Text style={styles.notesText} numberOfLines={3}>
                "{item.notes}"
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Skin Diary</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : logs.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="journal-outline" size={64} color={Colors.border} />
          <Text style={styles.emptyText}>Your skin diary is empty.</Text>
          <Text style={styles.emptySub}>Start logging your daily skin health to track your progress.</Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item._id}
          renderItem={renderLogEntry}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('AddSkinLog')}
      >
        <Ionicons name="add" size={32} color={Colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.neutral },
  header: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontSize: Typography.xxl,
    fontFamily: 'Georgia',
    fontWeight: '700',
    color: Colors.black,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    fontSize: Typography.lg,
    fontWeight: '600',
    color: Colors.black,
    marginTop: Spacing.md,
  },
  emptySub: {
    fontSize: Typography.base,
    color: Colors.secondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  listContainer: {
    padding: Spacing.base,
    paddingBottom: 180, // Accounts for tab bar + FAB
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    ...Shadow.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  dateText: {
    fontSize: Typography.md,
    fontWeight: '600',
    color: Colors.black,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  iconBtn: {
    padding: Spacing.xs,
  },
  cardContent: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  image: {
    width: 80,
    height: 100,
    borderRadius: Radius.md,
    backgroundColor: Colors.neutral,
  },
  details: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
  },
  badgeText: {
    fontSize: Typography.xs,
    fontWeight: '600',
    color: Colors.white,
  },
  productsText: {
    fontSize: Typography.sm,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  notesText: {
    fontSize: Typography.sm,
    color: Colors.secondary,
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    bottom: 110, // Pushed up above the floating tab bar (25 + 70 + 15)
    right: Spacing.xl,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.md,
  },
});

export default SkinDiaryScreen;
