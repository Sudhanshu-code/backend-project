import { asynHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asynHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res

  //destructure the value passed by the user
  const { fullName, username, email, password } = req.body;

  //validate the data
  if (
    [fullName, username, email, password].some((field) => field?.trim() == "")
  ) {
    throw new ApiError(400, "All field are required");
  }

  //check if user alredy existed with given email and username
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username alredy exit");
  }

  //***IMP NOTE*** to get the file we need to pass the multer middleware to the route of register as a middleware
  //get and validate the filepath of image passed by the user
  const avatarLocalPath = req.files?.avatar[0].path;

  //the below one give error if coverImage is not passed by user so it will be undefined, when try to acess 0th index it will give error
  // const coverImageLocalPath = req.files?.coverImage[0].path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  //upload files on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  //create the user in mongo database will return data back after successfull
  const user = await User.create({
    fullName,
    password,
    email,
    username: username.toLowerCase(),
    avatar: avatar.url,
    coverImage: coverImage.url || "",
  });

  //get the user data by user _id to send it to frontend
  //but dont need to send password and refreshToken so remove it using select
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the uset");
  }

  //return the response to the frontend using apiResponse we created
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user registered successfully"));
});

export { registerUser };
