import React, { useState } from 'react';
import {
  MessageSquare,
  Star,
  Sparkles,
  Calendar,
  MapPin,
  User,
  Check,
  AlertCircle,
  Loader2,
  Share2,
} from 'lucide-react';
import { EventItem, PlatformName, PlatformResult } from '../types';

interface FeedbackPageProps {
  selectedEvent: EventItem | null;
  events: EventItem[];
  onSelectEvent: (event: EventItem) => void;
  onGenerate: (payload: {
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
  }) => Promise<PlatformResult[]>;
  onSuccessGenerated: (results: PlatformResult[], event: EventItem, feedbackText: string) => void;
}

export const FeedbackPage: React.FC<FeedbackPageProps> = ({
  selectedEvent,
  events,
  onSelectEvent,
  onGenerate,
  onSuccessGenerated,
}) => {
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformName[]>([
    'Instagram',
    'LinkedIn',
    'X',
  ]);
  const [loadingPhase, setLoadingPhase] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const availablePlatforms: { id: PlatformName; label: string; icon: string }[] = [
    { id: 'Instagram', label: 'Instagram', icon: '📸' },
    { id: 'LinkedIn', label: 'LinkedIn', icon: '💼' },
    { id: 'X', label: 'X (Twitter)', icon: '𝕏' },
    { id: 'Facebook', label: 'Facebook', icon: '👥' },
    { id: 'YouTube', label: 'YouTube', icon: '▶️' },
  ];

  const togglePlatform = (p: PlatformName) => {
    if (selectedPlatforms.includes(p)) {
      if (selectedPlatforms.length === 1) return; // Keep at least one
      setSelectedPlatforms(selectedPlatforms.filter((item) => item !== p));
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) {
      setErrorMsg('Please attend an event and share your experience first.');
      return;
    }

    if (!feedbackText.trim()) {
      setErrorMsg('Please share your thoughts in the feedback area before generating content.');
      return;
    }

    if (selectedPlatforms.length === 0) {
      setErrorMsg('Please select at least one platform.');
      return;
    }

    setErrorMsg(null);

    // Sequence of loading states per prompt:
    // 1. "AI is understanding your experience..."
    // 2. "Creating platform-specific content..."
    setLoadingPhase('AI is understanding your experience...');

    const timer = setTimeout(() => {
      setLoadingPhase('Creating platform-specific content...');
    }, 1200);

    try {
      const results = await onGenerate({
        event: {
          eventName: selectedEvent.name,
          eventDescription: selectedEvent.description,
          eventDate: selectedEvent.date,
          eventTime: selectedEvent.time,
          eventLocation: selectedEvent.location,
          speaker: selectedEvent.speaker,
          eventTopics: selectedEvent.topics,
        },
        feedback: {
          userFeedback: feedbackText,
          rating,
        },
        platforms: selectedPlatforms,
      });

      clearTimeout(timer);
      setLoadingPhase(null);
      onSuccessGenerated(results, selectedEvent, feedbackText);
    } catch (err: any) {
      clearTimeout(timer);
      setLoadingPhase(null);
      console.error(err);
      setErrorMsg(
        err.message ||
          'AI generation is currently unavailable. Please check the API connection and try again.'
      );
    }
  };

  if (!selectedEvent) {
    // If no event is selected, allow user to choose from attended events
    const attendedEvents = events.filter((e) => e.attended);
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-16">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Select Attended Event</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Choose which event you recently attended to share your experience and generate posts.
          </p>
        </div>

        {attendedEvents.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-indigo-100 shadow-xs space-y-3">
            <Calendar className="w-12 h-12 text-indigo-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              Please attend an event and share your experience first.
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Browse the Events catalog, click "Attend Event", and then submit your feedback to generate genuine content.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {attendedEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 flex items-center justify-between gap-4 transition-all"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{ev.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{ev.speaker} • {ev.location}</p>
                </div>
                <button
                  onClick={() => onSelectEvent(ev)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Give Feedback
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Event Context Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-50/80 via-white to-violet-50/60 border border-indigo-100 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-100/70 px-2.5 py-0.5 rounded-md">
            Attended Event
          </span>
          <h3 className="text-lg font-black text-slate-900">{selectedEvent.name}</h3>
          <p className="text-xs text-slate-500">
            {selectedEvent.speaker} • {selectedEvent.location} • {selectedEvent.date}
          </p>
        </div>

        {events.length > 1 && (
          <select
            value={selectedEvent.id}
            onChange={(e) => {
              const ev = events.find((item) => item.id === e.target.value);
              if (ev) onSelectEvent(ev);
            }}
            className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-700"
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Title */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
          How was your experience?
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Your feedback is the source of truth for the AI. Write what resonated with you, and Gemini will synthesize it into authentic social posts.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Feedback Form */}
      <form onSubmit={handleGenerate} className="bg-white rounded-3xl border border-indigo-100 shadow-xl p-6 sm:p-8 space-y-7">
        {/* Rating 1-5 Stars */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700">
            How would you rate this event?
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 text-amber-400 hover:scale-110 transition-transform"
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-xs font-bold text-slate-600">
              {rating} / 5 Stars
            </span>
          </div>
        </div>

        {/* Large Feedback Textarea */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1">
            <span>Your Experience & Feedback</span>
            <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            required
            rows={5}
            placeholder="Tell us what you liked, what you learned, or what interested you about this event..."
            className="w-full p-4 text-sm font-medium bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 leading-relaxed font-sans placeholder:text-slate-400"
          />
        </div>

        {/* Platform Selection */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
              Choose Platforms
            </label>
            <span className="text-[11px] text-slate-400 font-medium">
              {selectedPlatforms.length} selected
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {availablePlatforms.map((p) => {
              const isSelected = selectedPlatforms.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePlatform(p.id)}
                  className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{p.icon}</span>
                    <span>{p.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Generate Button / Loading state */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={!!loadingPhase || !feedbackText.trim()}
            className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 text-white rounded-2xl text-sm font-black hover:opacity-95 transition-all shadow-md shadow-indigo-500/25 disabled:opacity-50"
          >
            {loadingPhase ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{loadingPhase}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Content</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
