// zod는 TypeScript에서 사용하는 유효성 검사 라이브러리
import * as z from "zod";

// profile-photo : 문자열 and url 형식 and 비어있지 않음
export const UserValidation = z.object({
  profile_photo: z.string().url().nonempty(),
  name: z.string().min(3).max(30),
  username: z.string().min(3).max(30),
  bio: z.string().min(3).max(1000),
});
