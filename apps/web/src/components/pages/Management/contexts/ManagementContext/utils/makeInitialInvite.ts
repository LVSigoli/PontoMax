import { UserInviteApiItem } from "@/services/domain"

export function makeInitialInvite(): UserInviteApiItem {
  return {
    email: "",
    copyText: "",
    invitationUrl: "",
    requiresPasswordChange: true,
  }
}
