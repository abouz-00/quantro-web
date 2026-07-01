import { NextResponse } from 'next/server';
import { createHandler } from '@/lib/api/handler';
import { updateUserProfileSchema } from '@/lib/schemas/userProfile';
import { getUserProfile, updateUserProfile } from '@/server/userProfile';

export const GET = createHandler(
  { auth: 'session', rateLimit: { name: 'user-profile-get', max: 60, windowSeconds: 60 }, routeLabel: 'GET /api/user/profile' },
  async (_request, { session }) => {
    const user = await getUserProfile(session!.user.id);
    return NextResponse.json(user, {
      headers: {
        // Cache user profile for 5 minutes
        'Cache-Control': 'private, max-age=300, stale-while-revalidate=600',
      },
    });
  }
);

export const PUT = createHandler(
  {
    auth: 'session',
    rateLimit: { name: 'user-profile-put', max: 30, windowSeconds: 60 },
    schema: updateUserProfileSchema,
    routeLabel: 'PUT /api/user/profile',
  },
  async (_request, { session, body }) => {
    const updatedUser = await updateUserProfile(session!.user.id, body);
    return NextResponse.json(updatedUser);
  }
);
