import type { Message } from "@/types/common";
import type { UpdateProfile } from "@/types/user";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import api from "./api";

export function useUpdateProfile() {
  return useMutation<Message, AxiosError<Message>, UpdateProfile>({
    mutationFn: async (payload: UpdateProfile): Promise<Message> => {
      const res = await api.put<Message>("/user/profile", payload);
      return res.data;
    },
  });
}
