import { getFileById } from "../util/files";
import { assertFile } from "../util/types";

export async function editFile(params: any, body: any, set: any) {
    const { id } = params;
    const { timestamp } = body;
    if (!id) { set.status = 400; return "No file id provided" }
    let file = await getFileById(id);
    if (!file) { set.status = 404; return "File not found" }

    if (timestamp || timestamp === 0) file.timestamp = timestamp;

    await file.save();
    set.status = 200;
    return assertFile(file);
}