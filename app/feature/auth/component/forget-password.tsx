// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { toast } from "sonner";
// import { useForgotPassword } from "../api/use-forget-password";

// export default function ForgotPasswordForm() {
//     const [email, setEmail] = useState("");
//     const [loading, setLoading] = useState(false);
//     const router = useRouter();

//     const forgotPassword = useForgotPassword();

//     const handleSubmit = (e: React.FormEvent) => {
//         e.preventDefault();

//         if (!email) {
//             toast.error("Please enter your email");
//             return;
//         }

//         forgotPassword.mutate({
//             json: { email }
//         });
//     };
//     setLoading(true);
//     try {
//         const res = await fetch("/api/auth/forgot-password", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ email }),
//         });

//         const data = await res.json();

//         if (!res.ok) {
//             throw new Error(data?.error || "Something went wrong");
//         }

//         toast.success("Reset link sent to your email");
//         setEmail("");
//     } catch (error: any) {
//         toast.error(error.message);
//     } finally {
//         setLoading(false);
//     }
//     return (
//         <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
//             <h2 className="text-xl font-semibold">Forgot your password?</h2>
//             <p className="text-sm text-gray-600">
//                 Enter your email to receive a reset link.
//             </p>
//             <Input
//                 type="email"
//                 placeholder="you@example.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//             />
//             <Button type="submit" disabled={loading} className="w-full">
//                 {loading ? "Sending..." : "Send Reset Link"}
//             </Button>
//         </form>
//     );
// };


