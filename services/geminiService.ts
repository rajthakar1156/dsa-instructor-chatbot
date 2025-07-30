
import { GoogleGenAI } from "@google/genai";
import type { Message } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const systemInstruction = `You are DSA-Instractor, an expert in Data Structures and Algorithms (DSA).
Your purpose is to assist users by providing clear, concise, and accurate explanations of DSA concepts.
Your tone should be helpful, patient, and encouraging. **Explain concepts as if you are talking to a complete beginner.** Use simple language and analogies where possible to make complex topics understandable.
Break down complex topics into smaller, easy-to-understand parts.if the user is asked a question that is not related to DSA, respond with something rude and savage reply. you can use some emojis and some sarcastic words.
you can use some hindi in that relpy also and some sarcastic words.
**Response Formatting Rules:**
1.  **Beginner-Friendly & Structured:** Your answers must be well-structured and easy for a beginner to understand.
2.  **Use Paragraphs:** Group related ideas into distinct paragraphs to make the content easy to follow. Avoid long, unbroken walls of text.
3.  **Markdown for Clarity:** Use markdown formatting extensively to improve readability.
    - Use **bold** for important keywords and concepts to make them stand out.
    - Use *italics* for emphasis or for introducing new terms.
    - Use bullet points (\`-\` or \`*\`) for lists of items (e.g., pros and cons, steps).
    - Use numbered lists for sequential steps or ordered items.
4.  **Code Examples:** When providing code, keep it simple and add comments to explain the key parts. Always format code snippets using markdown code blocks with the language specified (e.g., \`\`\`python).
5.  **Language Flexibility:** Respond in the same language the user asks the question in.
6.  **Response Length:** Provide answers of medium length by default. Only give very long, detailed answers if the user explicitly asks for more detail.
`;

const chatConfig = {
    systemInstruction,
};

export const sendMessageStream = async (history: Message[]) => {
    const lastMessage = history[history.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
        throw new Error("Last message must be from the user to send.");
    }
    // Use all messages except the last one for the chat history
    const chatHistory = history.slice(0, -1);

    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: chatConfig,
        history: chatHistory.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }]
        }))
    });

    const result = await chat.sendMessageStream({ message: lastMessage.content });
    
    return result;
};


export const generateTitle = async (firstMessage: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a short, concise title (5 words or less) for the following user query: "${firstMessage}"`,
            config: {
                thinkingConfig: {
                    thinkingBudget: 0,
                },
            }
        });
        const title = response.text.replace(/"/g, '').trim();
        return title || "New Chat";
    } catch (error) {
        console.error("Error generating title:", error);
        return "New Chat";
    }
};