// "use client"
// import { DottedSeperator } from "@/components/dotted-seperater.tsx/dotted-seperater";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { FcGoogle } from "react-icons/fc";
// import { FaGithub } from "react-icons/fa";
// import Link from "next/link";
// import { z } from "zod";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
// import Image from "next/image";
// import { registerSchema } from "../schemas";
// import { useRegister } from "../api/use-register";
// import { toast } from "sonner";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { ImageIcon } from "lucide-react";
// import { useRef } from "react";
// import { signInWithGoogle, signUpWithMicrosoft } from "@/lib/oAuth";
// // import { register } from "module";




// export const SignUpCard = () => {
//     const { mutate, isPending } = useRegister();
//     const form = useForm<z.infer<typeof registerSchema>>({
//         resolver: zodResolver(registerSchema),
//         defaultValues: {
//             name: "",
//             email: "",
//             password: "",
//             imageUrl: undefined
//         }
//     });



//     const onSubmit = (values: z.infer<typeof registerSchema>) => {
//         const result = registerSchema.safeParse(values);
//         if (!result.success) return;

//         const formData = new FormData();
//         formData.append("name", values.name);
//         formData.append("email", values.email);
//         formData.append("password", values.password);
//         if (values.imageUrl instanceof File) {
//             formData.append("imageUrl", values.imageUrl);
//         }

//         mutate(formData, {
//             onError: (error) => {
//                 form.setError("email", {
//                     type: "manual",
//                     message: error.message,
//                 });
//             },
//         });
//     };

//     const inputRef = useRef<HTMLInputElement>(null);
//     const handleImageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const file = e.target.files?.[0];
//         if (file) {
//             if (file.size > 1_000_000) {
//                 toast.error("Image size should be less than 1MB");
//                 return;
//             }
//             form.setValue("imageUrl", file);
//         }
//     };


//     return (
//         <Card className="w-full h-full md:w-[487px] border-none shadow-none">
//             <CardHeader className="flex items-center justify-center text-center p-7">
//                 <CardTitle className="text-2xl ">
//                     Sign Up
//                 </CardTitle>
//                 <CardDescription>
//                     <span className="text-sm text-gray-500">
//                         By signing up, you agree to our {""} <Link className="text-blue-700" href={"/privay"} > Privacy Policy </Link> and {""}<Link href={""} className="text-blue-700"> Terms of service </Link>
//                     </span>
//                 </CardDescription>
//             </CardHeader>
//             <div className="px-7 mb-2">
//                 <DottedSeperator />
//             </div>
//             <CardContent className="p-7">
//                 <Form {...form}>
//                     <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//                         <FormField name="name" control={form.control} render={({ field }) => (
//                             <FormItem>
//                                 <FormControl>
//                                     <Input
//                                         {...field}
//                                         type="text"
//                                         placeholder="Enter your Name"
//                                     />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                         />
//                         <FormField control={form.control} name="email" render={({ field }) => (
//                             <FormItem>
//                                 <FormControl>
//                                     <Input
//                                         {...field}
//                                         type="email"
//                                         placeholder="Enter your Email"

//                                     />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                         />
//                         <FormField control={form.control} name="password" render={({ field }) => (
//                             <FormItem>
//                                 <FormControl>
//                                     <Input
//                                         {...field}
//                                         type="password"
//                                         placeholder="Enter your Password"

//                                     />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                         />

//                         <FormField
//                             name="imageUrl"
//                             control={form.control}
//                             render={({ field }) => (
//                                 <div className="flex flex-col items-center gap-4 px-4 pt-2 pb-6 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
//                                     {/* Preview Image / Fallback */}
//                                     {field.value ? (
//                                         <div className="size-24 relative rounded-full overflow-hidden border-2 border-white shadow">
//                                             <Image
//                                                 alt="Profile Picture"
//                                                 fill
//                                                 className="object-cover"
//                                                 src={
//                                                     field.value instanceof File
//                                                         ? URL.createObjectURL(field.value)
//                                                         : field.value
//                                                 }
//                                             />
//                                         </div>
//                                     ) : (
//                                         <Avatar className="size-24 border-2 border-dashed border-gray-300">
//                                             <AvatarFallback className="bg-gray-100">
//                                                 <ImageIcon className="size-10 text-gray-400" />
//                                             </AvatarFallback>
//                                         </Avatar>
//                                     )}

//                                     {/* Label + Input */}
//                                     <div className="text-center">
//                                         <p className="text-sm font-medium text-gray-800 mb-1">Profile Picture</p>
//                                         <p className="text-xs text-gray-500 mb-3">JPG, PNG, or JPEG</p>

//                                         <input
//                                             type="file"
//                                             accept=".jpg, .png, .jpeg"
//                                             className="hidden"
//                                             ref={inputRef}
//                                             onChange={handleImageInput}
//                                             disabled={isPending}
//                                         />

//                                         {field.value ? (
//                                             <Button
//                                                 type="button"
//                                                 size="sm"
//                                                 variant="destructive"
//                                                 disabled={isPending}
//                                                 onClick={() => {
//                                                     field.onChange(null);
//                                                     if (inputRef.current) inputRef.current.value = "";
//                                                 }}
//                                             >
//                                                 Remove
//                                             </Button>
//                                         ) : (
//                                             <Button
//                                                 type="button"
//                                                 size="sm"
//                                                 variant="outline"
//                                                 disabled={isPending}
//                                                 onClick={() => inputRef.current?.click()}
//                                             >
//                                                 Upload
//                                             </Button>
//                                         )}
//                                     </div>
//                                 </div>
//                             )}
//                         />


//                         <Button
//                             className="w-full"
//                             variant="primary"
//                             type="submit"
//                             disabled={isPending}
//                         >
//                             Sign Up
//                         </Button>

//                     </form>
//                 </Form>

//             </CardContent>
//             <div className="px-7">
//                 <DottedSeperator />
//             </div>
//             <CardContent className="p-7 flex flex-col gap-y-4">
//                 <Button
//                     onClick={() => signInWithGoogle()}
//                     size="lg"
//                     className="w-full"
//                     variant="secondary">
//                     <FcGoogle className="mr-5 size-10" />
//                     Login with Google
//                 </Button>

//                 <Button
//                     onClick={() => signUpWithMicrosoft()}
//                     disabled={isPending}
//                     size="lg"
//                     className="w-full"
//                     variant="teritery">
//                     <FaGithub className="mr-5 size-10" />
//                     Login with Microsoft
//                 </Button>
//             </CardContent>

//             <div className="p-7">
//                 <DottedSeperator />
//             </div>

//             <CardContent className="px-7 flex items-center justify-center text-center">
//                 <p>
//                     Already have an account? {""}
//                     <Link href={"/sign-in"} className="text-blue-700 hover:underline">
//                         Sign In
//                     </Link>
//                 </p>
//             </CardContent>

//         </Card>
//     );
// };