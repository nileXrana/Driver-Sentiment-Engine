import mongoose, { Schema } from "mongoose";
import { UserDocument } from "../types/model.types";

const UserSchema = new Schema<UserDocument>(
    {
        email: { type: String, required: true, unique: true, index: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["ADMIN", "EMPLOYEE"], required: true },
    },
    {
        timestamps: true,
    }
);

export const UserModel = mongoose.model<UserDocument>("User", UserSchema);
