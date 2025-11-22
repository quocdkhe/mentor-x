import type { Message } from "@/types/common";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import api from "./api";

export function useUpdateAvatar() {
  return useMutation<string, AxiosError<Message>, File>({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("File", file);

      const res = await api.put("/user/update-avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return res.data.url; // .NET returns { url: "..." }
    },
  });
}
