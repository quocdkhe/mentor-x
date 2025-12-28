import { useRef, useMemo, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import type { AxiosError, AxiosProgressEvent } from 'axios';
import api from '@/api/api'; // Your API path
import type { Message } from '@/types/common'; // Your types
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider'; // Import your hook
import { useCreatePost } from '@/api/forum';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';

interface TextEditorProps {
  initContent?: string;
  topicId: string;
  onAfterPostCreate: (page: number) => void;
}

export default function TextEditor({ initContent, topicId, onAfterPostCreate }: TextEditorProps) {
  const editorRef = useRef<string>(initContent || "abc");
  const apiKey = import.meta.env.VITE_TINYMCE_API_KEY || 'no-api-key';
  const createPostMutation = useCreatePost(topicId);
  const pageSize = 10;
  const { theme } = useTheme();

  const isDark = useMemo(() => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return theme === 'dark';
  }, [theme]);

  const [loadedTheme, setLoadedTheme] = useState<"dark-mode" | "light-mode" | null>(null);
  const currentThemeKey = isDark ? "dark-mode" : "light-mode";
  const isLoading = loadedTheme !== currentThemeKey;

  const onSubmit = (content: string) => {
    createPostMutation.mutate({ content }, {
      onSuccess: (data) => {
        editorRef.current = "";
        toast.success("Đăng bài thành công");
        const lastPage = Math.ceil(data.totalCount / pageSize)
        onAfterPostCreate?.(lastPage);
      },
      onError: (err) => {
        const backendMessage =
          err.response?.data.message || "Đã xảy ra lỗi, vui lòng thử lại.";
        toast.error(`Thất bại: ${backendMessage}`);
      },
    });
  };

  const handleImageUpload = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      <div className="relative min-h-[400px]">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
            <Spinner />
          </div>
        )}
        <div style={{ opacity: isLoading ? 0 : 1 }} className="transition-opacity duration-200">
          <Editor
            // This makes TinyMCE reload with the new skin
            key={currentThemeKey}

            apiKey={apiKey}
            onInit={() => {
              setLoadedTheme(currentThemeKey);
            }}

            // 5. Use 'value' + 'onEditorChange' instead of 'initialValue'
            value={initContent || ""}
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
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button disabled={createPostMutation.isPending} onClick={() => onSubmit(editorRef.current)}>
          {createPostMutation.isPending && <Spinner />} Đăng bình luận
        </Button>
      </div>
    </>
  );
}