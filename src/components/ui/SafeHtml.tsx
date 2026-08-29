// Defense-in-depth HTML renderer for trusted Tiptap content.
// Strips any tag or attribute that is not on the whitelist.

import React from 'react';

const ALLOWED_TAGS = new Set([
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'strong',
  'em',
  'b',
  'i',
  'u',
  'a',
  'code',
  'pre',
  'blockquote',
  'br',
  'hr',
  'span',
  'div',
]);

const ALLOWED_ATTRS = new Set(['href', 'target', 'rel', 'title']);

function isSafeHref(href: string): boolean {
  const trimmed = href.trim();
  if (trimmed.startsWith('/')) return true;
  if (trimmed.startsWith('#')) return true;
  if (trimmed.startsWith('mailto:')) return true;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return true;
  return false;
}

interface SanitizedNode {
  tag: string;
  attrs: Record<string, string>;
  children: Array<SanitizedNode | string>;
}

function escapeText(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function sanitize(html: string): string {
  // Very small parser. Handles the common Tiptap output without bringing in
  // a dependency. Strips anything not in the allowlist.
  if (!html) return '';

  // Drop <script> and <style> blocks entirely
  let cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');

  // Strip event handlers and javascript: URLs by re-running on the result.
  cleaned = cleaned.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  cleaned = cleaned.replace(/(href|src)\s*=\s*("javascript:[^"]*"|'javascript:[^']*'|javascript:[^\s>]+)/gi, '');

  // Walk the string and rebuild with allowlist filter
  const out: string[] = [];
  let i = 0;
  while (i < cleaned.length) {
    const lt = cleaned.indexOf('<', i);
    if (lt === -1) {
      out.push(escapeText(cleaned.slice(i)));
      break;
    }
    if (lt > i) {
      out.push(escapeText(cleaned.slice(i, lt)));
    }
    const gt = cleaned.indexOf('>', lt);
    if (gt === -1) {
      out.push(escapeText(cleaned.slice(lt)));
      break;
    }
    const raw = cleaned.slice(lt, gt + 1);
    i = gt + 1;

    const closingMatch = raw.match(/^<\/([a-zA-Z][a-zA-Z0-9]*)\s*>$/);
    if (closingMatch) {
      const tag = closingMatch[1].toLowerCase();
      if (ALLOWED_TAGS.has(tag)) {
        out.push(`</${tag}>`);
      }
      continue;
    }

    const selfClosing = raw.match(/^<([a-zA-Z][a-zA-Z0-9]*)((?:\s+[a-zA-Z\-]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))*)\s*\/?>$/);
    if (selfClosing) {
      const tag = selfClosing[1].toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) continue;
      const attrString = selfClosing[2] || '';
      const attrs: string[] = [];
      const attrRegex = /([a-zA-Z\-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g;
      let m: RegExpExecArray | null;
      while ((m = attrRegex.exec(attrString)) !== null) {
        const name = m[1].toLowerCase();
        if (!ALLOWED_ATTRS.has(name)) continue;
        let value = m[3] ?? m[4] ?? m[5] ?? '';
        if (name === 'href' && !isSafeHref(value)) continue;
        if (name === 'target' && value === '_blank') {
          attrs.push('target="_blank"');
          attrs.push('rel="noopener noreferrer"');
        } else {
          attrs.push(`${name}="${value.replace(/"/g, '&quot;')}"`);
        }
      }
      out.push(`<${tag}${attrs.length ? ' ' + attrs.join(' ') : ''}>`);
    }
  }

  return out.join('');
}

export function SafeHtml({ html, className }: { html: string; className?: string }) {
  const sanitized = sanitize(html);
  return (
    <div
      className={className ?? 'prose prose-sm max-w-none'}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
