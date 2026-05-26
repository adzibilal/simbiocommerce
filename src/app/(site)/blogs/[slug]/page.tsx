import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublishedPostBySlug, getPublishedPosts } from "@/app/actions/post";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return { title: "Blog | SimbioCommerce" };
  return {
    title: post.metaTitle || `${post.title} | SimbioCommerce`,
    description: post.metaDescription || "",
    openGraph: {
      title: post.title,
      description: post.metaDescription || "",
      ...(post.featuredImage ? { images: [post.featuredImage] } : {}),
    },
  };
}

const BlogDetailsPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const allPosts = await getPublishedPosts();
  const related = allPosts.filter((p) => p.id !== post.id).slice(0, 3);

  const date = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <main>
      <Breadcrumb title={post.title} pages={["blog", post.title]} />
      <section className="py-16 bg-gray-2">
        <div className="max-w-[800px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          {/* Featured image */}
          {post.featuredImage && (
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-8">
              <Image src={post.featuredImage} alt={post.title} fill className="object-cover" sizes="800px" priority />
            </div>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {post.category && (
              <span className="bg-blue/10 text-blue text-xs font-medium px-3 py-1 rounded-full">{post.category}</span>
            )}
            {date && <span className="text-sm text-gray-500">{date}</span>}
            {post.author && <span className="text-sm text-gray-500">by <span className="font-medium text-dark">{post.author}</span></span>}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-dark leading-snug mb-8">{post.title}</h1>

          {/* Content */}
          <div className="[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-dark [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-dark [&_h2]:mb-3 [&_h2]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-dark [&_h3]:mb-2 [&_p]:text-gray-600 [&_p]:leading-relaxed [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_li]:text-gray-600 [&_li]:mb-1 [&_strong]:text-dark [&_strong]:font-semibold [&_a]:text-blue [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-blue [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-500 [&_img]:rounded-xl [&_img]:my-4 [&_img]:w-full [&_hr]:my-6 [&_hr]:border-gray-200">
            {post.content ? (
              <ReactMarkdown>{post.content}</ReactMarkdown>
            ) : (
              <p className="text-gray-400 italic">No content available.</p>
            )}
          </div>

          {/* Back link */}
          <div className="mt-10 pt-6 border-t border-gray-200">
            <Link href="/blogs" className="inline-flex items-center gap-2 text-sm font-medium text-blue hover:underline">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
              Back to Blog
            </Link>
          </div>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 mt-16">
            <h2 className="text-xl font-bold text-dark mb-6">Other Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {related.map((p) => (
                <div key={p.id} className="bg-white rounded-xl shadow-1 overflow-hidden">
                  <Link href={`/blogs/${p.slug}`} className="block relative aspect-[16/10] bg-gray-100">
                    {p.featuredImage && (
                      <Image src={p.featuredImage} alt={p.title} fill className="object-cover" sizes="400px" />
                    )}
                  </Link>
                  <div className="p-4">
                    {p.category && (
                      <span className="text-xs text-blue font-medium">{p.category}</span>
                    )}
                    <h3 className="font-semibold text-dark text-sm mt-1 line-clamp-2 hover:text-blue">
                      <Link href={`/blogs/${p.slug}`}>{p.title}</Link>
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default BlogDetailsPage;
