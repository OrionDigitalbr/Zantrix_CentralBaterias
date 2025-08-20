import { AdminLogin } from "@/components/admin-login";

export default function AdminPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <AdminLogin />
      </div>
    </div>
  );
}
