"use client";

import { useState } from "react";
import { useChangePasswordMutation } from "@/redux/features/auth/auth.api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";

export function ChangePasswordCard() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [show, setShow] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggle = (key: "current" | "next" | "confirm") => {
    setShow((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (form.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }

    try {
      await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      }).unwrap();
      toast.success("Password updated successfully.");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          "Failed to update password. Please try again."
      );
    }
  };

  const renderInput = (
    label: string,
    name: "currentPassword" | "newPassword" | "confirmPassword",
    showKey: "current" | "next" | "confirm"
  ) => (
    <div className="space-y-2">
      <Label htmlFor={name} className="flex items-center gap-2">
        <LockKeyhole className="h-4 w-4" />
        {label}
      </Label>
      <div className="relative">
        <Input
          id={name}
          name={name}
          type={show[showKey] ? "text" : "password"}
          value={form[name]}
          onChange={handleChange}
          placeholder={label}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
          onClick={() => toggle(showKey)}
          tabIndex={-1}
        >
          {show[showKey] ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle visibility</span>
        </Button>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>
          Use your current password to set a new, stronger password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            {renderInput("Current Password", "currentPassword", "current")}
            {renderInput("New Password", "newPassword", "next")}
            {renderInput(
              "Confirm New Password",
              "confirmPassword",
              "confirm"
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Minimum 8 characters. Avoid using previously used passwords.
          </p>
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

