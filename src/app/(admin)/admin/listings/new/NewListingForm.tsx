'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface CategoryOption {
  id: string;
  name: string;
}

interface ProviderOption {
  id: string;
  name: string;
}

const RISK_LEVELS = ['low', 'medium', 'high', 'very_high'] as const;
const LIQUIDITY = ['daily', 'weekly', 'monthly', 'quarterly', 'annual', 'lock_in'] as const;

export function NewListingForm({
  categories,
  providers,
}: {
  categories: CategoryOption[];
  providers: ProviderOption[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get('name') || '').trim(),
      description: String(fd.get('description') || ''),
      category_id: String(fd.get('category_id') || '') || null,
      provider_id: String(fd.get('provider_id') || '') || null,
      minimum_investment: Number(fd.get('minimum_investment') || 0),
      expected_returns: Number(fd.get('expected_returns') || 0),
      risk_level: String(fd.get('risk_level') || 'medium'),
      liquidity: String(fd.get('liquidity') || 'monthly'),
      investment_horizon: String(fd.get('investment_horizon') || ''),
      fee_structure: String(fd.get('fee_structure') || ''),
      is_published: fd.get('is_published') === 'on',
      is_featured: fd.get('is_featured') === 'on',
    };

    if (!payload.name) {
      setError('Name is required.');
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/admin/listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || `Request failed (${res.status})`);
        }
        setSuccess('Listing created.');
        (e.target as HTMLFormElement).reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create listing');
      }
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Name" name="name" required placeholder="Embassy Office Parks REIT" />

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">Category</label>
              <select name="category_id" className="w-full p-2 border border-zinc-300 rounded-md bg-white">
                <option value="">— Select —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">Provider</label>
              <select name="provider_id" className="w-full p-2 border border-zinc-300 rounded-md bg-white">
                <option value="">— Select —</option>
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">Description</label>
            <textarea
              name="description"
              rows={4}
              className="w-full p-2 border border-zinc-300 rounded-md"
              placeholder="Long-form description of the instrument..."
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <NumberField label="Minimum Investment (₹)" name="minimum_investment" defaultValue={0} />
            <NumberField label="Expected Returns (%)" name="expected_returns" defaultValue={0} step={0.1} />
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">Risk</label>
              <select name="risk_level" defaultValue="medium" className="w-full p-2 border border-zinc-300 rounded-md bg-white">
                {RISK_LEVELS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">Liquidity</label>
              <select name="liquidity" defaultValue="monthly" className="w-full p-2 border border-zinc-300 rounded-md bg-white">
                {LIQUIDITY.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <Field label="Investment Horizon" name="investment_horizon" placeholder="3-5 years" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">
              Fee structure
            </label>
            <textarea
              name="fee_structure"
              rows={2}
              className="w-full p-2 border border-zinc-300 rounded-md"
              placeholder="Management fee 1.5%, Performance fee 10%"
            />
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="is_published" className="rounded border-zinc-300 text-orange-600" />
              Publish to marketplace
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="is_featured" className="rounded border-zinc-300 text-orange-600" />
              Featured
            </label>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-emerald-600">{success}</p>}

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? 'Creating…' : 'Create Listing'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  name,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">{label}</label>
      <input
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full p-2 border border-zinc-300 rounded-md"
      />
    </div>
  );
}

function NumberField({
  label,
  name,
  defaultValue,
  step = 1,
}: {
  label: string;
  name: string;
  defaultValue: number;
  step?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1">{label}</label>
      <input
        type="number"
        name={name}
        defaultValue={defaultValue}
        step={step}
        className="w-full p-2 border border-zinc-300 rounded-md"
      />
    </div>
  );
}
