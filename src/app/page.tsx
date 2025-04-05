"use client";
import Link from "next/link";

export default function Home() {
  return (
    <div className="w-screen h-screen bg-gray-100" style={{backgroundColor:"rgba(2, 67, 108, 0.5)"}}>
      <div className="flex flex-col justify-evenly items-center h-full w-full">
        <div className="apptextBlack">
          Welcome to the App
        </div>
        <Link href="/Adminhome" className="apptextBlack">
          Admin Page
        </Link>
        <Link href="/Staffhome" className="apptextBlack">
          Staff Page
        </Link>
      </div>
    </div>
  );
}
