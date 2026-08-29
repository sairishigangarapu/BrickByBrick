import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';

interface CategorySEOMetadata {
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

export async function generateMetadata(
  { slug }: { slug: string }
) {

  // Fetch category from Supabase
  const { data, error } = await supabaseAdmin
    .from('investment_categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    notFound();
  }

  // Build canonical URL
  const canonicalUrl = `https://brickbybrick.com/category/${slug}`;

  // Determine meta keywords based on category type
  let metaKeywords = 'alternative investment,';
  if (data.name.includes('REIT')) metaKeywords += 'REIT, real estate, ';
  if (data.name.includes('InvIT')) metaKeywords += 'InvIT, infrastructure, ';
  if (data.name.includes('AIF')) metaKeywords += 'AIF, alternative fund, ';
  if (data.name.includes('PMS')) metaKeywords += 'PMS, portfolio management, ';
  if (data.name.includes('Private Credit')) metaKeywords += 'private credit, ';
  if (data.name.includes('Corporate Bonds')) metaKeywords += 'corporate bonds, ';
  if (data.name.includes('Infrastructure')) metaKeywords += 'infrastructure, ';
  if (data.name.includes('Fractional')) metaKeywords += 'fractional real estate, ';
  if (data.name.includes('Commodities')) metaKeywords += 'gold, silver, commodities, ';
  if (data.name.includes('Global')) metaKeywords += 'global alternatives, ';
  if (data.name.includes('Cryptocurrency')) metaKeywords += 'cryptocurrency education, ';

  metaKeywords = metaKeywords.slice(0, -2); // Remove trailing comma and space

  return {
    title: data.meta_title || `${data.name} - Alternative Investments in India`,
    description: data.meta_description || `Invest in ${data.name.toLowerCase()} in India. Discover opportunities, understand risks, and learn about regulation.`,
    keywords: metaKeywords,
    openGraph: {
      title: data.meta_title || `${data.name} - Alternative Investments in India`,
      description: data.meta_description || `Invest in ${data.name.toLowerCase()} in India. Discover opportunities, understand risks, and learn about regulation.`,
      images: data.logo_url || '/og-image.jpg',
    },
    twitter: {
      card: 'summary_large_image',
      title: data.meta_title || `${data.name} - Alternative Investments in India`,
      description: data.meta_description || `Invest in ${data.name.toLowerCase()} in India. Discover opportunities, understand risks, and learn about regulation.`,
      images: data.logo_url || '/og-image.jpg',
    },
    icons: {
      icon: '/favicon.ico',
    },
    authors: ['sairishi.gangarapu@gmail.com'],
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <div>Category: {slug}</div>;
}