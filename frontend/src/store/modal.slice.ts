import { createSlice } from "@reduxjs/toolkit";

type ModalType = "login" | "register" | null;

interface ModalState {
  openModal: ModalType;
}

const initialState: ModalState = {
  openModal: null,
};

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openLoginModal: (state) => {
      state.openModal = "login";
    },
    toggleLoginModal: (state) => {
      state.openModal = state.openModal === "login" ? null : "login";
    },
    openRegisterModal: (state) => {
      state.openModal = "register";
    },
    toggleRegisterModal: (state) => {
      state.openModal = state.openModal === "register" ? null : "register";
    },
    closeModal: (state) => {
      state.openModal = null;
    },
  },
});

export const {
  openLoginModal,
  toggleLoginModal,
  openRegisterModal,
  toggleRegisterModal,
  closeModal,
} = modalSlice.actions;
export default modalSlice.reducer;
