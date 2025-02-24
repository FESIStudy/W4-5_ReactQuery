'use client';

import { useQuery } from '@tanstack/react-query';

import fetchMeetingById from '@/api/meeting/fetchMeetingById';
import AvatarGroup from '@/app/meeting/detail/components/AvatarGroup';
import {
  MeetingDetailError,
  MeetingDetailSkeleton,
} from '@/app/meeting/detail/components/skeleton/MeetingDetailSkeleton';
import Card from '@/app/meeting/list/components/Card';
import FallbackImage from '@/components/shared/FallbackImage';
import MeetingProgress from '@/components/ui/card/MeetingProgress';
import Tag from '@/components/ui/Tag';
import { MeetingDetail } from '@/types/meeting';

export default function MeetingDetailClient({ meeting }: { meeting: MeetingDetail }) {
  const { data, error } = useQuery({
    queryKey: ['event', meeting?.id],
    queryFn: () => fetchMeetingById(meeting.id),
    initialData: meeting,
    enabled: !!meeting.id,
  });

  if (error) return <MeetingDetailError onRetry={() => window.location.reload()} />;
  if (!data?.id) return <MeetingDetailSkeleton />;

  return (
    <Card mode="detail">
      <div className="flex h-[271px] gap-6">
        <div className="relative flex w-[518px] items-center justify-center overflow-hidden">
          <div className="absolute left-0 top-0 z-0 size-[10px] bg-white" />
          <div className="absolute bottom-0 right-0 z-0 size-[10px] bg-white" />
          <FallbackImage />
          <Card.Like meetingId={data?.id} isLiked={data?.isLiked} onClick={() => null} />
        </div>
        <div className="flex h-[271px] w-[calc(100%-518px)] flex-col justify-between">
          <div className="flex flex-col gap-[10px]">
            <Tag />
            <div className="flex flex-col gap-2">
              <Card.Title
                name={data?.title}
                location={`${data?.location.region_1depth_name} ${data?.location.region_2depth_name}`}
              />
              <Card.ChipInfo datetime={data?.datetime} />
            </div>
            <div className="line-clamp-2 overflow-hidden text-ellipsis font-['Pretendard'] text-base font-medium text-[#8c8c8c]">
              {data?.summary}
            </div>
          </div>
          <MeetingProgress
            id="1"
            participantCount={data?.participants?.length ?? 0}
            capacity={20}
            isConfirmed
            isCompleted={false}
            optionClass="justifycontent: spacebetween"
          >
            <AvatarGroup count={10} />
          </MeetingProgress>
        </div>
      </div>
    </Card>
  );
}
