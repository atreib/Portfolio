import { getAllArticles, getArticleById } from "@/services/articles";
import { redirect } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Metadata, ResolvingMetadata } from "next";

type PageProps = {
  params: { id: string };
};

export const revalidate = 3600; // 1 hour
export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await getAllArticles();
  return posts.map((post) => ({
    id: post.id,
  }));
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const post = await getArticleById(params.id);
  if (!post) return redirect("/blog");
  const previousKeywords = (await parent).keywords || [];
  return {
    title: post.title,
    description: post.content.slice(0, 100),
    keywords: [post.title, ...previousKeywords],
    openGraph: {
      images: [post.thumbnail],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const post = await getArticleById(params.id);
  if (!post) return redirect("/blog");

  return (
    <div className="bg-background text-foreground px-4 md:px-6 space-y-6 md:space-y-12 lg:space-y-16">
      <nav>
        <Link
          className="text-muted-foreground hover:text-foreground transition-colors hover:underline underline-offset-4"
          href="/blog"
        >
          Back to all posts
        </Link>
      </nav>
      <header className="space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl lg:leading-[3.5rem]">
          {post.title}
        </h1>
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={post.author.avatar} />
            <AvatarFallback>
              {post.author.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span>{post.author.name}</span>
        </div>
        <p className="text-muted-foreground">
          Published on {formatDate(post.date)}
        </p>
      </header>
      <aside className="w-full lg:w-1/2 aspect-video">
        <Image
          src={post.thumbnail}
          alt={post.title}
          width={1024}
          height={1024}
          className="object-cover object-center w-full h-full"
        />
      </aside>
      <main className="">
        <article dangerouslySetInnerHTML={{ __html: post.content }} />
      </main>
    </div>
  );
}