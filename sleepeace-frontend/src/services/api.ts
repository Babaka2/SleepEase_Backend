// Define the base URL for your FastAPI server
const API_BASE_URL = import.meta.env.DEV ? '/api' : 'https://sleepease-backend.onrender.com';

/**
 * Interface for the AI Chat response
 */
export interface ChatResponse {
    status: string;
    reply: string;
}

/**
 * Sends a student's mood/feeling to the TextBlob AI engine on the backend.
 * @param message The user's input text (e.g., "I'm feeling stressed")
 */
export const fetchAIAdvice = async (message: string, mode: string = "general", token?: string): Promise<ChatResponse> => {
    try {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
        const endpoints = [`${API_BASE_URL}/chat`, `${API_BASE_URL}/ai/chat`];

        for (const endpoint of endpoints) {
            const response = await fetch(endpoint, {
                method: "POST",
                headers,
                body: JSON.stringify({ message, mode }),
            });

            if (response.status === 404) {
                continue;
            }

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json() as { status?: string; reply?: string; response?: string; message?: string };
            return {
                status: data.status || 'success',
                reply: data.reply || data.response || data.message || 'I am here to support you.',
            };
        }

        throw new Error('No compatible chat endpoint found');
    } catch (error) {
        console.error("Connection to SleepEase Backend failed:", error);
        return {
            status: "error",
            reply: "I'm having trouble connecting to my peace center. Please try again soon."
        };
    }
};