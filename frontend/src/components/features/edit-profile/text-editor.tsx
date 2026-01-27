import {
  useRef,
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Editor } from "@tinymce/tinymce-react";
import type { AxiosError, AxiosProgressEvent } from "axios";
import api from "@/api/api";
import type { Message } from "@/types/common";
import { useTheme } from "@/components/theme-provider";
import { Spinner } from "@/components/ui/spinner";

interface ProfileTextEditorProps {
  initContent?: string;
  value?: string;
  onChange?: (content: string) => void;
}

export interface ProfileTextEditorHandle {
  focus: () => void;
  insertContent: (content: string) => void;
  setContent: (content: string) => void;
}

const ProfileTextEditor = forwardRef<
  ProfileTextEditorHandle,
  ProfileTextEditorProps
>(({ initContent, value, onChange }, ref) => {
  const editorRef = useRef<string>(value || initContent || "");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorInstanceRef = useRef<any>(null);
  const apiKey = import.meta.env.VITE_TINYMCE_API_KEY || "no-api-key";
  const { theme } = useTheme();

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
    <div className="relative min-h-[400px]">
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
          key={currentThemeKey}
          apiKey={apiKey}
          onInit={(_evt, editor) => {
            editorInstanceRef.current = editor;
            setLoadedTheme(currentThemeKey);
          }}
          value={value}
          initialValue={!value && initContent ? initContent : undefined}
          onEditorChange={(newValue) => {
            editorRef.current = newValue;
            onChange?.(newValue);
          }}
          init={{
            height: 400,
            menubar: false,
            plugins: ["image", "link", "lists", "code"],
            toolbar:
              "undo redo | formatselect | bold italic | image | code | bullist numlist | link",
            images_upload_handler: handleImageUpload,
            language: "vi",
            skin: isDark ? "oxide-dark" : "snow",
            content_css: isDark ? "dark" : "default",
          }}
        />
      </div>
    </div>
  );
});

export default ProfileTextEditor;
