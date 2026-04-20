export interface ModalContextValue {
  activeModalId: string | null
  closeModal: () => void
  openModal: (id: string) => void
}
