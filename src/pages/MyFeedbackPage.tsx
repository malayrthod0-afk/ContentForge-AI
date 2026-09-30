import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Star,
  Calendar,
  Sparkles,
  Bookmark,
  ArrowRight,
  User,
  MapPin,
} from 'lucide-react';
import { FeedbackItem, EventItem } from '../types';

interface MyFeedbackPageProps {
  feedbacks: FeedbackItem[];
  savedVariations: any[];
  onSelectForGeneration: (feedback: FeedbackItem) => void;
  onNavigateEvents: () => void;
}

export const MyFeedbackPage: React.FC<MyFeedbackPageProps> = ({
  feedbacks,
  savedVariations,
  onSelectForGeneration,
  onNavigateEvents,
}) => {
  const [activeTab, setActiveTab] = useState<'feedbacks' | 'saved'>('feedbacks');

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-600">
              Attendee Records
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            <span className="text-xs text-slate-400 font-semibold">Source Data Vault</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            My Feedback & Saved Content
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Review your authentic event takeaways and access saved AI social posts.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab('feedbacks')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'feedbacks'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Feedback ({feedbacks.length})
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'saved'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Saved Posts ({savedVariations.length})
          </button>
        </div>
      </div>

      {activeTab === 'feedbacks' ? (
        feedbacks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-indigo-100 p-8 shadow-xs space-y-4">
            <MessageSquare className="w-12 h-12 text-indigo-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              No feedback submitted yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Attend an upcoming event in the catalog and share your thoughts to generate personalized social posts.
            </p>
            <button
              onClick={onNavigateEvents}
              className="mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              Browse Events
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((fb) => (
              <div
                key={fb.id}
                className="p-6 bg-white rounded-3xl border border-slate-200/90 hover:border-indigo-300 shadow-xs space-y-4 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      {fb.event_name || 'Event Session'}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      {fb.event_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{fb.event_date}</span>
                        </span>
                      )}
                      {fb.event_speaker && (
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{fb.event_speaker}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < (fb.rating || 5) ? 'fill-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Feedback Content */}
                <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-800 leading-relaxed font-medium italic">
                    "{fb.feedback_text}"
                  </p>
                </div>

                {/* Action button */}
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => onSelectForGeneration(fb)}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-xs font-bold hover:opacity-95 shadow-md shadow-indigo-500/20 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Content From This Feedback</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Saved Posts tab */
        savedVariations.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-indigo-100 p-8 shadow-xs space-y-4">
            <Bookmark className="w-12 h-12 text-indigo-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              No saved variations yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When generating content, click "Save Variation" to keep your favorite posts here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {savedVariations.map((item) => (
              <div
                key={item.id}
                className="p-6 bg-white rounded-3xl border border-slate-200/90 hover:border-indigo-300 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {item.platform}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {item.style} Variation
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs font-bold text-slate-900 leading-snug">
                  "{item.hook}"
                </p>

                <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {item.content}
                </p>

                {item.why_this_works && (
                  <p className="text-[11px] text-slate-500 italic">
                    Why it works: {item.why_this_works}
                  </p>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
