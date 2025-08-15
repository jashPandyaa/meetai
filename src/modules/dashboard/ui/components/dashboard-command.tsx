import { CommandResponsiveDialog, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Dispatch, SetStateAction } from "react";

interface Props {
    open : boolean;
    setOpen : Dispatch<SetStateAction<boolean>>;
}

export const DashboardCommand = ( { open , setOpen} : Props ) => {
    return (
        <CommandResponsiveDialog open={open} onOpenChange={setOpen}>
            <CommandInput 
                placeholder="find a meeeting or agent"
            />
            <CommandList>
                <CommandItem>
                    Test
                </CommandItem>
            </CommandList>
        </CommandResponsiveDialog>
    )
}