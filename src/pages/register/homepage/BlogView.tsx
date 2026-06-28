import { useSearchParams, Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getBlogById } from "@/services/blog.service";

const BlogView = () => {
  const [searchParams] = useSearchParams();
  const blogId = searchParams.get("id");

  const {
    data: blogData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["blog", blogId],
    queryFn: () => getBlogById(blogId!),
    enabled: !!blogId,
  });

  if (!blogId) {
    return (
      <div className="py-20 px-4 max-w-3xl mx-auto text-center">
        <h1 className="text-2xl font-medium">Blog not found</h1>
        <p className="text-muted-foreground mt-2">No blog ID was provided.</p>
        <Link to="/blogs">
          <Button variant="outline" className="mt-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blogs
          </Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-20 px-4 max-w-3xl mx-auto">
        <Skeleton className="h-8 w-32 mb-8" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <div className="flex items-center gap-4 mb-10">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (isError || !blogData) {
    return (
      <div className="py-20 px-4 max-w-3xl mx-auto text-center">
        <h1 className="text-2xl font-medium">Failed to load blog</h1>
        <p className="text-muted-foreground mt-2">
          Something went wrong. Please try again.
        </p>
        <Link to="/blogs">
          <Button variant="outline" className="mt-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blogs
          </Button>
        </Link>
      </div>
    );
  }

  const { blog, author } = blogData;
  const authorName =
    [author.firstName, author.lastName].filter(Boolean).join(" ") ||
    author.email;

  return (
    <article className="py-8 px-4 sm:px-8 md:px-8 animate-in fade-in duration-700">
      {/* Back */}
      <Link to="/blogs">
        <Button
          variant="ghost"
          className="mb-8 gap-2 text-muted-foreground hover:text-foreground -ml-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blogs
        </Button>
      </Link>

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
        {blog.title}
      </h1>

      {/* Author + Date */}
      <div className="flex items-center gap-4 mb-10 pb-10 border-b border-border/50">
        <Avatar className="h-11 w-11 border-2 border-background">
          <AvatarImage src={author.avatarUrl ?? undefined} />
          <AvatarFallback className="bg-primary/5 text-primary text-xs">
            {author.firstName?.[0]}
            {author.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-foreground text-sm">{authorName}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(blog.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className="prose prose-invert max-w-none prose-headings:tracking-tight prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />
    </article>
  );
};

export default BlogView;
