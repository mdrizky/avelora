import { requireUser } from "@/lib/auth/session";
import { getUserById } from "@/lib/db";
import { ProfileForm } from "@/components/dashboard/profile-form";

export default async function ProfilePage() {
  const user = await requireUser();
  const profile = getUserById(user.id);
  if (!profile) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-ink-900">Profil</h1>
        <p className="mt-1 text-sm text-ink-400">Kelola informasi akun dan keamanan.</p>
      </div>
      <ProfileForm
        initial={{
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone ?? "",
        }}
      />
    </div>
  );
}