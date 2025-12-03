import React, { useState, useEffect, useRef } from 'react';
import { Message, User } from '../types';

interface ChatRoomProps {
  user: User;
  onLeave: () => void;
}

// Broadcast channel for multi-tab communication
const chatChannel = new BroadcastChannel('discord_clone_channel');

export const ChatRoom: React.FC<ChatRoomProps> = ({ user, onLeave }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<User[]>([user]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages]);

  // Handle incoming messages and user presence
  useEffect(() => {
    const handleBroadcast = (event: MessageEvent) => {
      const data = event.data;
      
      // 1. New Message received
      if (data.type === 'NEW_MESSAGE') {
        setMessages(prev => [...prev, data.payload]);
      } 
      // 2. A new user joined -> Add them and announce myself
      else if (data.type === 'USER_JOINED') {
         if (data.payload.name !== user.name) {
            setOnlineUsers(prev => {
               if (prev.find(u => u.name === data.payload.name)) return prev;
               return [...prev, data.payload];
            });
            // Tell the new user that I am here too
            chatChannel.postMessage({ type: 'PRESENCE_UPDATE', payload: user });
         }
      }
      // 3. Existing user announced presence -> Add them
      else if (data.type === 'PRESENCE_UPDATE') {
        if (data.payload.name !== user.name) {
            setOnlineUsers(prev => {
               if (prev.find(u => u.name === data.payload.name)) return prev;
               return [...prev, data.payload];
            });
         }
      }
      // 4. User left (Optional, hard to detect on close but can simulate)
      else if (data.type === 'USER_LEFT') {
        setOnlineUsers(prev => prev.filter(u => u.name !== data.payload.name));
      }
    };

    chatChannel.onmessage = handleBroadcast;
    
    // Announce join to everyone
    chatChannel.postMessage({ type: 'USER_JOINED', payload: user });

    // Cleanup: Attempt to announce leaving (best effort)
    return () => {
      chatChannel.postMessage({ type: 'USER_LEFT', payload: user });
      chatChannel.onmessage = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString() + Math.random().toString(),
      sender: user.name,
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
      avatarColor: user.avatarColor
    };

    // Update local state
    setMessages(prev => [...prev, newMessage]);
    
    // Broadcast to other tabs
    chatChannel.postMessage({ type: 'NEW_MESSAGE', payload: newMessage });
    
    setInputText('');
    inputRef.current?.focus();
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    const today = new Date();
    const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    
    if (isToday) {
      return `오늘 ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    }
    return d.toLocaleDateString();
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#313338]">
      
      {/* 1. Server List (Leftmost) */}
      <nav className="w-[72px] bg-[#1E1F22] flex flex-col items-center py-3 space-y-2 overflow-y-auto no-scrollbar shrink-0">
        {/* Discord Home Icon */}
        <div className="w-12 h-12 bg-[#313338] rounded-[24px] hover:rounded-[16px] hover:bg-[#5865F2] transition-all duration-200 cursor-pointer flex items-center justify-center group relative mb-2">
           <svg className="w-7 h-7 text-[#DBDEE1] group-hover:text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M19.7971 11.2016L13.1408 5.23438C12.4969 4.65703 11.5031 4.65703 10.8592 5.23438L4.20288 11.2016C3.90155 11.4717 3.73718 11.865 3.75 12.2697V18.25C3.75 19.4926 4.75736 20.5 6 20.5H18C19.2426 20.5 20.25 19.4926 20.25 18.25V12.2697C20.2628 11.865 20.0984 11.4717 19.7971 11.2016Z" /></svg>
           <div className="absolute left-0 w-1 h-2 bg-white rounded-r-full opacity-0 group-hover:opacity-100 -ml-4 transition-all"></div>
        </div>
        
        <div className="w-8 h-[2px] bg-[#35363C] rounded-lg"></div>

        {/* Current Server */}
        <div className="relative group">
            <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center -ml-3">
                <div className="w-1 h-10 bg-white rounded-r-full"></div>
            </div>
            <div className="w-12 h-12 bg-[#5865F2] rounded-[16px] cursor-pointer flex items-center justify-center text-white font-bold transition-all text-xl">
                D
            </div>
        </div>
        
        {/* Add Server Button */}
        <div className="w-12 h-12 bg-[#313338] rounded-[24px] hover:rounded-[16px] hover:bg-[#23A559] group transition-all duration-200 cursor-pointer flex items-center justify-center text-[#23A559] hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </div>
      </nav>

      {/* 2. Channel List */}
      <div className="w-60 bg-[#2B2D31] flex flex-col shrink-0">
        {/* Server Header */}
        <header className="h-12 px-4 flex items-center justify-between shadow-sm hover:bg-[#35373C] cursor-pointer transition-colors border-b border-[#1E1F22]">
          <h1 className="font-bold text-white text-[15px] truncate">Discord Clone</h1>
          <svg className="w-4 h-4 text-[#DBDEE1]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </header>

        {/* Channels */}
        <div className="flex-1 overflow-y-auto p-2 space-y-[2px]">
          <div className="pt-2 pb-1 px-2 flex items-center justify-between text-[#949BA4] hover:text-[#DBDEE1] cursor-pointer">
             <div className="flex items-center text-xs font-bold uppercase hover:text-white transition-colors">
                <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                채팅 채널
             </div>
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </div>
          
          <div className="px-2 py-[6px] rounded-[4px] bg-[#404249] text-white cursor-pointer group flex items-center">
            <svg className="w-5 h-5 text-[#949BA4] mr-1.5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M5.88657 21C5.57547 21 5.3399 20.7189 5.39427 20.4126L6.00001 17H2.59511C2.28449 17 2.04905 16.7198 2.10259 16.4138L2.27759 15.4138C2.31946 15.1746 2.52722 15 2.77011 15H6.35001L7.41001 9H4.00511C3.69449 9 3.45905 8.71977 3.51259 8.41381L3.68759 7.41381C3.72946 7.17456 3.93722 7 4.18011 7H7.76001L8.39677 3.41262C8.43914 3.17391 8.64664 3 8.88907 3H9.87344C10.1845 3 10.4201 3.28107 10.3657 3.58738L9.76001 7H15.76L16.3968 3.41262C16.4391 3.17391 16.6466 3 16.8891 3H17.8734C18.1845 3 18.4201 3.28107 18.3657 3.58738L17.76 7H21.1649C21.4755 7 21.711 7.28023 21.6574 7.58619L21.4824 8.58619C21.4406 8.82544 21.2328 9 20.9899 9H17.41L16.35 15H19.7549C20.0655 15 20.301 15.2802 20.2474 15.5862L20.0724 16.5862C20.0306 16.8254 19.8228 17 19.5799 17H16L15.3632 20.5874C15.3209 20.8261 15.1134 21 14.8709 21H13.8866C13.5755 21 13.3399 20.7189 13.3943 20.4126L14 17H8.00001L7.36325 20.5874C7.32088 20.8261 7.11337 21 6.87094 21H5.88657ZM9.41001 9L8.35001 15H14.35L15.41 9H9.41001Z"></path></svg>
            <span className="font-medium truncate">일반</span>
          </div>
        </div>

        {/* User Profile Bar */}
        <div className="h-[52px] bg-[#232428] px-2 flex items-center justify-between">
           <div className="flex items-center hover:bg-[#3F4147] p-1 rounded cursor-pointer">
              <div className={`w-8 h-8 rounded-full ${user.avatarColor} flex items-center justify-center text-white text-xs font-bold mr-2 relative`}>
                 {user.name[0].toUpperCase()}
                 <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#23A559] rounded-full border-2 border-[#232428]"></div>
              </div>
              <div className="text-sm">
                  <div className="font-bold text-white leading-tight">{user.name}</div>
                  <div className="text-[10px] text-[#B5BAC1] leading-tight">#{Math.floor(Math.random() * 9000) + 1000}</div>
              </div>
           </div>
           <div className="flex items-center">
              <button onClick={onLeave} className="p-2 hover:bg-[#3F4147] rounded text-[#B5BAC1] hover:text-white" title="로그아웃">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
           </div>
        </div>
      </div>

      {/* 3. Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#313338]">
        {/* Header */}
        <header className="h-12 px-4 flex items-center shadow-sm border-b border-[#26272D] shrink-0">
          <svg className="w-6 h-6 text-[#80848E] mr-2" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M5.88657 21C5.57547 21 5.3399 20.7189 5.39427 20.4126L6.00001 17H2.59511C2.28449 17 2.04905 16.7198 2.10259 16.4138L2.27759 15.4138C2.31946 15.1746 2.52722 15 2.77011 15H6.35001L7.41001 9H4.00511C3.69449 9 3.45905 8.71977 3.51259 8.41381L3.68759 7.41381C3.72946 7.17456 3.93722 7 4.18011 7H7.76001L8.39677 3.41262C8.43914 3.17391 8.64664 3 8.88907 3H9.87344C10.1845 3 10.4201 3.28107 10.3657 3.58738L9.76001 7H15.76L16.3968 3.41262C16.4391 3.17391 16.6466 3 16.8891 3H17.8734C18.1845 3 18.4201 3.28107 18.3657 3.58738L17.76 7H21.1649C21.4755 7 21.711 7.28023 21.6574 7.58619L21.4824 8.58619C21.4406 8.82544 21.2328 9 20.9899 9H17.41L16.35 15H19.7549C20.0655 15 20.301 15.2802 20.2474 15.5862L20.0724 16.5862C20.0306 16.8254 19.8228 17 19.5799 17H16L15.3632 20.5874C15.3209 20.8261 15.1134 21 14.8709 21H13.8866C13.5755 21 13.3399 20.7189 13.3943 20.4126L14 17H8.00001L7.36325 20.5874C7.32088 20.8261 7.11337 21 6.87094 21H5.88657ZM9.41001 9L8.35001 15H14.35L15.41 9H9.41001Z"></path></svg>
          <h3 className="font-bold text-white mr-2">일반</h3>
          <span className="text-[#949BA4] text-xs truncate hidden sm:block">자유롭게 대화하세요.</span>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col px-4 pt-4">
           {/* Welcome visual */}
           <div className="mt-4 mb-8">
              <div className="w-16 h-16 bg-[#41434A] rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M5.88657 21C5.57547 21 5.3399 20.7189 5.39427 20.4126L6.00001 17H2.59511C2.28449 17 2.04905 16.7198 2.10259 16.4138L2.27759 15.4138C2.31946 15.1746 2.52722 15 2.77011 15H6.35001L7.41001 9H4.00511C3.69449 9 3.45905 8.71977 3.51259 8.41381L3.68759 7.41381C3.72946 7.17456 3.93722 7 4.18011 7H7.76001L8.39677 3.41262C8.43914 3.17391 8.64664 3 8.88907 3H9.87344C10.1845 3 10.4201 3.28107 10.3657 3.58738L9.76001 7H15.76L16.3968 3.41262C16.4391 3.17391 16.6466 3 16.8891 3H17.8734C18.1845 3 18.4201 3.28107 18.3657 3.58738L17.76 7H21.1649C21.4755 7 21.711 7.28023 21.6574 7.58619L21.4824 8.58619C21.4406 8.82544 21.2328 9 20.9899 9H17.41L16.35 15H19.7549C20.0655 15 20.301 15.2802 20.2474 15.5862L20.0724 16.5862C20.0306 16.8254 19.8228 17 19.5799 17H16L15.3632 20.5874C15.3209 20.8261 15.1134 21 14.8709 21H13.8866C13.5755 21 13.3399 20.7189 13.3943 20.4126L14 17H8.00001L7.36325 20.5874C7.32088 20.8261 7.11337 21 6.87094 21H5.88657ZM9.41001 9L8.35001 15H14.35L15.41 9H9.41001Z"></path></svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">#일반 에 오신 것을 환영합니다!</h1>
              <p className="text-[#B5BAC1]">#일반 채널의 시작 부분이에요.</p>
           </div>

           {/* Message List */}
           {messages.map((msg, idx) => {
             // Check if previous message was from same user within short time (grouping)
             const prevMsg = messages[idx - 1];
             const isCompact = prevMsg && prevMsg.sender === msg.sender && (new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime() < 60000);

             return (
              <div 
                key={msg.id} 
                className={`group flex pr-4 hover:bg-[#2e3035] -mx-4 px-4 ${isCompact ? 'py-0.5' : 'py-0.5 mt-[17px]'}`}
              >
                {!isCompact ? (
                  <div className={`w-10 h-10 rounded-full ${msg.avatarColor || 'bg-gray-500'} flex-shrink-0 cursor-pointer hover:opacity-80 flex items-center justify-center text-white font-bold mr-4`}>
                    {msg.sender[0].toUpperCase()}
                  </div>
                ) : (
                  <div className="w-10 mr-4 text-[10px] text-[#949BA4] opacity-0 group-hover:opacity-100 flex items-center justify-center select-none">
                     {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false}).slice(0,5)}
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  {!isCompact && (
                    <div className="flex items-center">
                      <span className="font-medium mr-2 hover:underline cursor-pointer text-white">
                        {msg.sender}
                      </span>
                      <span className="text-xs text-[#949BA4] ml-1">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  )}
                  <p className={`text-[#DBDEE1] whitespace-pre-wrap leading-[1.375rem] ${isCompact ? '' : ''}`}>
                    {msg.text}
                  </p>
                </div>
              </div>
             );
           })}
           <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Input Area */}
        <div className="px-4 pb-6 pt-2 shrink-0">
          <div className="bg-[#383A40] rounded-lg px-4 py-2.5 flex items-center">
             <button className="text-[#B5BAC1] hover:text-[#DBDEE1] mr-4 p-1 rounded-full bg-[#313338]">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
             </button>
             <form onSubmit={handleSendMessage} className="flex-1">
               <input
                 ref={inputRef}
                 type="text"
                 value={inputText}
                 onChange={(e) => setInputText(e.target.value)}
                 placeholder={`#일반에 메시지 보내기`}
                 className="w-full bg-transparent text-[#DBDEE1] outline-none placeholder-[#949BA4]"
               />
             </form>
             <div className="flex items-center space-x-3 ml-2">
                <svg className="w-6 h-6 text-[#B5BAC1] hover:text-[#DBDEE1] cursor-pointer" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8-1.41-1.42z"/></svg>
             </div>
          </div>
        </div>
      </div>

      {/* 4. Member List (Rightmost) */}
      <div className="w-60 bg-[#2B2D31] hidden lg:flex flex-col shrink-0 p-3 overflow-y-auto">
         <h2 className="text-[#949BA4] text-xs font-bold uppercase mb-2 px-2">온라인 — {onlineUsers.length}</h2>
         {onlineUsers.map((u, i) => (
             <div key={i} className="flex items-center px-2 py-1.5 hover:bg-[#35373C] rounded cursor-pointer opacity-90 hover:opacity-100 group">
                <div className={`w-8 h-8 rounded-full ${u.avatarColor || 'bg-gray-500'} flex items-center justify-center text-white text-xs font-bold mr-3 relative`}>
                   {u.name[0].toUpperCase()}
                   <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#23A559] rounded-full border-2 border-[#2B2D31]"></div>
                </div>
                <div>
                   <div className="font-medium text-[#DBDEE1]">
                     {u.name} 
                   </div>
                </div>
             </div>
         ))}
      </div>

    </div>
  );
};