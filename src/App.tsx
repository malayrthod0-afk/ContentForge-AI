import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { EventsPage } from './pages/EventsPage';
import { CreateEventPage } from './pages/CreateEventPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { GeneratedContentPage } from './pages/GeneratedContentPage';
import { api } from './services/api';
import { EventItem, FeedbackItem, PlatformResult, VariationItem } from './types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'events' | 'create-event' | 'feedback' | 'generated-content'>('events');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [savedVariations, setSavedVariations] = useState<any[]>([]);
  const [selectedEventForFeedback, setSelectedEventForFeedback] = useState<EventItem | null>(null);

  // Active generated content state
  const [generatedResults, setGeneratedResults] = useState<PlatformResult[] | null>(null);
  const [activeEventForGeneration, setActiveEventForGeneration] = useState<EventItem | null>(null);
  const [activeFeedbackText, setActiveFeedbackText] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load events, feedbacks, and saved content from backend
  const loadData = async () => {
    try {
      const [eventsList, feedbacksList, savedList] = await Promise.all([
        api.getEvents(),
        api.getFeedback(),
        api.getSavedContent(),
      ]);
      setEvents(eventsList);
      setFeedbacks(feedbacksList);
      setSavedVariations(savedList);
    } catch (e) {
      console.error('Error loading initial data:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Organizer creates event
  const handleCreateEvent = async (data: {
    name: string;
    description: string;
    date: string;
    time: string;
    location: string;
    speaker: string;
    topics?: string;
    imageUrl?: string;
  }) => {
    const created = await api.createEvent(data);
    setEvents((prev) => [created, ...prev]);
    showToast(`Event "${created.name}" created successfully!`);
    return created;
  };

  // User attends event
  const handleAttendEvent = async (eventId: string) => {
    await api.attendEvent(eventId);
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, attended: true } : e))
    );
    showToast('Marked as Attended!');
  };

  // Navigate to Feedback for an event
  const handleSelectForFeedback = (event: EventItem) => {
    setSelectedEventForFeedback(event);
    setCurrentPage('feedback');
  };

  // Generate content using ACTUAL event data + ACTUAL user feedback
  const handleGenerateContent = async (payload: {
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
  }) => {
    // Save feedback to database if selectedEvent exists
    if (selectedEventForFeedback) {
      try {
        const savedFeedback = await api.submitFeedback({
          eventId: selectedEventForFeedback.id,
          feedbackText: payload.feedback.userFeedback,
          rating: payload.feedback.rating ?? 5,
        });
        setFeedbacks((prev) => [savedFeedback, ...prev]);
      } catch (e) {
        console.error('Could not save feedback to DB:', e);
      }
    }

    // Call Gemini API through backend
    const results = await api.generateContent(payload);
    return results;
  };

  // On successful generation callback
  const handleSuccessGenerated = (
    results: PlatformResult[],
    event: EventItem,
    feedbackText: string
  ) => {
    setGeneratedResults(results);
    setActiveEventForGeneration(event);
    setActiveFeedbackText(feedbackText);
    setCurrentPage('generated-content');
    showToast('Platform variations generated successfully!');
  };

  // Refine specific content variation
  const handleRefine = async (payload: {
    currentContent: string;
    refinementAction: 'Make Shorter' | 'Make More Professional' | 'Make More Engaging' | 'Improve Hook';
    eventName: string;
    userFeedback: string;
    platform: string;
  }) => {
    const refined = await api.refineContent(payload);
    showToast(`Applied refinement: ${payload.refinementAction}`);
    return refined;
  };

  // Regenerate all variations with Gemini
  const handleRegenerate = async () => {
    if (!activeEventForGeneration || !activeFeedbackText) return;
    try {
      const results = await api.generateContent({
        event: {
          eventName: activeEventForGeneration.name,
          eventDescription: activeEventForGeneration.description,
          eventDate: activeEventForGeneration.date,
          eventTime: activeEventForGeneration.time,
          eventLocation: activeEventForGeneration.location,
          speaker: activeEventForGeneration.speaker,
          eventTopics: activeEventForGeneration.topics,
        },
        feedback: {
          userFeedback: activeFeedbackText,
        },
        platforms: generatedResults?.map((r) => r.platform) || ['Instagram', 'LinkedIn', 'X'],
      });
      setGeneratedResults(results);
      showToast('Regenerated all platform variations!');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Regeneration failed');
    }
  };

  // Save variation to database
  const handleSaveVariation = async (platform: string, variation: VariationItem) => {
    if (!activeEventForGeneration) return;
    await api.saveContent({
      eventId: activeEventForGeneration.id,
      platform,
      style: variation.style,
      hook: variation.hook,
      content: variation.content,
      hashtags: variation.hashtags,
      cta: variation.cta,
      scoreAuthenticity: variation.scoreAuthenticity,
      scoreEngagement: variation.scoreEngagement,
      scorePlatformFit: variation.scorePlatformFit,
      whyThisWorks: variation.whyThisWorks,
    });
    const saved = await api.getSavedContent();
    setSavedVariations(saved);
    showToast(`Saved ${platform} variation to My Feedback!`);
  };

  // From My Feedback page: generate content for past feedback
  const handleSelectFeedbackForGeneration = (fb: FeedbackItem) => {
    const matchingEvent = events.find((e) => e.id === fb.event_id) || {
      id: fb.event_id,
      name: fb.event_name || 'Event Session',
      description: 'Attended session',
      date: fb.event_date || '2026',
      time: 'Session Time',
      location: fb.event_location || 'Campus / Venue',
      speaker: fb.event_speaker || 'Organizer',
      attended: true,
    };
    setSelectedEventForFeedback(matchingEvent);
    setCurrentPage('feedback');
  };

  return (
    <div className="min-h-screen bg-[#f8faff] text-[#0f172a] font-['Plus_Jakarta_Sans',sans-serif] flex flex-col antialiased">
      {/* Focused Navigation Header */}
      <Navigation
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page)}
        feedbackCount={feedbacks.length}
        hasGeneratedContent={!!generatedResults && generatedResults.length > 0}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
        {currentPage === 'events' && (
          <EventsPage
            events={events}
            onAttendEvent={handleAttendEvent}
            onSelectForFeedback={handleSelectForFeedback}
            onNavigateCreate={() => setCurrentPage('create-event')}
          />
        )}

        {currentPage === 'create-event' && (
          <CreateEventPage
            onCreateEvent={handleCreateEvent}
            onEventCreated={(ev) => {
              setCurrentPage('events');
            }}
          />
        )}

        {currentPage === 'feedback' && (
          <FeedbackPage
            selectedEvent={selectedEventForFeedback}
            events={events}
            onSelectEvent={(ev) => setSelectedEventForFeedback(ev)}
            onGenerate={handleGenerateContent}
            onSuccessGenerated={handleSuccessGenerated}
          />
        )}

        {currentPage === 'generated-content' && (
          <GeneratedContentPage
            results={generatedResults}
            activeEvent={activeEventForGeneration}
            activeFeedback={activeFeedbackText}
            onRefine={handleRefine}
            onRegenerate={handleRegenerate}
            onSaveVariation={handleSaveVariation}
            onNavigateEvents={() => setCurrentPage('events')}
          />
        )}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
