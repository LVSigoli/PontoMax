// Types
import type { SelectionOption } from "@/components/structure/Select/types"
import type { Solicitation } from "./types"

export const INITIAL_SOLICITATIONS: Solicitation[] = [
  {
    id: 1,
    userName: "Lucas Vinicius Sigoli",
    requestDate: "2026-03-08",
    requestedAt: "08/03/2026",
    justification: "Tive que finalizar mais cedo por conta de compromissos pessoas",
    status: "Pendente",
    points: [
      { id: 1, time: "08h e 00 min", type: "Entrada" },
      { id: 2, time: "08h e 00 min", type: "Saida" },
      { id: 3, time: "08h e 00 min", type: "Entrada" },
      { id: 4, time: "08h e 00 min", type: "Saida" },
    ],
  },
  {
    id: 2,
    userName: "Lucas Vinicius Sigoli",
    requestDate: "2026-03-08",
    requestedAt: "08/03/2026",
    justification: "Tive que finalizar mais cedo por conta de compromissos pessoais",
    status: "Pendente",
    points: [
      { id: 1, time: "08h e 00 min", type: "Entrada" },
      { id: 2, time: "08h e 00 min", type: "Saida" },
    ],
  },
  {
    id: 3,
    userName: "Lucas Vinicius Sigoli",
    requestDate: "2026-03-08",
    requestedAt: "08/03/2026",
    justification: "Tive que finalizar mais cedo por conta de compromissos pessoais",
    status: "Pendente",
    points: [
      { id: 1, time: "08h e 00 min", type: "Entrada" },
      { id: 2, time: "08h e 00 min", type: "Saida" },
    ],
  },
  {
    id: 4,
    userName: "Lucas Sigoli",
    requestDate: "2026-03-08",
    requestedAt: "08/03/2026",
    justification: "Tive que finalizar mais cedo por conta de compromissos pessoais",
    status: "Pendente",
    points: [
      { id: 1, time: "08h e 00 min", type: "Entrada" },
      { id: 2, time: "08h e 00 min", type: "Saida" },
    ],
  },
  {
    id: 5,
    userName: "Lucas Vinicius Sigoli",
    requestDate: "2026-03-08",
    requestedAt: "08/03/2026",
    justification: "Tive que finalizar mais cedo por conta de compromissos pessoais",
    status: "Pendente",
    points: [
      { id: 1, time: "08h e 00 min", type: "Entrada" },
      { id: 2, time: "08h e 00 min", type: "Saida" },
    ],
  },
  {
    id: 6,
    userName: "Lucas Vinicius Sigoli",
    requestDate: "2026-03-08",
    requestedAt: "08/03/2026",
    justification: "Tive que finalizar mais cedo por conta de compromissos pessoais",
    status: "Pendente",
    points: [
      { id: 1, time: "08h e 00 min", type: "Entrada" },
      { id: 2, time: "08h e 00 min", type: "Saida" },
    ],
  },
  {
    id: 7,
    userName: "Lucas Vinicius Sigoli",
    requestDate: "2026-03-08",
    requestedAt: "08/03/2026",
    justification: "Tive que finalizar mais cedo por conta de compromissos pessoais",
    status: "Aprovado",
    points: [
      { id: 1, time: "08h e 00 min", type: "Entrada" },
      { id: 2, time: "08h e 00 min", type: "Saida" },
    ],
  },
  {
    id: 8,
    userName: "Lucas Vinicius Sigoli",
    requestDate: "2026-03-08",
    requestedAt: "08/03/2026",
    justification: "Tive que finalizar mais cedo por conta de compromissos pessoais",
    status: "Aprovado",
    points: [
      { id: 1, time: "08h e 00 min", type: "Entrada" },
      { id: 2, time: "08h e 00 min", type: "Saida" },
    ],
  },
  {
    id: 9,
    userName: "Lucas Vinicius Sigoli",
    requestDate: "2026-03-08",
    requestedAt: "08/03/2026",
    justification: "Tive que finalizar mais cedo por conta de compromissos pessoais",
    status: "Recusado",
    points: [
      { id: 1, time: "08h e 00 min", type: "Entrada" },
      { id: 2, time: "08h e 00 min", type: "Saida" },
    ],
  },
  {
    id: 10,
    userName: "Lucas Vinicius Sigoli",
    requestDate: "2026-03-08",
    requestedAt: "08/03/2026",
    justification: "Tive que finalizar mais cedo por conta de compromissos pessoais",
    status: "Recusado",
    points: [
      { id: 1, time: "08h e 00 min", type: "Entrada" },
      { id: 2, time: "08h e 00 min", type: "Saida" },
    ],
  },
]

export const SOLICITATION_STATUS_OPTIONS: SelectionOption[] = [
  { value: "all", label: "Selecione..." },
  { value: "Pendente", label: "Pendente" },
  { value: "Aprovado", label: "Aprovado" },
  { value: "Recusado", label: "Recusado" },
]
