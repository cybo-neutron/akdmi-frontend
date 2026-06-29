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
