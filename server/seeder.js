import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Post from './models/postModel.js'


dotenv.config();

connectDB();

const importData = async () => { 
    try {
        await Post.deleteMany();

        const createdPosts = await Post.insertMany(posts);

        await Post.insertMany(createdPosts);

        console.log('Data imported!'.green.inverse);
        process.exit();
    } catch (error) {
        console.log(`${error}`.red.inverse);
        process.exit(1);
    }
 }

 const destroyData = async () => { 
    try {
        await Post.deleteMany();

        console.log('Data destroyed!'.green.inverse);
        process.exit();
    } catch (error) {
        console.log(`${error}`.red.inverse);
        process.exit(1);
    }
 }

 if (process.argv[2] === '-d') {
    destroyData();
 } else {
    importData();
 }