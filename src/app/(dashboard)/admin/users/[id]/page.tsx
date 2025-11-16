"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  useGetUserByIdQuery,
  useBlockUserMutation,
  useDeleteUserMutation,
} from "@/redux/features/user/user.api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Loader2,
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Ban,
  Trash2,
  User,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const [blockUserId, setBlockUserId] = useState<string | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const { data: user, isLoading, error } = useGetUserByIdQuery(userId);
  const [blockUser, { isLoading: isBlocking }] = useBlockUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      case "user":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
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

  const getProfilePhotoUrl = (profilePhoto?: string) => {
    if (!profilePhoto) return null;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    // profilePhoto is stored as: /uploads/profile-photos/filename.png
    // We want to access it via: http://localhost:5000/api/uploads/profile-photos/filename.png
    const photoPath = profilePhoto.startsWith("/")
      ? profilePhoto
      : `/${profilePhoto}`;
    return `${apiUrl}${photoPath}`;
  };

  const handleBlockUser = async () => {
    if (!blockUserId || !user) return;

    try {
      await blockUser({
        id: blockUserId,
        isBlocked: !user.isBlocked,
      }).unwrap();
      toast.success(
        user.isBlocked
          ? "User unblocked successfully!"
          : "User blocked successfully!"
      );
      setBlockUserId(null);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to update user status. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;

    try {
      await deleteUser(deleteUserId).unwrap();
      toast.success("User deleted successfully!");
      router.push("/admin/users");
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to delete user. Please try again.";
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">User not found</h3>
          <p className="text-muted-foreground mb-4">
            The user you're looking for doesn't exist or has been deleted.
          </p>
          <Link href="/admin/users">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/users">
            <Button variant="ghost" size="sm" className="mb-2 border">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">User Details</h1>
          <p className="text-muted-foreground mt-2">
            View and manage user information
          </p>
        </div>
        {!user.isDeleted && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setBlockUserId(user._id)}>
              <Ban className="mr-2 h-4 w-4" />
              {user.isBlocked ? "Unblock" : "Block"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setDeleteUserId(user._id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* User Information */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Basic user details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profile Photo */}
            <div className="space-y-2">
              <Label>Profile Photo</Label>
              <div className="flex items-center gap-4 p-3 bg-muted rounded-md">
                <Avatar className="h-20 w-20">
                  {user.profilePhoto ? (
                    <AvatarImage
                      src={getProfilePhotoUrl(user.profilePhoto) || undefined}
                      alt={user.name}
                    />
                  ) : null}
                  <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.profilePhoto ? "Photo uploaded" : "No photo"}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <div className="p-3 bg-muted rounded-md flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                {user.name}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="p-3 bg-muted rounded-md flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {user.email}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <div className="p-3 bg-muted rounded-md flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {user.phone || "N/A"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Account status and role</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <div className="p-3 bg-muted rounded-md">
                <Badge className={getRoleBadgeColor(user.role)}>
                  {user.role}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="p-3 bg-muted rounded-md flex gap-2">
                {user.isDeleted && <Badge variant="destructive">Deleted</Badge>}
                {user.isBlocked && <Badge variant="destructive">Blocked</Badge>}
                {!user.isDeleted && !user.isBlocked && (
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                  >
                    Active
                  </Badge>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>User ID</Label>
              <div className="p-3 bg-muted rounded-md font-mono text-xs break-all">
                {user._id}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timestamps</CardTitle>
            <CardDescription>Account creation and update dates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Created</Label>
              <div className="p-3 bg-muted rounded-md flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div>{new Date(user.createdAt).toLocaleDateString()}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(user.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Last Updated</Label>
              <div className="p-3 bg-muted rounded-md flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div>{new Date(user.updatedAt).toLocaleDateString()}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(user.updatedAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Block/Unblock Confirmation Dialog */}
      <AlertDialog
        open={!!blockUserId}
        onOpenChange={(open) => !open && setBlockUserId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {user.isBlocked ? "Unblock User?" : "Block User?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {user.isBlocked
                ? "This will allow the user to access the platform again."
                : "This will prevent the user from accessing the platform."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBlocking}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBlockUser} disabled={isBlocking}>
              {isBlocking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : user.isBlocked ? (
                "Unblock"
              ) : (
                "Block"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteUserId}
        onOpenChange={(open) => !open && setDeleteUserId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User?</AlertDialogTitle>
            <AlertDialogDescription>
              This will soft delete the user. The user will be marked as deleted
              but their data will be retained. This action can be reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete User"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
