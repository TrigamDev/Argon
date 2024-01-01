import PostModel, { Post } from "../models/post";
import { FilterTag, Tag } from "../models/tag";
import { assertPost, assertTagList } from "./types";

export async function getPosts() {
    let posts = await PostModel.find().exec();
    return posts.map((post) => assertPost(post));
};

export async function createPostId() {
    let posts = await getPosts();
    if (posts.length === 0) return 0;
    posts.sort((a, b) => a.id - b.id);
    let id = posts[posts.length - 1].id + 1;
    return id;
};

export async function getPostById(id: number) {
    try {
        return await PostModel.findOne({ id: id }).exec();
    } catch (err) {
        console.error(err);
        return null;
    }
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

export async function getPostsByTags(filters: FilterTag[]) {
    // Setup
    let posts = await getPosts();
    if (!filters || filters?.length === 0) return posts;
    // Filter posts
    let filteredPosts: Post[] = [];
    for (let post of posts) {
        let postHasAllTags = filters.every((filter) => {
            let postHasTag = post.tags.some((tag) => tag.name === filter.name && tag.type === filter.type);
            return filter.exclude ? !postHasTag : postHasTag;
        });
        if (postHasAllTags) filteredPosts.push(post);
    };
    return filteredPosts;
}