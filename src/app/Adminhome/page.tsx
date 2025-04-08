"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import UserDashboard from "@/components/adminpanel";
import SessionLog from "@/app/Sessionlog/page";
import { cn } from "@/lib/utils";

export default function Home() {
  let [activeTab, setActiveTab] = useState(1);
  return (
      <div className="w-screen h-screen" style={{backgroundColor:"rgba(15, 72, 97, 0.8)"}}>
        <div className="flex flex-row justify-between items-center h-1/8 w-full border-b-4 border-white border-solid">
          <div className="text-white text-2xl">
            Welcome Admin User
          </div>
          <div className="text-white p-4"> 
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </div>
        </div>
        <div className="grid grid-cols-5 w-full h-7/8">
          <div className="col-span-1 h-full border-r-4 border-white border-solid">
            <div className="flex flex-col h-full justify-evenly items-center">
              <Button 
                variant="secondary" 
                className={cn(
                  activeTab === 1 ? 'active' : '',
                  'w-1/2'
                )}
                onClick={() => setActiveTab(1)}>
                <div className="apptextB">
                  User Dashboard
                </div>
              </Button>
              <Button 
                variant="secondary" 
                className={cn(
                  activeTab === 1 ? 'active' : '',
                  'w-1/2'
                )}
                onClick={() => setActiveTab(2)}>
                <div className="apptextB">
                  Sessions Log
                </div>
              </Button>
             
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
  );
}
