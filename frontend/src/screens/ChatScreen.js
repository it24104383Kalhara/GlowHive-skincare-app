import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
  Image, ScrollView,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import io from 'socket.io-client';
import api, { BASE_SERVER_URL } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { Colors, Typography, Spacing, Radius } from '../utils/theme';
import MessageMenu from '../components/MessageMenu';

const ChatScreen = ({ route, navigation }) => {
  console.log('[1] ChatScreen component started');
  const params = route?.params || {};
  console.log('[2] params extracted:', params);
  const { conversationId, sellerId, productId, productTitle } = params;
  console.log('[3] destructured:', { conversationId, sellerId, productId, productTitle });
  const { user } = useContext(AuthContext);
  console.log('[4] current user:', user?._id);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef();
  const socketRef = useRef();
  const processedIds = useRef(new Set());
  console.log('[5] state and refs initialized');

  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);

  // --- Attachment pickers (same as before) ---
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setAttachments(prev => [...prev, {
        uri: asset.uri,
        type: 'image',
        name: asset.fileName || `image_${Date.now()}.jpg`,
        mimeType: asset.mimeType || 'image/jpeg',
      }]);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setAttachments(prev => [...prev, {
          uri: asset.uri,
          type: 'document',
          name: asset.name,
          mimeType: asset.mimeType || 'application/octet-stream',
          size: asset.size,
        }]);
      } else if (result.type === 'success') {
        setAttachments(prev => [...prev, {
          uri: result.uri,
          type: 'document',
          name: result.name,
          mimeType: result.mimeType || 'application/octet-stream',
          size: result.size,
        }]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // ========== FIXED uploadFile – works on web + native ==========
  const uploadFile = async (file) => {
    console.log('[uploadFile] START. File object:', JSON.stringify(file, null, 2));
    console.log('[uploadFile] Platform:', Platform.OS);

    const formData = new FormData();

    if (Platform.OS === 'web' && file.uri && file.uri.startsWith('blob:')) {
      console.log('[uploadFile] Web blob detected');
      const blob = await fetch(file.uri).then(r => r.blob());
      const fileToSend = new File([blob], file.name, { type: file.mimeType || blob.type });
      formData.append('file', fileToSend);
      console.log('[uploadFile] Web file appended:', fileToSend);
    } else {
      console.log('[uploadFile] Native or regular file');
      const fileToSend = {
        uri: file.uri,
        type: file.mimeType,
        name: file.name,
      };
      formData.append('file', fileToSend);
      console.log('[uploadFile] Native file object:', fileToSend);
    }

    console.log('[uploadFile] Sending to /api/upload');
    const response = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('[uploadFile] Response:', response.data);
    return response.data.url;
  };
  // ===============================================================

  // --- Helper functions (edit, delete, reply, details) unchanged ---
  const handleEdit = () => {
    console.log('[handleEdit] triggered, selectedMessage:', selectedMessage?._id);
    if (!selectedMessage) return;

    // Switch to edit mode instead of using iOS-only Alert.prompt
    setEditingMessage(selectedMessage);
    setNewMessage(selectedMessage.text);
    setMenuVisible(false);
    console.log('[handleEdit] edit mode activated');
  };

  const handleDelete = () => {
    console.log('[handleDelete] called');
    if (!selectedMessage) {
      console.log('[DEBUG] handleDelete: no selectedMessage');
      return;
    }
    console.log('[DEBUG] handleDelete called, message ID:', selectedMessage._id);

    const confirmDelete = () => {
      console.log('[DEBUG] Delete confirmed, sending DELETE request to:', `/messages/${selectedMessage._id}`);
      api.delete(`/messages/${selectedMessage._id}`)
        .then(response => {
          console.log('[DEBUG] Delete response:', response.data);
          setMessages(prev => prev.filter(msg => msg._id !== selectedMessage._id));
          Alert.alert('Success', 'Message deleted');
        })
        .catch(err => {
          console.error('[DEBUG] Delete error:', err);
          console.log('[DEBUG] Error response:', err.response);
          Alert.alert('Error', err.response?.data?.message || 'Could not delete message');
        })
        .finally(() => setMenuVisible(false));
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this message?')) {
        confirmDelete();
      } else {
        setMenuVisible(false);
      }
    } else {
      Alert.alert(
        'Delete Message',
        'Are you sure you want to delete this message?',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setMenuVisible(false) },
          { text: 'Delete', style: 'destructive', onPress: confirmDelete },
        ]
      );
    }
  };

  const handleReply = () => {
    console.log('[handleReply] called, selectedMessage:', selectedMessage?._id);
    if (!selectedMessage) return;
    const quoted = `> ${selectedMessage.text}\n\n`;
    setNewMessage(quoted);
    setMenuVisible(false);
    console.log('[handleReply] quoted set, menu closed');
  };

  const handleDetails = () => {
    console.log('[handleDetails] called');
    if (!selectedMessage) {
      console.log('[DEBUG] handleDetails: no selectedMessage');
      return;
    }
    console.log('[DEBUG] handleDetails called, message:', selectedMessage);
    const senderName = selectedMessage.senderId?.name || 'Unknown';
    const timeStr = selectedMessage.createdAt ? new Date(selectedMessage.createdAt).toLocaleString() : 'Unknown time';
    Alert.alert(
      'Message Details',
      `From: ${senderName}\nSent: ${timeStr}\nID: ${selectedMessage._id}\nText: ${selectedMessage.text}`
    );
    setMenuVisible(false);
  };

  // --- Init conversation & socket (unchanged) ---
  useEffect(() => {
    console.log('[useEffect mount] starting initConversation');
    initConversation();
    return () => {
      console.log('[useEffect cleanup] disconnecting socket');
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    console.log('[useEffect conversation] conversation changed:', conversation?._id);
    if (!conversation) return;
    if (!socketRef.current) {
      console.log('[socket] creating new socket connection to:', BASE_SERVER_URL);
      socketRef.current = io(BASE_SERVER_URL);
      socketRef.current.on('connect', () => {
        console.log('[socket] connected, joining conversation:', conversation._id);
        socketRef.current.emit('joinConversation', conversation._id);
      });
      socketRef.current.on('newMessage', (msg) => {
        console.log('[socket] newMessage received:', msg._id, 'conv:', msg.conversationId);
        if (msg.conversationId === conversation._id && !processedIds.current.has(msg._id)) {
          console.log('[socket] newMessage accepted, adding to state');
          processedIds.current.add(msg._id);
          setMessages(prev => [...prev, msg]);
        } else {
          console.log('[socket] newMessage ignored (duplicate or wrong conv)');
        }
      });
      socketRef.current.on('disconnect', (reason) => {
        console.log('[socket] DISCONNECTED, reason:', reason);
      });
      socketRef.current.on('connect_error', (err) => {
        console.error('[socket] connect_error:', err.message);
      });
    } else if (socketRef.current.connected) {
      console.log('[socket] already connected, joining conversation:', conversation._id);
      socketRef.current.emit('joinConversation', conversation._id);
    } else {
      console.log('[socket] exists but not connected, will reconnect later');
    }
  }, [conversation]);

  const initConversation = async () => {
    console.log('[initConversation] started');
    try {
      if (conversationId) {
        console.log('[initConversation] using existing conversationId:', conversationId);
        setConversation({ _id: conversationId });
        const msgsRes = await api.get(`/messages/${conversationId}`);
        console.log('[initConversation] messages fetched, count:', msgsRes.data.length);
        setMessages(msgsRes.data);
        processedIds.current.clear();
        msgsRes.data.forEach(m => processedIds.current.add(m._id));
      } else if (sellerId && productId) {
        console.log('[initConversation] creating new conversation for product:', productId);
        const res = await api.post('/messages/conversations', { sellerId, productId, productTitle });
        console.log('[initConversation] conversation created:', res.data._id);
        setConversation(res.data);
        const msgsRes = await api.get(`/messages/${res.data._id}`);
        console.log('[initConversation] messages fetched for new conv, count:', msgsRes.data.length);
        setMessages(msgsRes.data);
        processedIds.current.clear();
        msgsRes.data.forEach(m => processedIds.current.add(m._id));
      } else {
        throw new Error('Missing required parameters');
      }
    } catch (err) {
      console.error('[initConversation] error:', err);
      Alert.alert('Error', err.message || 'Could not start conversation');
    } finally {
      setLoading(false);
      console.log('[initConversation] loading set to false');
    }
  };

  // --- Send message with attachments (unchanged logic, uses fixed uploadFile) ---
  const handleSend = async () => {
    console.log('[handleSend] called, newMessage:', newMessage, 'conversationId:', conversation?._id);
    if ((!newMessage.trim() && attachments.length === 0) || !conversation?._id) {
      console.log('[handleSend] aborting - empty message and no attachments');
      return;
    }

    if (editingMessage) {
      setSending(true);
      try {
        const res = await api.put(`/messages/${editingMessage._id}`, { text: newMessage.trim() });
        setMessages(prev =>
          prev.map(msg =>
            msg._id === editingMessage._id ? { ...msg, text: res.data.text, edited: true } : msg
          )
        );

        // Update socket for realtime edit (if supported by backend/frontend, or just let it be)
        socketRef.current?.emit('sendMessage', {
          conversationId: conversation._id,
          text: newMessage.trim(),
          _id: editingMessage._id,
          isEdit: true
        });

        setEditingMessage(null);
        setNewMessage('');
      } catch (err) {
        console.error('[handleEdit] error:', err);
        Alert.alert('Error', err.response?.data?.message || 'Could not edit message');
      } finally {
        setSending(false);
      }
      return;
    }

    setSending(true);
    setUploading(true);
    let uploadedAttachments = [];
    try {
      // Upload each attachment
      for (const att of attachments) {
        console.log('[handleSend] uploading file:', att.name);
        const url = await uploadFile(att);
        console.log('[handleSend] uploaded URL:', url);
        uploadedAttachments.push({
          type: att.type,
          url,
          name: att.name,
          mimeType: att.mimeType,
          size: att.size,
        });
      }
      console.log('[handleSend] uploadedAttachments final:', uploadedAttachments);

      // Prepare payload with attachments
      const payload = {
        conversationId: conversation._id,
        text: newMessage.trim() || '📎 Attachment',
        attachments: uploadedAttachments,  // <-- MUST be included
      };
      console.log('[handleSend] payload:', JSON.stringify(payload, null, 2));

      const res = await api.post('/messages', payload);
      const sent = res.data;
      processedIds.current.add(sent._id);
      setMessages(prev => [...prev, sent]);
      setNewMessage('');
      setAttachments([]);

      socketRef.current?.emit('sendMessage', {
        conversationId: conversation._id,
        text: payload.text,
        attachments: uploadedAttachments,
        senderId: user._id,
        senderName: user.name,
        _id: sent._id,
        createdAt: sent.createdAt,
      });
    } catch (err) {
      console.error('[handleSend] error:', err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.message || err.message || 'Message not sent');
    } finally {
      setUploading(false);
      setSending(false);
    }
  };
  // --- Render a single message ---
  const renderMessage = ({ item }) => {
    const senderId = item.senderId?._id ?? item.senderId;
    const adminDummyId = '000000000000000000000000';
    const isMe = user.isAdmin
      ? (senderId === null || String(senderId) === adminDummyId)
      : String(senderId) === String(user._id);
    const time = item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    const showDots = Platform.OS === 'web' ? hoveredMessageId === item._id : true;

    const handleMenuPress = () => {
      console.log('[renderMessage] menu pressed for msg:', item._id);
      setSelectedMessage(item);
      setMenuVisible(true);
    };

    const mouseProps = Platform.OS === 'web' ? {
      onMouseEnter: () => setHoveredMessageId(item._id),
      onMouseLeave: () => setHoveredMessageId(null),
    } : {};

    return (
      <View style={[styles.messageRow, isMe ? styles.myRow : styles.otherRow]} {...mouseProps}>
        <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
          <View style={styles.messageContent}>
            {/* Attachments preview */}
            {item.attachments && item.attachments.length > 0 && (
              <View style={styles.attachmentsContainer}>
                {item.attachments.map((att, idx) => (
                  <View key={idx} style={styles.attachment}>
                    {att.type === 'image' ? (
                      <Image source={{ uri: att.url }} style={styles.attachmentImage} />
                    ) : (
                      <View style={styles.documentIcon}>
                        <Ionicons name="document-outline" size={32} color={isMe ? Colors.white : Colors.primary} />
                        <Text style={[styles.fileName, isMe && { color: Colors.white }]} numberOfLines={1}>
                          {att.name}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
            {item.text ? (
              <Text style={[styles.text, isMe ? styles.myText : styles.otherText]}>
                {item.text}
              </Text>
            ) : null}
            <View style={styles.metaDataRow}>
              {time ? <Text style={styles.time}>{time}</Text> : null}
              {item.edited && <Text style={styles.edited}> (edited)</Text>}
            </View>
          </View>
          {showDots && (
            <TouchableOpacity onPress={handleMenuPress} style={styles.menuIcon}>
              <Ionicons name="ellipsis-horizontal" size={20} color={isMe ? Colors.white : Colors.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    console.log('[ChatScreen] loading true, showing spinner');
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  const headerTitle = user?.isAdmin
    ? (productTitle || conversation?.productTitle || 'Chat')
    : (productTitle ? `Chat about ${productTitle}` : 'Chat with Seller');

  console.log('[ChatScreen] rendering main UI, header:', headerTitle);
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{headerTitle}</Text>
        <View style={{ width: 40 }} />
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item._id}
          renderItem={renderMessage}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />
        <View style={styles.inputContainer}>
          {editingMessage && (
            <View style={styles.editingBanner}>
              <View style={styles.editingLeft}>
                <Ionicons name="pencil" size={16} color={Colors.primary} style={{ marginRight: 6 }} />
                <Text style={styles.editingText}>Editing message...</Text>
              </View>
              <TouchableOpacity onPress={() => { setEditingMessage(null); setNewMessage(''); }}>
                <Ionicons name="close-circle" size={20} color={Colors.secondary} />
              </TouchableOpacity>
            </View>
          )}
          {/* Attachment preview row */}
          {attachments.length > 0 && (
            <ScrollView horizontal style={styles.attachmentPreviewRow} showsHorizontalScrollIndicator={false}>
              {attachments.map((att, idx) => (
                <View key={idx} style={styles.previewItem}>
                  {att.type === 'image' ? (
                    <Image source={{ uri: att.uri }} style={styles.previewImage} />
                  ) : (
                    <View style={styles.previewDoc}>
                      <Ionicons name="document-outline" size={40} color={Colors.primary} />
                    </View>
                  )}
                  <TouchableOpacity onPress={() => removeAttachment(idx)} style={styles.removePreview}>
                    <Ionicons name="close-circle" size={20} color="red" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
          <View style={styles.inputRow}>
            <View style={styles.mediaButtons}>
              <TouchableOpacity onPress={pickImage} style={styles.mediaBtn} disabled={sending || uploading}>
                <Ionicons name="image-outline" size={24} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={pickDocument} style={styles.mediaBtn} disabled={sending || uploading}>
                <Ionicons name="document-outline" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              multiline
              editable={!sending && !uploading}
            />
            <TouchableOpacity
              style={[styles.sendButton, ((!newMessage.trim() && attachments.length === 0) || sending || uploading) && styles.disabled]}
              onPress={handleSend}
              disabled={(!newMessage.trim() && attachments.length === 0) || sending || uploading}
            >
              <Ionicons name="send" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <MessageMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onDetails={handleDetails}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onReply={handleReply}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.neutral },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: Typography.md, fontWeight: '600', color: Colors.black },
  list: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.md },
  messageRow: { marginBottom: Spacing.sm, flexDirection: 'row' },
  myRow: { justifyContent: 'flex-end' },
  otherRow: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '75%', padding: Spacing.sm, borderRadius: Radius.lg, flexDirection: 'row' },
  myBubble: { backgroundColor: Colors.primary },
  otherBubble: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border },
  messageContent: { flexShrink: 1, flexDirection: 'column' },
  text: { fontSize: Typography.md },
  myText: { color: Colors.white },
  otherText: { color: Colors.black },
  metaDataRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  time: { fontSize: Typography.xs, color: Colors.secondary },
  edited: { fontSize: Typography.xs, color: Colors.secondary, fontStyle: 'italic', marginLeft: 4 },
  menuIcon: { paddingLeft: Spacing.sm, justifyContent: 'center' },
  inputContainer: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingVertical: Spacing.sm,
  },
  editingBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.neutral,
    paddingHorizontal: Spacing.base,
    paddingVertical: 8,
    marginBottom: Spacing.sm,
  },
  editingLeft: { flexDirection: 'row', alignItems: 'center' },
  editingText: { fontSize: Typography.sm, color: Colors.primary, fontWeight: '600' },
  attachmentPreviewRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  previewItem: {
    marginRight: Spacing.sm,
    position: 'relative',
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  previewDoc: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: Colors.neutral,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePreview: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: Colors.white,
    borderRadius: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
  },
  mediaButtons: {
    flexDirection: 'row',
    marginRight: Spacing.sm,
  },
  mediaBtn: {
    marginHorizontal: 4,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.neutral,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.base,
    paddingVertical: Platform.OS === 'ios' ? Spacing.sm : Spacing.xs,
    maxHeight: 100,
    fontSize: Typography.md,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.pill,
    padding: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  disabled: { backgroundColor: Colors.secondary },
  attachmentsContainer: { marginBottom: 4, flexDirection: 'row', flexWrap: 'wrap' },
  attachment: { marginRight: 8, marginBottom: 4 },
  attachmentImage: { width: 120, height: 120, borderRadius: 8 },
  documentIcon: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.05)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  fileName: { fontSize: 12, marginLeft: 8, color: Colors.textMuted },
});

export default ChatScreen;