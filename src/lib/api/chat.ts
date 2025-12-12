/**
 * Chat API Service
 * Handles communication with RAG chatbot backend
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

// ============================================
// TYPES
// ============================================

export interface Property {
    property_id: number;
    title: string;
    price_per_night: number;
    location_city?: string;
    location_country?: string;
    bedrooms?: number;
    bathrooms?: number;
    max_guests?: number;
    amenities?: string[];
    images?: string[];
    description?: string;
    match_score?: number;
}

export interface KnowledgeSnippet {
    title: string;
    content: string;
    section: string;
    match_score: number;
}

export interface ChatRequest {
    message: string;
    conversation_id?: string;
    filters?: {
        city?: string;
        min_price?: number;
        max_price?: number;
        bedrooms?: number;
        guests?: number;
    };
}

export interface ChatResponse {
    response: string;
    properties: Property[];
    knowledge_snippets: KnowledgeSnippet[];
    conversation_id: string;
    suggested_actions: string[];
    query_type: 'property_search' | 'knowledge' | 'mixed';
}

export interface RecommendationsRequest {
    property_id: number;
    limit?: number;
}

export interface RecommendationsResponse {
    property_id: number;
    recommendations: Property[];
    count: number;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Send a message to the chat API
 */
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
            throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Chat API error:', error);
        throw error;
    }
}

/**
 * Get property recommendations
 */
export async function getRecommendations(
    request: RecommendationsRequest
): Promise<RecommendationsResponse> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/recommendations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
            throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Recommendations API error:', error);
        throw error;
    }
}

/**
 * Check backend health
 */
export async function checkBackendHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${BACKEND_URL}/health`, {
            method: 'GET',
        });
        return response.ok;
    } catch (error) {
        console.error('Backend health check failed:', error);
        return false;
    }
}
