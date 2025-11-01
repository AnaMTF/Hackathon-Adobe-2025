import { NextResponse } from "next/server";
import { ensureDbReady } from "@/lib/database";
import { User } from "@/app/models/user-model";
import { getCurrentUser } from "@/lib/auth";

// Ensure DB is ready
await ensureDbReady();

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { email, numeFullName, departament, jobTitle, telefon, location, poza, points } = body;

    // If points is provided without email, use authenticated user
    if (points !== undefined && !email) {
      const currentUser = await getCurrentUser();
      
      if (!currentUser || !currentUser.userId) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
      }

      const user = await User.findByPk(currentUser.userId);
      if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
      }

      // Update only points
      await user.update({ points });

      // Return user without password
      const userJson = user.toJSON();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { parola, ...userResponse } = userJson;

      return NextResponse.json({
        message: "Points updated successfully",
        data: { user: userResponse },
      });
    }

    // Original profile update logic
    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    // Update user fields (including points if provided)
    const updateData: Partial<{ 
      numeFullName: string; 
      departament: string; 
      jobTitle: string; 
      telefon: string; 
      location: string; 
      poza: string;
      points: number;
    }> = {};
    
    if (numeFullName !== undefined) updateData.numeFullName = numeFullName;
    if (departament !== undefined) updateData.departament = departament;
    if (jobTitle !== undefined) updateData.jobTitle = jobTitle;
    if (telefon !== undefined) updateData.telefon = telefon;
    if (location !== undefined) updateData.location = location;
    if (poza !== undefined) updateData.poza = poza;
    if (points !== undefined) updateData.points = points;

    await user.update(updateData);

    // Return user without password
    const userJson = user.toJSON();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { parola, ...userResponse } = userJson;

    return NextResponse.json({
      message: "Profile updated successfully",
      data: { user: userResponse },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ message: "Failed to update profile" }, { status: 500 });
  }
}
