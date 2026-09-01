'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { useSearchParams } from 'next/navigation';
import { formatDistanceToNowStrict } from 'date-fns';
import { supabase } from '@/lib/supabase';
import type { NewsArticle } from '@/lib/news-categories';

interface LearningPath {
  id: string;
  name: string;
  description: string;
  order_index: number;
  is_active: boolean;
}

interface LearningContent {
  id: string;
  path_id: string;
  title: string;
  content_type: 'article' | 'video' | 'course' | 'interactive_module' | 'infographic' | 'case_study' | 'pdf';
  order_index: number;
  is_published: boolean;
}

interface HubSection {
  id: string;
  label: string;
  articles: NewsArticle[];
}

function formatPublishedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime()) || date.getTime() === 0) return '';
  try {
    return formatDistanceToNowStrict(date, { addSuffix: true });
  } catch {
    return '';
  }
}

function HubArticleRow({ article }: { article: NewsArticle }) {
  const published = formatPublishedAt(article.publishedAt);
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block text-left py-2 border-b border-zinc-100 last:border-b-0"
    >
      <p className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-orange-700 transition-colors">
        {article.title}
      </p>
      <p className="text-[11px] text-gray-500 mt-1">
        <span className="font-semibold">{article.source}</span>
        {published && ` · ${published}`}
      </p>
    </a>
  );
}

export default function LearningHubPage() {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [learningContent, setLearningContent] = useState<LearningContent[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // Research Hub live feeds (SEBI RSS + Google News). Fetched independently of
  // the learning-path data so one failing source never blocks the page.
  const [hubSections, setHubSections] = useState<HubSection[]>([]);
  const [hubState, setHubState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Fetch learning paths
  useEffect(() => {
    const fetchLearningPaths = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('learning_paths')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true });

        if (error) throw error;
        setLearningPaths(data || []);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchLearningPaths();
  }, []);

  const loadHubUpdates = useCallback(async () => {
    setHubState('loading');
    try {
      const res = await fetch('/api/learning-hub/updates?perSection=8');
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      setHubSections(Array.isArray(data?.sections) ? data.sections : []);
      setHubState('ready');
    } catch (err) {
      console.error('Failed to fetch hub updates:', err);
      setHubState('error');
    }
  }, []);

  useEffect(() => {
    loadHubUpdates();
  }, [loadHubUpdates]);

  // Fetch content for selected path
  useEffect(() => {
    if (!selectedPath) {
      setLearningContent([]);
      return;
    }

    const fetchContent = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('learning_content')
          .select('*')
          .eq('learning_path_id', selectedPath)
          .eq('is_published', true)
          .order('order_index', { ascending: true });

        if (error) throw error;
        setLearningContent(data || []);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchContent();
  }, [selectedPath]);

  if (loading) {
    return <div className="min-h-screen p-8">Loading learning hub...</div>;
  }

  if (error) {
    return <div className="min-h-screen p-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-black text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black uppercase mb-4">Learning Hub</h1>
          <p className="text-lg text-gray-400 max-w-2xl">
            Master alternative investments with our comprehensive learning paths and resources.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 py-12">
        {/* Learning Paths Selection */}
        <div className="mb-12">
          <h2 className="text-2xl font-black uppercase mb-6">Learning Paths</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {learningPaths.map((path) => (
              <Card
                key={path.id}
                className={`p-8 text-center border-2 transition-all cursor-pointer ${
                  selectedPath === path.id 
                    ? 'border-orange-500 shadow-md bg-orange-50' 
                    : 'border-zinc-200 hover:border-orange-500 hover:shadow-lg bg-zinc-50'
                }`}
                onClick={() => setSelectedPath(path.id)}
              >
                <span className="text-5xl mb-4 block">{path.name === 'Beginner' ? '🌱' : path.name === 'Intermediate' ? '📈' : '🚀'}</span>
                <h3 className="font-bold text-xl uppercase mb-2">{path.name}</h3>
                <p className="text-sm text-zinc-600 line-clamp-2">{path.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Learning Content */}
        {selectedPath && (
          <div className="mb-16">
            <h2 className="text-2xl font-black uppercase mb-6">Curriculum</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {learningContent.map((content) => (
                <Card
                  key={content.id}
                  className="p-4 border-t"
                >
                  <div className="flex items-start gap-3">
                    <span 
                      className={content.content_type === 'video' 
                        ? 'text-orange-500' 
                        : content.content_type === 'article'
                          ? 'text-blue-500'
                          : content.content_type === 'pdf'
                            ? 'text-green-500'
                              : 'text-purple-500'}
                    >
                      {content.content_type[0].toUpperCase() + content.content_type.slice(1)}
                    </span>
                    <div className="flex-1 pt-1">
                      <h4 className="font-medium">{content.title}</h4>
                      <p className="text-xs text-gray-500">{content.content_type}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Research Hub Section — live feeds: SEBI's official RSS + Google News RSS */}
        <div className="mt-8 pt-12 border-t border-zinc-200">
          <h2 className="text-2xl font-black uppercase mb-2">Research Hub</h2>
          <p className="text-sm text-gray-500 mb-6">
            Live updates from verified sources — SEBI (sebi.gov.in) and Google News.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {hubSections.map((section) => {
              const expanded = expandedSections[section.id];
              const visibleArticles = expanded ? section.articles : section.articles.slice(0, 4);
              return (
                <Card key={section.id} className="p-6">
                  <h4 className="font-medium mb-1">{section.label}</h4>
                  <p className="text-xs text-gray-500 mb-3">
                    {section.id === 'sebi-updates'
                      ? 'Regulatory updates from SEBI affecting alternative investments'
                      : section.id === 'market-reports'
                        ? 'Quarterly and annual market reports on alternative investments'
                        : 'Latest tax changes and implications for investors'}
                  </p>
                  {hubState === 'loading' && (
                    <p className="text-xs text-gray-400 py-4">Loading updates…</p>
                  )}
                  {hubState === 'error' && (
                    <div className="py-4">
                      <p className="text-xs text-gray-500 mb-2">Could not load updates right now.</p>
                      <Button variant="outline" size="sm" onClick={loadHubUpdates}>
                        Retry
                      </Button>
                    </div>
                  )}
                  {hubState === 'ready' && visibleArticles.length === 0 && (
                    <p className="text-xs text-gray-400 py-4">No updates available right now.</p>
                  )}
                  {hubState === 'ready' && visibleArticles.length > 0 && (
                    <>
                      <div className="mb-3">
                        {visibleArticles.map((article) => (
                          <HubArticleRow key={article.id} article={article} />
                        ))}
                      </div>
                      {section.articles.length > 4 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setExpandedSections((prev) => ({ ...prev, [section.id]: !prev[section.id] }))
                          }
                        >
                          {expanded ? 'Show Less' : `View All (${section.articles.length})`}
                        </Button>
                      )}
                    </>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}