import { useQueryState, parseAsBoolean } from "nuqs"

export const UseCreateTaskModal = () => {
    const [isopen, setIsOpen] = useQueryState(
        "create-task",
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