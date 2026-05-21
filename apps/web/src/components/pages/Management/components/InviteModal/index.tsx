// External Libraries
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"

// Components
import { Button } from "@/components/structure/Button"
import { Typography } from "@/components/structure/Typography"
import { InviteField } from "./components/InviteField"

// Types
import { Modal, ModalMethods } from "@/components/structure/Modal"
import { InviteModalMethods, InviteModalProps } from "./types"

export const InviteModal = forwardRef<InviteModalMethods, InviteModalProps>(
  ({ invite }, ref) => {
    const modalRef = useRef<ModalMethods>(null)

    // Hooks
    useImperativeHandle(ref, () => ({ close, open, toggle }))

    // States
    const [hasCopiedInvite, setHasCopiedInvite] = useState(false)

    // Effects
    useEffect(() => {
      setHasCopiedInvite(false)
    }, [])

    // Functions
    function close() {
      setHasCopiedInvite(false)
      return modalRef.current?.close()
    }

    function open() {
      setHasCopiedInvite(false)
      return modalRef.current?.open()
    }

    function toggle() {
      setHasCopiedInvite(false)
      return modalRef.current?.toggle()
    }

    async function handleCopyInvite() {
      if (!invite.copyText || !navigator.clipboard?.writeText) return

      await navigator.clipboard.writeText(invite.copyText)
      setHasCopiedInvite(true)
    }

    return (
      <Modal ref={modalRef} className="max-w-xl">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2 justify-start">
            <Typography variant="h4" value="Convite de usuario" />

            <Typography
              variant="b1"
              color="secondary"
              fontWeight="light"
              value="Usuario convidado com sucesso. Compartilhe os dados abaixo."
            />
          </div>

          <div className="rounded-2xl border border-border-subtle bg-surface-page p-4">
            <InviteField label="URL de convite" value={invite.invitationUrl} />
          </div>

          <div className="rounded-2xl border border-border-subtle bg-surface-page p-4">
            <Typography
              variant="b1"
              value="A troca de senha sera obrigatoria assim que o funcionario entrar na aplicacao."
            />
          </div>

          {hasCopiedInvite ? (
            <Typography
              variant="b2"
              value="Convite copiado para a area de transferencia."
              className="text-success-700"
            />
          ) : null}

          <div className="flex flex-row justify-between gap-4">
            <Button
              fitWidth
              value="Fechar"
              color="primary"
              variant="outlined"
              onClick={close}
            />

            <Button
              fitWidth
              value="Copiar convite"
              disabled={!invite.copyText}
              onClick={handleCopyInvite}
            />
          </div>
        </div>
      </Modal>
    )
  }
)

InviteModal.displayName = "InviteModal"
