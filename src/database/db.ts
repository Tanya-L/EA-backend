// import * as Mongoose from "mongoose";
import mongoose = require("mongoose");

let database_: mongoose.Connection;
const dbname_: string = "vetclinic";

export const mongoConnect = () => {
    // const uri = "mongodb+srv://localhost/" + dbname_ + "?retryWrites=true&w=majority";
    const uri = `mongodb://localhost/${dbname_}`;
    if (database_) {
        return;
    }
    mongoose.connect(uri, {
        useNewUrlParser: true,
        useFindAndModify: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    });
    database_ = mongoose.connection;
    database_.once("open", async () => {
        console.log("Connected to database");
    });
    database_.on("error", () => {
        console.log("Error connecting to database");
    });
};

export const mongoDisconnect = () => {
    if (!database_) {
        return;
    }
    mongoose.disconnect();
};
