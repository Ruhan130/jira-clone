import { useMedia } from "react-use";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";

interface ResponsiveModalProps {
    children: React.ReactNode,
    open: boolean,
    isOpen: (opne: boolean) => void;
}


export const ResponsiveModal = ({ children, open, isOpen }: ResponsiveModalProps) => {
    const isDesktop = useMedia("(min-width: 1024px)", true);

    if (isDesktop) {
        return (
            <Dialog>
                <DialogContent className="w-full sm:max-w-lg p-0  border-none overflow-y-auto hide-scrollbar max-h-[85vh]">

                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer>
            <DrawerContent>
                <div className="overflow-y-auto hide-scrollbar max-h-[85hv]">
                    {children}
                </div>  
            </DrawerContent>
        </Drawer>
    )
}
