import React, { useState } from 'react';
import { Login } from './components/Login';
import { ChatRoom } from './components/ChatRoom';
import { User } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleJoin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLeave = () => {
    setCurrentUser(null);
  };

  return (
    <div className="h-screen w-full">
      {!currentUser ? (
        <Login onJoin={handleJoin} />
      ) : (
        <ChatRoom user={currentUser} onLeave={handleLeave} />
      )}
    </div>
  );
};

export default App;