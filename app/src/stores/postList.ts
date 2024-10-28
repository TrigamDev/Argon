import { atom } from "nanostores"

import type { Post, Tag } from "../util/types"
import { Sorts } from "../util/types"

export const postList = atom<Post[]>([])

// Pages
export const pageSize = atom<number>(60)
export const currentPage = atom<number>(1)

// Filter + Sort
export const filterTags = atom<Tag[]>([])
export const sort = atom<Sorts>(Sorts.timestamp)