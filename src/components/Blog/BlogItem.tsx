import React from "react";
import Image from "next/image";
import Link from "next/link";

type Post = {
  id: string;
  title: string;
  slug: string;
  featuredImage?: string | null;
  createdAt?: string | null;
  category?: string | null;
  author?: string | null;
  metaDescription?: string | null;
};

const FALLBACK = "/images/blog/blog-01.jpg";

const BlogItem = ({ blog }: { blog: Post }) => {
  const date = blog.createdAt
    ? new Date(blog.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    : "";

  return (
    <div className="shadow-1 bg-white rounded-xl overflow-hidden">
      <Link href={`/blogs/${blog.slug}`} className="block overflow-hidden aspect-[16/10] relative bg-gray-100">
        <Image
          src={blog.featuredImage || FALLBACK}
          alt={blog.title}
          fill
          className="object-cover transition-transform duration-500 hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </Link>

      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-3 mb-3 text-custom-sm text-gray-500">
          {blog.category && (
            <span className="bg-blue/10 text-blue text-xs font-medium px-2.5 py-0.5 rounded-full">
              {blog.category}
            </span>
          )}
          {date && <span>{date}</span>}
        </div>

        <h2 className="font-semibold text-dark text-lg leading-snug mb-3 hover:text-blue transition-colors line-clamp-2">
          <Link href={`/blogs/${blog.slug}`}>{blog.title}</Link>
        </h2>

        {blog.metaDescription && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">{blog.metaDescription}</p>
        )}

        <Link
          href={`/blogs/${blog.slug}`}
          className="text-custom-sm inline-flex items-center gap-2 py-2 text-blue hover:gap-3 transition-all duration-200 font-medium"
        >
          Read More
          <svg className="fill-current" width="16" height="16" viewBox="0 0 18 18" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M10.1023 4.10225C10.3219 3.88258 10.6781 3.88258 10.8977 4.10225L15.3977 8.60225C15.6174 8.82192 15.6174 9.17808 15.3977 9.39775L10.8977 13.8977C10.6781 14.1174 10.3219 14.1174 10.1023 13.8977C9.88258 13.6781 9.88258 13.3219 10.1023 13.1023L13.642 9.5625H3C2.68934 9.5625 2.4375 9.31066 2.4375 9C2.4375 8.68934 2.68934 8.4375 3 8.4375H13.642L10.1023 4.89775C9.88258 4.67808 9.88258 4.32192 10.1023 4.10225Z" fill=""/>
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default BlogItem;
