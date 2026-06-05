import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import Link from 'next/link';

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const { data: dbUser } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('clerk_id', userId)
    .single();

  const { data: enrollments } = await supabaseAdmin
    .from('enrollments')
    .select(`
      id,
      progress_percent,
      enrolled_at,
      courses (
        id,
        title,
        thumbnail_url,
        total_lessons
      )
    `)
    .eq('user_id', dbUser?.id);

  const { data: certificates } = await supabaseAdmin
    .from('certificates')
    .select(`
      id,
      issued_at,
      courses (
        id,
        title
      )
    `)
    .eq('user_id', dbUser?.id);

  const totalProgress = enrollments?.length 
    ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress_percent || 0), 0) / enrollments.length)
    : 0;

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black tracking-tight">Your Profile</h1>
          <Link href="/student-portal/profile/edit">
            <Button variant="outline" size="sm">Edit Profile</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="border-gray-200 shadow-none">
              <CardContent className="p-6 flex flex-col items-center">
                <div className="w-32 h-32 rounded-full overflow-hidden mb-4 bg-gray-100 flex items-center justify-center">
                  {user.imageUrl ? (
                    <img 
                      src={user.imageUrl} 
                      alt={user.fullName || 'User'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-gray-400">
                      {user.firstName?.[0] || '?'}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-center">
                  {user.fullName || 'Student'}
                </h2>
                <p className="text-gray-500 text-sm">{user.emailAddresses[0]?.emailAddress}</p>
                <div className="mt-4 pt-4 border-t border-gray-100 w-full">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Member since</span>
                    <span className="font-medium">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="border-gray-200 shadow-none">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">Learning Progress</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50">
                    <div className="text-3xl font-black text-brand-primary">{enrollments?.length || 0}</div>
                    <div className="text-sm text-gray-500">Enrolled Courses</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50">
                    <div className="text-3xl font-black text-brand-primary">{totalProgress}%</div>
                    <div className="text-sm text-gray-500">Avg. Progress</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50">
                    <div className="text-3xl font-black text-brand-primary">{certificates?.length || 0}</div>
                    <div className="text-sm text-gray-500">Certificates</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-none">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">Enrolled Courses</h3>
                {(!enrollments || enrollments.length === 0) ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">You haven&apos;t enrolled in any courses yet.</p>
                    <Link href="/courses">
                      <Button>Browse Catalog</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {enrollments.map((enrollment: any) => (
                      <div 
                        key={enrollment.id} 
                        className="flex items-center gap-4 p-4 bg-gray-50"
                      >
                        <div className="w-16 h-16 bg-gray-200 flex-shrink-0 flex items-center justify-center">
                          {enrollment.courses?.thumbnail_url ? (
                            <img 
                              src={enrollment.courses.thumbnail_url} 
                              alt={enrollment.courses.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-gray-400 text-xs">No image</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{enrollment.courses?.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={enrollment.progress_percent || 0} className="flex-1" />
                            <span className="text-sm text-gray-500 w-12">
                              {enrollment.progress_percent || 0}%
                            </span>
                          </div>
                        </div>
                        <Link href={`/student-portal/learn/${enrollment.courses?.id}`}>
                          <Button variant="outline" size="sm">Continue</Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {certificates && certificates.length > 0 && (
              <Card className="border-gray-200 shadow-none">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-4">Certificates</h3>
                  <div className="space-y-4">
                    {certificates.map((cert: any) => (
                      <div 
                        key={cert.id} 
                        className="flex items-center justify-between p-4 bg-gray-50"
                      >
                        <div>
                          <h4 className="font-medium">{cert.courses?.title}</h4>
                          <p className="text-sm text-gray-500">
                            Issued {new Date(cert.issued_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">View Certificate</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}