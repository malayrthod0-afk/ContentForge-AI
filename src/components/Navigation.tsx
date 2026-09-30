import React from 'react';
import { Calendar, PlusCircle, MessageSquare, Sparkles, Flame } from 'lucide-react';

interface NavigationProps {
  currentPage: 'events' | 'create-event' | 'feedback' | 'generated-content';
  onNavigate: (page: 'events' | 'create-event' | 'feedback' | 'generated-content') => void;
  feedbackCount?: number;
  hasGeneratedContent?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onNavigate,
  feedbackCount = 0,
  hasGeneratedContent = false,
}) => {
  const navItems: {
    id: 'events' | 'create-event' | 'feedback' | 'generated-content';
    label: string;
    icon: any;
    badge?: string | number;
  }[] = [
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'create-event', label: 'Create Event', icon: PlusCircle },
    {
      id: 'feedback',
      label: 'My Feedback',
      icon: MessageSquare,
      badge: feedbackCount > 0 ? feedbackCount : undefined,
    },
    {
      id: 'generated-content',
      label: 'Generated Content',
      icon: Sparkles,
      badge: hasGeneratedContent ? 'Ready' : undefined,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-indigo-100/70 shadow-xs">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => onNavigate('events')}
          className="flex items-center gap-2.5 text-left group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Flame className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900">
                ContentForge
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Event → Feedback → Social Content</p>
          </div>
        </button>

        {/* 4 Focused Navigation Tabs */}
        <nav className="flex items-center gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'
                  }`}
                />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      isActive
                        ? 'bg-indigo-200/70 text-indigo-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
