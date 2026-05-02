import type { PointRecord } from "@/components/pages/PointRegister/types"

import type { AdjustmentRequestForm } from "../types"

const INITIAL_RECORD_TIME = "08:00"

export function makeInitialForm(): AdjustmentRequestForm {
  return {
    justification: "",
    records: [],
  }
}

export function buildCurrentForm(records: PointRecord[]) {
  return {
    justification: "",
    records: records.map((record) => ({ ...record })),
  }
}

export function buildNewRecord(
  currentRecords: PointRecord[],
  workdayDate?: string,
  records?: PointRecord[]
) {
  return {
    id: Date.now(),
    workdayDate: workdayDate ?? records?.[0]?.workdayDate,
    time: INITIAL_RECORD_TIME,
    workedHours: "00h 00min",
    extraHours: "00h 00min",
    missingHours: "00h 00min",
    type: getNextPointType(currentRecords),
    status: "Registrado",
  } satisfies PointRecord
}

export function resolveWorkdayDate(
  workdayDate: string | undefined,
  records: PointRecord[],
  formRecords: PointRecord[]
) {
  return workdayDate ?? records[0]?.workdayDate ?? formRecords[0]?.workdayDate
}

function getNextPointType(records: PointRecord[]) {
  return records[records.length - 1]?.type === "Entrada" ? "Saida" : "Entrada"
}
