import type { Message } from "@/types/common";
import type { AdminCreateUser ,UpdateProfile, UpdateRole, UserResponseDTO } from "@/types/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
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

export function useGetUserList(){
  return useQuery<UserResponseDTO[], AxiosError<Message>>({
    queryKey: ["users"],
    queryFn: async (): Promise<UserResponseDTO[]> => {
      const res = await api.get<UserResponseDTO[]>("/users");
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // optional: cache for 10 minutes
  })
}

export function usePatchUser(){
  const queryClient = useQueryClient();

  return useMutation<UserResponseDTO, AxiosError<Message>, UpdateRole>(
    {
      mutationFn: async ({ id, role}): Promise<UserResponseDTO> => {
        const res = await api.patch<UserResponseDTO>(`/users/role`, {
        id,
        role,
      });
      return res.data;
      },
      onSuccess: () => {
      // Invalidate users list to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    }
  )
}

export function usePostUser(){
  const queryClient = useQueryClient();

  return useMutation<UserResponseDTO, AxiosError<Message>, AdminCreateUser>(
    {
      mutationFn: async (userData): Promise<UserResponseDTO> =>{
        const res = await api.post<UserResponseDTO>(`/users`, userData);
        return res.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["users"]})
      }
    }
  )
}