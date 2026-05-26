import ReactMarkdown from "react-markdown";

interface StaticPageProps {
  title: string;
  content: string;
}

export default function StaticPage({ title, content }: StaticPageProps) {
  return (
    <section className="py-20">
      <div className="max-w-[900px] mx-auto px-4 sm:px-8 xl:px-0">
        <h1 className="text-3xl font-bold text-dark mb-10">{title}</h1>
        {content ? (
          <div className="
            [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-dark [&_h1]:mb-4 [&_h1]:mt-8
            [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-dark [&_h2]:mb-3 [&_h2]:mt-8
            [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-dark [&_h3]:mb-2 [&_h3]:mt-6
            [&_p]:text-body [&_p]:leading-relaxed [&_p]:mb-4
            [&_ul]:text-body [&_ul]:mb-4 [&_ul]:pl-6 [&_ul]:list-disc
            [&_ol]:text-body [&_ol]:mb-4 [&_ol]:pl-6 [&_ol]:list-decimal
            [&_li]:mb-1 [&_li]:leading-relaxed
            [&_strong]:font-semibold [&_strong]:text-dark
            [&_a]:text-blue [&_a]:underline hover:[&_a]:text-blue-dark
            [&_blockquote]:border-l-4 [&_blockquote]:border-blue/30 [&_blockquote]:pl-4 [&_blockquote]:text-body [&_blockquote]:italic [&_blockquote]:mb-4
            [&_hr]:border-gray-3 [&_hr]:my-6
            [&_em]:italic
          ">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-body">Content coming soon.</p>
        )}
      </div>
    </section>
  );
}
