import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { fetchUser } from "@/lib/actions/user.actions";
import AccountProfile from "@/components/forms/AccountProfile";

async function Page() {
  const user = await currentUser(); // 현재 active한 User 정보
  // Clerk User Object : https://clerk.com/docs/references/javascript/user/user
  if (!user) return null; // to avoid typescript warnings

  // currentUser에서 가져온 Clerk의 user의 id로 DB에서 User 검색
  const userInfo = await fetchUser(user.id);

  // onboarded가 true인 User이면 Home으로 Redirect
  if (userInfo?.onboarded) redirect("/");

  // onboarded가 true가 아닌 User 중에서 DB에 없는 User는 currentUser에서 가져온 Clerk의 user 정보를 userData로 쓰고,
  // DB에 있는 User이면 DB에 있는 User 정보를 userData로 사용

  // ✅ User 정보 흐름
  // SignUp---(Google Auth)--->currentUser--->user--->userData---(AccountProfile)--->updateUser
  // --->onSubmit---(onboarded: true, DB에 새로운 User 생성)--->New User Created!

  // updateUser 함수에 findOneAndUpdate에 upsert를 true로 설정했기 때문에 조건에 맞는 User가 없으면 새로운 User를 생성한다.
  const userData = {
    id: user.id,
    objectId: userInfo?._id,
    username: userInfo ? userInfo?.username : user.username,
    // userInfo가 존재하면 name, userInfo가 존재하지 않으면 user.firstName, user.firstName이 null이거나 undefined이면 공백
    name: userInfo ? userInfo?.name : user.firstName ?? "",
    bio: userInfo ? userInfo?.bio : "",
    image: userInfo ? userInfo?.image : user.imageUrl,
  };

  return (
    <main className="mx-auto flex max-w-3xl flex-col justify-start px-10 py-20">
      <h1 className="head-text">Onboarding</h1>
      <p className="mt-3 text-base-regular text-light-2">
        Complete your profile now, to use Threds.
      </p>

      <section className="mt-9 bg-dark-2 p-10">
        <AccountProfile user={userData} btnTitle="Continue" />
      </section>
    </main>
  );
}

export default Page;
