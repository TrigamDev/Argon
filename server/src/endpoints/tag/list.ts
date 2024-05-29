import { Context } from "elysia";
import Database from "bun:sqlite";
import { getTags } from "../../util/database";

export default function getTagList(context: Context, db: Database) {
	return getTags(db)
}