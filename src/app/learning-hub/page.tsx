'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

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

export default function LearningHubPage() {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [learningContent, setLearningContent] = useState<LearningContent[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

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

        {/* Research Hub Section */}
        <div className="mt-8 pt-12 border-t border-zinc-200">
          <h2 className="text-2xl font-black uppercase mb-6">Research Hub</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <h4 className="font-medium mb-4">Market Reports</h4>
              <p className="text-sm text-gray-500">
                Quarterly and annual market reports on alternative investments
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/learning-hub')}
              >
                View All
              </Button>
            </Card>
            <Card className="p-6 text-center">
              <h4 className="font-medium mb-4">SEBI Updates</h4>
              <p className="text-sm text-gray-500">
                Latest regulatory updates from SEBI affecting alternative investments
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/learning-hub')}
              >
                View All
              </Button>
            </Card>
            <Card className="p-6 text-center">
              <h4 className="font-medium mb-4">Tax Updates</h4>
              <p className="text-sm text-gray-500">
                Latest tax changes and implications for investors
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/learning-hub')}
              >
                View All
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}