"use client";

import { useState } from "react";
import {
  useGetAllUsersQuery,
  useBlockUserMutation,
  useDeleteUserMutation,
  UserProfile,
} from "@/redux/features/user/user.api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, MoreHorizontal, Ban, Trash2 } from "lucide-react";
import { toast } from "sonner";
import UserStatistics from "./_components/UserStatistics";
import UserFilters from "./_components/UserFilters";
import BlockUserDialog from "./_components/BlockUserDialog";
import DeleteUserDialog from "./_components/DeleteUserDialog";

export default function AdminUsersPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [blockUserId, setBlockUserId] = useState<string | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const { data: users, isLoading } = useGetAllUsersQuery();
  const [blockUser, { isLoading: isBlocking }] = useBlockUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const usersArray = Array.isArray(users) ? users : [];

  // Filter users
  const filteredUsers = usersArray.filter((user) => {
    // Status filter
    if (statusFilter === "active" && user.isDeleted) return false;
    if (statusFilter === "deleted" && !user.isDeleted) return false;
    if (statusFilter === "blocked" && !user.isBlocked) return false;
    if (statusFilter === "unblocked" && user.isBlocked) return false;

    // Role filter
    if (roleFilter !== "all" && user.role !== roleFilter) return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query) ||
        user._id.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const activeUsers = usersArray.filter((u) => !u.isDeleted).length;
  const deletedUsers = usersArray.filter((u) => u.isDeleted).length;
  const blockedUsers = usersArray.filter((u) => u.isBlocked).length;
  const mentorUsers = usersArray.filter((u) => u.role === "mentor").length;

  const handleBlockUser = async () => {
    if (!blockUserId) return;
    const user = usersArray.find((u) => u._id === blockUserId);
    if (!user) return;

    try {
      await blockUser({
        id: blockUserId,
        isBlocked: !user.isBlocked,
      }).unwrap();
      toast.success(
        user.isBlocked
          ? "User unblocked successfully!"
          : "User blocked successfully!",
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
      setDeleteUserId(null);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to delete user. Please try again.";
      toast.error(errorMessage);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "mentor":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400";
      case "user":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const blockUserData = usersArray.find((u) => u._id === blockUserId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground mt-2">
          Manage all users in the system
        </p>
      </div>

      {/* Statistics */}
      <UserStatistics
        activeUsers={activeUsers}
        blockedUsers={blockedUsers}
        deletedUsers={deletedUsers}
        mentorUsers={mentorUsers}
      />

      {/* Filters */}
      <UserFilters
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        roleFilter={roleFilter}
        onSearchChange={setSearchQuery}
        onStatusFilterChange={setStatusFilter}
        onRoleFilterChange={setRoleFilter}
      />

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
          <CardDescription>List of all users in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium">{user.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={getRoleBadgeColor(user.role)}
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {user.phone || "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
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
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setBlockUserId(user._id)}
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              {user.isBlocked ? "Unblock" : "Block"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteUserId(user._id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No users found</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search or filters"
                  : "No users match the current filters"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Block/Unblock Confirmation Dialog */}
      <BlockUserDialog
        open={!!blockUserId}
        onOpenChange={(open) => !open && setBlockUserId(null)}
        isBlocked={blockUserData?.isBlocked || false}
        onConfirm={handleBlockUser}
        isLoading={isBlocking}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteUserDialog
        open={!!deleteUserId}
        onOpenChange={(open) => !open && setDeleteUserId(null)}
        onConfirm={handleDeleteUser}
        isLoading={isDeleting}
      />
    </div>
  );
}
