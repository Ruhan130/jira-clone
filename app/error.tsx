"use client"
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

const ErrorPage = () => {
    return (
        <div className="h-screen flex items-center justify-center flex-col gap-y-4">
            <AlertTriangle />
            <p className="text-sm">
                Something went Wrong
            </p>
            <Button variant="secondary" size="sm">
                <Link href="/">
                    Go  to Home
                </Link>
            </Button>
        </div>
    );
}

export default ErrorPage;