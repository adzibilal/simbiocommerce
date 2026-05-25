import type { Metadata } from "next";
export const metadata: Metadata = { title: "Add Category" };

import { redirect } from "next/navigation";

export default function AddCategoryRedirectPage() {
  redirect("/admin/categories");
}
