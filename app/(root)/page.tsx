import ThreadCard from "@/components/cards/ThreadCard";
import { fetchPosts } from "@/lib/actions/thread.actions";
import { currentUser } from "@clerk/nextjs";

export default async function Home() {
  // fetchPosts는 pageNumber와 pageSize를 인자로 받음
  // 페이지 넘기기 기능을 만든다면 fetchPosts(2, 30)으로 쓰면 될 듯
  const result = await fetchPosts(1, 30);
  const user = await currentUser();
  return (
    // return 안에 여러 개의 Component를 넣으려면 <> 안에 다 집어 넣어야 됨
    <>
      <h1 className="head-text text-left">Home</h1>
      <section className="mt-9 flex flex-col gap-10">
        {result.posts.length === 0 ? (
          <p className="no-result">No Threads Found</p>
        ) : (
          <>
            {result.posts.map((post) => (
              <ThreadCard
                key={post.id}
                id={post.id}
                currentUserId={user?.id || ""}
                parentId={post.parentId}
                content={post.text}
                author={post.author}
                community={post.community}
                createdAt={post.createdAt}
                comments={post.children}
              />
            ))}
          </>
        )}
      </section>
    </>
  );
}
