import { useState, useEffect, useCallback } from 'react';
import { supabaseService } from './service';
import type { Conversation, Message, Project } from '~/types/supabase';

interface UseSupabaseChatOptions {
  userId?: string;
  autoSave?: boolean;
  enabled?: boolean;
}

interface UseSupabaseChatReturn {
  // State
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Methods
  createConversation: (title: string, metadata?: Record<string, any>) => Promise<Conversation | null>;
  loadConversation: (conversationId: string) => Promise<void>;
  saveMessage: (role: 'user' | 'assistant' | 'system', content: string, metadata?: Record<string, any>) => Promise<void>;
  updateConversationTitle: (title: string) => Promise<boolean>;
  deleteConversation: (conversationId: string) => Promise<boolean>;
  exportConversation: (conversationId: string) => Promise<any>;
  refreshConversations: () => Promise<void>;
}

/**
 * React hook for managing chat history with Supabase
 */
export function useSupabaseChat(
  options: UseSupabaseChatOptions = {},
): UseSupabaseChatReturn {
  const { userId, autoSave = true, enabled = true } = options;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set user ID when it changes
  useEffect(() => {
    if (userId) {
      supabaseService.setUserId(userId);
    }
  }, [userId]);

  /**
   * Load all conversations
   */
  const refreshConversations = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await supabaseService.getConversations();
      setConversations(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load conversations';
      setError(errorMessage);
      console.error(errorMessage, err);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  /**
   * Create a new conversation
   */
  const createConversation = useCallback(
    async (title: string, metadata?: Record<string, any>): Promise<Conversation | null> => {
      if (!enabled) return null;

      setIsSaving(true);
      setError(null);

      try {
        const conversation = await supabaseService.createConversation(title, metadata);
        if (conversation) {
          setConversations((prev) => [conversation, ...prev]);
          setCurrentConversation(conversation);
          setMessages([]);
        }
        return conversation;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create conversation';
        setError(errorMessage);
        console.error(errorMessage, err);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [enabled],
  );

  /**
   * Load a specific conversation with its messages
   */
  const loadConversation = useCallback(
    async (conversationId: string) => {
      if (!enabled) return;

      setIsLoading(true);
      setError(null);

      try {
        const [conversation, loadedMessages] = await Promise.all([
          supabaseService.getConversation(conversationId),
          supabaseService.getMessages(conversationId),
        ]);

        if (conversation) {
          setCurrentConversation(conversation);
          setMessages(loadedMessages);
        } else {
          setError('Conversation not found');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load conversation';
        setError(errorMessage);
        console.error(errorMessage, err);
      } finally {
        setIsLoading(false);
      }
    },
    [enabled],
  );

  /**
   * Save a message to the current conversation
   */
  const saveMessage = useCallback(
    async (role: 'user' | 'assistant' | 'system', content: string, metadata?: Record<string, any>) => {
      if (!enabled || !autoSave || !currentConversation) return;

      setIsSaving(true);
      setError(null);

      try {
        const message = await supabaseService.createMessage(
          currentConversation.id,
          role,
          content,
          metadata,
        );

        if (message) {
          setMessages((prev) => [...prev, message]);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to save message';
        setError(errorMessage);
        console.error(errorMessage, err);
      } finally {
        setIsSaving(false);
      }
    },
    [enabled, autoSave, currentConversation],
  );

  /**
   * Update the conversation title
   */
  const updateConversationTitle = useCallback(
    async (title: string): Promise<boolean> => {
      if (!enabled || !currentConversation) return false;

      setIsSaving(true);
      setError(null);

      try {
        const success = await supabaseService.updateConversation(currentConversation.id, { title });
        if (success) {
          setCurrentConversation((prev) => (prev ? { ...prev, title } : null));
          setConversations((prev) =>
            prev.map((conv) => (conv.id === currentConversation.id ? { ...conv, title } : conv)),
          );
        }
        return success;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update conversation';
        setError(errorMessage);
        console.error(errorMessage, err);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [enabled, currentConversation],
  );

  /**
   * Delete a conversation
   */
  const deleteConversation = useCallback(
    async (conversationId: string): Promise<boolean> => {
      if (!enabled) return false;

      setError(null);

      try {
        const success = await supabaseService.deleteConversation(conversationId);
        if (success) {
          setConversations((prev) => prev.filter((conv) => conv.id !== conversationId));
          if (currentConversation?.id === conversationId) {
            setCurrentConversation(null);
            setMessages([]);
          }
        }
        return success;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete conversation';
        setError(errorMessage);
        console.error(errorMessage, err);
        return false;
      }
    },
    [enabled, currentConversation],
  );

  /**
   * Export a conversation
   */
  const exportConversation = useCallback(
    async (conversationId: string) => {
      if (!enabled) return null;

      try {
        const [conversation, loadedMessages] = await Promise.all([
          supabaseService.getConversation(conversationId),
          supabaseService.getMessages(conversationId),
        ]);

        return {
          conversation,
          messages: loadedMessages,
          exported_at: new Date().toISOString(),
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to export conversation';
        setError(errorMessage);
        console.error(errorMessage, err);
        return null;
      }
    },
    [enabled],
  );

  // Load conversations on mount
  useEffect(() => {
    if (enabled && userId) {
      refreshConversations();
    }
  }, [enabled, userId, refreshConversations]);

  return {
    conversations,
    currentConversation,
    messages,
    isLoading,
    isSaving,
    error,
    createConversation,
    loadConversation,
    saveMessage,
    updateConversationTitle,
    deleteConversation,
    exportConversation,
    refreshConversations,
  };
}

/**
 * React hook for managing projects with Supabase
 */
interface UseSupabaseProjectsOptions {
  userId?: string;
  enabled?: boolean;
}

interface UseSupabaseProjectsReturn {
  // State
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Methods
  createProject: (
    name: string,
    description?: string,
    files?: any[],
    metadata?: Record<string, any>,
  ) => Promise<Project | null>;
  loadProject: (projectId: string) => Promise<void>;
  updateProject: (
    projectId: string,
    updates: Partial<{ name: string; description: string; files: any[]; metadata: Record<string, any> }>,
  ) => Promise<boolean>;
  deleteProject: (projectId: string) => Promise<boolean>;
  refreshProjects: () => Promise<void>;
}

export function useSupabaseProjects(
  options: UseSupabaseProjectsOptions = {},
): UseSupabaseProjectsReturn {
  const { userId, enabled = true } = options;

  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set user ID when it changes
  useEffect(() => {
    if (userId) {
      supabaseService.setUserId(userId);
    }
  }, [userId]);

  /**
   * Load all projects
   */
  const refreshProjects = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await supabaseService.getProjects();
      setProjects(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load projects';
      setError(errorMessage);
      console.error(errorMessage, err);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  /**
   * Create a new project
   */
  const createProject = useCallback(
    async (
      name: string,
      description?: string,
      files?: any[],
      metadata?: Record<string, any>,
    ): Promise<Project | null> => {
      if (!enabled) return null;

      setIsSaving(true);
      setError(null);

      try {
        const project = await supabaseService.createProject(name, description, files, metadata);
        if (project) {
          setProjects((prev) => [project, ...prev]);
          setCurrentProject(project);
        }
        return project;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create project';
        setError(errorMessage);
        console.error(errorMessage, err);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [enabled],
  );

  /**
   * Load a specific project
   */
  const loadProject = useCallback(
    async (projectId: string) => {
      if (!enabled) return;

      setIsLoading(true);
      setError(null);

      try {
        const project = await supabaseService.getProject(projectId);
        if (project) {
          setCurrentProject(project);
        } else {
          setError('Project not found');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load project';
        setError(errorMessage);
        console.error(errorMessage, err);
      } finally {
        setIsLoading(false);
      }
    },
    [enabled],
  );

  /**
   * Update a project
   */
  const updateProject = useCallback(
    async (
      projectId: string,
      updates: Partial<{ name: string; description: string; files: any[]; metadata: Record<string, any> }>,
    ): Promise<boolean> => {
      if (!enabled) return false;

      setIsSaving(true);
      setError(null);

      try {
        const success = await supabaseService.updateProject(projectId, updates);
        if (success) {
          setProjects((prev) =>
            prev.map((proj) => (proj.id === projectId ? { ...proj, ...updates } : proj)),
          );
          if (currentProject?.id === projectId) {
            setCurrentProject((prev) => (prev ? { ...prev, ...updates } : null));
          }
        }
        return success;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update project';
        setError(errorMessage);
        console.error(errorMessage, err);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [enabled, currentProject],
  );

  /**
   * Delete a project
   */
  const deleteProject = useCallback(
    async (projectId: string): Promise<boolean> => {
      if (!enabled) return false;

      setError(null);

      try {
        const success = await supabaseService.deleteProject(projectId);
        if (success) {
          setProjects((prev) => prev.filter((proj) => proj.id !== projectId));
          if (currentProject?.id === projectId) {
            setCurrentProject(null);
          }
        }
        return success;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete project';
        setError(errorMessage);
        console.error(errorMessage, err);
        return false;
      }
    },
    [enabled, currentProject],
  );

  // Load projects on mount
  useEffect(() => {
    if (enabled && userId) {
      refreshProjects();
    }
  }, [enabled, userId, refreshProjects]);

  return {
    projects,
    currentProject,
    isLoading,
    isSaving,
    error,
    createProject,
    loadProject,
    updateProject,
    deleteProject,
    refreshProjects,
  };
}
