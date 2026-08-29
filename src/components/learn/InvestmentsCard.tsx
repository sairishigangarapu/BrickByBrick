import React from 'react';
import Image from 'next/image';
import { CardTitle } from '@/components/ui/Card';

interface InvestmentCardProps {
  investment: any;
}

export default function InvestmentsCard({ investment }: InvestmentCardProps) {
  const {
    name,
    description,
    minimum_investment,
    expected_returns,
    risk_level,
    liquidity,
    regulator,
    is_featured,
    is_trending,
    logo_url,
    category,
  } = investment;

  const riskColor = risk_level === 'low'
    ? 'bg-green-100 text-green-800 px-2 py-1 rounded'
    : risk_level === 'medium'
      ? 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded'
      : risk_level === 'high'
        ? 'bg-red-100 text-red-800 px-2 py-1 rounded'
        : 'bg-purple-100 text-purple-800 px-2 py-1 rounded';

  return (
    <div className="hover:shadow-lg hover:transition-shadow duration-300 border border-gray-200 bg-white text-foreground">
      <div className="flex flex-col h-full">
        {logo_url && (
          <Image
            src={logo_url}
            alt={name}
            width={120}
            height={80}
            className="object-cover rounded-t-lg"
          />
        )}
        {!logo_url && (
          <div className="p-4 rounded-t-lg bg-gray-100">
            <span className="text-gray-400 text-sm">No Logo</span>
          </div>
        )}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <CardTitle className="line-clamp-2">{name}</CardTitle>
          {description && (
            <p className="text-sm text-gray-500 line-clamp-2 mt-1">
              {description.substring(0, 100)}...</p>
          )}
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className={riskColor}>
              {risk_level}
            </span>
            <span className="text-gray-500">•</span>
            <span>{liquidity}</span>
            {minimum_investment && (
              <span>₹{minimum_investment.toLocaleString()}</span>
            )}
          </div>
          {expected_returns && (
            <p className="mt-2 text-orange-600 font-medium">
              Expected: {expected_returns}% p.a.
            </p>
          )}
          {regulator && (
            <p className="mt-1 text-xs text-gray-400">
              Regulated by {regulator}
            </p>
          )}
          {is_featured && (
            <span className="mt-2 text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
              Featured
            </span>
          )}
          {is_trending && (
            <span className="mt-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
              Trending
            </span>
          )}
        </div>
      </div>
    </div>
  );
}