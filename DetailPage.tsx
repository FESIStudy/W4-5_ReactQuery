'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import fetchMeetingById from '@/api/meeting/fetchMeetingById';
import MeetingDetailClient from '@/app/meeting/detail/components/MeetingDetailClient';
import {
  MeetingDetailSkeleton,
  MeetingDetailError,
} from '@/app/meeting/detail/components/skeleton/MeetingDetailSkeleton';
import { MeetingDetail } from '@/types/meeting';

export default function DetailPage() {
  const params = useParams();
  const meetingId = params.id as string;

  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!meetingId) return;

    fetchMeetingById(meetingId)
      .then((data) => {
        if (data?.id) {
          setMeeting(data);
          setError(null);
        } else {
          console.error('Invalid event data:', data);
          setError(new Error('Invalid event data'));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch meeting data:', err);
        setError(err);
        setLoading(false);
      });
  }, [meetingId]);

  if (!meetingId) return <p>⚠️ 이벤트 ID가 필요합니다.</p>;
  if (loading) return <MeetingDetailSkeleton />;
  if (error) return <MeetingDetailError onRetry={() => window.location.reload()} />;
  if (!meeting) return <p>⚠️ 유효한 이벤트 데이터가 없습니다.</p>;

  return <MeetingDetailClient meeting={meeting} />;
}
