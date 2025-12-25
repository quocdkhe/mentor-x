import { useRef, useState, useMemo } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import type { AxiosError, AxiosProgressEvent } from 'axios';
import api from '@/api/api'; // Your API path
import type { Message } from '@/types/common'; // Your types
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider'; // Import your hook

export default function TextEditor() {
  const editorRef = useRef<any>(null);
  const apiKey = import.meta.env.VITE_TINYMCE_API_KEY || 'no-api-key';

  // 1. Get the global theme
  const { theme } = useTheme();

  // 2. State to hold content (CRITICAL: Preserves text when theme toggles)
  const [content, setContent] = useState("<p>Start editing...</p>");

  // 3. Calculate "Effective" Theme (Dark or Light)
  // This resolves 'system' preference to an actual color scheme
  const isDark = useMemo(() => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return theme === 'dark';
  }, [theme]);

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
        value={content}
        onEditorChange={(newValue) => setContent(newValue)}

        init={{
          height: 400,
          menubar: false,
          plugins: ['image', 'link', 'lists'],
          toolbar: 'undo redo | formatselect | bold italic | image | code | bullist numlist | link',
          images_upload_handler: handleImageUpload,
          language: 'vi',

          // 6. Dynamic Skin Configuration
          skin: isDark ? "oxide-dark" : "snow",
          content_css: isDark ? "dark" : "default",
        }}
      />
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline">Hủy</Button>
        <Button onClick={() => console.log(content)}>Đăng bình luận</Button>
      </div>
    </>
  );
}