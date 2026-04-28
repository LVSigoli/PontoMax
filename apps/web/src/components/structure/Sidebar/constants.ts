import type { NavigationItem } from "./types"

export const SIDEBAR_ITEMS: NavigationItem[] = [
  {
    id: "point",
    label: "Ponto",
    icon: "point",
    href: "/",
  },
  {
    id: "history",
    label: "Histórico",
    icon: "history",
    href: "/history",
  },
  {
    id: "analytics",
    label: "Análises",
    icon: "analytics",
    href: "/analytics",
  },
  {
    id: "management",
    label: "Gerenciamento",
    icon: "management",
    href: "/management",
  },
  {
    id: "holydays",
    label: "Feriados",
    icon: "holiday,",
    href: "/holydays",
  },
  {
    id: "solicitations",
    label: "Ajustes Pendentes",
    icon: "solicitation",
    href: "/solicitations",
  },
]
