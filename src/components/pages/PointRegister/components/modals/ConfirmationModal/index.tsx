// External Libraries
import { forwardRef, useImperativeHandle, useRef } from "react"

// Components
import { Button } from "@/components/structure/Button"
import { Modal } from "@/components/structure/Modal"
import { Typography } from "@/components/structure/Typography"

// Types
import type { ModalMethods } from "@/components/structure/Modal/types"
import type { ConfirmationModalMethods, ConfirmationModalProps } from "./types"

export const ConfirmationModal = forwardRef<
  ConfirmationModalMethods,
  ConfirmationModalProps
>(({ currentTime, onConfirm }, ref) => {
  // Refs
  const modalRef = useRef<ModalMethods>(null)

  // Functions
  function handleCancel() {
    modalRef.current?.close()
  }

  function handleConfirm() {
    onConfirm()
    modalRef.current?.close()
  }

  useImperativeHandle(
    ref,
    () => ({
      close: () => modalRef.current?.close(),
      open: () => modalRef.current?.open(),
      toggle: () => modalRef.current?.toggle(),
    }),
    []
  )

  return (
    <Modal ref={modalRef}>
      <div className="flex flex-col gap-5">
        <div>
          <Typography variant="h4" value="Confirmar registro de ponto" />
          <Typography
            variant="b2"
            className="mt-2"
            value={`Deseja registrar seu ponto agora às ${currentTime}?`}
          />
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            value="Cancelar"
            fitWidth
            color="danger"
            variant="outlined"
            onClick={handleCancel}
          />
          <Button
            fitWidth
            value="Confirmar"
            variant="filled"
            onClick={handleConfirm}
          />
        </div>
      </div>
    </Modal>
  )
})

ConfirmationModal.displayName = "ConfirmationModal"
