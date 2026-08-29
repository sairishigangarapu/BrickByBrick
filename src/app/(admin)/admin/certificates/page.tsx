import React from 'react';
import { supabaseAdmin } from '@/lib/supabase';
import { Award, Search, Download } from 'lucide-react';
import { format } from 'date-fns';

export const revalidate = 0;

export default async function AdminCertificatesPage() {
  // Fetch certificates from the database (joining users and courses if available)
  // Assuming a 'certificates' table exists with user_id, course_id, issued_at
  // If it doesn't exist, we will gracefully handle the error and show an empty state.
  
  const { data: certificates, error } = await supabaseAdmin
    .from('certificates')
    .select(`
      id,
      issued_at,
      certificate_url,
      users ( id, email ),
      courses ( id, title )
    `)
    .order('issued_at', { ascending: false })
    .limit(50);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black mb-2 text-white">Certificates Registry</h1>
          <p className="text-gray-400">Track and manage all course completion certificates issued to students.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search by student email..." 
              className="bg-zinc-900 border border-zinc-800 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-orange-500 w-64"
            />
          </div>
          <button className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
            <Award className="w-5 h-5" />
            Generate Manual
          </button>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {error || !certificates || certificates.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
              <Award className="w-8 h-8 text-zinc-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Certificates Issued</h3>
            <p className="text-zinc-500 max-w-md">
              There are currently no certificates in the registry. When students complete a course, their automatically generated certificates will appear here.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950 border-b border-zinc-800">
                <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Student Email</th>
                <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Course Completed</th>
                <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider">Date Issued</th>
                <th className="p-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {certificates.map((cert: any) => (
                <tr key={cert.id} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="p-4 text-sm font-medium text-zinc-300">
                    {cert.users?.email || 'Unknown User'}
                  </td>
                  <td className="p-4 text-sm text-zinc-400">
                    {cert.courses?.title || 'Unknown Course'}
                  </td>
                  <td className="p-4 text-sm text-zinc-400">
                    {cert.issued_at ? format(new Date(cert.issued_at), 'MMM dd, yyyy') : 'N/A'}
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-orange-500 hover:text-orange-400 p-2 rounded hover:bg-orange-500/10 transition-colors inline-flex items-center gap-2 text-sm font-bold">
                      <Download className="w-4 h-4" />
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
