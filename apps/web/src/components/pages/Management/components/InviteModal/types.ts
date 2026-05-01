import type { ModalMethods } from "@/components/structure/Modal"
import type { UserInviteApiItem } from "@/services/domain"

export type InviteModalMethods = ModalMethods

export interface InviteModalProps {
  invite: UserInviteApiItem
}
