import type { NavigationItem } from "./types"

export const SIDEBAR_ITEMS: NavigationItem[] = [
  {
    id: "point",
    label: "Ponto",
    icon: "timer",
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
    icon: "analysis",
    href: "/analytics",
  },
  {
    id: "management",
    label: "Gerenciamento",
    icon: "company",
    href: "/management",
  },
  {
    id: "holydays",
    label: "Feriados",
    icon: "flag",
    href: "/holydays",
  },
  {
    id: "solicitations",
    label: "Ajustes Pendentes",
    icon: "update",
    href: "/solicitations",
  },
]
