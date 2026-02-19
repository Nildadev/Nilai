import { supabaseHelpers, getSupabase } from './client';
import type { Conversation, Message, Project } from '~/types/supabase';
import { toast } from 'react-toastify';

/**
 * Supabase service for managing chat history and projects
 */
export class SupabaseService {
  private static instance: SupabaseService;
  private isEnabled: boolean = false;
  private userId: string | null = null;

  private constructor() {
    this.checkConnection();
  }

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  /**
   * Check if Supabase is properly configured
   */
  private async checkConnection() {
    try {
      const supabase = await getSupabase();
      
      if (!supabase) {
        console.warn('[Supabase] Client not initialized');
        this.isEnabled = false;
        return;
      }

      const { data, error } = await supabase.from('profiles').select('id').limit(1);

      if (error) {
        console.warn('[Supabase] Connection check failed:', error.message);
        this.isEnabled = false;
      } else {
        this.isEnabled = true;
        console.log('[Supabase] Connection established');
      }
    } catch (error) {
      console.warn('[Supabase] Not configured:', error);
      this.isEnabled = false;
    }
  }

  /**
   * Set the current user ID
   */
  public setUserId(userId: string) {
    this.userId = userId;
  }

  /**
   * Check if the service is enabled
   */
  public isServiceEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * ====================
   * CONVERSATION METHODS
   * ====================
   */

  /**
   * Create a new conversation
   */
  async createConversation(title: string, metadata?: Record<string, any>): Promise<Conversation | null> {
    if (!this.isEnabled || !this.userId) {
      console.warn('Supabase service not enabled or user not set');
      return null;
    }

    try {
      const { data, error } = await supabaseHelpers.createConversation(this.userId, title, metadata);

      if (error) throw error;

      const conversation = data?.[0] as Conversation;
      toast.success('Conversation saved to Supabase');
      return conversation;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      toast.error('Failed to save conversation');
      return null;
    }
  }

  /**
   * Get all conversations for the current user
   */
  async getConversations(): Promise<Conversation[]> {
    if (!this.isEnabled || !this.userId) {
      return [];
    }

    try {
      const { data, error } = await supabaseHelpers.getConversations(this.userId);

      if (error) throw error;

      return data as Conversation[];
    } catch (error) {
      console.error('Failed to get conversations:', error);
      return [];
    }
  }

  /**
   * Get a single conversation by ID
   */
  async getConversation(conversationId: string): Promise<Conversation | null> {
    if (!this.isEnabled) {
      return null;
    }

    try {
      const { data, error } = await supabaseHelpers.getConversation(conversationId);

      if (error) throw error;

      return data as Conversation;
    } catch (error) {
      console.error('Failed to get conversation:', error);
      return null;
    }
  }

  /**
   * Update a conversation
   */
  async updateConversation(
    conversationId: string,
    updates: Partial<{ title: string; metadata: Record<string, any> }>,
  ): Promise<boolean> {
    if (!this.isEnabled) {
      return false;
    }

    try {
      const { error } = await supabaseHelpers.updateConversation(conversationId, updates);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Failed to update conversation:', error);
      return false;
    }
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string): Promise<boolean> {
    if (!this.isEnabled) {
      return false;
    }

    try {
      const { error } = await supabaseHelpers.deleteConversation(conversationId);

      if (error) throw error;

      toast.success('Conversation deleted');
      return true;
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      toast.error('Failed to delete conversation');
      return false;
    }
  }

  /**
   * ====================
   * MESSAGE METHODS
   * ====================
   */

  /**
   * Create a new message
   */
  async createMessage(
    conversationId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: Record<string, any>,
  ): Promise<Message | null> {
    if (!this.isEnabled) {
      return null;
    }

    try {
      const { data, error } = await supabaseHelpers.createMessage(conversationId, role, content, metadata);

      if (error) throw error;

      return data?.[0] as Message;
    } catch (error) {
      console.error('Failed to create message:', error);
      return null;
    }
  }

  /**
   * Get all messages for a conversation
   */
  async getMessages(conversationId: string): Promise<Message[]> {
    if (!this.isEnabled) {
      return [];
    }

    try {
      const { data, error } = await supabaseHelpers.getMessages(conversationId);

      if (error) throw error;

      return data as Message[];
    } catch (error) {
      console.error('Failed to get messages:', error);
      return [];
    }
  }

  /**
   * Update a message
   */
  async updateMessage(
    messageId: string,
    updates: Partial<{ content: string; metadata: Record<string, any> }>,
  ): Promise<boolean> {
    if (!this.isEnabled) {
      return false;
    }

    try {
      const { error } = await supabaseHelpers.updateMessage(messageId, updates);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Failed to update message:', error);
      return false;
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string): Promise<boolean> {
    if (!this.isEnabled) {
      return false;
    }

    try {
      const { error } = await supabaseHelpers.deleteMessage(messageId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Failed to delete message:', error);
      return false;
    }
  }

  /**
   * ====================
   * PROJECT METHODS
   * ====================
   */

  /**
   * Create a new project
   */
  async createProject(
    name: string,
    description?: string,
    files?: any[],
    metadata?: Record<string, any>,
  ): Promise<Project | null> {
    if (!this.isEnabled || !this.userId) {
      return null;
    }

    try {
      const { data, error } = await supabaseHelpers.createProject(this.userId, name, description, files, metadata);

      if (error) throw error;

      const project = data?.[0] as Project;
      toast.success('Project saved to Supabase');
      return project;
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error('Failed to save project');
      return null;
    }
  }

  /**
   * Get all projects for the current user
   */
  async getProjects(): Promise<Project[]> {
    if (!this.isEnabled || !this.userId) {
      return [];
    }

    try {
      const { data, error } = await supabaseHelpers.getProjects(this.userId);

      if (error) throw error;

      return data as Project[];
    } catch (error) {
      console.error('Failed to get projects:', error);
      return [];
    }
  }

  /**
   * Get a single project by ID
   */
  async getProject(projectId: string): Promise<Project | null> {
    if (!this.isEnabled) {
      return null;
    }

    try {
      const { data, error } = await supabaseHelpers.getProject(projectId);

      if (error) throw error;

      return data as Project;
    } catch (error) {
      console.error('Failed to get project:', error);
      return null;
    }
  }

  /**
   * Update a project
   */
  async updateProject(
    projectId: string,
    updates: Partial<{ name: string; description: string; files: any[]; metadata: Record<string, any> }>,
  ): Promise<boolean> {
    if (!this.isEnabled) {
      return false;
    }

    try {
      const { error } = await supabaseHelpers.updateProject(projectId, updates);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Failed to update project:', error);
      return false;
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId: string): Promise<boolean> {
    if (!this.isEnabled) {
      return false;
    }

    try {
      const { error } = await supabaseHelpers.deleteProject(projectId);

      if (error) throw error;

      toast.success('Project deleted');
      return true;
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error('Failed to delete project');
      return false;
    }
  }

  /**
   * ====================
   * UTILITY METHODS
   * ====================
   */

  /**
   * Save a complete conversation with messages
   */
  async saveConversationWithMessages(
    title: string,
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string; metadata?: Record<string, any> }>,
    metadata?: Record<string, any>,
  ): Promise<Conversation | null> {
    if (!this.isEnabled || !this.userId) {
      return null;
    }

    try {
      // Create conversation
      const conversation = await this.createConversation(title, metadata);
      if (!conversation) return null;

      // Save all messages
      for (const message of messages) {
        await this.createMessage(conversation.id, message.role, message.content, message.metadata);
      }

      return conversation;
    } catch (error) {
      console.error('Failed to save conversation with messages:', error);
      return null;
    }
  }

  /**
   * Export all user data
   */
  async exportUserData() {
    if (!this.isEnabled || !this.userId) {
      return null;
    }

    try {
      const [conversations, projects] = await Promise.all([this.getConversations(), this.getProjects()]);

      return {
        user_id: this.userId,
        exported_at: new Date().toISOString(),
        conversations,
        projects,
      };
    } catch (error) {
      console.error('Failed to export user data:', error);
      return null;
    }
  }

  /**
   * Clear all user data (use with caution!)
   */
  async clearAllData(): Promise<boolean> {
    if (!this.isEnabled || !this.userId) {
      return false;
    }

    if (!confirm('Are you sure you want to delete all your data? This cannot be undone.')) {
      return false;
    }

    try {
      const { conversations, projects } = await this.exportUserData();

      // Delete all projects
      if (projects) {
        for (const project of projects) {
          await this.deleteProject(project.id);
        }
      }

      // Delete all conversations (messages will be cascade deleted)
      if (conversations) {
        for (const conversation of conversations) {
          await this.deleteConversation(conversation.id);
        }
      }

      toast.success('All data cleared');
      return true;
    } catch (error) {
      console.error('Failed to clear data:', error);
      toast.error('Failed to clear data');
      return false;
    }
  }
}

// Export singleton instance
export const supabaseService = SupabaseService.getInstance();
