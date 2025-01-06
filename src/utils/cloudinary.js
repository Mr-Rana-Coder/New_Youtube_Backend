import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return console.log("Couldn't Get the File Path");
        //file will be uploaded on the cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        })
        //File has been uploaded successfully
        console.log("File is uploaded on cloudinary", response.url);
        fs.unlinkSync(localFilePath);
        return response;
    } catch (err) {
        fs.unlinkSync(localFilePath) //remove the locally saved temporary file as the upload got failed.
        return null;
    }
}

const destroyFromCloudinary = async (publicId) => {
    try {
        if (!publicId) return console.log("Couldn't Get the publicId");
        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: "auto"
        })
        console.log("File deleted successfully from the cloudinary", response);
        return response;
    } catch (err) {
        console.err("Unable to delete the file from the cloudinary",err)
        return null;
    }
}

export {
    uploadOnCloudinary,
    destroyFromCloudinary
};