"use client";

import { useState } from "react";
import { Check, ChevronDown, Users, Search } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Team {
  $id: string;
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  name: string;
  image: string | null;
  description?: string;
  createdBy: string;
  workspaceId: string;
  team_lead: string;
  members: string;
  [key: string]: any;
}

export const MultipleTeamsField = ({ form, teams, isLoading }: any) => {
  const [open, setOpen] = useState(false);

  return (
    <FormField
      control={form.control}
      name="members"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Teams</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className="justify-between h-auto min-h-[40px] p-3"
                >
                  <span>
                    {field.value?.length > 0 
                      ? `${field.value.length} teams selected`
                      : "Select teams..."
                    }
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-2">
              <div className="space-y-2">
                {teams?.map((team: any) => {
                  const isSelected = field.value?.includes(team.$id);
                  return (
                    <button
                      key={team.$id}
                      type="button"
                      className="w-full flex items-center gap-2 p-2 rounded hover:bg-accent text-left"
                      onClick={() => {
                        console.log("BUTTON CLICKED:", team.name);
                        const currentValue = field.value || [];
                        const newValue = isSelected
                          ? currentValue.filter((id: string) => id !== team.$id)
                          : [...currentValue, team.$id];
                        
                        console.log("New value:", newValue);
                        field.onChange(newValue);
                      }}
                    >
                      <div className={`w-4 h-4 border rounded ${
                        isSelected ? 'bg-primary text-white' : 'border-gray-300'
                      } flex items-center justify-center`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <span>{team.name}</span>
                    </button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};