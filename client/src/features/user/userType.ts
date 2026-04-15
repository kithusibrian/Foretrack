export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture: string;
}
export interface UpdateUserResponse {
  data: User;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface DeleteAccountPayload {
  currentPassword: string;
  confirmationText: string;
}

export interface DeleteAccountResponse {
  message: string;
}
