"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { UserProfile } from "@/redux/features/user/user.api";
import { Loader2, Mail, Phone, Calendar, Edit } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ViewUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile | undefined;
  isLoading: boolean;
  onEdit: (user: UserProfile) => void;
  getRoleBadgeColor: (role: string) => string;
}

export default function ViewUserDialog({
  open,
  onOpenChange,
  user,
  isLoading,
  onEdit,
  getRoleBadgeColor,
}: ViewUserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            View detailed information about the user
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : user ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <div className="p-3 bg-muted rounded-md">{user.name}</div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="p-3 bg-muted rounded-md flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <div className="p-3 bg-muted rounded-md flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {user.phone || "N/A"}
                </div>
              </div>
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
                  {user.isDeleted && (
                    <Badge variant="destructive">Deleted</Badge>
                  )}
                  {user.isBlocked && (
                    <Badge variant="destructive">Blocked</Badge>
                  )}
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
                <div className="p-3 bg-muted rounded-md font-mono text-xs">
                  {user._id}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Created</Label>
                <div className="p-3 bg-muted rounded-md flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  {new Date(user.createdAt).toLocaleDateString()} (
                  {formatDistanceToNow(new Date(user.createdAt), {
                    addSuffix: true,
                  })}
                  )
                </div>
              </div>
              <div className="space-y-2">
                <Label>Last Updated</Label>
                <div className="p-3 bg-muted rounded-md flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  {new Date(user.updatedAt).toLocaleDateString()} (
                  {formatDistanceToNow(new Date(user.updatedAt), {
                    addSuffix: true,
                  })}
                  )
                </div>
              </div>
            </div>
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {user && !user.isDeleted && (
            <Button
              onClick={() => {
                onOpenChange(false);
                onEdit(user);
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit User
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
