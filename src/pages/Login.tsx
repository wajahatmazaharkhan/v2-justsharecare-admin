import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useTitle from "@/hooks/useTitle";
import { Login as loginService } from "@/services/auth-services/auth.service";
import { useAuthStore } from "@/store/auth-store";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type LoginState = {
  email: string;
  password: string;
};

export function Login() {
  const [loading, setLoading] = useState(false);
  const { toggleAuthState } = useAuthStore();
  const [loginDetails, setLoginDetails] = useState<LoginState>({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginDetails((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!loginDetails.email || !loginDetails.password) {
      toast.error("Email and password are required.");
      return;
    }

    try {
      setLoading(true);

      const res = await loginService(loginDetails.email, loginDetails.password);
      localStorage.setItem("token", res.data.data.token);
      toast.success("Login successful! Welcome back");
      if (res.status === 200) {
        toggleAuthState(true);
        navigate("/admin");
      }
      // Example token storage
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Invalid credentials or server error.",
      );
    } finally {
      setLoading(false);
    }
  };

  useTitle("Login");

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={loginDetails.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={loginDetails.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-2">
          <Button
            onClick={() => handleSubmit()}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
