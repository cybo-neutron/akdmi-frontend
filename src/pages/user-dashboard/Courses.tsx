import { AddCourseDialog } from "@/components/course/AddCourseDialog";
import { CourseList } from "@/components/course/CourseList";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermissionStore } from "@/store/usePermissionStore";
import type { UserRoleType } from "@/types/auth.types";
import { Action } from "@/types/permission.type";
import { Resource } from "@/types/resource.types";

const Courses = () => {
  const { userDetails } = useAuthStore();
  const { hasPermission } = usePermissionStore();

  const canCreate = hasPermission(
    userDetails?.role as UserRoleType,
    Resource.COURSE,
    Action.create,
  );

  const canEdit = hasPermission(
    userDetails?.role as UserRoleType,
    Resource.COURSE,
    Action.update,
  );

  const canDelete = hasPermission(
    userDetails?.role as UserRoleType,
    Resource.COURSE,
    Action.delete,
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">All Courses</h1>
          <p className="text-muted-foreground text-sm">
            Manage and view all your enrolled and created courses.
          </p>
        </div>

        <div className="shrink-0">{canCreate && <AddCourseDialog />}</div>
      </div>

      <CourseList canEdit={canEdit} canDelete={canDelete} />
    </div>
  );
};

export default Courses;
