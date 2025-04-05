"use client";
import { useState } from "react";
import Image from "next/image";
import UserDashboard from "@/components/adminpanel";
import SessionLog from "@/app/Sessionlog/page";

export default function Home() {
  let [activeTab, setActiveTab] = useState(1);
  return (
    <div className="h-screen w-screen">
      <div className="w-screen h-screen bg-gray-100" style={{backgroundColor:"rgba(2, 67, 108, 0.5)"}}>
        <div className="flex flex-row justify-evenly h-1/8 w-full border-b-4 border-white border-solid">
          <div className="apptextBlack">
            Welcome Admin User
          </div>
          <div> 
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </div>
        </div>
        <div className="grid grid-cols-5 w-full h-full">
          <div className="col-span-1 h-full border-r-4 border-white border-solid">
            <div className="flex flex-col h-full justify-evenly">
              <button className={activeTab === 1 ? 'active' : ''} onClick={() => setActiveTab(1)}>
                <div className="apptextB">
                  User Dashboard
                </div>
              </button>
              <button className={activeTab === 2 ? 'active' : ''} onClick={() => setActiveTab(2)}>
                <div className="apptextB">
                  Sessions Log
                </div>
              </button>
             
            </div>
          </div>
          <div className="col-span-4 h-full border-r-4 border-white border-solid">
            <div className="flex flex-col h-full justify-center items-center">
              {activeTab === 1 && <UserDashboard/>}
              {activeTab === 2 && <SessionLog/>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
