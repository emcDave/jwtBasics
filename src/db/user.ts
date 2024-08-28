import mongoose from "mongoose";
const user = new mongoose.Schema(
    {
        
        username:{
            type: String,
            unique:true
        },
        password:{
            type: String,
            required:true
        },
        email:{
            type: String,
        },
       
       
    }, { timestamps: true }
)
export const UserModel = mongoose.model(`User`, user)
export const getAllUsers =()=> UserModel.find().lean()
export const getUserById = (id:string) => UserModel.findOne({"_id":id}).lean()
export const getUserByName = (userName:string) => UserModel.findOne({"username":userName}).lean()
export const creatNewUser = (values:Record<string,any>) => new UserModel(values).save().then(user=>user.toObject())
export const deleteUserById = (id:string) => UserModel.findByIdAndDelete(id)
export const updateUsersById = (id:string,values:Record<string,any>) => UserModel.findByIdAndUpdate(id,values,{returnDocument: 'after',upsert:true})