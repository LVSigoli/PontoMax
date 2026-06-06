export interface CurrentLocation {
  latitude: number
  longitude: number
  accuracyMeters: number | null
}

const LOCATION_TIMEOUT_MS = 10000
const REGISTER_LOCATION_TIMEOUT_MS = 4000
const REGISTER_LOCATION_MAXIMUM_AGE_MS = 5 * 60 * 1000

export async function ensureLocationPermission() {
  const permissionState = await getLocationPermissionState()

  if (permissionState === "granted") {
    return
  }

  if (permissionState === "denied") {
    throw new Error("Permita o acesso a localizacao para registrar o ponto.")
  }

  await requestCurrentLocation()
}

export async function requestCurrentLocation(): Promise<CurrentLocation> {
  return requestCurrentLocationWithOptions({
    enableHighAccuracy: true,
    timeout: LOCATION_TIMEOUT_MS,
    maximumAge: 0,
  })
}

export async function requestCurrentLocationForRegister(): Promise<CurrentLocation | null> {
  const permissionState = await getLocationPermissionState()

  if (permissionState !== "granted") {
    return null
  }

  const locationPromise = requestCurrentLocationWithOptions({
    enableHighAccuracy: false,
    timeout: REGISTER_LOCATION_TIMEOUT_MS,
    maximumAge: REGISTER_LOCATION_MAXIMUM_AGE_MS,
  }).catch(() => null)

  const timeoutPromise = new Promise<null>((resolve) => {
    window.setTimeout(() => resolve(null), REGISTER_LOCATION_TIMEOUT_MS)
  })

  return Promise.race([locationPromise, timeoutPromise])
}

async function requestCurrentLocationWithOptions(options: {
  enableHighAccuracy: boolean
  timeout: number
  maximumAge: number
}): Promise<CurrentLocation> {
  if (typeof window === "undefined" || !("navigator" in window)) {
    throw new Error("Nao foi possivel acessar a localizacao neste dispositivo.")
  }

  if (!navigator.geolocation) {
    throw new Error("Seu navegador nao oferece suporte a localizacao.")
  }

  return new Promise<CurrentLocation>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracyMeters: Number.isFinite(position.coords.accuracy)
            ? position.coords.accuracy
            : null,
        })
      },
      (error) => {
        reject(new Error(getGeolocationErrorMessage(error)))
      },
      {
        enableHighAccuracy: options.enableHighAccuracy,
        timeout: options.timeout,
        maximumAge: options.maximumAge,
      }
    )
  })
}

async function getLocationPermissionState() {
  if (
    typeof window === "undefined" ||
    !("navigator" in window) ||
    !navigator.geolocation
  ) {
    return "unsupported" as const
  }

  if (!navigator.permissions?.query) {
    return "prompt" as const
  }

  try {
    const permissionStatus = await navigator.permissions.query({
      name: "geolocation" as PermissionName,
    })

    return permissionStatus.state
  } catch {
    return "prompt" as const
  }
}

function getGeolocationErrorMessage(error: GeolocationPositionError) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Permita o acesso a localizacao para registrar o ponto."
    case error.POSITION_UNAVAILABLE:
      return "Nao foi possivel obter sua localizacao no momento."
    case error.TIMEOUT:
      return "A captura da localizacao demorou mais do que o esperado."
    default:
      return "Nao foi possivel capturar sua localizacao."
  }
}
