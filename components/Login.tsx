import React, { useState } from 'react';
import { User } from '../types';

interface LoginProps {
  onJoin: (user: User) => void;
}

const AVATAR_COLORS = [
  'bg-red-500', 'bg-orange-500', 'bg-green-500', 
  'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-yellow-500'
];

export const Login: React.FC<LoginProps> = ({ onJoin }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length > 0) {
      const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
      onJoin({ name: name.trim(), avatarColor: randomColor });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[url('https://cdn.discordapp.com/attachments/1078996537365692446/1078996537365692446/discord_background.png')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      
      <div className="relative w-full max-w-[480px] bg-[#313338] rounded-md shadow-2xl p-8 transform transition-all">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">돌아오신 것을 환영해요!</h1>
          <p className="text-[#B5BAC1]">다시 만나서 반가워요!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-xs font-bold text-[#B5BAC1] uppercase mb-2">
              닉네임 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              className="w-full bg-[#1E1F22] text-white p-2.5 rounded-[3px] border-none outline-none focus:ring-0 font-medium h-10"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              maxLength={20}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium py-2.5 rounded-[3px] transition-colors mt-6"
          >
            입장하기
          </button>

          <div className="text-xs text-[#949BA4] mt-2">
            입장시 <span className="text-[#00A8FC] cursor-pointer hover:underline">운영 정책</span>에 동의하는 것으로 간주됩니다.
          </div>
        </form>
      </div>
    </div>
  );
};