import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async(req,res)=>{

    //get userdetails from the frontend
    const {fullName,email,userName,password} = req.body;
    console.log("email : ",email);

    //validation - not empty
    if([fullName,email,userName,password].some(()=>{
        Field?.trim() === ""})
    ){
        throw new ApiError(400,"All fields are required")
    }

    //check if user already exists:username,email
    const existedUser = User.findOne({
        $or:[{userName},{email}]
    })
    if(existedUser){
        throw new ApiError(409,"User already exists")
    }

    //check for images and avatars
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar field is required")
    }

    //upload them to coudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400,"Avatar is not uploaded successfully")
    }

    //create user object -create entry in db
    //remove password and refresh token from the response
    //check for user creation
    const user = await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        userName:userName.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    //return response
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully")
    )

})

export {registerUser};