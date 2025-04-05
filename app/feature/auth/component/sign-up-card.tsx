import { DottedSeperator } from "@/components/dotted-seperater.tsx/dotted-seperater";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";


const formSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

export const SignUpCard = () => {

const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues:{
        email: "",
        password: ""
    }
})

    return (
        <Card className="w-full h-full md:w-[487px] border-none shadow-none">
            <CardHeader className="flex items-center justify-center text-center p-7">
                <CardTitle className="text-2xl ">
                    Sign Up

                </CardTitle>
                <CardDescription>
                    <span className="text-sm text-gray-500">
                        By signing up, you agree to our {""} <Link className="text-blue-700" href={"/privay"} > Privacy Policy </Link> and {""}<Link href={""} className="text-blue-700"> Terms of service </Link>
                    </span>
                </CardDescription>
            </CardHeader>
            <div className="px-7 mb-2">
                <DottedSeperator />
            </div>
            <CardContent className="p-7">
                <form className="space-y-4">

                    <Input required
                        type="text"
                        placeholder="Enter Your Name "
                        value={""}
                        onChange={() => { }}
                        disabled={false}
                    />

                    <Input required
                        type="email"
                        placeholder="Enter your Email"
                        value={""}
                        onChange={() => { }}
                        disabled={false}
                    />

                    <Input required
                        value={""}
                        placeholder="Enter your Password"
                        type="password"
                        onChange={() => { }}
                        disabled={false}
                        min={8}
                        max={255}
                    />

                    <Button className="w-full" variant="primary" disabled={false} >
                        Submit
                    </Button>
                </form>
            </CardContent>
            <div className="px-7">
                <DottedSeperator />
            </div>
            <CardContent className="p-7 flex flex-col gap-y-4">
                <Button
                    disabled={false}
                    size="lg"
                    className="w-full"
                    variant="secondary">
                    <FcGoogle className="mr-5 size-10" />
                    Login with Google
                </Button>

                <Button
                    disabled={false}
                    size="lg"
                    className="w-full"
                    variant="secondary">
                    <FaGithub className="mr-5 size-10" />
                    Login with GitHub
                </Button>
            </CardContent>

        </Card>
    );
};