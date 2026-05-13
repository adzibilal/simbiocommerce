import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import ProfileForm from "@/components/Dashboard/ProfileForm";
import { redirect } from "next/navigation";

const ProfilePage = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const rows = await db.select().from(users).where(eq(users.email, session.user.email));
  const user = rows[0];

  if (!user) {
    return (
      <div className="p-6 bg-white rounded-2xl shadow-1 border border-gray-2 text-dark font-euclid-circular-a">
        User not found in database.
      </div>
    );
  }

  return (
    <div className="space-y-6 font-euclid-circular-a">
      <div>
        <h1 className="text-heading-5 font-bold text-dark">Profile Detail</h1>
        <p className="text-custom-sm text-body">
          Manage your personal information.
        </p>
      </div>

      <ProfileForm user={user} />
    </div>
  );
};

export default ProfilePage;
