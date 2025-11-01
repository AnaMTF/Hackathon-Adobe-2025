import { NextResponse } from "next/server";
import { ensureDbReady, sequelize } from "@/lib/database";
import { DataTypes, Model } from "sequelize";

// Ensure DB is ready
await ensureDbReady();

// Define User model inline
class User extends Model {}
User.init(
  {
    uuid: { type: DataTypes.UUID, primaryKey: true, autoIncrement: true },
    numeFullName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    parola: { type: DataTypes.STRING, allowNull: false },
    departament: { type: DataTypes.STRING, allowNull: false },
    jobTitle: { type: DataTypes.STRING, allowNull: false },
    telefon: { type: DataTypes.STRING },
    location: { type: DataTypes.STRING },
    poza: { type: DataTypes.TEXT },
  },
  { sequelize, tableName: "users", timestamps: true }
);

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { email, numeFullName, departament, jobTitle, telefon, location, poza } = body;

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    // Update user fields
    await user.update({ numeFullName, departament, jobTitle, telefon, location, poza });


    return NextResponse.json({
      message: "Profile updated successfully",
      data: { user },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ message: "Failed to update profile" }, { status: 500 });
  }
}
