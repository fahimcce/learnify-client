"use server";

import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  email: string;
  role: string;
  exp: number;
  iat: number;
  name?: string;
}

export async function setAuthCookies(token: string) {
  try {
    const cookieStore = await cookies();

    // Decode token to get expiration
    const decodedToken: DecodedToken = jwtDecode(token);

    // Calculate expiration date (7 days from now or use token exp, whichever is earlier)
    const tokenExp = decodedToken.exp * 1000; // Convert to milliseconds
    const sevenDaysFromNow = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const expires = new Date(Math.min(tokenExp, sevenDaysFromNow));

    // Set token cookie
    cookieStore.set("token", token, {
      httpOnly: false, // Allow client-side access for Redux
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expires,
      path: "/",
    });

    // Set user cookie
    // Note: JWT token may not include name, so we'll set it from Redux state if available
    const userData = {
      email: decodedToken.email,
      role: decodedToken.role,
      name: decodedToken.name || decodedToken.email, // Fallback to email if name not in token
    };

    cookieStore.set("user", JSON.stringify(userData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expires,
      path: "/",
    });

    return { success: true, user: userData };
  } catch (error) {
    console.error("Error setting auth cookies:", error);
    return { success: false, error: "Failed to set authentication cookies" };
  }
}

export async function clearAuthCookies() {
  try {
    const cookieStore = await cookies();

    // Delete cookies - delete() only takes the cookie name, no options needed
    cookieStore.delete("token");
    cookieStore.delete("user");

    return { success: true };
  } catch (error: any) {
    // Log error but don't throw - client-side cleanup will handle it
    console.error("Error clearing auth cookies:", error?.message || error);
    // Return success anyway since client-side cleanup happens via Redux
    return { success: true };
  }
}
