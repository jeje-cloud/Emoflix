import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Header, Footer } from "@/components";
import { Film, Mail, Lock, User } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      localStorage.setItem("token", data.token);
      localStorage.setItem("userEmail", formData.email);
      toast({
        title: "Success",
        description: "You have successfully logged in.",
      });
      navigate("/emotions");
    } catch (error) {
      toast({ title: "Error", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      // Clear password field after successful signup
      setFormData({ ...formData, password: "" });
      
      toast({ 
        title: "Account created", 
        description: "Your account has been created successfully. Please log in." 
      });
      
      // Switch to login tab after successful signup
      setActiveTab("login");
    } catch (error) {
      toast({ title: "Error", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    const popup = window.open(
      "https://accounts.google.com/o/oauth2/auth?client_id=751047087683-kd88h5t67glb9c12b2g12svtr9a3a4co.apps.googleusercontent.com&redirect_uri=http://localhost:8080/emotions&response_type=token&scope=email%20profile",
      "_self"
    );

    const interval = setInterval(() => {
      if (popup.closed) {
        clearInterval(interval);
        navigate("/emotions");
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow flex items-center justify-center p-6 pt-24 pb-20">
        <div className="w-full max-w-md">
          <Card className="glass-panel animate-scale-in">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-2">
                <div className="rounded-full bg-primary/10 p-3">
                  <Film className="h-6 w-6 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">{APP_NAME}</CardTitle>
              <CardDescription>Enter your details to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs 
                value={activeTab} 
                onValueChange={setActiveTab}
                defaultValue="login" 
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <Input
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Logging in..." : "Log in"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <Input
                      name="name"
                      type="text"
                      placeholder="Full name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      name="password"
                      type="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating account..." : "Create account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="justify-center">
              <p className="text-xs text-muted-foreground">
                or you can sign in with
              </p>
              <FcGoogle
                className="h-6 w-6 cursor-pointer ml-5"
                onClick={handleGoogleAuth}
              />
              <FaApple className="h-6 w-6 cursor-pointer ml-2" />
              <FaFacebook className="h-6 w-6 cursor-pointer ml-2" />
            </CardFooter>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Auth;
