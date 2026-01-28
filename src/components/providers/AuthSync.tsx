"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetMyProfileQuery } from "@/redux/features/user/user.api";
import { setUser } from "@/redux/features/auth/authSlice";
import { RootState } from "@/redux/store";

export function AuthSync() {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);

  // Only fetch if token exists
  const { data: userProfile, isSuccess } = useGetMyProfileQuery(undefined, {
    skip: !token,
  });

  useEffect(() => {
    if (isSuccess && userProfile) {
      // Update the auth user with the latest data from the server
      // This ensures that isVerified and other status-related fields are always up to date
      dispatch(
        setUser({
          _id: userProfile._id,
          name: userProfile.name,
          email: userProfile.email,
          phone: userProfile.phone,
          role: userProfile.role,
          isVerified: userProfile.isVerified,
          profilePhoto: userProfile.profilePhoto,
        }),
      );
    }
  }, [isSuccess, userProfile, dispatch]);

  return null;
}
