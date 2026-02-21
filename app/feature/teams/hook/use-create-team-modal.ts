import { useQueryState, parseAsBoolean } from "nuqs"

export const UseCreateTeamModal = () => {
    const [isopen, setIsOpen] = useQueryState(
        "create-teams",
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