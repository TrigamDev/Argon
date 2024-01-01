import PostModel, { Post } from "../models/post";

export async function getPosts() {
    let posts = await PostModel.find().exec();
    return posts;
};

export async function createPostId() {
    let posts = await getPosts();
    if (posts.length === 0) return 0;
    posts.sort((a, b) => a.id - b.id);
    let id = posts[posts.length - 1].id + 1;
    return id;
};

export async function getPost(id: number) {
    let post = await PostModel.findOne({ id: id }).exec();
    return post;
};

export async function uploadPostToDB(postData: Post) {
    try {
        console.log(`\n💾 Saving Post #${postData.id} to the database...`);
        const newPost = new PostModel(postData);
        await newPost.save();
        console.log(`💾 Saved Post #${postData.id} to the database!`);
    } catch (err) {
        console.error(err);
        console.log(`❗ Error saving Post #${postData.id} to the database!`);
    }
};