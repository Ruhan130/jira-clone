"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useState } from "react";

type SelectedMember = {
  id: string;
  name: string;
  image?: string;
};

interface MultiSelectProps {
    SelectedMember: SelectedMember[];
    selected?: string[];
    onChange: (selected: string[]) => void;
    disabled?: boolean;
    placeholder?: string;
}

export function MultiSelect({
    SelectedMember,
    selected,
    onChange,
    disabled,
    placeholder = "Select members...",
}: MultiSelectProps) {
    const [open, setOpen] = useState(false);

    const toggleSelection = (id: string) => {
        const selectedList = selected ?? [];

        if (selectedList.includes(id)) {
            onChange(selectedList.filter((item) => item !== id));
        } else {
            onChange([...selectedList, id]);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    disabled={disabled}
                    className="w-full justify-between"
                >
                    {(selected?.length ?? 0) > 0
                        ? `${selected?.length} member(s) selected`
                        : placeholder}
                    <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandInput placeholder="Search members..." />
                    <CommandEmpty>No member found.</CommandEmpty>
                    <CommandGroup>
                        {SelectedMember.map((option) => (
                            <CommandItem
                                key={option.id}
                                onSelect={() => toggleSelection(option.id)}
                                className="cursor-pointer"
                            >
                                <Checkbox
                                    checked={(selected ?? []).includes(option.id)}

                                    className="mr-2"
                                    aria-label={option.name}
                                />
                                <span>{option.name}</span>
                                {(selected ?? []).includes(option.id) && (
                                    <Check className="ml-auto size-4 text-primary" />
                                )}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}