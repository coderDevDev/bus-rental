'use client';

import { ProfileLayout } from '@/components/profile/profile-layout';
import { AdminStats } from '@/components/profile/admin-stats';
//import { AdminActivity } from '@/components/profile/admin-activity';

export default function AdminProfile() {
  return (
    <ProfileLayout
      backHref="/dashboard"
      role="passenger"
      // stats={<AdminStats />}
    />
  );
}
