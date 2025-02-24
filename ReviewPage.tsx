'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';

import fetchMeetingById from '@/api/meeting/fetchMeetingById';
import {
  ReviewListError,
  ReviewListSkeleton,
} from '@/app/meeting/detail/components/skeleton/ReviewSkeleton';
import Pagination from '@/components/ui/Pagination';
import ReviewItem from '@/components/ui/review/ReviewItem';
import { MeetingDetail } from '@/types/meeting';

export default function ReviewList() {
  const params = useParams();
  const meetingId = params.id as string;

  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  const {
    data: meeting,
    isLoading,
    error,
    refetch,
  } = useQuery<MeetingDetail>({
    queryKey: ['event', meetingId],
    queryFn: () => fetchMeetingById(meetingId),
    enabled: !!meetingId,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  if (!meetingId) return <p>⚠️ 이벤트 ID가 필요합니다.</p>;
  if (isLoading) return <ReviewListSkeleton />;
  if (error || !meeting) return <ReviewListError onRetry={refetch} />;
  if (!meeting?.reviews?.length)
    return (
      <p className="flex h-[200px] items-center justify-center text-gray-500">
        아직 리뷰가 없습니다.
      </p>
    );
  const totalReviews = meeting.reviews.length;
  const totalPages = Math.ceil(totalReviews / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const selectedReviews = meeting.reviews.slice(startIndex, startIndex + reviewsPerPage);

  return (
    <div className="flex-col">
      <div className="font-['DungGeunMo'] text-2xl font-normal text-black">이전 번개 리뷰</div>
      <div className="mt-4 space-y-4">
        {selectedReviews.map((review, index) => (
          <React.Fragment key={review.id}>
            <ReviewItem
              date={review.date}
              content={review.content}
              count={review.count}
              username={review.writer}
            />
            {index < selectedReviews.length - 1 && (
              <div data-svg-wrapper="">
                <svg
                  width="1200"
                  height="4"
                  viewBox="0 0 1200 4"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0 2H1200"
                    stroke="#F0F0F0"
                    strokeWidth="3"
                    strokeLinecap="square"
                    strokeDasharray="3 6"
                  />
                </svg>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChangeAction={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
