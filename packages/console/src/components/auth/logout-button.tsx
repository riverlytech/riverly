import { authClient } from '@/lib/auth-client';
import { useNavigate } from '@tanstack/react-router'

export async function LogOutButton({ redirect }: { redirect: string }) {
  const navigate = useNavigate();
  const signout = async () => {
    return await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate({ to: redirect }).then()
        },
      },
    });
  }
  return (
    <div
      onClick={() => { signout().then() }}
    >
      Log Out
    </div>
  )
}
