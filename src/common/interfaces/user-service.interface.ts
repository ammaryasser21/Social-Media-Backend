export type ConfirmEmailType = {
    email: string,
    otp: string
}

export type PasswordType = {
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
}