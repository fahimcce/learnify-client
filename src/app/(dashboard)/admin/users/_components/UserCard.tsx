"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { UserProfile } from "@/redux/features/user/user.api";
import { User, Ban, Trash2, Phone, MoreVertical } from "lucide-react";

interface UserCardProps {
  user: UserProfile;
  onBlock: (userId: string) => void;
  onDelete: (userId: string) => void;
  getRoleBadgeColor: (role: string) => string;
}

export default function UserCard({
  user,
  onBlock,
  onDelete,
  getRoleBadgeColor,
}: UserCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/admin/users/${user._id}`);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking menu
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className="h-full cursor-pointer hover:shadow-lg transition-shadow"
        onClick={handleCardClick}
      >
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2 flex-1">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">{user.name}</CardTitle>
                <CardDescription className="text-xs">
                  {user.email}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getRoleBadgeColor(user.role)}>
                {user.role}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={handleMenuClick}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleMenuClick}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={handleMenuClick}>
                  {!user.isDeleted && (
                    <>
                      <DropdownMenuItem onClick={() => onBlock(user._id)}>
                        <Ban className="mr-2 h-4 w-4" />
                        {user.isBlocked ? "Unblock" : "Block"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(user._id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {user.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              {user.phone}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
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
        </CardContent>
      </Card>
    </motion.div>
  );
}
