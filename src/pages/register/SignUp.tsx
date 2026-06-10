import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useAuthStore } from "@/store/useAuthStore";
import { registerUser } from "@/services/auth.service";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type RegisterInputs = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

const SignUp = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInputs>();

  const { setAccessToken, isLoggedIn, setUserDetails } = useAuthStore();

  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit: SubmitHandler<RegisterInputs> = async (data) => {
    try {
      const { email, password, firstName, lastName } = data;
      const response = await registerUser({
        email,
        password,
        firstName,
        lastName,
      });
      setAccessToken(response?.payload?.accessToken || null);
      const { userId, role } = response.payload;
      setUserDetails({
        userId,
        email,
        role,
        firstName,
        lastName,
      });
      //   navigate("/dashboard/all-courses");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Register</CardTitle>
        <CardDescription>
          Enter your email below to register to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="firstName">Firstname</Label>
            <Input
              id="firstName"
              type="text"
              placeholder="First name"
              required
              {...register("firstName")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lastName">Lastname</Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Last name"
              required
              {...register("lastName")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="username@example.com"
              required
              {...register("email")}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                className="pr-10"
                placeholder="Enter password"
                required
                {...register("password")}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full">
            Register
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="underline">
            Login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignUp;
