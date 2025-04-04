import { DottedSeperator } from "@/components/dotted-seperater.tsx/dotted-seperater";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
export const SignInCard = () => {
    return (
        <Card className="w-full h-full md:w-[487px] border-none shadow-none">
            <CardHeader className="flex items-center justify-center text-center p-7">
                <CardTitle className="text-2xl ">
                    Welcome back.!
                </CardTitle>
            </CardHeader>
            <div className="px-7 mb-2">
                <DottedSeperator />
            </div>
            <CardContent className="p-7">
                <form className="space-y-4">
                    <Input required
                        type="email"
                        placeholder="Email"
                        value={""}
                        onChange={() => { }}
                        disabled={false}
                    />

                    <Input required
                        value={""}
                        placeholder="Password"
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