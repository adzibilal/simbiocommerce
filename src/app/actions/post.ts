"use server";

import { db } from "@/db";
import { posts, postCategories, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getPosts() {
  try {
    return await db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        status: posts.status,
        createdAt: posts.createdAt,
        category: postCategories.name,
        author: users.name,
      })
      .from(posts)
      .leftJoin(postCategories, eq(posts.categoryId, postCategories.id))
      .leftJoin(users, eq(posts.authorId, users.id));
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return [];
  }
}

export async function getPostById(id: string) {
  try {
    const result = await db.select().from(posts).where(eq(posts.id, id));
    return result[0] || null;
  } catch (error) {
    console.error("Failed to fetch post by id:", error);
    return null;
  }
}

export async function createPost(data: {
  title: string;
  slug: string;
  content?: string;
  featuredImage?: string;
  categoryId?: string;
  authorId: string;
  status?: string;
  metaTitle?: string;
  metaDescription?: string;
}) {
  try {
    await db.insert(posts).values(data);
    revalidatePath("/admin/posts");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return { success: false, error: "Post slug already exists!" };
    }
    return { success: false, error: error.message || "Failed to create post" };
  }
}

export async function updatePost(id: string, data: {
  title?: string;
  slug?: string;
  content?: string;
  featuredImage?: string;
  categoryId?: string;
  status?: string;
  metaTitle?: string;
  metaDescription?: string;
}) {
  try {
    await db.update(posts).set({ ...data, updatedAt: new Date().toISOString() }).where(eq(posts.id, id));
    revalidatePath("/admin/posts");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return { success: false, error: "Post slug already exists!" };
    }
    return { success: false, error: error.message || "Failed to update post" };
  }
}

export async function getPublishedPosts() {
  try {
    return await db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        featuredImage: posts.featuredImage,
        createdAt: posts.createdAt,
        category: postCategories.name,
        categorySlug: postCategories.slug,
        author: users.name,
        metaDescription: posts.metaDescription,
      })
      .from(posts)
      .leftJoin(postCategories, eq(posts.categoryId, postCategories.id))
      .leftJoin(users, eq(posts.authorId, users.id))
      .where(eq(posts.status, "published"))
      .orderBy(posts.createdAt);
  } catch (error) {
    console.error("Failed to fetch published posts:", error);
    return [];
  }
}

export async function getPublishedPostBySlug(slug: string) {
  try {
    const result = await db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        content: posts.content,
        featuredImage: posts.featuredImage,
        createdAt: posts.createdAt,
        status: posts.status,
        metaTitle: posts.metaTitle,
        metaDescription: posts.metaDescription,
        category: postCategories.name,
        categorySlug: postCategories.slug,
        author: users.name,
      })
      .from(posts)
      .leftJoin(postCategories, eq(posts.categoryId, postCategories.id))
      .leftJoin(users, eq(posts.authorId, users.id))
      .where(eq(posts.slug, slug))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("Failed to fetch post by slug:", error);
    return null;
  }
}

export async function deletePost(id: string) {
  try {
    await db.delete(posts).where(eq(posts.id, id));
    revalidatePath("/admin/posts");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete post" };
  }
}
