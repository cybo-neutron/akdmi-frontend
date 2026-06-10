import { useState, useRef, useCallback, useEffect } from "react";
import {
  useMutation,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { enrollUser } from "@/services/enrollment.service";
import { getAllUsers } from "@/services/users.service";
import { Loader2, Search } from "lucide-react";
import { useAllowedAccess } from "@/hooks/useAllowedAccess";
import { UserRole } from "@/types/auth.types";

const USERS_PER_PAGE = 20;

interface AddEnrollmentDialogProps {
  courseId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddEnrollmentDialog({
  courseId,
  open,
  onOpenChange,
}: AddEnrollmentDialogProps) {
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(
    new Set(),
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const queryClient = useQueryClient();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { checkRole } = useAllowedAccess();
  const canEnroll = checkRole([UserRole.ADMIN, UserRole.MANAGER]);



  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Infinite query for users
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["users-infinite", debouncedSearch],
      queryFn: ({ pageParam = 1 }) =>
        getAllUsers({
          page: pageParam,
          limit: USERS_PER_PAGE,
          search: debouncedSearch || undefined,
        }),
      getNextPageParam: (lastPage) =>
        lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
      initialPageParam: 1,
      enabled: open,
    });

  // Flatten all pages into a single users array
  const users = data?.pages.flatMap((page) => page.users) ?? [];

  // Intersection Observer for infinite scroll
  const observerCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(observerCallback, {
      root: sentinel.parentElement,
      threshold: 0.1,
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [observerCallback]);

  const enrollMutation = useMutation({
    mutationFn: async () => {
      const promises = Array.from(selectedUserIds).map((userId) =>
        enrollUser({ userId, courseId }),
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["enrollments", courseId],
      });
      setSelectedUserIds(new Set());
      setSearchTerm("");
      setDebouncedSearch("");
      onOpenChange(false);
    },
  });

  const toggleUser = (userId: number) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      setSelectedUserIds(new Set());
      setSearchTerm("");
      setDebouncedSearch("");
      enrollMutation.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Enrollments</DialogTitle>
          <DialogDescription>
            Select users to enroll in this course.
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="search user"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* User List — scrollable container */}
        <div className="max-h-[320px] overflow-y-auto -mx-6 px-6 space-y-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading users...
            </div>
          ) : users.length > 0 ? (
            <>
              {users.map((user) => {
                const isSelected = selectedUserIds.has(user.id);
                return (
                  <label
                    key={user.id}
                    htmlFor={`enroll-user-${user.id}`}
                    className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors ${
                      isSelected ? "bg-primary/5" : "hover:bg-muted/50"
                    }`}
                  >
                    <Checkbox
                      id={`enroll-user-${user.id}`}
                      checked={isSelected}
                      onCheckedChange={() => toggleUser(user.id)}
                    />
                    <Avatar className="h-10 w-10 border-2 border-background">
                      <AvatarImage src={user.avatarUrl} />
                      <AvatarFallback className="bg-primary/5 text-primary text-xs">
                        {user.firstName?.[0]}
                        {user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-sm text-foreground truncate">
                        {[user.firstName, user.lastName]
                          .filter(Boolean)
                          .join(" ") || "Unnamed"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </span>
                    </div>
                  </label>
                );
              })}

              {/* Sentinel element for infinite scroll */}
              <div ref={sentinelRef} className="py-2 flex justify-center">
                {isFetchingNextPage && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground text-sm">
                No users found matching your search.
              </p>
            </div>
          )}
        </div>

        {enrollMutation.isError && (
          <div className="text-destructive text-sm">
            Failed to enroll users. Some may already be enrolled.
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={enrollMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={() => enrollMutation.mutate()}
            disabled={
              selectedUserIds.size === 0 ||
              enrollMutation.isPending ||
              !canEnroll
            }
          >
            {enrollMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {enrollMutation.isPending
              ? "Enrolling..."
              : `Enroll users${selectedUserIds.size > 0 ? ` (${selectedUserIds.size})` : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
