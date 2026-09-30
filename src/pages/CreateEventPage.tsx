import React, { useState } from 'react';
import { PlusCircle, Calendar, Clock, MapPin, User, Tag, Image, Sparkles } from 'lucide-react';
import { EventItem } from '../types';

interface CreateEventPageProps {
  onCreateEvent: (data: {
    name: string;
    description: string;
    date: string;
    time: string;
    location: string;
    speaker: string;
    topics?: string;
    imageUrl?: string;
  }) => Promise<EventItem>;
  onEventCreated: (event: EventItem) => void;
}

export const CreateEventPage: React.FC<CreateEventPageProps> = ({
  onCreateEvent,
  onEventCreated,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('2026-10-15');
  const [time, setTime] = useState('10:00 AM - 1:00 PM');
  const [location, setLocation] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [topics, setTopics] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || !location.trim() || !speaker.trim()) {
      setErrorMsg('Please fill in all required event details.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const created = await onCreateEvent({
        name,
        description,
        date,
        time,
        location,
        speaker,
        topics,
        imageUrl: imageUrl.trim() || undefined,
      });
      onEventCreated(created);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-600">
            Event Organizer Portal
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
          <span className="text-xs text-slate-400 font-semibold">Publish New Event</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
          Create Event
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Provide accurate details about your session, workshop, or conference. Attendees will view this exact information and submit feedback for social content generation.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-800">
          {errorMsg}
        </div>
      )}

      {/* Organizer Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-indigo-100 shadow-xl p-6 sm:p-8 space-y-6">
        {/* Event Name */}
        <div>
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1">
            <span>Event Name</span>
            <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. AI & Future Technology Seminar"
            className="mt-1.5 w-full px-4 py-3 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1">
            <span>Event Description</span>
            <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            placeholder="Describe what the event covers, key takeaways, and what attendees will experience..."
            className="mt-1.5 w-full p-4 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 leading-relaxed font-sans"
          />
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>Date</span>
            </label>
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              placeholder="e.g. October 15, 2026"
              className="mt-1.5 w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Time</span>
            </label>
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              placeholder="e.g. 10:00 AM - 1:00 PM EST"
              className="mt-1.5 w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800"
            />
          </div>
        </div>

        {/* Location and Speaker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              <span>Location</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              placeholder="e.g. Innovation Hall A, Tech Hub or Virtual"
              className="mt-1.5 w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span>Speaker / Organizer</span>
            </label>
            <input
              type="text"
              value={speaker}
              onChange={(e) => setSpeaker(e.target.value)}
              required
              placeholder="e.g. Dr. Elena Vance (Lead AI Researcher)"
              className="mt-1.5 w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800"
            />
          </div>
        </div>

        {/* Event Topics */}
        <div>
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-indigo-600" />
            <span>Event Topics (Comma-separated)</span>
          </label>
          <input
            type="text"
            value={topics}
            onChange={(e) => setTopics(e.target.value)}
            placeholder="e.g. Generative AI, Future Tech, Neural Networks, Hands-on Lab"
            className="mt-1.5 w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800"
          />
        </div>

        {/* Event Image URL */}
        <div>
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Image className="w-3.5 h-3.5 text-indigo-600" />
            <span>Event Image URL (Optional)</span>
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="e.g. https://images.unsplash.com/photo-1540575467063-178a50c2df87"
            className="mt-1.5 w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-800"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Leave blank to use clean styled gradient banner.
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 text-white rounded-2xl text-sm font-black hover:opacity-95 transition-all shadow-md shadow-indigo-500/25 disabled:opacity-50"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isSubmitting ? 'Creating Event...' : 'Create Event'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
