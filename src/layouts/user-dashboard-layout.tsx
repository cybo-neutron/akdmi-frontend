import { Fragment, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import {
  BookOpen,
  Settings,
  User,
  LogOut,
  Bell,
  Search,
  Command,
  BookText,
  Users,
  SquareActivity,
  UserStar,
  NotebookText,
  Rocket,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CustomDropDown from "@/components/custom/CustomDropDown";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/useAuthStore";
import ThemeSelector from "@/components/custom/ThemeSelector";
import { UserRole, type UserRoleType } from "@/types/auth.types";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareActivity,
      isActive: true,
      allowedUsers: [
        UserRole.ADMIN,
        UserRole.MENTOR,
        UserRole.STUDENT,
        UserRole.MANAGER,
      ],
    },
    {
      title: "All Courses",
      url: "/dashboard/courses",
      icon: BookText,
      isActive: true,
      allowedUsers: [
        UserRole.ADMIN,
        UserRole.MENTOR,
        UserRole.STUDENT,
        UserRole.MANAGER,
      ],
    },
    {
      title: "Users",
      url: "/dashboard/users",
      icon: Users,
      isActive: true,
      allowedUsers: [UserRole.ADMIN],
    },
    {
      title: "Manage Enrollments",
      url: "/dashboard/enrollments",
      icon: UserStar,
      isActive: true,
      allowedUsers: [UserRole.ADMIN, UserRole.MANAGER],
    },
    {
      title: "Blogs",
      url: "/dashboard/blogs",
      icon: NotebookText,
      isActive: true,
      allowedUsers: [UserRole.ADMIN, UserRole.MANAGER],
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
      allowedUsers: [
        UserRole.ADMIN,
        UserRole.MENTOR,
        UserRole.STUDENT,
        UserRole.MANAGER,
      ],
    },
  ],
};

export default function UserDashboardLayout() {
  const { userDetails, isUserLoggedIn, logOut } = useAuthStore();

  const location = useLocation();
  const navigate = useNavigate();

  // Helper to get breadcrumbs from path
  const pathSegments = location.pathname.split("/").filter(Boolean);

  useEffect(() => {
    if (!isUserLoggedIn) {
      navigate("/login");
      return;
    }
  }, [isUserLoggedIn]);

  return (
    <SidebarProvider>
      <Sidebar
        collapsible="icon"
        className="border-r border-sidebar-border bg-sidebar animate-in slide-in-from-left duration-300"
      >
        <SidebarHeader className="h-16 flex w-full px-4 border-b border-sidebar-border">
          <Link to="/" className="flex  justify-start gap-3 items-center group">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground group-hover:scale-110 transition-transform">
              {/* <Command className="size-5" /> */}
              <Rocket />
            </div>
            <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
              <span className="font-semibold text-sidebar-foreground">AKDMI</span>
              {/* <span className="text-[10px] text-muted-foreground">
                Improvement Coaching Institute
              </span> */}
            </div>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-4 mb-2">
              Platform
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {data.navMain
                  .filter((item) =>
                    item.allowedUsers.includes(
                      userDetails?.role as UserRoleType,
                    ),
                  )
                  .map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.url}
                        className="transition-all hover:bg-sidebar-accent group"
                      >
                        <Link to={item.url} className="flex items-center gap-3">
                          <div
                            className={cn(
                              "p-1 rounded-md transition-colors",
                              location.pathname === item.url
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground group-hover:text-primary",
                            )}
                          >
                            <item.icon size={16} />
                          </div>
                          <span className="font-medium group-data-[collapsible=icon]:hidden">
                            {item.title}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-2 group-data-[collapsible=icon]:justify-center">
            <Avatar className="size-8 ring-2 ring-primary/10">
              <AvatarImage
                src={userDetails?.avatarUrl || ""}
                alt={userDetails?.firstName || ""}
              />
              <AvatarFallback className="bg-primary/5 text-primary">
                {userDetails?.firstName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5 group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-medium leading-none text-sidebar-foreground truncate max-w-[120px]">
                {userDetails?.firstName}
              </span>
              <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                {userDetails?.email}
              </span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-6 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-1 hover:bg-muted" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild>
                    <Link
                      to="/dashboard"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      Dashboard
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {pathSegments.slice(1).map((segment, index) => (
                  <Fragment key={segment}>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      {index === pathSegments.length - 2 ? (
                        <BreadcrumbPage className="font-semibold text-foreground capitalize">
                          {segment}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link
                            to={`/${pathSegments.slice(0, index + 2).join("/")}`}
                            className="text-muted-foreground hover:text-primary transition-colors capitalize"
                          >
                            {segment}
                          </Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search resources..."
                className="pl-9 w-[300px] h-9 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/20 transition-all focus-visible:w-[350px]"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded border bg-background text-[10px] font-mono opacity-0 group-focus-within:opacity-100 transition-opacity">
                ⌘K
              </div>
            </div>

            {/* Notification Button */}
            {/* <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-muted text-muted-foreground"
            >
              <Bell className="size-5" />
              <span className="absolute top-2 right-2 size-2 bg-primary rounded-full ring-2 ring-background ring-offset-0" />
            </Button> */}

            <ThemeSelector />

            <CustomDropDown
              TriggerComponent={
                <button className="flex items-center gap-2 px-1 py-1 rounded-full hover:bg-muted transition-colors ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="size-8 border-2 border-background shadow-sm">
                    <AvatarImage
                      src={userDetails?.avatarUrl || ""}
                      alt={userDetails?.firstName || ""}
                    />
                    <AvatarFallback>
                      {userDetails?.firstName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              }
              menuItems={[
                {
                  onClickAction: () => console.log("Profile"),
                  Component: (
                    <div className="flex items-center gap-2 group/item">
                      <User className="size-4 text-muted-foreground group-hover/item:text-primary" />
                      <span>Profile</span>
                    </div>
                  ),
                },
                {
                  onClickAction: () => console.log("Settings"),
                  Component: (
                    <div className="flex items-center gap-2 group/item">
                      <Settings className="size-4 text-muted-foreground group-hover/item:text-primary" />
                      <span>Settings</span>
                    </div>
                  ),
                },
                {
                  onClickAction: () => logOut(),
                  Component: (
                    <div className="flex items-center gap-2 text-destructive group/item">
                      <LogOut className="size-4 opacity-70 group-hover/item:opacity-100" />
                      <span>Logout</span>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

function Separator({
  orientation = "horizontal",
  className,
}: {
  orientation?: "horizontal" | "vertical";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className,
      )}
    />
  );
}
