'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

import fetchMeetingById from '@/api/meeting/fetchMeetingById';
import updateMeetingDescription from '@/api/meeting/updateMeetingDescription';
import {
  DescriptionSkeleton,
  DescriptionError,
} from '@/app/meeting/detail/components/skeleton/DescriptionSkeleton';
import { MeetingDetail } from '@/types/meeting';

const MarkdownEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface UpdateMeetingParams {
  meetingId: string;
  title: string;
  description: string;
}

export default function DescriptionPage() {
  const params = useParams();
  const meetingId = params.id as string;

  const {
    data: meeting,
    isLoading,
    error,
    refetch,
  } = useQuery<MeetingDetail>({
    queryKey: ['event', meetingId],
    queryFn: () => fetchMeetingById(meetingId),
    enabled: !!meetingId,
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    console.log('Fetched meeting data:', meeting);

    if (meeting && 'details' in meeting && meeting.details) {
      setTitle(meeting.details.title);
      setDescription(meeting.details.description);
    }
  }, [meeting]);

  const updateMutation = useMutation({
    mutationFn: (updateData: UpdateMeetingParams) => updateMeetingDescription(updateData),
    onSuccess: async () => {
      await refetch();
      setIsEditing(false);
    },
  });

  const handleSave = async () => {
    if (!meetingId) return;
    await updateMutation.mutateAsync({ meetingId, title, description });
  };

  const renderContent = () => {
    if (!isEditing) {
      return <ReactMarkdown className="flex flex-col gap-1">{meeting?.details?.description ?? '설명이 없습니다.'}</ReactMarkdown>;
    }

    if (tab === 'edit') {
      return <MarkdownEditor value={description} onChange={(value?: string) => setDescription(value || '')} />;
    }

    return (
      <div className="rounded-md border bg-gray-50 p-4">
        <ReactMarkdown className="flex flex-col gap-1">{description ?? '설명이 없습니다.'}</ReactMarkdown>
      </div>
    );
  };

  if (!meetingId) return <p>⚠️ 이벤트 ID가 필요합니다.</p>;
  if (isLoading) return <DescriptionSkeleton />;
  if (error || !meeting) return <DescriptionError onRetry={refetch} />;

  return (
    <div className="min-h-[300px] font-['Pretendard'] text-base font-medium leading-normal text-neutral-800">
      <div className="flex w-full items-center justify-between">
        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-4 w-full px-2 py-1 text-2xl"
          />
        ) : (
          <div className="mb-4 font-dunggeunmo text-2xl font-normal text-black">{meeting?.details?.title ?? '제목 없음'}</div>
        )}
        {isEditing ? (
          <button type="button" onClick={handleSave} className="w-18 rounded-xl bg-black px-4 py-2 text-white">
            저장
          </button>
        ) : (
          <button type="button" onClick={() => setIsEditing(true)} className="w-18 rounded-xl bg-black px-4 py-2 text-white">
            수정
          </button>
        )}
      </div>
      {isEditing && (
        <div className="flex border-b border-gray-300">
          <button type="button" className={`px-4 py-2 ${tab === 'edit' ? 'border-b-2 border-black' : 'text-gray-600'}`} onClick={() => setTab('edit')}>
            편집
          </button>
          <button
            type="button"
            className={`px-4 py-2 ${tab === 'preview' ? 'border-b-2 border-blue-500' : 'text-gray-600'}`}
            onClick={() => setTab('preview')}
          >
            미리보기
          </button>
        </div>
      )}
      {renderContent()}
    </div>
  );
}
