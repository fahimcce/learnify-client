"use client";

import { useState, useEffect, useRef } from "react";
import {
  useGetMyProfileQuery,
  useUpdateAdminProfileMutation,
  useUpdateProfilePhotoMutation,
} from "@/redux/features/admin/admin.api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Edit2,
  Save,
  X,
  Loader2,
  Camera,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AdminProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const { data: profile, isLoading, error } = useGetMyProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateAdminProfileMutation();
  const [updateProfilePhoto, { isLoading: isUploadingPhoto }] =
    useUpdateProfilePhotoMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile && !isEditing) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        email: profile.email || "",
      });
    }
  }, [profile, isEditing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        email: profile.email || "",
      });
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        email: profile.email || "",
      });
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      await updateProfile({
        id: profile._id,
        data: {
          name: formData.name,
          phone: formData.phone,
        },
      }).unwrap();
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Failed to update profile. Please try again."
      );
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    if (!profile) return;

    try {
      await updateProfilePhoto({
        id: profile._id,
        file,
      }).unwrap();
      toast.success("Profile photo updated successfully");
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          "Failed to update profile photo. Please try again."
      );
    }
  };

  const getProfilePhotoUrl = (profilePhoto?: string) => {
    if (!profilePhoto) return null;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

    const photoPath = profilePhoto.startsWith("/")
      ? profilePhoto
      : `/${profilePhoto}`;
    // Construct full URL: apiUrl + photoPath
    // e.g., http://localhost:5000/api + /uploads/profile-photos/filename.png
    return `${apiUrl}${photoPath}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">
              Error Loading Profile
            </CardTitle>
            <CardDescription>
              Failed to load your profile. Please try refreshing the page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Profile</h1>
          <p className="text-muted-foreground mt-2">
            Manage your personal information and account settings
          </p>
        </div>
        {!isEditing && (
          <Button onClick={handleEdit} variant="outline">
            <Edit2 className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Your account information and contact details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6 pb-6 border-b">
            <div className="relative group">
              <Avatar className="h-24 w-24">
                {profile.profilePhoto ? (
                  <AvatarImage
                    src={getProfilePhotoUrl(profile.profilePhoto) || undefined}
                    alt={profile.name}
                  />
                ) : null}
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
              >
                {isUploadingPhoto ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold">{profile.name}</h3>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Member since {format(new Date(profile.createdAt), "MMMM yyyy")}
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name
              </Label>
              {isEditing ? (
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                />
              ) : (
                <div className="px-3 py-2 rounded-md border bg-muted/50">
                  {profile.name}
                </div>
              )}
            </div>

            {/* Email Field (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <div className="px-3 py-2 rounded-md border bg-muted/50">
                {profile.email}
              </div>
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              {isEditing ? (
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                />
              ) : (
                <div className="px-3 py-2 rounded-md border bg-muted/50">
                  {profile.phone || "Not provided"}
                </div>
              )}
            </div>
          </div>

          {/* Account Information */}
          <div className="pt-6 border-t space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Account Information
            </h4>
            <div className="grid gap-4 md:grid-cols-2 text-sm">
              <div>
                <p className="text-muted-foreground">Account Created</p>
                <p className="font-medium">
                  {format(new Date(profile.createdAt), "PPpp")}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Updated</p>
                <p className="font-medium">
                  {format(new Date(profile.updatedAt), "PPpp")}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button
                onClick={handleSave}
                disabled={isUpdating}
                className="flex-1"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={isUpdating}
                className="flex-1"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
          <CardDescription>
            Your account status and security information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <p className="font-medium">Account Status</p>
                <p className="text-sm text-muted-foreground">
                  {profile.isDeleted
                    ? "Your account has been deleted"
                    : "Your account is active"}
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  profile.isDeleted
                    ? "bg-destructive/10 text-destructive"
                    : "bg-green-500/10 text-green-600 dark:text-green-400"
                }`}
              >
                {profile.isDeleted ? "Deleted" : "Active"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
