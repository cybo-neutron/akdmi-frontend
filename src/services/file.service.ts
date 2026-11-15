import { axiosInterceptor } from "@/lib/axiosInterceptor";
import axios from "axios";

export async function getPreSignedUrl({
  bucketName,
  objectKey,
  contentType,
}: {
  bucketName: string;
  objectKey: string;
  contentType: string;
}) {
  const { data } = await axiosInterceptor.request({
    method: "POST",
    url: `/v1/file-upload/signed-url`,
    data: {
      bucketName,
      objectKey,
      contentType,
    },
  });
  return data;
}

export async function getSignedUrlForDownload({
  bucketName,
  objectKey,
}: {
  bucketName: string;
  objectKey: string;
}) {
  const { data } = await axiosInterceptor.request({
    method: "POST",
    url: `/v1/file-upload/signed-url-for-download`,
    data: {
      bucketName,
      objectKey,
    },
  });
  return data;
}

export async function uploadFileWithPreSignedUrl(
  preSignedUrl: string,
  file: any,
  onProgress?: (progressEvent: any) => void,
) {
  const response = await axios.request({
    method: "PUT",
    url: preSignedUrl,
    headers: {
      "Content-Type": file.type,
    },
    data: file,
    ...(onProgress && { onUploadProgress: onProgress }),
  });
  // const response = await fetch(preSignedUrl, {
  //   method: "PUT",
  //   headers: {
  //     "Content-Type": file.type,
  //   },
  //   body: file,
  //   ...(onProgress && { onUploadProgress: onProgress }),
  // });

  return response;
}

export async function getEditorImageUploadUrl({
  contentType,
  size,
}: {
  contentType: string;
  size: number;
}): Promise<{ signedUrl: string; publicUrl: string }> {
  const { data } = await axiosInterceptor.request({
    method: "POST",
    url: `/v1/file-upload/editor-image`,
    data: {
      contentType,
      size,
    },
  });
  return data;
}

// Uploads an image used inside the rich text editor and returns its public url
export async function uploadEditorImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files can be uploaded");
  }
  const { signedUrl, publicUrl } = await getEditorImageUploadUrl({
    contentType: file.type,
    size: file.size,
  });
  await uploadFileWithPreSignedUrl(signedUrl, file);
  return publicUrl;
}
