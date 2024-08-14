import { atom } from "nanostores"

export const dimensions = atom({ width: 0, height: 0 })
export const size = atom(0) // bytes
export const duration = atom(0) // seconds