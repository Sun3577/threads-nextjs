"use client";

import * as z from "zod";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { useUploadThing } from "@/lib/uploadthing";
import { isBase64Image } from "@/lib/utils";

import { UserValidation } from "@/lib/validations/user";
import { updateUser } from "@/lib/actions/user.actions";

interface Props {
  user: {
    id: string;
    objectId: string;
    username: string;
    name: string;
    bio: string;
    image: string;
  };
  btnTitle: string;
}

const AccountProfile = ({ user, btnTitle }: Props) => {
  const router = useRouter();
  // 현재 Url의 경로 이름
  const pathname = usePathname();

  // startUpload : media type을 서버에 저장
  const { startUpload } = useUploadThing("media");

  // File을 Array 형식으로 받아들임
  const [files, setFiles] = useState<File[]>([]);

  // useForm은 Form의 value를 추적, 유효성 검사, 폼 제출 처리에 사용
  const form = useForm<z.infer<typeof UserValidation>>({
    resolver: zodResolver(UserValidation),
    defaultValues: {
      profile_photo: user?.image ? user.image : "",
      name: user?.name ? user.name : "",
      username: user?.username ? user.username : "",
      bio: user?.bio ? user.bio : "",
    },
  });

  // Form에 입력한 데이터를 values로 받음
  // values는 UserValidation 유효성 검사로 profile_photo, name, username, bio를 갖음
  const onSubmit = async (values: z.infer<typeof UserValidation>) => {
    const blob = values.profile_photo;

    // values의 profile_photo가 Base64 이미지이면 hasImageChanged가 true가 되어 files을 startUpload로 imgRes에 저장
    const hasImageChanged = isBase64Image(blob);
    if (hasImageChanged) {
      const imgRes: any = await startUpload(files);

      // imgRes가 존재하고 imgRes의 첫 번째 파일의 fileUrl이 존재하면 values의 profile_photo에 저장
      if (imgRes && imgRes[0].fileUrl) {
        values.profile_photo = imgRes[0].fileUrl;
      }
    }

    // updateUser 함수에 findOneAndUpdate에 upsert를 true로 설정했기 때문에 조건에 맞는 User가 없으면 새로운 User를 생성
    await updateUser({
      name: values.name,
      path: pathname,
      username: values.username,
      userId: user.id,
      bio: values.bio,
      image: values.profile_photo,
    });

    if (pathname === "/profile/edit") {
      // 이전 페이지로 이동
      router.back();
    } else {
      // Home으로 이동
      router.push("/");
    }
  };

  const handleImage = (
    // ChangeEvent는 <input>에서 발생하는 event type
    e: ChangeEvent<HTMLInputElement>,
    // 문자열을 value로 받아서 FormField의 값으로 바꿈
    fieldChange: (value: string) => void
  ) => {
    // onChange가 작동해서 새로고침되는 것은 막음
    e.preventDefault();
    // FileReader()는 웹 애플리케이션에서 파일을 비동기적으로 읽는 데 사용
    const fileReader = new FileReader();

    // 파일이 있고 파일의 길이가 0보다 크면, (공집합인 경우를 제외하기 위해) 첫 번째 파일을 file에 저장
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // e.target.files는 Array가 아니라 유사 Array (map, filter, reduce 등을 사용할 수 없음)이기 때문에 Array.From()으로 Array로 바꾸어 저장
      setFiles(Array.from(e.target.files));
      // upload된 파일이 이미지가 아닌 경우에는 함수 종료
      if (!file.type.includes("image")) return;

      fileReader.readAsDataURL(file);
      // .onload는 파일을 다 읽은 경우 실행한 동작을 정의
      fileReader.onload = async (event) => {
        // event.target.result는 다 읽은 파일의 URL을 나타내는 문자열
        const imageDataUrl = event.target?.result?.toString() || "";
        fieldChange(imageDataUrl);
      };
    }
  };

  return (
    // Form은 React Component이고 {...form}은 Form의 Props로 form 자체를 Props로 Form Component에 전달
    <Form {...form}>
      <form
        className="flex flex-col justify-start gap-10"
        // form이 제출될 때 실행할 함수를 정의, form에 있는 여러 가지 속성 중에서 handleSubmit를 사용하는 것
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          // control은 Form에 입력된 내용을 받을 수 있도록 하고, 유효성 검사와 Form의 Submit을 가능하게 함
          control={form.control}
          name="profile_photo"
          // field는 Form에 입력된 내용을 추적할 수 있게 함
          render={({ field }) => (
            <FormItem className="flex items-center gap-4">
              <FormLabel className="account-form_image-label">
                {field.value ? (
                  <Image
                    src={field.value}
                    alt="profile_icon"
                    width={96}
                    height={96}
                    priority
                    className="rounded-full object-contain"
                  />
                ) : (
                  <Image
                    src="/assets/profile.svg"
                    alt="profile_icon"
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                )}
              </FormLabel>
              <FormControl className="flex-1 text-base-semibold text-gray-200">
                <Input
                  type="file"
                  accept="image/*"
                  placeholder="Add profile photo"
                  className="account-form_image-input"
                  // field의 값이 바뀔 때 onChange가 작동
                  onChange={(e) => handleImage(e, field.onChange)}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-3">
              <FormLabel className="text-base-semibold text-light-2">
                Name
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  className="account-form_input no-focus"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-3">
              <FormLabel className="text-base-semibold text-light-2">
                Username
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  className="account-form_input no-focus"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-3">
              <FormLabel className="text-base-semibold text-light-2">
                Bio
              </FormLabel>
              <FormControl>
                <Textarea
                  rows={10}
                  className="account-form_input no-focus"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="bg-primary-500">
          {btnTitle}
        </Button>
      </form>
    </Form>
  );
};

export default AccountProfile;
