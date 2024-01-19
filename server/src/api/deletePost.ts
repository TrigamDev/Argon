import PostModel, { Post } from "../models/post";
import { getFileExtension } from "../util/files";

export default async function deletePost(req: any, res: any) {
    const id = Number(req?.params?.id);
    if (!id) return res.status(400).json({ error: "No id provided" });

    const post = await PostModel.findOne({ id: id });
    if (!post) return res.status(404).json({ error: "No post found" });

    console.log(`\n🗑️  ⚫ Deleting post #${id}...`)
    deleteFiles(post);
    await PostModel.deleteOne({ id: id });
    console.log(`\n🗑️  ✅ Deleted post #${id}!`)
    return res.status(200).json({ success: true });
};

function deleteFiles(post: Post) {
    const fs = require('fs');
    const path = require('path');

    const file = post.file;
    const id = post.id;

    const filePath = path.join(__dirname, `../../assets/${file.type}/${id}_${file.title}.${file.extension}`);
    const coverPath = path.join(__dirname, `../../assets/audio/${id}_${file.title}.${getFileExtension(file?.musicCoverUrl as string)}`);
    const thumbnailPath = path.join(__dirname, `../../assets/${file.type}/${id}_${file.title}_thumbnail.webp`);
    const layeredPath = path.join(__dirname, `../../assets/layered/${id}_${file.title}.${getFileExtension(file?.layeredUrl as string)}`);

    console.log(`\n🗑️  ⚫ Deleting file ${filePath}...`)
    fs.unlink(filePath, (err: any) => {
        if (err) console.log(`🗑️  ❗ Error deleting file ${filePath}: ${err}`);
        else console.log(`🗑️  ✅ Deleted file ${filePath}!`);
    });
    console.log(`🗑️  ⚫ Deleting thumbnail ${thumbnailPath}...`)
    fs.unlink(thumbnailPath, (err: any) => {
        if (err) console.log(`🗑️  ❗ Error deleting file ${thumbnailPath}: ${err}`);
        else console.log(`🗑️  ✅ Deleted thumbnail ${thumbnailPath}!`);
    });
    if (post?.file?.type === 'audio') {
        console.log(`🗑️  ⚫ Deleting music cover ${coverPath}...`)
        fs.unlink(coverPath, (err: any) => {
            if (err) console.log(`🗑️  ❗ Error deleting file ${coverPath}: ${err}`);
            else console.log(`🗑️  ✅ Deleted music cover ${coverPath}!`);
        });
    }
    if (post.file.layeredUrl) {
        console.log(`🗑️  ⚫ Deleting layered file ${layeredPath}...`)
        fs.unlink(layeredPath, (err: any) => {
            if (err) console.log(`🗑️  ❗ Error deleting file ${layeredPath}: ${err}`);
            else console.log(`🗑️  ✅ Deleted layered file ${layeredPath}!`);
        });
    }
};