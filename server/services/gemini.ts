import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export interface EventData {
  eventName: string;
  eventDescription: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  speaker: string;
  eventTopics?: string;
}

export interface FeedbackData {
  userFeedback: string;
  rating?: number;
}

export interface GenerationInput {
  event: EventData;
  feedback: FeedbackData;
  platforms: string[]; // ['Instagram', 'LinkedIn', 'X', 'Facebook', 'YouTube']
}

export interface VariationOutput {
  style: 'Professional' | 'Engaging' | 'Storytelling';
  hook: string;
  content: string;
  hashtags: string[];
  cta: string;
  scoreAuthenticity: number;
  scoreEngagement: number;
  scorePlatformFit: number;
  whyThisWorks: string;
}

export interface PlatformContentOutput {
  platform: string;
  variations: VariationOutput[];
}

export async function generateContentFromExperience(input: GenerationInput): Promise<{ platforms: PlatformContentOutput[] }> {
  // Validate presence of event and feedback
  if (!input.event?.eventName?.trim() || !input.feedback?.userFeedback?.trim()) {
    throw new Error('Please attend an event and share your experience first.');
  }

  const ai = getAIClient();
  if (!ai) {
    throw new Error('AI generation is currently unavailable. Please check the API connection and try again.');
  }

  const systemInstruction = `You are ContentForge AI. You convert an actual attended event and genuine attendee feedback into tailored social media content.

CRITICAL INSTRUCTIONS:
- The user's ACTUAL EVENT and ACTUAL FEEDBACK are the absolute SOURCE OF TRUTH.
- NEVER invent an unrelated topic or use pre-existing sample data.
- The content MUST be explicitly about "${input.event.eventName}" and reflect the user's specific experience: "${input.feedback.userFeedback}".
- For every requested platform, generate EXACTLY 3 variations:
  1. Style: "Professional"
  2. Style: "Engaging"
  3. Style: "Storytelling"

Platform Adaptation rules:
- Instagram: Strong hook, engaging caption, hashtags, CTA
- LinkedIn: Professional experience, key learning, thoughtful conclusion, hashtags
- X: Short and concise (within character limits), strong hook, relevant hashtags if appropriate
- Facebook: Friendly and community-focused, event experience, CTA
- YouTube: Video title, comprehensive video description, CTA

For each variation, include:
- scoreAuthenticity: integer 1-100 evaluating how authentically it reflects the attendee's feedback
- scoreEngagement: integer 1-100
- scorePlatformFit: integer 1-100
- whyThisWorks: concise explanation specifically referencing the actual event "${input.event.eventName}" and the attendee's stated feedback.

Return strictly valid JSON in the following format:
{
  "platforms": [
    {
      "platform": "Instagram",
      "variations": [
        {
          "style": "Professional",
          "hook": "...",
          "content": "...",
          "hashtags": ["#tag1", "#tag2"],
          "cta": "...",
          "scoreAuthenticity": 95,
          "scoreEngagement": 92,
          "scorePlatformFit": 94,
          "whyThisWorks": "This post works because..."
        }
      ]
    }
  ]
}`;

  const prompt = `EVENT DETAILS:
- Name: ${input.event.eventName}
- Description: ${input.event.eventDescription}
- Date: ${input.event.eventDate}
- Time: ${input.event.eventTime}
- Location: ${input.event.eventLocation}
- Speaker/Organizer: ${input.event.speaker}
- Topics: ${input.event.eventTopics || 'General'}

ATTENDEE FEEDBACK:
- User Experience & Feedback: "${input.feedback.userFeedback}"
- Rating: ${input.feedback.rating ?? 5}/5 stars

REQUESTED PLATFORMS:
${input.platforms.join(', ')}

Generate high-quality platform-specific variations based directly on this event and feedback. Return JSON.`;

  // Model sequence: prioritize gemini-3.1-flash-lite for immediate responsiveness, fallback to gemini-3.8-flash
  const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim() || '';
      if (!text) continue;

      const parsed = JSON.parse(text);
      if (parsed.platforms && Array.isArray(parsed.platforms)) {
        return parsed;
      }
    } catch (error: any) {
      console.warn(`Model ${model} failed, trying next:`, error?.message || error);
      lastError = error;
    }
  }

  console.error('All Gemini generation attempts failed:', lastError);
  throw new Error('AI generation is currently unavailable. Please check the API connection and try again.');
}

export async function refineContent(params: {
  currentContent: string;
  refinementAction: 'Make Shorter' | 'Make More Professional' | 'Make More Engaging' | 'Improve Hook';
  eventName: string;
  userFeedback: string;
  platform: string;
}): Promise<{ refinedContent: string; whyThisWorks: string }> {
  const ai = getAIClient();
  if (!ai) {
    throw new Error('AI generation is currently unavailable. Please check the API connection and try again.');
  }

  const prompt = `You are ContentForge AI editor. Refine the following ${params.platform} content.
EVENT TOPIC: "${params.eventName}"
USER FEEDBACK: "${params.userFeedback}"

CURRENT CONTENT:
"""
${params.currentContent}
"""

REFINEMENT ACTION: "${params.refinementAction}"

Rules:
- Preserve the actual event topic ("${params.eventName}") and the user's authentic feedback experience.
- DO NOT inject unrelated topics.
- Apply the requested refinement: "${params.refinementAction}".

Return strictly valid JSON:
{
  "refinedContent": "...",
  "whyThisWorks": "Brief explanation of how the ${params.refinementAction} refinement improved the post for ${params.platform} while keeping the event context authentic."
}`;

  const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text?.trim() || '{}');
      if (parsed.refinedContent) {
        return parsed;
      }
    } catch (error: any) {
      console.warn(`Refinement model ${model} error:`, error?.message || error);
    }
  }

  throw new Error('AI generation is currently unavailable. Please check the API connection and try again.');
}
