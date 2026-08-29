import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';

interface ProviderSEOMetadata {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImageUrl: string;
  canonicalUrl: string;
}

export async function generateMetadata({
  slug,
}: {
  slug: string;
}) {
  // Fetch provider from Supabase
  const { data, error } = await supabaseAdmin
    .from('investment_providers')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    notFound();
  }

  // Build canonical URL
  const canonicalUrl = `https://brickbybrick.com/provider/${slug}`;

  return {
    title: data.name + ' - ' + (data.provider_type || 'Investment Provider'),
    description: data.description || `Learn about ${data.name}, a ${data.provider_type || 'investment provider'} in India's alternative investment market.`,
    keywords: 'alternative investment, provider, ' + (data.provider_type || 'investment') + ', india',
    openGraph: {
      title: data.name + ' - ' + (data.provider_type || 'Investment Provider'),
      description: data.description || `Learn about ${data.name}, a ${data.provider_type || 'investment provider'} in India's alternative investment market.`,
      images: data.website_url || '/og-image.jpg',
    },
    twitter: {
      card: 'summary',
      title: data.name + ' - ' + (data.provider_type || 'Investment Provider'),
      description: data.description || `Learn about ${data.name}, a ${data.provider_type || 'investment provider'} in India's alternative investment market.`,
      images: data.website_url || '/og-image.jpg',
    },
    icons: {
      icon: '/favicon.ico',
    },
  };
}

export default function ProviderPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  return <div>Provider: {slug}</div>;
}