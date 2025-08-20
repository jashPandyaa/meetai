import {
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
  CommandResponsiveDialog,
} from "@/components/ui/command";
import { ReactNode, useState } from "react";
import { Button } from "./ui/button";
import { ChevronsUpDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
    options : Array<{
        id : string,
        value : string, 
        children : ReactNode;
    }>;
    onSelect: (value : string) => void;
    onSearch?: (value : string) => void;
    value: string;
    placeholder?: string;
    isSearchable?: boolean;
    className?: string;
};

export const CommandSelect = ({
    options,
    onSelect,
    onSearch,
    value,
    placeholder = "Select an option",
    className,
} : Props ) => {
    const [open, setOpen ] = useState(false);
    const selecteOption = options.find((options) => options.value === value);

    return (
        <>
          <Button
          onClick={() => setOpen(true)}
          type="button"
          variant="outline"
          className={cn(
            "h-9 justify-between font-normal px-2",
            !selecteOption && "text-muted-foreground",
            className,
          )}
          >
            <div>
                {selecteOption?.children ?? placeholder}
            </div>
            <ChevronsUpDownIcon />
          </Button>
          <CommandResponsiveDialog
          shouldFilter={!onSearch}
          open={open}
          onOpenChange={setOpen}
          >
            <CommandInput placeholder="Search..." onValueChange={onSearch} />
            <CommandList>
                <CommandEmpty>
                    <span className="text-muted-foreground text-sm">
                        No options found
                    </span>
                </CommandEmpty>
                {options.map((option) => (
                    <CommandItem 
                    key={option.id}
                    onSelect={() => {
                        onSelect(option.value)
                        setOpen(false);
                    }}
                    >
                        {option.children}
                    </CommandItem>
                ))}
            </CommandList>
          </CommandResponsiveDialog>
        </>
    );
};

