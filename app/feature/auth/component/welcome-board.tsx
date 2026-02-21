"use client"
import React from 'react';
import Image from "next/image";
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function MyraWelcome() {
    const router = useRouter();
    return (

        <div className="h-[400px] bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md w-full text-center items-center">
            <div className="flex  justify-center mb-6">
                <div className="w-12 h-12 border rounded-lg flex items-center justify-center">
                    <Image src="/Myra_Logo.png" alt="Logo" width={70} height={70} />
                </div>
            </div>

            <h1 className="text-2xl font-semibold text-gray-900 mb-4">
                Welcome to Myra
            </h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
                Product development made simple — with tasks, projects, and roadmaps, all in Myra.
            </p>

            <Button size={'lg'} onClick={() => router.replace("/")}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 mt-12 rounded-lg transition-colors duration-200 text-lg">
                Get started
            </Button>
        </div>

    );
}