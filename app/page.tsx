import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex gap-2 py-2 px-4 ">
      <Button>
        primary
      </Button>
      <Button variant='secondary'>
        secondary
      </Button>
      <Button variant='ghost'>
        ghost
      </Button>
      <Button variant='destructive'>
        destructive
      </Button>
      <Button variant='muted'>
        muted
      </Button>
      <Button variant='teritery'>
      teriterys
      </Button>
    </div>
  );
}
