import { EventItem, FeedbackItem, PlatformResult, VariationItem } from '../types';

export const api = {
  async getEvents(): Promise<EventItem[]> {
    const res = await fetch('/api/events');
    const data = await res.json();
    return data.data || [];
  },

  async createEvent(eventData: {
    name: string;
    description: string;
    date: string;
    time: string;
    location: string;
    speaker: string;
    topics?: string;
    imageUrl?: string;
  }): Promise<EventItem> {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to create event');
    }
    return data.data;
  },

  async getEvent(id: string): Promise<EventItem> {
    const res = await fetch(`/api/events/${id}`);
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Event not found');
    }
    return data.data;
  },

  async attendEvent(id: string): Promise<EventItem> {
    const res = await fetch(`/api/events/${id}/attend`, {
      method: 'POST',
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to attend event');
    }
    return data.data;
  },

  async submitFeedback(payload: {
    eventId: string;
    feedbackText: string;
    rating: number;
  }): Promise<FeedbackItem> {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to save feedback');
    }
    return data.data;
  },

  async getFeedback(): Promise<FeedbackItem[]> {
    const res = await fetch('/api/feedback');
    const data = await res.json();
    return data.data || [];
  },

  async generateContent(payload: {
    event: {
      eventName: string;
      eventDescription: string;
      eventDate: string;
      eventTime: string;
      eventLocation: string;
      speaker: string;
      eventTopics?: string;
    };
    feedback: {
      userFeedback: string;
      rating?: number;
    };
    platforms: string[];
  }): Promise<PlatformResult[]> {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(
        data.error ||
          'AI generation is currently unavailable. Please check the API connection and try again.'
      );
    }
    return data.data;
  },

  async refineContent(payload: {
    currentContent: string;
    refinementAction: 'Make Shorter' | 'Make More Professional' | 'Make More Engaging' | 'Improve Hook';
    eventName: string;
    userFeedback: string;
    platform: string;
  }): Promise<{ refinedContent: string; whyThisWorks: string }> {
    const res = await fetch('/api/refine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(
        data.error ||
          'AI generation is currently unavailable. Please check the API connection and try again.'
      );
    }
    return data;
  },

  async saveContent(payload: any): Promise<{ success: boolean; id: string }> {
    const res = await fetch('/api/save-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async getSavedContent(): Promise<any[]> {
    const res = await fetch('/api/saved-content');
    const data = await res.json();
    return data.data || [];
  },
};
