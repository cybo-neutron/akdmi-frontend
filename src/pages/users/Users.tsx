import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  MoreVertical,
  Search,
  Mail,
  ShieldCheck,
  Trash2,
  Pencil,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getAllUsers } from "@/services/users.service";
import type { User } from "@/services/users.service";
import { Skeleton } from "@/components/ui/skeleton";
import { AddUserDialog } from "./AddUserDialog";
import { DeleteUserDialog } from "./DeleteUserDialog";
import { EditUserDialog } from "./EditUserDialog";
import { useAllowedAccess } from "@/hooks/useAllowedAccess";
import { UserRole } from "@/types/auth.types";

const ITEMS_PER_PAGE = 8;

const Users = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const { checkRole } = useAllowedAccess();
  const navigate = useNavigate();

  if (!checkRole([UserRole.ADMIN, UserRole.MANAGER])) {
    navigate("/dashboard");
  }

  // Dialog state
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const searchTerm = searchParams.get("search") || "";
  const currentPage = Number(searchParams.get("page")) || 1;

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

  const handleEditClick = (user: User) => {
    setEditUser(user);
    setEditOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setDeleteUser(user);
    setDeleteOpen(true);
  };

  // Fetch users with server-side pagination and search
  const {
    data: paginatedData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users", currentPage, ITEMS_PER_PAGE, searchTerm],
    queryFn: () =>
      getAllUsers({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: searchTerm || undefined,
      }),
  });

  const users = paginatedData?.users ?? [];
  const totalPages = paginatedData?.totalPages ?? 0;
  const totalUsers = paginatedData?.total ?? 0;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <UserIcon className="h-10 w-10 text-destructive opacity-50" />
        </div>
        <h3 className="text-xl font-medium text-foreground">
          Failed to load users
        </h3>
        <p className="text-muted-foreground mt-1">
          There was an error fetching the user list. Please try again later.
        </p>
        <Button
          variant="outline"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["users"] })}
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-8 animate-in fade-in duration-700">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-light tracking-tight text-foreground transition-all">
              users
            </h1>
            <p className="text-muted-foreground font-light">
              Manage your platform members and their roles.
            </p>
          </div>

          <AddUserDialog />
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <div className="absolute inset-0   transition-all duration-500" />
          <div className="relative flex items-center  border border-border/50   transition-all focus-within:border-primary/50">
            {/* <Search className="h-5 w-5 text-muted-foreground mr-3" /> */}
            <Input
              placeholder="search user"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="border-none  focus-visible:ring-0 focus-visible:ring-offset-0 text-lg font-light placeholder:text-muted-foreground/50 h-10 w-full"
            />
            <Search className="h-5 w-5 text-muted-foreground mr-3" />
            {/* <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-muted rounded-lg text-[10px] font-mono text-muted-foreground mr-2">
              <span className="opacity-50">ESC</span>
            </div> */}
          </div>
        </div>

        {/* Table Section */}
        <div className="relative border border-border/50 bg-card/30 backdrop-blur-sm">
          <div className="overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="w-[300px] font-medium pl-8">
                    name
                  </TableHead>
                  <TableHead className="font-medium">email</TableHead>
                  <TableHead className="font-medium">role</TableHead>
                  <TableHead className="text-right font-medium">
                    action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                    <TableRow key={i} className="border-border/50">
                      <TableCell className=" pl-8">
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-48" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </TableCell>
                      <TableCell className=" pr-8 text-right">
                        <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : users.length > 0 ? (
                  users.map((user: User) => (
                    <TableRow
                      key={user.id}
                      className="group border-border/50 hover:bg-primary/2 transition-colors"
                    >
                      <TableCell className="pl-8">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Avatar className="h-10 w-10 border-2 border-background transition-transform group-hover:scale-110">
                              <AvatarImage src={user.avatarUrl} />
                              <AvatarFallback className="bg-primary/5 text-primary text-xs">
                                {user.firstName?.[0]}
                                {user.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background" />
                          </div>
                          <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {user.firstName} {user.lastName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground py-5">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 opacity-50" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell className="py-5">
                        <Badge
                          variant="outline"
                          className={`
                            capitalize font-light px-3 py-1 rounded-full border-none
                            ${
                              user.role === "admin"
                                ? "bg-amber-500/10 text-amber-500"
                                : user.role === "mentor"
                                  ? "bg-indigo-500/10 text-indigo-500"
                                  : "bg-slate-500/10 text-slate-500"
                            }
                          `}
                        >
                          <ShieldCheck className="mr-1.5 h-3 w-3" />
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right py-5 pr-8">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-all active:scale-90"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-40 p-2 rounded-xl border-border/50 bg-background/80 backdrop-blur-xl animate-in zoom-in-95 duration-200"
                          >
                            <DropdownMenuItem
                              onClick={() => handleEditClick(user)}
                              className="flex items-center gap-2 rounded-lg cursor-pointer focus:bg-primary/10 focus:text-primary py-2.5"
                            >
                              <Pencil className="h-4 w-4" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(user)}
                              className="flex items-center gap-2 rounded-lg cursor-pointer focus:bg-destructive/10 focus:text-destructive py-2.5 text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                          <UserIcon className="h-10 w-10 text-muted-foreground opacity-20" />
                        </div>
                        <h3 className="text-xl font-medium text-foreground">
                          No users found
                        </h3>
                        <p className="text-muted-foreground mt-1 max-w-[250px]">
                          We couldn't find any users matching your search
                          criteria.
                        </p>
                        <Button
                          variant="link"
                          onClick={() => handleSearchChange("")}
                          className="mt-2 text-primary"
                        >
                          Clear search
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Footer */}
          {!isLoading && totalUsers > 0 && (
            <div className="flex items-center justify-between px-8 py-6 border-t border-border/50 bg-muted/10 rounded-b-3xl">
              <p className="text-sm text-muted-foreground font-light">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-foreground">
                  {Math.min(currentPage * ITEMS_PER_PAGE, totalUsers)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {totalUsers}
                </span>{" "}
                users
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
                        if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        )
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
                        className={`h-9 w-9 rounded-xl transition-all ${currentPage === page ? " " : "hover:bg-primary/5 hover:text-primary"}`}
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
        </div>
      </div>

      {/* Dialogs */}
      <EditUserDialog
        user={editUser}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteUserDialog
        user={deleteUser}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
};

export default Users;
