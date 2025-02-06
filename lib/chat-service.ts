import { supabase } from '@/lib/supabase/config';
import type { Message } from '@/types/chat';
import type { Database } from '@/types/supabase';

type ChatConversation = Database['public']['Tables']['chat_conversations']['Row'];
type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];

export class ChatService {
  async createConversation(userId: string, title?: string): Promise<ChatConversation | null> {
    const { data, error } = await supabase
      .from('chat_conversations')
      .insert({
        user_id: userId,
        title: title || 'New Chat',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }

    return data;
  }

  async getConversations(userId: string): Promise<ChatConversation[]> {
    const { data, error } = await supabase
      .from('chat_conversations')
      .select()
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }

    return data;
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select()
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return data.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.created_at),
      usedTools: msg.used_tools as Message['usedTools']
    }));
  }

  async saveMessage(conversationId: string, message: Message): Promise<ChatMessage | null> {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        role: message.role,
        content: message.content,
        used_tools: message.usedTools || null,
        created_at: message.timestamp.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving message:', error);
      return null;
    }

    // Update conversation's updated_at timestamp
    await supabase
      .from('chat_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return data;
  }

  async deleteConversation(conversationId: string): Promise<boolean> {
    const { error } = await supabase
      .from('chat_conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }

    return true;
  }

  async updateConversationTitle(conversationId: string, title: string): Promise<boolean> {
    const { error } = await supabase
      .from('chat_conversations')
      .update({ 
        title,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    if (error) {
      console.error('Error updating conversation title:', error);
      return false;
    }

    return true;
  }
} 