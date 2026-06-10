import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { unenrollUser } from "@/services/enrollment.service";
import type { EnrolledUser } from "@/services/enrollment.service";
import { Loader2, UserMinus } from "lucide-react";

interface UnenrollDialogProps {
  enrolledUser: EnrolledUser | null;
  courseId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UnenrollDialog({
  enrolledUser,
  courseId,
  open,
  onOpenChange,
}: UnenrollDialogProps) {
  const queryClient = useQueryClient();

  const unenrollMutation = useMutation({
    mutationFn: () =>
      unenrollUser({
        userId: enrolledUser!.user.id,
        courseId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["enrollments", courseId],
      });
      onOpenChange(false);
    },
  });

  const handleUnenroll = () => {
    if (enrolledUser) {
      unenrollMutation.mutate();
    }
  };

  const displayName =
    [enrolledUser?.user.firstName, enrolledUser?.user.lastName]
      .filter(Boolean)
      .join(" ") || enrolledUser?.user.email;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10">
            <UserMinus className="h-5 w-5 text-destructive" />
          </AlertDialogMedia>
          <AlertDialogTitle>Unenroll User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to unenroll{" "}
            <span className="font-medium text-foreground">{displayName}</span>{" "}
            from this course? They will lose access to all course materials.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {unenrollMutation.isError && (
          <div className="text-destructive text-sm">
            Failed to unenroll user. Please try again.
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={unenrollMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleUnenroll}
            disabled={unenrollMutation.isPending}
          >
            {unenrollMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Unenrolling...
              </>
            ) : (
              <>
                <UserMinus className="mr-2 h-4 w-4" />
                Unenroll
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
