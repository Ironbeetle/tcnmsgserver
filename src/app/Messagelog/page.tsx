"use client";
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Home() {
  let [activeTab, setActiveTab] = useState(1);
  const NotificationsLog = () => {
    return (
      <div>
        Notifications Log
      </div>
    );
  };
  const EmailLog = () => {
    return (
      <div>
        Email Log
      </div>
    );
  };
  const TextLog = () => {
    return (
      <div>
        Text Log
      </div>
    );
  };
  return (
    <>
      <div className="flex flex-col justify-evenly items-center h-full w-full">
                <div className="grid grid-cols-3 h-1/8 w-full border-b-4 border-white border-solid">
                    <div className="flex flex-col justify-center items-center">
                        <Button variant="outline" className={activeTab === 1 ? 'active' : ''} onClick={() => setActiveTab(1)} style={{width:"50%"}}>
                            <div className="apptext">
                                Email
                            </div>
                        </Button>
                    </div>
                    <div className="flex flex-col justify-center">
                        <Button variant="outline" className={activeTab === 2 ? 'active' : ''} onClick={() => setActiveTab(2)} style={{width:"50%"}}>
                            <div className="apptextB">
                                Text
                            </div>
                        </Button>
                    </div>
                    <div className="flex flex-col justify-center">
                        <Button variant="outline" className={activeTab === 3 ? 'active' : ''} onClick={() => setActiveTab(3)} style={{width:"50%"}}>
                            <div className="apptextB">
                                Notifications
                            </div>
                        </Button>
                    </div>
                </div>
                
                <div className="flex flex-col justify-evenly w-full h-7/8">
                  <div className="w-1/2 h-full p-6">
                    {activeTab === 1 && <EmailLog/>}
                    {activeTab === 2 && <TextLog/>}
                    {activeTab === 3 && <NotificationsLog/>}
                  </div>
                </div>
           </div>
    </>
  );
}
