import {
  useRef,
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Editor } from "@tinymce/tinymce-react";
import type { AxiosError, AxiosProgressEvent } from "axios";
import api from "@/api/api"; // Your API path
import type { Message } from "@/types/common"; // Your types
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider"; // Import your hook
import { useCreatePost } from "@/api/forum";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useQueryClient } from "@tanstack/react-query";

interface TextEditorProps {
  initContent?: string;
  topicId: string;
  onAfterPostCreate: (lastPage: number) => void;
  isEditing?: boolean;
  onCancel?: () => void;
  onUpdate?: (content: string) => void;
}

export interface TextEditorHandle {
  focus: () => void;
  insertContent: (content: string) => void;
  setContent: (content: string) => void;
}

const TextEditor = forwardRef<TextEditorHandle, TextEditorProps>(
  (
    { initContent, topicId, onAfterPostCreate, isEditing, onCancel, onUpdate },
    ref,
  ) => {
    const editorRef = useRef<string>(initContent || "abc");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const editorInstanceRef = useRef<any>(null);
    const apiKey = import.meta.env.VITE_TINYMCE_API_KEY || "no-api-key";
    const createPostMutation = useCreatePost(topicId);
    const pageSize = 10;
    const { theme } = useTheme();
    const queryClient = useQueryClient();

    useImperativeHandle(ref, () => ({
      focus: () => {
        if (editorInstanceRef.current) {
          editorInstanceRef.current.focus();
          editorInstanceRef.current
            .getContainer()
            .scrollIntoView({ behavior: "smooth", block: "center" });
        }
      },
      insertContent: (content: string) => {
        if (editorInstanceRef.current) {
          editorInstanceRef.current.insertContent(content);
        }
      },
      setContent: (content: string) => {
        if (editorInstanceRef.current) {
          editorInstanceRef.current.setContent(content);
          editorRef.current = content;
        }
      },
    }));

    const isDark = useMemo(() => {
      return theme === "dark";
    }, [theme]);

    const [loadedTheme, setLoadedTheme] = useState<
      "dark-mode" | "light-mode" | null
    >(null);
    const currentThemeKey = isDark ? "dark-mode" : "light-mode";
    const isLoading = loadedTheme !== currentThemeKey;

    const onSubmit = (content: string) => {
      if (isEditing && onUpdate) {
        onUpdate(content);
        return;
      }

      createPostMutation.mutate(
        { content },
        {
          onSuccess: (data) => {
            editorRef.current = "";
            if (editorInstanceRef.current) {
              editorInstanceRef.current.setContent("");
            }
            toast.success("Đăng bài thành công");
            const lastPage = Math.ceil(data.totalCount / pageSize);
            onAfterPostCreate?.(lastPage);
            queryClient.invalidateQueries({
              queryKey: ["forum-topic-posts", topicId],
            });
          },
          onError: (err) => {
            const backendMessage =
              err.response?.data.message || "Đã xảy ra lỗi, vui lòng thử lại.";
            toast.error(`Thất bại: ${backendMessage}`);
          },
        },
      );
    };

    const handleImageUpload = (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      blobInfo: any,
      progress: (percent: number) => void,
    ): Promise<string> => {
      return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append("File", blobInfo.blob(), blobInfo.filename());

        api
          .post<Message>("/file/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (e: AxiosProgressEvent) => {
              if (e.total) progress((e.loaded / e.total) * 100);
            },
          })
          .then((res) => {
            if (res.data?.message) resolve(res.data.message);
            else reject("Invalid response from server");
          })
          .catch((error: AxiosError<Message>) => {
            reject(
              "Image upload failed: " +
                (error.response?.data?.message || error.message),
            );
          });
      });
    };
    return (
      <>
        <div className="relative min-h-[400px]">
          {isEditing && (
            <div className="mb-4 bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-200 p-4 rounded shadow-sm animate-in fade-in duration-300">
              <p className="font-bold text-lg">Đang sửa bài viết</p>
              <p className="text-sm opacity-90">
                Bạn đang chỉnh sửa nội dung bài viết của mình.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
              <Spinner />
            </div>
          )}
          <div
            style={{ opacity: isLoading ? 0 : 1 }}
            className="transition-opacity duration-200"
          >
            <Editor
              // This makes TinyMCE reload with the new skin
              key={currentThemeKey}
              apiKey={apiKey}
              onInit={(_evt, editor) => {
                editorInstanceRef.current = editor;
                setLoadedTheme(currentThemeKey);
              }}
              // 5. Use 'value' + 'onEditorChange' instead of 'initialValue'
              onEditorChange={(newValue) => (editorRef.current = newValue)}
              initialValue={initContent || ""}
              init={{
                height: 400,
                menubar: false,
                plugins: ["image", "link", "lists", "code"],
                toolbar:
                  "undo redo | formatselect | bold italic | image | code | bullist numlist | link",
                images_upload_handler: handleImageUpload,
                language: "vi",

                // 6. Dynamic Skin Configuration
                skin: isDark ? "oxide-dark" : "snow",
                content_css: isDark ? "dark" : "default",
              }}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          {isEditing && (
            <Button variant="destructive" onClick={onCancel} className="gap-2">
              Hủy
            </Button>
          )}
          <Button
            disabled={createPostMutation.isPending}
            onClick={() => onSubmit(editorRef.current)}
            className={isEditing ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            {createPostMutation.isPending && <Spinner />}
            {isEditing ? "Lưu thay đổi" : "Đăng bình luận"}
          </Button>
        </div>
      </>
    );
  },
);

export default TextEditor;
