import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Edit3,
  Bookmark,
  RefreshCw,
  Check,
  Award,
  HelpCircle,
  Wand2,
  Calendar,
  User,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { EventItem, PlatformResult, VariationItem } from '../types';

interface GeneratedContentPageProps {
  results: PlatformResult[] | null;
  activeEvent: EventItem | null;
  activeFeedback: string;
  onRefine: (payload: {
    currentContent: string;
    refinementAction: 'Make Shorter' | 'Make More Professional' | 'Make More Engaging' | 'Improve Hook';
    eventName: string;
    userFeedback: string;
    platform: string;
  }) => Promise<{ refinedContent: string; whyThisWorks: string }>;
  onRegenerate: () => Promise<void>;
  onSaveVariation: (platform: string, variation: VariationItem) => Promise<void>;
  onNavigateEvents: () => void;
}

export const GeneratedContentPage: React.FC<GeneratedContentPageProps> = ({
  results,
  activeEvent,
  activeFeedback,
  onRefine,
  onRegenerate,
  onSaveVariation,
  onNavigateEvents,
}) => {
  if (!results || results.length === 0 || !activeEvent) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center bg-white rounded-3xl border border-indigo-100 p-8 shadow-xs space-y-4">
        <Sparkles className="w-12 h-12 text-indigo-300 mx-auto" />
        <h3 className="text-lg font-black text-slate-900">
          No generated content ready yet
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Please select an attended event, submit your genuine feedback, and click "Generate Content" to view your customized multi-platform variations.
        </p>
        <button
          onClick={onNavigateEvents}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-xs"
        >
          Go to Events
        </button>
      </div>
    );
  }

  const [activePlatformIndex, setActivePlatformIndex] = useState(0);
  const [selectedVariationIndex, setSelectedVariationIndex] = useState<number>(0);

  const activePlatformResult = results[activePlatformIndex] || results[0];
  const currentVariation =
    activePlatformResult.variations[selectedVariationIndex] ||
    activePlatformResult.variations[0];

  // Inline editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartEdit = () => {
    setEditText(currentVariation.content);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    currentVariation.content = editText;
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      await onSaveVariation(activePlatformResult.platform, currentVariation);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRefinementAction = async (
    action: 'Make Shorter' | 'Make More Professional' | 'Make More Engaging' | 'Improve Hook'
  ) => {
    setIsRefining(true);
    try {
      const refined = await onRefine({
        currentContent: currentVariation.content,
        refinementAction: action,
        eventName: activeEvent.name,
        userFeedback: activeFeedback,
        platform: activePlatformResult.platform,
      });

      if (refined.refinedContent) {
        currentVariation.content = refined.refinedContent;
        if (refined.whyThisWorks) {
          currentVariation.whyThisWorks = refined.whyThisWorks;
        }
      }
    } catch (err) {
      console.error('Refinement failed:', err);
    } finally {
      setIsRefining(false);
    }
  };

  const handleRegenerateClick = async () => {
    setIsRegenerating(true);
    try {
      await onRegenerate();
    } finally {
      setIsRegenerating(false);
    }
  };

  const platformIcons: Record<string, string> = {
    Instagram: '📸',
    LinkedIn: '💼',
    X: '𝕏',
    Facebook: '👥',
    YouTube: '▶️',
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-600">
            Social Studio
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
          <span className="text-xs text-slate-400 font-semibold">Gemini 3.8 Flash Engine</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
          Your Experience, Everywhere.
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Content generated from your actual attendance at{' '}
          <strong className="text-slate-800 font-bold">"{activeEvent.name}"</strong> and genuine feedback.
        </p>
      </div>

      {/* Event & Feedback Grounding Bar */}
      <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-indigo-900 uppercase tracking-wider text-[10px] bg-indigo-200/60 px-2 py-0.5 rounded-md">
            Source Experience:
          </span>
          <span className="text-slate-700 italic">"{activeFeedback}"</span>
        </div>
        <span className="text-[11px] font-semibold text-slate-500">
          Speaker: {activeEvent.speaker}
        </span>
      </div>

      {/* Platform Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-indigo-100/70">
        {results.map((pr, idx) => {
          const isActive = idx === activePlatformIndex;
          return (
            <button
              key={pr.platform}
              onClick={() => {
                setActivePlatformIndex(idx);
                setSelectedVariationIndex(0);
                setIsEditing(false);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{platformIcons[pr.platform] || '📱'}</span>
              <span>{pr.platform}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Workspace Card */}
      <div className="bg-white rounded-3xl border border-indigo-100 shadow-xl overflow-hidden space-y-6">
        {/* Workspace Top Bar: Variation Selection */}
        <div className="p-6 bg-gradient-to-r from-indigo-50/70 via-white to-violet-50/40 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">{platformIcons[activePlatformResult.platform] || '📱'}</span>
              <h3 className="text-lg font-black text-slate-900">
                {activePlatformResult.platform} Edition
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Select between 3 distinct psychological angles tailored for {activePlatformResult.platform}
            </p>
          </div>

          {/* 3 Variations Tabs: Variation 1 - Professional, Variation 2 - Engaging, Variation 3 - Storytelling */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/80 gap-1">
            {activePlatformResult.variations.map((v, i) => {
              const isSelected = selectedVariationIndex === i;
              return (
                <button
                  key={v.style}
                  onClick={() => {
                    setSelectedVariationIndex(i);
                    setIsEditing(false);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Variation {i + 1}: {v.style}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* EXTRA FEATURE 1 — AI Content Score Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/50 via-slate-50 to-violet-50/40 border border-indigo-100/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                  AI Content Score
                </span>
                <p className="text-[11px] text-slate-500">
                  Heuristic benchmark for this variation
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Authenticity
                </span>
                <span className="text-sm font-black text-emerald-700">
                  {currentVariation.scoreAuthenticity || 96}/100
                </span>
              </div>
              <div className="text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Engagement
                </span>
                <span className="text-sm font-black text-indigo-700">
                  {currentVariation.scoreEngagement || 92}/100
                </span>
              </div>
              <div className="text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Platform Fit
                </span>
                <span className="text-sm font-black text-violet-700">
                  {currentVariation.scorePlatformFit || 94}/100
                </span>
              </div>
            </div>
          </div>

          {/* Hook Banner */}
          <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 block mb-1">
              Opening Hook
            </span>
            <p className="text-sm font-bold text-slate-900 leading-snug">
              "{currentVariation.hook}"
            </p>
          </div>

          {/* Main Content Area: Text Display or Inline Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                Post Content
              </label>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-3 py-1 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Apply Edits
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleStartEdit}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit in canvas</span>
                </button>
              )}
            </div>

            {isEditing ? (
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={8}
                className="w-full p-4 text-sm bg-white border-2 border-indigo-500 rounded-2xl focus:outline-hidden leading-relaxed font-sans text-slate-800 shadow-inner"
              />
            ) : (
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 text-sm text-slate-800 leading-relaxed whitespace-pre-line font-medium shadow-2xs">
                {currentVariation.content}
              </div>
            )}
          </div>

          {/* Hashtags & CTA */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                Hashtags:
              </span>
              {currentVariation.hashtags && currentVariation.hashtags.length > 0 ? (
                currentVariation.hashtags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">#ContentForge</span>
              )}
            </div>

            {currentVariation.cta && (
              <div className="text-xs font-bold text-slate-700 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200/70">
                CTA: <span className="text-indigo-700">{currentVariation.cta}</span>
              </div>
            )}
          </div>

          {/* EXTRA FEATURE 2 — Why This Works Box */}
          <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span>Why This Works</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {currentVariation.whyThisWorks}
            </p>
          </div>

          {/* Refinement Actions: Only 4 specific refinement actions */}
          <div className="p-4 rounded-2xl bg-violet-50/40 border border-violet-100 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-violet-800 block">
              1-Click Refinement
            </span>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  'Make Shorter',
                  'Make More Professional',
                  'Make More Engaging',
                  'Improve Hook',
                ] as const
              ).map((act) => (
                <button
                  key={act}
                  onClick={() => handleRefinementAction(act)}
                  disabled={isRefining}
                  className="px-3.5 py-1.5 bg-white hover:bg-violet-100 text-violet-800 border border-violet-200 rounded-xl text-xs font-bold transition-colors shadow-2xs disabled:opacity-50"
                >
                  {isRefining ? 'Refining...' : act}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons: Edit, Copy, Regenerate, Save */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {/* Copy */}
              <button
                onClick={() => handleCopy(currentVariation.content)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              {/* Edit */}
              <button
                onClick={handleStartEdit}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              {/* Regenerate */}
              <button
                onClick={handleRegenerateClick}
                disabled={isRegenerating}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                <span>{isRegenerating ? 'Regenerating...' : 'Regenerate'}</span>
              </button>
            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20"
            >
              {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Bookmark className="w-4 h-4" />}
              <span>{savedSuccess ? 'Saved to My Feedback!' : 'Save Variation'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
