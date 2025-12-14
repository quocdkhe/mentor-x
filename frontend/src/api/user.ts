import type { Message } from "@/types/common";
import type { UpdateProfile, UserResponseDTO } from "@/types/user";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import api from "./api";

export function useUpdateProfile() {
  return useMutation<Message, AxiosError<Message>, UpdateProfile>({
    mutationFn: async (payload: UpdateProfile): Promise<Message> => {
      const res = await api.put<Message>("/users/profile", payload);
      return res.data;
    },
  });
}

export function useGetCurrentUser() {
  return useQuery<UserResponseDTO, AxiosError<Message>>({
    queryKey: ["current-user"],
    queryFn: async (): Promise<UserResponseDTO> => {
      const res = await api.get<UserResponseDTO>("/users/self");
      return res.data;
    },
    staleTime: 1000 * 60 * 10, // optional: cache for 10 minutes
  });
}
