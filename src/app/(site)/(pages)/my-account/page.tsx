import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getOrdersByUser } from "@/app/actions/order";
import { getSavedAddresses } from "@/app/actions/address";
import MyAccount from "@/components/MyAccount";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account | SimbioCommerce",
};

export default async function MyAccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/signin?callbackUrl=/my-account");

  const [userRows, orders, savedAddresses] = await Promise.all([
    db.select().from(users).where(eq(users.id, session.user.id)),
    getOrdersByUser(session.user.id),
    getSavedAddresses(session.user.id),
  ]);

  const user = userRows[0];

  return (
    <main>
      <MyAccount user={user} orders={orders} savedAddresses={savedAddresses} />
    </main>
  );
}
