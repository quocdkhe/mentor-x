import type { ErrorMessage } from "@/types/common";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import api from "./api";

type UpdateFilePayload = {
  fileUrl: string;
  file: File;
};

export function useUploadFile() {
  return useMutation<ErrorMessage, AxiosError<ErrorMessage>, File>({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("File", file);
      const res = await api.post<ErrorMessage>("/file/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    },
  });
}

export function useUpdateFile() {
  return useMutation<ErrorMessage, AxiosError<ErrorMessage>, UpdateFilePayload>(
    {
      mutationFn: async ({ fileUrl, file }) => {
        const formData = new FormData();
        formData.append("File", file);

        const res = await api.put<ErrorMessage>(`/file/update`, formData, {
          params: { fileUrl },
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        return res.data;
      },
    },
  );
}
