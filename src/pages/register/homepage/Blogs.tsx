import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight, NotebookText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { getAllBlogs } from "@/services/blog.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router";

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1434031215662-8a48c44c4427?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=60",
];

function getPlaceholderImage(index: number) {
  return PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length];
}

function getReadTime(content: string): string {
  const plainText = content.replace(/<[^>]+>/g, " ");
  const words = plainText.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

const Blogs = () => {
  const {
    data: paginatedData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["blogs", 1, 9, ""],
    queryFn: () => getAllBlogs({ page: 1, limit: 9 }),
  });

  const blogs = paginatedData?.blogs ?? [];

  return (
    <div className="pt-24 px-4 sm:px-6 pb-16">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
        <div className="max-w-2xl">
          <Badge variant="outline" className="mb-4 text-primary">
            Academy Insights
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            Our Latest Insights
          </h1>
          <p className="text-muted-foreground">
            Tips, trends, and tutorials to help you build a successful online
            course business.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-video w-full" />
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <NotebookText className="h-10 w-10 text-destructive opacity-50" />
          </div>
          <h3 className="text-xl font-medium text-foreground">
            Failed to load blogs
          </h3>
          <p className="text-muted-foreground mt-1">
            There was an error fetching blog posts.
          </p>
        </div>
      ) : blogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogs.map((item, index) => (
            <Link key={item.blog.id} to={`/blog?id=${item.blog.id}`}>
              <Card className="group border-primary/5 hover:border-primary/20 transition-all cursor-pointer overflow-hidden h-full">
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  <img
                    src={getPlaceholderImage(index)}
                    alt={item.blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6 border border-background">
                        <AvatarImage src={item.author.avatarUrl ?? undefined} />
                        <AvatarFallback className="bg-primary/5 text-primary text-[9px]">
                          {item.author.firstName?.[0]}
                          {item.author.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {[item.author.firstName, item.author.lastName]
                          .filter(Boolean)
                          .join(" ") || item.author.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.blog.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </span>
                      <span>{getReadTime(item.blog.content)}</span>
                    </div>
                  </div>
                  <CardTitle className="leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    {item.blog.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {item.blog.content
                      .replace(/<[^>]+>/g, " ")
                      .substring(0, 150)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="ghost"
                    className="p-0 h-auto group-hover:gap-2 transition-all"
                  >
                    Read More <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <NotebookText className="h-10 w-10 text-muted-foreground opacity-20" />
          </div>
          <h3 className="text-xl font-medium text-foreground">
            No blog posts yet
          </h3>
          <p className="text-muted-foreground mt-1 max-w-[300px]">
            Check back soon for tips, trends, and tutorials.
          </p>
        </div>
      )}
    </div>
  );
};

export default Blogs;
