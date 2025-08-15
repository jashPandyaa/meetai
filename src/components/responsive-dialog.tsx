"use client";

import { Dialog , DialogContent , DialogHeader,
    DialogTitle, DialogDescription   }
    from "@/components/ui/dialog"

import { Drawer, DrawerContent , DrawerTitle , 
    DrawerHeader , DrawerDescription
 } from "@/components/ui/drawer"

import { useIsMobile } from "@/hooks/use-mobile"

interface ResponsiveDialogProps  {
    title : string;
    description : string;
    children: React.ReactNode;
    open : boolean;
    opOpenChange : ( open: boolean ) => void;
};

export const ResponsiveDialog = ( {
    title, 
    description,
    children,
    open,
    opOpenChange,
    } : ResponsiveDialogProps ) => {
    
    const isMobile = useIsMobile();

    if(isMobile){
        return (
            <Drawer open={open} onOpenChange={opOpenChange}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle> {title} </DrawerTitle>
                        <DrawerDescription> {description} </DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4">
                        {children}
                    </div>
                </DrawerContent>
            </Drawer>
        );
    };

    return (
        <Dialog open={open} onOpenChange={opOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle> {title} </DialogTitle>
                    <DialogDescription> {description} </DialogDescription>
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    );
};