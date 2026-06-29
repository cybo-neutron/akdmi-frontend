import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { updateUser } from "@/services/users.service";
import {
  getPreSignedUrl,
  uploadFileWithPreSignedUrl,
} from "@/services/file.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  avatarUrl: string;
}

const BUCKET_NAME = "akdmi-content";

const Profile = () => {
  const { userDetails, setUserDetails } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: userDetails?.firstName || "",
      lastName: userDetails?.lastName || "",
      avatarUrl: userDetails?.avatarUrl || "",
    },
  });

  // Set avatar preview on load
  useEffect(() => {
    setAvatarPreview(userDetails?.avatarUrl || null);
  }, [userDetails?.avatarUrl]);

  const mutation = useMutation({
    mutationFn: (data: Partial<Parameters<typeof updateUser>[0]> & { id: number }) =>
      updateUser(data),
    onSuccess: (updatedUser) => {
      toast.success("Profile updated successfully!");
      setSelectedFile(null); // Clear selected file after successful save
      if (userDetails) {
        setUserDetails({
          ...userDetails,
          ...(updatedUser.firstName && { firstName: updatedUser.firstName }),
          ...(updatedUser.lastName && { lastName: updatedUser.lastName }),
          ...(updatedUser.avatarUrl && { avatarUrl: updatedUser.avatarUrl }),
        });
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update profile. Please try again.");
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    if (!userDetails?.userId) {
      toast.error("User session not found.");
      return;
    }

    let finalAvatarUrl = data.avatarUrl;

    // Upload to S3 if a new file was chosen
    if (selectedFile) {
      try {
        setIsUploading(true);
        setUploadProgress(0);

        // Generate object key
        const extension = selectedFile.name.split(".").pop();
        const objectKey = `public/avatars/${userDetails.userId}_${Date.now()}.${extension}`;

        // Get presigned upload URL
        const uploadData = await getPreSignedUrl({
          bucketName: BUCKET_NAME,
          objectKey,
          contentType: selectedFile.type,
        });

        if (!uploadData || !uploadData.signedUrl) {
          throw new Error("Invalid presigned URL response from server");
        }

        // Upload file with progress tracking
        const uploadResponse = await uploadFileWithPreSignedUrl(uploadData.signedUrl, selectedFile, (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        });

        finalAvatarUrl = uploadData.signedUrl.split('?')[0];

        // finalAvatarUrl = `${BUCKET_NAME}::${objectKey}`;
        setValue("avatarUrl", finalAvatarUrl);
      } catch (error) {
        console.error("Avatar upload error:", error);
        toast.error("Failed to upload image. Profile details not saved.");
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    mutation.mutate({
      id: Number(userDetails.userId),
      firstName: data.firstName,
      lastName: data.lastName,
      avatarUrl: finalAvatarUrl || undefined,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be less than 2MB.");
        return;
      }

      // Defer S3 upload, just update local state and preview
      setSelectedFile(file);
      const localPreviewUrl = URL.createObjectURL(file);
      setAvatarPreview(localPreviewUrl);
    }
  };

  const isPending = isUploading || mutation.isPending;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-in fade-in duration-700">
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-light tracking-tight text-foreground">
            My Profile
          </h1>
          <p className="text-muted-foreground font-light text-sm">
            View and update your personal details.
          </p>
        </div>

        <Card className="border-border/50 bg-card/30 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg">
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardHeader className="text-center pb-2 pt-8">
              {/* Profile Image at the center */}
              <div className="relative mx-auto group w-32 h-32">
                <Avatar className="w-32 h-32 border-4 border-background shadow-xl ring-2 ring-primary/10 transition-transform duration-300 group-hover:scale-105">
                  <AvatarImage src={avatarPreview || undefined} className="object-cover" />
                  <AvatarFallback className="text-3xl font-semibold bg-primary/5 text-primary">
                    {userDetails?.firstName?.charAt(0)}
                    {userDetails?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                {/* Circular Upload Progress Overlay */}
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full z-10">
                    <svg className="w-full h-full transform -rotate-90 absolute inset-0">
                      <circle
                        cx="64"
                        cy="64"
                        r="58"
                        className="stroke-white/20"
                        strokeWidth="6"
                        fill="transparent"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="58"
                        className="stroke-primary transition-all duration-300 animate-pulse"
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray={364.4}
                        strokeDashoffset={364.4 * (1 - uploadProgress / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="text-white font-semibold text-sm z-20">
                      {uploadProgress}%
                    </span>
                  </div>
                )}

                {/* Camera Overlay Icon */}
                <button
                  type="button"
                  onClick={() => !isPending && fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 bg-primary text-primary-foreground p-2 rounded-full shadow-lg border border-background hover:bg-primary/95 transition-all active:scale-90 disabled:opacity-75 z-20"
                  title="Upload profile picture"
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <CardTitle className="mt-4 text-xl font-medium">
                {userDetails?.firstName} {userDetails?.lastName}
              </CardTitle>
              <CardDescription className="text-xs uppercase tracking-wider text-muted-foreground">
                {userDetails?.role}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-6 px-6 sm:px-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name Input */}
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-xs font-semibold uppercase tracking-wider">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="Enter first name"
                    className="bg-muted/30 focus-visible:bg-background border-border/50"
                    {...register("firstName", {
                      required: "First name is required",
                    })}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-destructive">{errors.firstName.message}</p>
                  )}
                </div>

                {/* Last Name Input */}
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-xs font-semibold uppercase tracking-wider">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Enter last name"
                    className="bg-muted/30 focus-visible:bg-background border-border/50"
                    {...register("lastName", {
                      required: "Last name is required",
                    })}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-destructive">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Email Address (Read-only) */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email Address
                </Label>
                <Input
                  disabled
                  value={userDetails?.email || ""}
                  className="bg-muted/50 border-border/30 opacity-70 cursor-not-allowed select-none"
                />
                <p className="text-[10px] text-muted-foreground/60 italic">
                  Email address cannot be changed.
                </p>
              </div>

              {/* Avatar URL Input */}
              <div className="space-y-2">
                <Label htmlFor="avatarUrl" className="text-xs font-semibold uppercase tracking-wider">
                  Avatar Image URL
                </Label>
                <Input
                  id="avatarUrl"
                  placeholder="https://example.com/avatar.jpg"
                  className="bg-muted/30 focus-visible:bg-background border-border/50 font-mono text-xs"
                  {...register("avatarUrl")}
                  onChange={(e) => setAvatarPreview(e.target.value || null)}
                />
              </div>
            </CardContent>

            <CardFooter className="px-6 sm:px-10 pb-8 flex justify-end gap-3 border-t border-border/30 pt-6">
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="w-full sm:w-auto h-10 px-6 font-medium"
              >
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Profile;