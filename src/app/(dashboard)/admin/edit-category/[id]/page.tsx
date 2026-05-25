import { redirect } from "next/navigation";

export default function EditCategoryRedirectPage() {
  redirect("/admin/categories");
}
