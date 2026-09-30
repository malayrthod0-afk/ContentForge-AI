import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Tag,
  ArrowRight,
  CheckCircle2,
  PlusCircle,
  MessageSquare,
  Sparkles,
  ArrowDown,
} from 'lucide-react';
import { EventItem } from '../types';

interface EventsPageProps {
  events: EventItem[];
  onAttendEvent: (eventId: string) => Promise<void>;
  onSelectForFeedback: (event: EventItem) => void;
  onNavigateCreate: () => void;
}

export const EventsPage: React.FC<EventsPageProps> = ({
  events,
  onAttendEvent,
  onSelectForFeedback,
  onNavigateCreate,
}) => {
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [attendingId, setAttendingId] = useState<string | null>(null);

  const handleAttend = async (event: EventItem) => {
    setAttendingId(event.id);
    try {
      await onAttendEvent(event.id);
      event.attended = true;
      if (selectedEvent?.id === event.id) {
        setSelectedEvent({ ...event, attended: true });
      }
    } finally {
      setAttendingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-16">
      {/* Visual Workflow Header */}
      <section className="bg-gradient-to-r from-indigo-50/80 via-white to-violet-50/70 border border-indigo-100 rounded-3xl p-6 sm:p-8 text-center shadow-xs">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">
          Turn Real Event Experiences Into Native Social Posts
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl mx-auto">
          Discover an event, participate, share your genuine feedback, and let Gemini generate platform-native content with zero generic filler.
        </p>

        {/* 4-Step Diagram */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-black">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-indigo-200 text-indigo-900 shadow-2xs">
            <span className="text-base">📅</span>
            <span>EVENT</span>
          </div>
          <ArrowRight className="w-4 h-4 text-indigo-400" />
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-indigo-200 text-indigo-900 shadow-2xs">
            <span className="text-base">🎟️</span>
            <span>ATTEND</span>
          </div>
          <ArrowRight className="w-4 h-4 text-indigo-400" />
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-indigo-200 text-indigo-900 shadow-2xs">
            <span className="text-base">✍️</span>
            <span>FEEDBACK</span>
          </div>
          <ArrowRight className="w-4 h-4 text-indigo-400" />
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl shadow-xs">
            <Sparkles className="w-4 h-4" />
            <span>AI CONTENT</span>
          </div>
        </div>
      </section>

      {/* Detail Modal / Drawer if an event is open */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-indigo-100 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            {selectedEvent.image_url && (
              <img
                src={selectedEvent.image_url}
                alt={selectedEvent.name}
                className="w-full h-56 object-cover rounded-2xl border border-slate-100"
              />
            )}

            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{selectedEvent.date} • {selectedEvent.time}</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">{selectedEvent.name}</h2>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedEvent.speaker}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedEvent.location}</span>
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                About The Event
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {selectedEvent.description}
              </p>
            </div>

            {selectedEvent.topics && (
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                  Key Topics
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedEvent.topics.split(',').map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100"
                    >
                      {t.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Attendance & Feedback Action Area */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>

              <div className="flex items-center gap-3">
                {selectedEvent.attended ? (
                  <>
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>✓ Attended</span>
                    </div>

                    <button
                      onClick={() => {
                        const ev = selectedEvent;
                        setSelectedEvent(null);
                        onSelectForFeedback(ev);
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-xs font-bold hover:opacity-95 shadow-md shadow-indigo-500/20"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Give Feedback</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleAttend(selectedEvent)}
                    disabled={attendingId === selectedEvent.id}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50"
                  >
                    <span>{attendingId === selectedEvent.id ? 'Confirming...' : 'Attend Event'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Events Listing */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900">Upcoming & Active Events</h2>
            <p className="text-xs text-slate-500">
              Browse events created by organizers or create a new one to test the workflow
            </p>
          </div>
          <button
            onClick={onNavigateCreate}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Event</span>
          </button>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-indigo-100 p-8 shadow-xs">
            <Calendar className="w-12 h-12 text-indigo-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No events created yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Create an event as an organizer to see real event cards and start the Attend → Feedback → AI workflow.
            </p>
            <button
              onClick={onNavigateCreate}
              className="mt-4 px-5 py-2.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-xl hover:bg-indigo-100 transition-colors"
            >
              + Create First Event
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex flex-col justify-between bg-white rounded-3xl border border-slate-200/90 hover:border-indigo-300 hover:shadow-lg transition-all overflow-hidden group"
              >
                <div>
                  {event.image_url ? (
                    <img
                      src={event.image_url}
                      alt={event.name}
                      className="w-full h-44 object-cover border-b border-slate-100"
                    />
                  ) : (
                    <div className="w-full h-36 bg-gradient-to-tr from-indigo-100 via-indigo-50 to-violet-100 flex items-center justify-center text-indigo-400 border-b border-indigo-50">
                      <Calendar className="w-10 h-10 opacity-60" />
                    </div>
                  )}

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-bold text-indigo-600">
                      <span>{event.date}</span>
                      <span className="text-slate-400 font-medium">{event.time}</span>
                    </div>

                    <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                      {event.name}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>

                    <div className="pt-2 flex flex-col gap-1 text-[11px] text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">Speaker: {event.speaker}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-5 pt-0 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="flex-1 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-center"
                  >
                    View Event
                  </button>

                  {event.attended ? (
                    <button
                      onClick={() => onSelectForFeedback(event)}
                      className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Feedback</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAttend(event)}
                      disabled={attendingId === event.id}
                      className="px-3.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-xl transition-colors"
                    >
                      {attendingId === event.id ? 'Attending...' : 'Attend'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
