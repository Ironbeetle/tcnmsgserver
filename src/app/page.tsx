import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="h-screen w-screen">
      <div className="bg-green-200 h-full flex flex-col justify-evenly items-center">
          <Link href="/Staffhome">
          <Button variant="default" size="lg">
            Staff Page
          </Button>
          </Link>

          <Link href="/Adminhome">
          <Button variant="outline" size="lg">
            Admin Page
          </Button>
          </Link>
      </div>
    </div>
  );
}
