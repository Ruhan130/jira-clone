import { useQueryState, parseAsBoolean } from "nuqs"

export const UseCreateProjectModal = () => {
    const [isopen, setIsOpen] = useQueryState(
        "create-project",
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