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
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">All Courses</h1>
          <p className="text-muted-foreground">
            Manage and view all your enrolled and created courses.
          </p>
        </div>

        <div>{canCreate && <AddCourseDialog />}</div>
      </div>

      <CourseList canEdit={canEdit} canDelete={canDelete} />
    </div>
  );
};

export default Courses;
