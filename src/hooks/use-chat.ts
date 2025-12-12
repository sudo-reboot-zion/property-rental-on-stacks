/**
 * Chat Hook
 * Manages chat state and conversation with RAG backend
 */
import { useState, useCallback } from 'react';
import { sendChatMessage, type ChatResponse, type Property, type KnowledgeSnippet } from '@/lib/api/chat';
import { useToast } from './use-toast';

export interface Message {
    id: string;
    type: 'user' | 'ai';
    text: string;
    properties?: Property[];
    knowledge_snippets?: KnowledgeSnippet[];
    query_type?: 'property_search' | 'knowledge' | 'mixed';
    timestamp: Date;
}

export function useChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [suggestedActions, setSuggestedActions] = useState<string[]>([]);
    const { toast } = useToast();

    /**
     * Send a message to the chatbot
     */
    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim()) return;

        // Add user message
        const userMessage: Message = {
            id: `user-${Date.now()}`,
            type: 'user',
            text: text.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            // Call API
            const response: ChatResponse = await sendChatMessage({
                message: text.trim(),
                conversation_id: conversationId || undefined,
            });

            // Update conversation ID
            setConversationId(response.conversation_id);

            // Update suggested actions
            setSuggestedActions(response.suggested_actions || []);

            // Add AI response
            const aiMessage: Message = {
                id: `ai-${Date.now()}`,
                type: 'ai',
                text: response.response,
                properties: response.properties || [],
                knowledge_snippets: response.knowledge_snippets || [],
                query_type: response.query_type,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, aiMessage]);

        } catch (error) {
            console.error('Chat error:', error);

            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to send message. Please try again.',
                variant: 'destructive',
            });

            // Add error message
            const errorMessage: Message = {
                id: `error-${Date.now()}`,
                type: 'ai',
                text: 'Sorry, I encountered an error. Please try again or check if the backend is running.',
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [conversationId, toast]);

    /**
     * Clear chat history
     */
    const clearChat = useCallback(() => {
        setMessages([]);
        setConversationId(null);
        setSuggestedActions([]);
    }, []);

    /**
     * Send a suggested action
     */
    const sendSuggestedAction = useCallback((action: string) => {
        sendMessage(action);
    }, [sendMessage]);

    return {
        messages,
        isLoading,
        suggestedActions,
        sendMessage,
        sendSuggestedAction,
        clearChat,
    };
}
