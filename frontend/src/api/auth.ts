import { useMutation } from "@tanstack/react-query";
import api from "./api";
import type { AxiosError } from "axios";

type UserResponseDTO = {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  role: string;
};

type RegisterDTO = {
  name: string;
  phone: string;
  email: string;
  password: string;
};

type LoginDTO = {
  email: string;
  password: string;
};

type ErrorMessage = {
  message: string;
};

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
