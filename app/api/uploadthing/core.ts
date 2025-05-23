import { createUploadthing, type FileRouter } from "uploadthing/next";
import { currentUser } from "@clerk/nextjs";
 
const f = createUploadthing();
 
// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      try {
        // This code runs on your server before upload
        const user = await currentUser();
 
        // If you throw, the user will not be able to upload
        if (!user) {
          throw new Error("Unauthorized");
        }
 
        // Whatever is returned here is accessible in onUploadComplete as `metadata`
        return { userId: user.id };
      } catch (error) {
        console.error("Error in upload middleware:", error);
        throw new Error("Failed to authenticate user");
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        // This code RUNS ON YOUR SERVER after upload
        console.log("Upload complete for userId:", metadata.userId);
        console.log("file url", file.url);
 
        // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
        return { uploadedBy: metadata.userId, url: file.url };
      } catch (error) {
        console.error("Error in onUploadComplete:", error);
        throw new Error("Failed to process upload");
      }
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;