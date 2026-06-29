import { axiosInterceptor } from "@/lib/axiosInterceptor";
import { uploadFileWithPreSignedUrl } from "./file.service";

// ─── Type-Specific Data Interfaces ──────────────────────────────────

export interface ContentTextData {
  id?: number;
  content: string;
  contentId?: number;
}

export interface ContentMediaData {
  id?: number;
  url: string;
  type: "video" | "audio" | "image";
  contentId?: number;
}

export interface ContentDocumentData {
  id?: number;
  url: string;
  type: "pdf" | "doc" | "ppt" | "other";
  contentId?: number;
}

export type ContentTypeData =
  | ContentTextData
  | ContentMediaData
  | ContentDocumentData
  | null;

// ─── Base Content Interfaces ─────────────────────────────────────────

export interface Content {
  id: number;
  title: string;
  description: string;
  type: "text" | "media" | "document";
  isActive: boolean;
  sequence: number;
  parentId: number | null;
  courseId: number;
  createdAt?: string;
  updatedAt?: string;
  typeData?: ContentTypeData;
}

export interface Chapter extends Content {
  topics: Content[];
}

export interface CreateContentData {
  title: string;
  description: string;
  type: "text" | "media" | "document";
  courseId: number;
  parentId?: number | null;
  sequence?: number;
}

export interface UpdateContentData {
  id: number;
  title?: string;
  description?: string;
  type?: "text" | "media" | "document";
  sequence?: number;
}

// ─── Type-Specific Save Interfaces ───────────────────────────────────

export interface SaveTextData {
  contentId: number;
  content: string;
}

export interface SaveMediaData {
  contentId: number;
  // url: string;
  file: File | null;
  onProgress?: (progress: number) => void;
  // mediaType: "video" | "audio" | "image";
}

export interface SaveDocumentData {
  contentId: number;
  url: string;
  documentType: "pdf" | "doc" | "ppt" | "other";
}

// ─── Base Content API Functions ──────────────────────────────────────

export async function createContent(contentData: CreateContentData) {
  const { data } = await axiosInterceptor.request({
    method: "post",
    url: `/v1/contents/create`,
    data: contentData,
  });

  return data;
}

export async function getContentsByCourse(courseId: string | number) {
  const { data } = await axiosInterceptor.request({
    method: "get",
    url: `/v1/contents/course/${courseId}`,
  });

  return data;
}

export async function getContentsByCoursePublic(courseId: string | number) {
  const { data } = await axiosInterceptor.request({
    method: "get",
    url: `/v1/contents/public/${courseId}`,
  });

  return data;
}

export async function getContentById(contentId: string | number) {
  const { data } = await axiosInterceptor.request({
    method: "get",
    url: `/v1/contents/${contentId}`,
  });


  return data;
}

export async function updateContent(contentData: UpdateContentData) {
  const { data } = await axiosInterceptor.request({
    method: "patch",
    url: `/v1/contents/update`,
    data: contentData,
  });

  return data;
}

export async function deleteContent(contentId: string | number) {
  const { data } = await axiosInterceptor.request({
    method: "delete",
    url: `/v1/contents/${contentId}`,
  });

  return data;
}

// ─── Type-Specific Save API Functions ─────────────────────────────────

export async function saveContentText(saveData: SaveTextData) {
  const { data } = await axiosInterceptor.request({
    method: "post",
    url: `/v1/contents/text/save`,
    data: saveData,
  });

  return data;
}

export async function saveContentMedia(saveData: SaveMediaData) {
  if (!saveData?.file) {
    throw new Error("File is required");
  }

  const { contentId, file, onProgress } = saveData;

  const { data: uploadData } = await axiosInterceptor.request({
    method: "post",
    url: `/v1/contents/media/get-presigned-url-for-upload`,
    data: {
      name: file.name,
      contentType: file.type,
      contentId,
    },
  });
  const { signedUrl, objectKey, bucketName, fileCategory } = uploadData;

  await uploadFileWithPreSignedUrl(signedUrl, file, (progressEvent) => {
    if (onProgress) {
      onProgress(
        Math.round((progressEvent.loaded / progressEvent.total) * 100),
      );
    }
  });

  const { data } = await axiosInterceptor.request({
    method: "post",
    url: `/v1/contents/media/save`,
    data: {
      contentId,
      url: `${bucketName}::${objectKey}`,
      mediaType: fileCategory,
    },
  });

  return data;
}

export async function saveContentDocument(saveData: SaveDocumentData) {
  const { data } = await axiosInterceptor.request({
    method: "post",
    url: `/v1/contents/document/save`,
    data: saveData,
  });

  return data;
}

export interface ReorderItem {
  id: number;
  sequence: number;
}

/**
 * Bulk-update sequence numbers for a set of content items.
 * Pass only root-level chapter IDs, or only child topic IDs of a single
 * parent — never mix the two in one call.
 */
export async function reorderContents(items: ReorderItem[]) {
  const { data } = await axiosInterceptor.request({
    method: "patch",
    url: `/v1/contents/reorder`,
    data: { items },
  });
  return data;
}
