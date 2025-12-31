import AuthForm from "@/components/auth/AuthForm";

export default function AuthPage() {
  return (
    <div className="bg-gray-50 w-full flex items-center h-full justify-center">
      <div className="flex items-center justify-center px-4 w-1/2">
        <div className="max-w-md w-full">
          <AuthForm />
        </div>
      </div>
    </div>
  );
}
