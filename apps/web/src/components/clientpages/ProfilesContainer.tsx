'use client';

import { useState } from 'react';
import { Profile } from '@/types';
import ProfileCreateForm from './ProfileCreateForm';
import ProfileListClient from './ProfileListClient';
import { UserMetadata } from '@supabase/supabase-js';

interface ProfilesContainerProps {
  token: string | undefined;
  userId: string | undefined;
  metaData?: UserMetadata;
}

export default function ProfilesContainer({
  token,
  userId,
  metaData,
}: ProfilesContainerProps) {
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  const handleEditProfile = (profile: Profile) => {
    setEditingProfile(profile);
    // Smoothly scroll to the form on mobile or small screens
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingProfile(null);
  };

  return (
    <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6 w-full">
      <div className="lg:col-span-7 space-y-6">
        <ProfileCreateForm
          token={token}
          userId={userId}
          metaData={metaData}
          editingProfile={editingProfile}
          onCancelEdit={handleCancelEdit}
        />
      </div>

      <div className="lg:col-span-5 space-y-6">
        <ProfileListClient
          token={token}
          userId={userId}
          onEdit={handleEditProfile}
          activeEditId={editingProfile?.id || null}
        />
      </div>
    </main>
  );
}
