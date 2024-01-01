import { File } from "../models/file";

import { getFileById } from "../util/files";
import { assertFile } from "../util/types";

export async function getFile(params: any): Promise<File | null> {
    let found = await getFileById(Number(params.id));
    if (found) return assertFile(found);
    return null;
};