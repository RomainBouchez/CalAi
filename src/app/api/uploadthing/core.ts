import { createRouteHandler } from "uploadthing/next";
import { createUploadthing } from "uploadthing/next";

const f = createUploadthing();

// Define file upload routes
const ourFileRouter = {
    // Define as many FileRoutes as you need
    imageUploader: f({ image: { maxFileSize: "4MB" } })
        .middleware(async () => {
            // This code runs on your server before upload
            return { userId: "anonymous" }; // Add user data to the returned metadata
        })
        .onUploadComplete(async ({ metadata, file }) => {
            // This code runs on your server after upload
            console.log("Upload complete for userId:", metadata.userId);
            console.log("File URL:", file.url);

            return { uploadedBy: metadata.userId, url: file.url };
        }),
};

export const { GET, POST } = createRouteHandler({
    router: ourFileRouter,
});