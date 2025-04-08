"use client";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="w-screen h-screen bg-gray-100" style={{backgroundColor:"rgba(2, 67, 108, 0.5)"}}>
      <div className="flex flex-col justify-evenly items-center h-full w-full">
        <div className="text-white text-3xl text-center">
          Tataskweyak Communication Center v1.0
        </div>
        <Button asChild className={buttonVariants({ variant: "secondary" })}>
          <Link href="/Adminhome">
            Admin Home Page
          </Link>
        </Button> 
      
        <Button asChild className={buttonVariants({ variant: "secondary" })}>
          <Link href="/Staffhome">
            Staff Home Page
          </Link>
        </Button>
      </div>
    </div>
  );
}
