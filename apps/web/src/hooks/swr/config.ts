import type { SWRConfiguration } from "swr"

export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  shouldRetryOnError: false,
  dedupingInterval: 10_000,
  focusThrottleInterval: 10_000,
  keepPreviousData: true,
}
