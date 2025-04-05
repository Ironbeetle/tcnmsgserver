"use client";
import { useState } from "react";
import Image from "next/image";

export default function Home() {
  let [activeTab, setActiveTab] = useState(1);
 
  return (
    <>
      <div className="flex flex-col justify-evenly w-full h-full">
        <div className="h-full">
          <div className="flex flex-col h-full justify-center items-center">
          <div className="apptextB">
                Session Log
              </div>
          </div>
        </div>
      </div>
    </>
  );
}
