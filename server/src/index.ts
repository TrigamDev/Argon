import mongoose from "mongoose";

import app from "./app";
import PostModel from "./models/post";

const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI!, {
    dbName: 'data'
}).then(async () => {
    console.log("💾 Connected to MongoDB");
    app.listen(port, () => {
        console.log(`💠 Server listening to port ${port}`)
    });
    // await fix();
}).catch((err) => { console.log(err) });

async function fix() {
    // fetch all posts
    let posts = PostModel.find({});
    console.log(`Fixing ${await posts.countDocuments()} posts`)
    // iterate over posts
    for await (const post of posts) {
        let shouldFix = false;
        console.log(`Fixing post #${post.id}`)
        

        
        if (!shouldFix) continue;
        await PostModel.findOneAndUpdate({ id: post.id }, {
            // tags: post.tags
        }, { new: true });

        console.log(`Fixed post #${post.id}`)
    }
    console.log(`Fixed ${await posts.countDocuments()} posts`);
}