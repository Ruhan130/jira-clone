import { useQueryState, parseAsBoolean } from "nuqs"

export const UseCreateWorkspaceModal = () => {
    const [isopen, setIsOpen] = useQueryState(
        "create-workspace",
        parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
    );
    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);
    return {
        isopen,
        open,
        close,
        setIsOpen   

    }
}