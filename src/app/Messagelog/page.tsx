"use client";
import { useState } from "react";
import Image from "next/image";

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
    <div className="h-screen w-screen">
      <div className="w-screen h-screen bg-gray-100" style={{backgroundColor:"rgba(2, 67, 108, 0.5)"}}>
        <div className="grid grid-cols-5 w-full h-full">
          <div className="col-span-1 h-full border-r-4 border-white border-solid">
            <div className="flex flex-col h-full justify-evenly">
              <button className={activeTab === 1 ? 'active' : ''} onClick={() => setActiveTab(1)}>
                <div className="apptextB">
                  Email
                </div>
              </button>
              <button className={activeTab === 2 ? 'active' : ''} onClick={() => setActiveTab(2)}>
                <div className="apptextB">
                  Text
                </div>
              </button>
              <button className={activeTab === 3 ? 'active' : ''} onClick={() => setActiveTab(3)}>
                <div className="apptextB">
                  Notifications
                </div>
              </button>
             
            </div>
          </div>
          <div className="col-span-4 h-full border-r-4 border-white border-solid">
            <div className="flex flex-col h-full justify-center items-center">
              {activeTab === 1 && <EmailLog/>}
              {activeTab === 2 && <TextLog/>}
              {activeTab === 3 && <NotificationsLog/>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
