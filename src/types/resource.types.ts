export const Resource = {
    COURSE: "course",
    CONTENT: "content",
    USER: "user",
    BLOG: "blog",
} as const;

export type ResourceType = (typeof Resource)[keyof typeof Resource];
