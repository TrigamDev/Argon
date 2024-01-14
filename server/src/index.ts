import mongoose from "mongoose";

import app from "./app";

const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI!, {
    dbName: 'data'
}).then(() => {
    console.log("💾 Connected to MongoDB");
    app.listen(port, () => {
        console.log(`💠 Server listening to port ${port}`)
    });
}).catch((err) => { console.log(err) });