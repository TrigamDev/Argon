import { atom } from "nanostores"

// Universal
export const size = atom(0) // bytes

// Image/Video
export const dimensions = atom({ width: 0, height: 0 })

// Video/Audio
export const duration = atom(0) // seconds

// Audio
export const playing = atom(false)
export const volume = atom(50)
export const muted = atom(false)
export const loop = atom(true)