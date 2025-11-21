import { useMutation } from "@tanstack/react-query";
import api from "./api";
import type { AxiosError } from "axios";
import type { UserResponseDTO, RegisterDTO, LoginDTO } from "../types/user";
import type { ErrorMessage } from "../types/common";

export function useRegister() {
  return useMutation<UserResponseDTO, AxiosError<ErrorMessage>, RegisterDTO>({
    mutationFn: async (payload: RegisterDTO): Promise<UserResponseDTO> => {
      const res = await api.post<UserResponseDTO>("/auth/register", payload);
      return res.data;
    },
  });
}

export function useLogin() {
  return useMutation<UserResponseDTO, AxiosError<ErrorMessage>, LoginDTO>({
    mutationFn: async (payload: LoginDTO): Promise<UserResponseDTO> => {
      const res = await api.post<UserResponseDTO>("/auth/login", payload);
      return res.data;
    },
  });
}
