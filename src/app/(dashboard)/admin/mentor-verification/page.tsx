"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetAllMentorsForVerificationQuery,
  useApproveMentorMutation,
  useUnverifyMentorMutation,
  useRejectMentorMutation,
  PendingMentor,
} from "@/redux/features/admin/admin.api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  CheckCircle,
  XCircle,
  UserCheck,
  Clock,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  ShieldX,
  Users,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function MentorVerificationPage() {
  const {
    data: allMentors,
    isLoading,
    refetch,
  } = useGetAllMentorsForVerificationQuery();
  const [approveMentor, { isLoading: isApproving }] =
    useApproveMentorMutation();
  const [unverifyMentor, { isLoading: isUnverifying }] =
    useUnverifyMentorMutation();
  const [rejectMentor, { isLoading: isRejecting }] = useRejectMentorMutation();

  const [selectedMentor, setSelectedMentor] = useState<PendingMentor | null>(
    null
  );
  const [actionType, setActionType] = useState<
    "approve" | "unverify" | "reject" | null
  >(null);

  const pendingMentors = allMentors?.filter((m) => !m.isVerified) || [];
  const verifiedMentors = allMentors?.filter((m) => m.isVerified) || [];

  const handleAction = async () => {
    if (!selectedMentor || !actionType) return;

    try {
      if (actionType === "approve") {
        await approveMentor(selectedMentor._id).unwrap();
        toast.success(`${selectedMentor.name} has been verified successfully!`);
      } else if (actionType === "unverify") {
        await unverifyMentor(selectedMentor._id).unwrap();
        toast.success(`${selectedMentor.name}'s access has been revoked.`);
      } else {
        await rejectMentor(selectedMentor._id).unwrap();
        toast.success(`${selectedMentor.name} has been removed.`);
      }
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "An error occurred");
    } finally {
      setSelectedMentor(null);
      setActionType(null);
    }
  };

  const openConfirmDialog = (
    mentor: PendingMentor,
    action: "approve" | "unverify" | "reject"
  ) => {
    setSelectedMentor(mentor);
    setActionType(action);
  };

  const isProcessing = isApproving || isUnverifying || isRejecting;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const MentorCard = ({
    mentor,
    showVerifyButton,
  }: {
    mentor: PendingMentor;
    showVerifyButton: boolean;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardHeader
          className={`pb-4 ${
            mentor.isVerified
              ? "bg-gradient-to-r from-green-500/10 to-emerald-500/10"
              : "bg-gradient-to-r from-orange-500/10 to-yellow-500/10"
          }`}
        >
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14 border-2 border-background shadow-lg">
              <AvatarImage src={mentor.profilePhoto} alt={mentor.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                {mentor.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-lg">{mentor.name}</CardTitle>
              {mentor.isVerified ? (
                <Badge className="mt-2 bg-green-500/20 text-green-600 border-green-500/30">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="mt-2 bg-orange-500/10 text-orange-600 border-orange-500/30"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Pending
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span className="truncate">{mentor.email}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{mentor.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(mentor.createdAt), "PPP")}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-3 border-t">
            {showVerifyButton ? (
              <>
                <Button
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => openConfirmDialog(mentor, "approve")}
                  disabled={isProcessing}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => openConfirmDialog(mentor, "reject")}
                  disabled={isProcessing}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-orange-600 border-orange-300 hover:bg-orange-50"
                  onClick={() => openConfirmDialog(mentor, "unverify")}
                  disabled={isProcessing}
                >
                  <ShieldX className="h-4 w-4 mr-1" />
                  Revoke Access
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => openConfirmDialog(mentor, "reject")}
                  disabled={isProcessing}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Mentor Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage mentor verification and access
          </p>
        </div>
        <div className="flex gap-2">
          <Badge
            variant="outline"
            className="px-3 py-1.5 bg-orange-500/10 text-orange-600 border-orange-300"
          >
            <Clock className="h-3 w-3 mr-1" />
            {pendingMentors.length} Pending
          </Badge>
          <Badge
            variant="outline"
            className="px-3 py-1.5 bg-green-500/10 text-green-600 border-green-300"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            {verifiedMentors.length} Verified
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">Total Mentors</p>
                <p className="text-2xl font-bold">{allMentors?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-500/20">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingMentors.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">Verified</p>
                <p className="text-2xl font-bold">{verifiedMentors.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <UserCheck className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-xs text-muted-foreground">Admin Control</p>
                <p className="text-sm font-semibold">Full Access</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingMentors.length})
          </TabsTrigger>
          <TabsTrigger value="verified" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Verified ({verifiedMentors.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingMentors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {pendingMentors.map((mentor) => (
                  <MentorCard
                    key={mentor._id}
                    mentor={mentor}
                    showVerifyButton={true}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">All Caught Up!</h3>
                <p className="text-muted-foreground">
                  No pending verification requests.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="verified" className="mt-6">
          {verifiedMentors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {verifiedMentors.map((mentor) => (
                  <MentorCard
                    key={mentor._id}
                    mentor={mentor}
                    showVerifyButton={false}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No Verified Mentors</h3>
                <p className="text-muted-foreground">
                  Approve pending mentors to see them here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={!!selectedMentor && !!actionType}
        onOpenChange={() => {
          setSelectedMentor(null);
          setActionType(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {actionType === "approve" && (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Approve Mentor
                </>
              )}
              {actionType === "unverify" && (
                <>
                  <ShieldX className="h-5 w-5 text-orange-500" />
                  Revoke Access
                </>
              )}
              {actionType === "reject" && (
                <>
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Remove Mentor
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "approve" && (
                <>
                  Are you sure you want to approve{" "}
                  <strong>{selectedMentor?.name}</strong>? They will have full
                  access to the mentor dashboard.
                </>
              )}
              {actionType === "unverify" && (
                <>
                  Are you sure you want to revoke access for{" "}
                  <strong>{selectedMentor?.name}</strong>? They will no longer
                  be able to access the mentor dashboard.
                </>
              )}
              {actionType === "reject" && (
                <>
                  Are you sure you want to remove{" "}
                  <strong>{selectedMentor?.name}</strong>? This action will
                  delete their account.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              disabled={isProcessing}
              className={
                actionType === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : actionType === "unverify"
                  ? "bg-orange-600 hover:bg-orange-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {isProcessing && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {actionType === "approve" && "Approve"}
              {actionType === "unverify" && "Revoke Access"}
              {actionType === "reject" && "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
