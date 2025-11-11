"use server";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";

interface DecodedToken {
  email: string;
  role: string;
  exp: number;
  iat: number;
  name?: string;
}

export const getCurrenUser = async () => {
  try {
    const accessToken = (await cookies()).get("token")?.value;

    if (!accessToken) {
      return null;
    }

    const decodedToken: DecodedToken = await jwtDecode(accessToken);

    // Check if token is expired
    const currentTime = Date.now() / 1000;
    if (decodedToken.exp < currentTime) {
      return null;
    }

    return {
      email: decodedToken.email,
      role: decodedToken.role,
      name: decodedToken.name,
    };
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};
