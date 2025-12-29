import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CommentCard } from '@/components/features/forum/comment-card'
import { ArrowLeft } from 'lucide-react';
import { createLazyRoute, getRouteApi, Link } from '@tanstack/react-router';
import TextEditor, { type TextEditorHandle } from '@/components/features/forum/text-editor';
import { useGetAllPostsByTopicId, useGetTopicById } from '@/api/forum';
import { useState, useRef } from 'react';
import { ApiPagination } from '@/components/api-pagination';
import { formatDate, getTopicTypeMeta } from '@/lib/utils';
import { ForumPostSkeletonList } from '@/components/skeletons/topic-detail-skeleton';

const route = getRouteApi('/public/forum/topic/$topicId');


export function TopicDetail() {
  const textEditorRef = useRef<TextEditorHandle>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { topicId } = route.useParams();
  const pageSize = 10;
  const postsQuery = useGetAllPostsByTopicId(topicId, currentPage, pageSize);
  const topicQuery = useGetTopicById(topicId);

  if (postsQuery.isLoading || topicQuery.isLoading) {
    return <ForumPostSkeletonList />
  }
  if (postsQuery.isError || !postsQuery.data) {
    return <div className="p-6 text-red-500">Không thể tải bài viết</div>;
  }

  const { label, variant } = getTopicTypeMeta(topicQuery.data?.type);
  function handlePageChange(page: number) {
    setCurrentPage(page);
    console.log("Triggered state change");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleAfterPostCreate(lastPage: number) {
    if (currentPage !== lastPage) {
      setCurrentPage(lastPage);
    }
  }

  function handleReply(content: string) {
    textEditorRef.current?.focus();
    textEditorRef.current?.insertContent(content);
  }

  return (
    <div className="container mx-auto px-4 pt-6 pb-6">
      <div className="w-full space-y-6">
        <Button variant="outline" className="mb-4" asChild>
          <Link to='/forum'>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Link>
        </Button>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge variant={variant} className="shrink-0">
              {label}
            </Badge>

            <h1 className="text-3xl font-bold tracking-tight leading-none">
              {topicQuery.data?.title}
            </h1>
          </div>

          <p className="text-muted-foreground">{formatDate(topicQuery.data?.dateCreated.toString())}</p>
        </div>

        <div className="space-y-4">
          {postsQuery.data.items.map((post, index) => (
            <CommentCard key={post.id} post={post} commentNumber={index + 1} onReplyClick={handleReply} />
          ))}
        </div>

        <TextEditor ref={textEditorRef} topicId={topicId} onAfterPostCreate={handleAfterPostCreate} />
        <ApiPagination
          pagination={postsQuery.data}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}

export const Route = createLazyRoute('/public/forum/topic/$topicId')({
  component: TopicDetail
})
