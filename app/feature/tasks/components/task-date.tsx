import { differenceInDays } from "date-fns";

interface TaskDateProps {
    value: string;
    className?: string;
}

export const TaskDate = ({ value, className }: TaskDateProps) => {

    const today = new Date();
    const endDay = new Date(value);
    const diffInDays = differenceInDays(endDay, today);

    let textColor = "text-muted-foreground";
}