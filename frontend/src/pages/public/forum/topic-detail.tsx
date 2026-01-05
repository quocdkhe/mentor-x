import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CommentCard } from '@/components/features/forum/comment-card'
import { ArrowLeft } from 'lucide-react';
import { createLazyRoute, getRouteApi, Link } from '@tanstack/react-router';
import TextEditor, { type TextEditorHandle } from '@/components/features/forum/text-editor';
import { useGetAllPostsByTopicId, useGetTopicById, useDeletePost, useUpdatePost } from '@/api/forum';
import { useState, useRef } from 'react';
import { ApiPagination } from '@/components/api-pagination';
import { formatDate, getTopicTypeMeta } from '@/lib/utils';
import { ForumPostSkeletonList } from '@/components/skeletons/topic-detail-skeleton';
import type { Post } from '@/types/forum';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const route = getRouteApi('/public/forum/topic/$topicId');


export function TopicDetail() {
  const textEditorRef = useRef<TextEditorHandle>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const { topicId } = route.useParams();
  const pageSize = 10;
  const postsQuery = useGetAllPostsByTopicId(topicId, currentPage, pageSize);
  const topicQuery = useGetTopicById(topicId);
  const queryClient = useQueryClient();

  const deletePostMutation = useDeletePost();
  const updatePostMutation = useUpdatePost();

  if (postsQuery.isLoading || topicQuery.isLoading) {
    return <ForumPostSkeletonList />
  }
  if (postsQuery.isError || !postsQuery.data) {
    return <div className="p-6 text-red-500">Không thể tải bài viết</div>;
  }

  const { label, variant } = getTopicTypeMeta(topicQuery.data?.type);
  function handlePageChange(page: number) {
    setCurrentPage(page);
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

  function handleEdit(post: Post) {
    setEditingPost(post);
    textEditorRef.current?.focus();
    textEditorRef.current?.setContent(post.content);
    // Smooth scroll to editor
    textEditorRef.current?.focus();
  }

  function handleDelete(postId: string) {
    setDeletingPostId(postId);
  }

  function handleConfirmDelete() {
    if (!deletingPostId) return;

    deletePostMutation.mutate(deletingPostId, {
      onSuccess: () => {
        toast.success("Xóa bình luận thành công");
        setDeletingPostId(null);
        queryClient.invalidateQueries({
          queryKey: ['forum-topic-posts', topicId],
        });
      },
      onError: (error) => {
        toast.error("Không thể xóa bình luận: " + (error.response?.data.message || error.message));
      }
    });
  }

  function handleCancelEdit() {
    setEditingPost(null);
    textEditorRef.current?.setContent("");
  }

  function handleUpdatePost(content: string) {
    if (!editingPost) return;

    updatePostMutation.mutate({ postId: editingPost.id, post: { content } }, {
      onSuccess: () => {
        toast.success("Cập nhật bình luận thành công");
        setEditingPost(null);
        textEditorRef.current?.setContent("");
        queryClient.invalidateQueries({
          queryKey: ['forum-topic-posts', topicId],
        });
      },
      onError: (error) => {
        toast.error("Không thể cập nhật bình luận: " + (error.response?.data.message || error.message));
      }
    });
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
            <CommentCard
              key={post.id}
              post={post}
              commentNumber={index + 1}
              onReplyClick={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>

        <TextEditor
          ref={textEditorRef}
          topicId={topicId}
          onAfterPostCreate={handleAfterPostCreate}
          isEditing={!!editingPost}
          onCancel={handleCancelEdit}
          onUpdate={handleUpdatePost}
        />
        <ApiPagination
          pagination={postsQuery.data}
          onPageChange={handlePageChange}
        />
      </div>

      <Dialog open={!!deletingPostId} onOpenChange={(open) => !open && setDeletingPostId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa bình luận này không? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingPostId(null)}>Hủy</Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>Xóa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const Route = createLazyRoute('/public/forum/topic/$topicId')({
  component: TopicDetail
})
