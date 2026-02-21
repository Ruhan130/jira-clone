import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface InviteErrorPageProps {
    searchParams: {
        message?: string;
    };
}

const InviteErrorPage = ({ searchParams }: InviteErrorPageProps) => {
    const errorMessage = searchParams.message || "Invalid invitation link";
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-red-600">Invitation Error</CardTitle>
                    <CardDescription>
                        {decodeURIComponent(errorMessage)}
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <Button asChild>
                        <Link href="/sign-up">
                            Create New Account
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default InviteErrorPage;