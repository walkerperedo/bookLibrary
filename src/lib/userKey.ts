import { useUser } from "@/modules/users/store/user.store";

export function getUserKey() {
  const u = useUser.getState().user;
  return u ? `user:${u.id}` : 'guest';
}
