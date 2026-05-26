import React from "react";
import Breadcrumb from "../Common/Breadcrumb";
import BlogItem from "../Blog/BlogItem";
import { getPublishedPosts } from "@/app/actions/post";

const BlogGrid = async () => {
  const posts = await getPublishedPosts();

  return (
    <>
      <Breadcrumb title="Blog" pages={["blog"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          {posts.length === 0 ? (
            <div className="text-center py-20 text-gray-400">No posts published yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-7.5">
              {posts.map((post) => (
                <BlogItem key={post.id} blog={post} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default BlogGrid;
