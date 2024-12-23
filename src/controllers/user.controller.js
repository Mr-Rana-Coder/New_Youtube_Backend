import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken;
        await user.save({ ValiditeBeforeSave: false })

        return {
            accessToken,
            refreshToken
        }

    } catch (err) {
        throw new ApiError(500, "unable to generate token")
    }
}

const registerUser = asyncHandler(async (req, res) => {

    //get userdetails from the frontend
    const { fullName, email, userName, password } = req.body;
    console.log("email : ", email);

    //validation - not empty
    if ([fullName, email, userName, password].some((field) => {
        field?.trim() === ""
    })
    ) {
        throw new ApiError(400, "All fields are required")
    }

    //check if user already exists:username,email
    const existedUser = await User.findOne({
        $or: [{ userName }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User already exists")
    }

    //check for images and avatars
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar field is required")
    }

    //upload them to coudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar is not uploaded successfully")
    }

    //create user object -create entry in db
    //remove password and refresh token from the response
    //check for user creation
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    //return response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

})

const loginUser = asyncHandler(async (req, res) => {
    //Taking user data from the request
    const { userName, email, Password } = req.body;

    if (!userName || !email) {
        throw new ApiError(400, "Username or Email is required")
    }

    //finding the user on the basis of username or email
    const user = User.findOne({
        $or: [{ userName }, { email }]
    });

    //user not Found
    if (!user) {
        throw new ApiError(404, "User not exist")
    }

    //checking the password
    const passValid = await user.isPasswordCorrect(Password);

    if (!passValid) {
        throw new ApiError(401, "Password is not Valid")
    }

    //genrating referesh token and access token
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    //optional what to send to the user 
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    //options for the cookie
    const options = {
        httpOnly: true,
        secure: true
    }

    //sending the response
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "user Logged in successfully!"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id,
        {
            $set: { refreshToken: undefined }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .clearCookie("accessToken", accessToken)
        .clearCookie("refreshToken", refreshToken)
        .json(new ApiResponse(200), {}, "User logged Out Successfully")
})

export {
    registerUser,
    loginUser,
    logoutUser
};