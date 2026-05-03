import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
  RefreshControl, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { Colors, Typography, Spacing, Radius, Shadow } from '../utils/theme';

const InboxScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations');
      let convs = res.data;
      const withUnread = await Promise.all(convs.map(async (conv) => {
        try {
          const unreadRes = await api.get(`/conversations/${conv._id}/unread-count`);
          return { ...conv, unreadCount: unreadRes.data.unreadCount };
        } catch (err) {
          console.error(`Failed to get unread count for ${conv._id}`, err);
          return { ...conv, unreadCount: 0 };
        }
      }));
      setConversations(withUnread);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); fetchConversations(); };
  useFocusEffect(useCallback(() => { fetchConversations(); }, []));

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now - d) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h`;
    return d.toLocaleDateString();
  };

  const getOtherParticipant = (conv) => {
    if (user.isAdmin) {
      if (conv.customerId && typeof conv.customerId === 'object') return conv.customerId;
      return { _id: conv.customerId, name: 'Customer' };
    } else {
      if (conv.sellerId && typeof conv.sellerId === 'object') return conv.sellerId;
      return { _id: conv.sellerId, name: 'Seller' };
    }
  };

  const markConversationAsRead = async (conversationId) => {
    try {
      await api.post(`/conversations/${conversationId}/read`);
      setConversations(prev =>
        prev.map(conv =>
          conv._id === conversationId ? { ...conv, unreadCount: 0 } : conv
        )
      );
    } catch (err) {
      console.error('Mark read failed:', err);
    }
  };

  // ✅ NEW: Delete conversation
const deleteConversation = async (conversationId) => {
  console.log('[DELETE] Button clicked for conversation:', conversationId);
  Alert.alert(
    'Delete Conversation',
    'Are you sure? This will delete all messages in this chat permanently.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          console.log('[DELETE] Confirmed, calling API...');
          try {
            const response = await api.delete(`/conversations/${conversationId}`);
            console.log('[DELETE] API response:', response.status, response.data);
            setConversations(prev => {
              const newList = prev.filter(conv => conv._id !== conversationId);
              console.log('[DELETE] Old length:', prev.length, 'New length:', newList.length);
              return newList;
            });
            Alert.alert('Deleted', 'Conversation removed.');
          } catch (err) {
            console.error('[DELETE] Error:', err);
            Alert.alert('Error', 'Could not delete conversation.');
          }
        },
      },
    ]
  );
};

  const handlePress = async (conv) => {
    if (!conv._id) {
      Alert.alert('Error', 'Conversation ID missing');
      return;
    }
    if (conv.unreadCount > 0) {
      await markConversationAsRead(conv._id);
    }
    navigation.navigate('Chat', {
      conversationId: conv._id,
      productTitle: conv.productTitle || 'Product',
    });
  };

  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => {
      const dateA = new Date(a.updatedAt);
      const dateB = new Date(b.updatedAt);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [conversations, sortOrder]);

  const filteredConversations = useMemo(() => {
    let result = sortedConversations;

    const getSenderIdStr = (conv) => {
      const sender = conv.lastMessageSenderId;
      if (!sender) return null;
      if (typeof sender === 'object') return String(sender._id || sender);
      return String(sender);
    };

    // 1. Apply Status Filter
    if (filterStatus === 'replied') {
      result = result.filter(conv => {
        const senderStr = getSenderIdStr(conv);
        if (!senderStr) return false;
        return senderStr === String(user?._id);
      });
    } else if (filterStatus === 'unreplied') {
      result = result.filter(conv => {
        const senderStr = getSenderIdStr(conv);
        if (!senderStr) return true; // If no messages yet, treat as unreplied
        return senderStr !== String(user?._id);
      });
    }

    // 2. Apply Search Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(conv => {
        const productName = conv.productTitle || 'Product';
        const other = getOtherParticipant(conv);
        const otherName = other?.name || (user.isAdmin ? 'Customer' : 'Seller');
        return productName.toLowerCase().includes(query) || otherName.toLowerCase().includes(query);
      });
    }

    return result;
  }, [sortedConversations, searchQuery, filterStatus, user]);

  const renderItem = ({ item }) => {
    const productName = item.productTitle || 'Product';
    const other = getOtherParticipant(item);
    const otherName = other?.name || (user.isAdmin ? 'Customer' : 'Seller');
    const last = item.lastMessage || 'No messages yet';
    const time = formatTime(item.updatedAt);
    const mainText = user.isAdmin ? `${otherName} - ${productName}` : productName;

    return (
      <TouchableOpacity style={styles.item} onPress={() => handlePress(item)} activeOpacity={0.7}>
        <View style={styles.avatar}>
          <Ionicons name="chatbubble-outline" size={40} color={Colors.primary} />
        </View>
        <View style={styles.content}>
          <View style={styles.row}>
            <Text style={styles.name} numberOfLines={1}>{mainText}</Text>
            <Text style={styles.time}>{time}</Text>
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>{last}</Text>
        </View>
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>
              {item.unreadCount > 99 ? '99+' : item.unreadCount}
            </Text>
          </View>
        )}
        {/* ✅ DELETE ICON */}
        <TouchableOpacity
          onPress={() => deleteConversation(item._id)}
          style={styles.deleteButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={22} color={Colors.error || 'red'} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading) return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <View style={styles.sortToggle}>
          <TouchableOpacity style={[styles.sortOption, sortOrder === 'newest' && styles.sortOptionActive]} onPress={() => setSortOrder('newest')}>
            <Text style={[styles.sortText, sortOrder === 'newest' && styles.sortTextActive]}>Newest</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.sortOption, sortOrder === 'oldest' && styles.sortOptionActive]} onPress={() => setSortOrder('oldest')}>
            <Text style={[styles.sortText, sortOrder === 'oldest' && styles.sortTextActive]}>Oldest</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity style={[styles.filterChip, filterStatus === 'all' && styles.filterChipActive]} onPress={() => setFilterStatus('all')}>
          <Text style={[styles.filterText, filterStatus === 'all' && styles.filterTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterChip, filterStatus === 'replied' && styles.filterChipActive]} onPress={() => setFilterStatus('replied')}>
          <Text style={[styles.filterText, filterStatus === 'replied' && styles.filterTextActive]}>Replied</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterChip, filterStatus === 'unreplied' && styles.filterChipActive]} onPress={() => setFilterStatus('unreplied')}>
          <Text style={[styles.filterText, filterStatus === 'unreplied' && styles.filterTextActive]}>Unreplied</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={Colors.secondary} style={styles.searchIcon} />
        <TextInput style={styles.searchInput} placeholder="Search conversations..." placeholderTextColor={Colors.secondary} value={searchQuery} onChangeText={setSearchQuery} />
        {searchQuery !== '' && <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}><Ionicons name="close-circle" size={20} color={Colors.secondary} /></TouchableOpacity>}
      </View>

      {filteredConversations.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="chatbubbles-outline" size={72} color={Colors.border} />
          <Text style={styles.emptyText}>{searchQuery ? 'No matching conversations' : 'No conversations'}</Text>
          <Text style={styles.emptySub}>Start a chat from a product page</Text>
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ... (your existing styles remain exactly as they were)
  safe: { flex: 1, backgroundColor: Colors.neutral },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { fontSize: Typography.xl, fontFamily: 'Georgia', fontWeight: '700', color: Colors.black },
  sortToggle: { flexDirection: 'row', backgroundColor: Colors.neutral, borderRadius: Radius.pill, padding: 2 },
  sortOption: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.pill },
  sortOptionActive: { backgroundColor: Colors.white, ...Shadow.sm },
  sortText: { fontSize: Typography.sm, color: Colors.secondary },
  sortTextActive: { color: Colors.primary, fontWeight: '600' },
  filterRow: { flexDirection: 'row', justifyContent: 'space-evenly', marginHorizontal: Spacing.base, marginVertical: Spacing.sm, paddingVertical: Spacing.xs, backgroundColor: Colors.white, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border },
  filterChip: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.lg, borderRadius: Radius.pill },
  filterChipActive: { backgroundColor: Colors.primary },
  filterText: { fontSize: Typography.sm, color: Colors.secondary },
  filterTextActive: { color: Colors.white, fontWeight: '600' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.lg, marginHorizontal: Spacing.base, marginVertical: Spacing.sm, paddingHorizontal: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  searchIcon: { marginRight: Spacing.sm },
  searchInput: { flex: 1, paddingVertical: Spacing.sm, fontSize: Typography.md, color: Colors.black },
  clearButton: { padding: Spacing.xs },
  list: { paddingHorizontal: Spacing.base },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.sm, marginVertical: Spacing.xs, ...Shadow.sm },
  avatar: { marginRight: Spacing.sm },
  content: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  name: { fontSize: Typography.md, fontWeight: '700', color: Colors.black, flex: 1 },
  time: { fontSize: Typography.xs, color: Colors.secondary },
  lastMessage: { fontSize: Typography.sm, color: Colors.textMuted },
  unreadBadge: { backgroundColor: Colors.primary, borderRadius: 12, minWidth: 24, height: 24, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6, marginLeft: 8 },
  unreadText: { color: Colors.white, fontSize: 12, fontWeight: 'bold' },
  // ✅ New style for delete button
  deleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    marginLeft: 4,
  },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.xxl },
  emptyText: { fontSize: Typography.lg, fontWeight: '600', color: Colors.black, marginTop: Spacing.md },
  emptySub: { fontSize: Typography.sm, color: Colors.secondary, textAlign: 'center', marginTop: Spacing.sm },
});

export default InboxScreen;