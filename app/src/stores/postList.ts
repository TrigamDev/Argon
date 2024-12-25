import { atom } from "nanostores"

import type { Post, Tag } from "@argon/util/types"
import { Sorts } from "@argon/util/types"

export const postList = atom<Post[]>([])

// Pages
export const pageSize = atom<number>(60)
export const currentPage = atom<number>(1)

// Filter + Sort
export const filterTags = atom<string>("")
export const sort = atom<Sorts>(Sorts.timestamp)