"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createWrokspaceSchemas } from "../schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DottedSeperator } from "@/components/dotted-seperater.tsx/dotted-seperater";
interface CreateWorkSpaceForm {
    onCalled?: () => void;
};

export const CreateWorkSpaceForm = ({ onCalled }: CreateWorkSpaceForm) => {
    const form = useForm<z.infer<typeof createWrokspaceSchemas>>({
        resolver: zodResolver(createWrokspaceSchemas),
        defaultValues: {
            name: "",
        }
    });

    const onsubmit = (values: z.infer<typeof createWrokspaceSchemas>) => {
        console.log({ values });
    }

    return (
        <div>
            <Card className="w-full h-full  border-none shadow-none">
                <CardHeader className=" flex p-7">
                    <CardTitle className="text-xl font-bold">
                        Create new Workspace
                    </CardTitle>
                </CardHeader>
                <div className="px-7">
                    <DottedSeperator />
                </div>
                <CardContent className="p-7">
                     
                </CardContent>
            </Card>
        </div>
    )

}