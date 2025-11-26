import { useMutation, useQuery } from "@tanstack/react-query";
import api from "./api";
import type { AxiosError } from "axios";
import type { UserResponseDTO, RegisterDTO, LoginDTO } from "../types/user";
import type { Message } from "../types/common";

export function useRegister() {
  return useMutation<UserResponseDTO, AxiosError<Message>, RegisterDTO>({
    mutationFn: async (payload: RegisterDTO): Promise<UserResponseDTO> => {
      const res = await api.post<UserResponseDTO>("/auth/register", payload);
      return res.data;
    },
  });
}

export function useLogin() {
  return useMutation<UserResponseDTO, AxiosError<Message>, LoginDTO>({
    mutationFn: async (payload: LoginDTO): Promise<UserResponseDTO> => {
      const res = await api.post<UserResponseDTO>("/auth/login", payload);
      return res.data;
    },
  });
}

export function useLogout() {
  return useMutation<Message, AxiosError<Message>>({
    mutationFn: async (): Promise<Message> => {
      const res = await api.post<Message>("/auth/logout");
      return res.data;
    },
  });
}

export function useGetCurrentUser() {
  return useQuery<UserResponseDTO, AxiosError<Message>>({
    queryKey: ["current-user"],
    queryFn: async (): Promise<UserResponseDTO> => {
      const res = await api.get<UserResponseDTO>("/auth/self");
      return res.data;
    },
    staleTime: 1000 * 60 * 10, // optional: cache for 10 minutes
  });
}
