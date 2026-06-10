import { useState } from "react";
import { useSearchParams } from "react-router";
import {
  Search,
  Plus,
  NotebookText,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  getAllBlogs,
  deleteBlog,
  getBlogById,
  type Blog,
  type BlogWithAuthor,
} from "@/services/blog.service";
import { BlogEditor } from "./BlogEditor";

const ITEMS_PER_PAGE = 9;

const Blogs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const searchTerm = searchParams.get("search") || "";
  const currentPage = Number(searchParams.get("page")) || 1;
  const editBlogId = searchParams.get("edit");
  const isCreating = searchParams.get("new") === "1";

  // State for delete confirmation
  const [deleteBlogData, setDeleteBlogData] = useState<BlogWithAuthor | null>(
    null,
  );
  const [deleteOpen, setDeleteOpen] = useState(false);

  // State for editing: holds the full blog object once fetched
  const [editBlog, setEditBlog] = useState<Blog | null>(null);

  // Fetch blogs list
  const {
    data: paginatedData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["blogs", currentPage, ITEMS_PER_PAGE, searchTerm],
    queryFn: () =>
      getAllBlogs({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: searchTerm || undefined,
      }),
  });

  // Fetch single blog for editing
  const { isLoading: isBlogLoading } = useQuery({
    queryKey: ["blog", editBlogId],
    queryFn: async () => {
      const result = await getBlogById(editBlogId!);
      setEditBlog(result.blog);
      return result;
    },
    enabled: !!editBlogId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteBlog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      setDeleteOpen(false);
      setDeleteBlogData(null);
    },
  });

  const blogs = paginatedData?.blogs ?? [];
  const totalPages = paginatedData?.totalPages ?? 0;
  const totalBlogs = paginatedData?.total ?? 0;

  const handleSearchChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    setSearchParams(params, { replace: true });
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    setSearchParams(params);
  };

  const handleCreate = () => {
    setSearchParams({ new: "1" });
  };

  const handleEditClick = (blog: BlogWithAuthor) => {
    setEditBlog(blog.blog);
    setSearchParams({ edit: blog.blog.id.toString() });
  };

  const handleDeleteClick = (blog: BlogWithAuthor) => {
    setDeleteBlogData(blog);
    setDeleteOpen(true);
  };

  const handleBack = () => {
    setEditBlog(null);
    setSearchParams({});
  };

  // ─── Editor Mode ──────────────────────────────────────────────
  if (isCreating) {
    return (
      <div className="flex flex-col gap-8 animate-in fade-in duration-700">
        <div className="space-y-1">
          <h1 className="text-4xl font-light tracking-tight text-foreground">
            Create Blog
          </h1>
          <p className="text-muted-foreground font-light">
            Write and publish a new blog post.
          </p>
        </div>
        <BlogEditor onBack={handleBack} />
      </div>
    );
  }

  if (editBlogId) {
    if (isBlogLoading || !editBlog) {
      return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-700">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-5 w-72" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-8 animate-in fade-in duration-700">
        <div className="space-y-1">
          <h1 className="text-4xl font-light tracking-tight text-foreground">
            Edit Blog
          </h1>
          <p className="text-muted-foreground font-light">
            Update your blog post.
          </p>
        </div>
        <BlogEditor blog={editBlog} onBack={handleBack} />
      </div>
    );
  }

  // ─── List Mode ──────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-light tracking-tight text-foreground">
            Blogs
          </h1>
          <p className="text-muted-foreground font-light">
            Manage and view all blog posts.
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:scale-105 active:scale-95 group"
        >
          <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
          Create Blog
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search blogs..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9 rounded-xl border-border/50 bg-muted/30 focus:bg-background transition-colors"
        />
      </div>

      {/* Blog Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="border border-border/50 rounded-xl p-6 space-y-4"
            >
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex items-center gap-3 pt-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((item) => (
            <div
              key={item.blog.id}
              className="group relative border border-border/50 bg-card/30 backdrop-blur-sm rounded-xl p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
              onClick={() => handleEditClick(item)}
            >
              {/* Actions */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-primary/10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-40 p-2 rounded-xl border-border/50 bg-background/80 backdrop-blur-xl animate-in zoom-in-95 duration-200"
                  >
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(item);
                      }}
                      className="flex items-center gap-2 rounded-lg cursor-pointer py-2.5"
                    >
                      <Pencil className="h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(item);
                      }}
                      className="flex items-center gap-2 rounded-lg cursor-pointer focus:bg-destructive/10 focus:text-destructive py-2.5 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Card Content */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(item.blog.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>

                <h3 className="text-lg font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {item.blog.title}
                </h3>

                <p
                  className="text-sm text-muted-foreground line-clamp-3 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: item.blog.content
                      .replace(/<[^>]+>/g, " ")
                      .substring(0, 150),
                  }}
                />

                {/* Author */}
                <div className="flex items-center gap-3 pt-3 mt-auto border-t border-border/30">
                  <Avatar className="h-7 w-7 border border-background">
                    <AvatarImage src={item.author.avatarUrl ?? undefined} />
                    <AvatarFallback className="bg-primary/5 text-primary text-[10px]">
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
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <NotebookText className="h-10 w-10 text-muted-foreground opacity-20" />
          </div>
          <h3 className="text-xl font-medium text-foreground">
            No blogs found
          </h3>
          <p className="text-muted-foreground mt-1 max-w-[250px]">
            {searchTerm
              ? "No blogs match your search. Try a different term."
              : 'No blog posts yet. Click "Create Blog" to write your first post.'}
          </p>
        </div>
      )}

      {/* Pagination Footer */}
      {!isLoading && totalBlogs > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground font-light">
            Showing{" "}
            <span className="font-medium text-foreground">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-foreground">
              {Math.min(currentPage * ITEMS_PER_PAGE, totalBlogs)}
            </span>{" "}
            of <span className="font-medium text-foreground">{totalBlogs}</span>{" "}
            blogs
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-9 w-9 rounded-xl border-border/50 hover:bg-primary/5 hover:text-primary disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                if (totalPages > 5) {
                  if (
                    page !== 1 &&
                    page !== totalPages &&
                    (page < currentPage - 1 || page > currentPage + 1)
                  ) {
                    if (page === currentPage - 2 || page === currentPage + 2)
                      return (
                        <span key={page} className="px-1 opacity-50">
                          ...
                        </span>
                      );
                    return null;
                  }
                }
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "ghost"}
                    size="icon"
                    onClick={() => handlePageChange(page)}
                    className={`h-9 w-9 rounded-xl transition-all ${
                      currentPage === page
                        ? ""
                        : "hover:bg-primary/5 hover:text-primary"
                    }`}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-9 w-9 rounded-xl border-border/50 hover:bg-primary/5 hover:text-primary disabled:opacity-30 transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10">
              <Trash2 className="h-5 w-5 text-destructive" />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete Blog</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {deleteBlogData?.blog.title}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() =>
                deleteBlogData && deleteMutation.mutate(deleteBlogData.blog.id)
              }
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Blogs;
