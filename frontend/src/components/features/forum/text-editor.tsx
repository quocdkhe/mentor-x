import { useRef, useMemo } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import type { AxiosError, AxiosProgressEvent } from 'axios';
import api from '@/api/api'; // Your API path
import type { Message } from '@/types/common'; // Your types
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider'; // Import your hook
import { useCreatePost } from '@/api/forum';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';

export default function TextEditor({ initContent, topicId }: { initContent?: string, topicId: string }) {
  const editorRef = useRef<string>(initContent || "");
  const apiKey = import.meta.env.VITE_TINYMCE_API_KEY || 'no-api-key';
  const createPostMutation = useCreatePost(topicId);
  const { theme } = useTheme();

  const isDark = useMemo(() => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return theme === 'dark';
  }, [theme]);

  const onSubmit = (content: string) => {
    createPostMutation.mutate({ content }, {
      onSuccess: (data) => {
        editorRef.current = "";
        toast.success(data.message);
      },
      onError: (err) => {
        const backendMessage =
          err.response?.data.message || "Đã xảy ra lỗi, vui lòng thử lại.";
        toast.error(`Thất bại: ${backendMessage}`);
      },
    });
  };

  const handleImageUpload = (
    blobInfo: any,
    progress: (percent: number) => void
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("File", blobInfo.blob(), blobInfo.filename());

      api.post<Message>("/file/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e: AxiosProgressEvent) => {
          if (e.total) progress((e.loaded / e.total) * 100);
        }
      })
        .then((res) => {
          if (res.data?.message) resolve(res.data.message);
          else reject("Invalid response from server");
        })
        .catch((error: AxiosError<Message>) => {
          reject("Image upload failed: " + (error.response?.data?.message || error.message));
        });
    });
  };
  return (
    <>
      <Editor
        // This makes TinyMCE reload with the new skin
        key={isDark ? "dark-mode" : "light-mode"}

        apiKey={apiKey}
        onInit={(evt, editor) => (editorRef.current = editor)}

        // 5. Use 'value' + 'onEditorChange' instead of 'initialValue'
        value={editorRef.current}
        onEditorChange={(newValue) => editorRef.current = newValue}

        init={{
          height: 400,
          menubar: false,
          plugins: ['image', 'link', 'lists', 'code'],
          toolbar: 'undo redo | formatselect | bold italic | image | code | bullist numlist | link',
          images_upload_handler: handleImageUpload,
          language: 'vi',

          // 6. Dynamic Skin Configuration
          skin: isDark ? "oxide-dark" : "snow",
          content_css: isDark ? "dark" : "default",
        }}
      />
      <div className="flex justify-end gap-2 mt-4">
        <Button disabled={createPostMutation.isPending} onClick={() => onSubmit(editorRef.current)}>
          {createPostMutation.isPending && <Spinner />} Đăng bình luận
        </Button>
      </div>
    </>
  );
}