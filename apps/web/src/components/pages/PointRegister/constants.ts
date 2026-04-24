import type { PointRecord } from "./types"

export const POINT_RECORDS: PointRecord[] = [
  {
    id: 1,
    time: "08:00:00",
    workedHours: "08h 00min",
    extraHours: "00h 00min",
    missingHours: "00h 00min",
    type: "Entrada",
    status: "Registrado",
  },
  {
    id: 2,
    time: "12:00:00",
    workedHours: "08h 00min",
    extraHours: "00h 30min",
    missingHours: "00h 00min",
    type: "Saída",
    status: "Registrado",
  },
  {
    id: 3,
    time: "13:30:00",
    workedHours: "06h 45min",
    extraHours: "00h 00min",
    missingHours: "01h 15min",
    type: "Entrada",
    status: "Pendente",
  },
  {
    id: 4,
    time: "18:00:00",
    workedHours: "08h 00min",
    extraHours: "00h 00min",
    missingHours: "00h 00min",
    type: "Saída",
    status: "Aprovado",
  },
]
