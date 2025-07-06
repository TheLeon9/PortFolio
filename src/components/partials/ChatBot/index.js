import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

import style from './index.module.scss';

import LogoReset from 'p/img/custom_img/reset.svg';
import LogoChatBot from 'p/img/custom_img/chatbot.svg';
import LogoSend from 'p/img/custom_img/send.svg';
import { imgWH } from '@/constants';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const toggleChat = () => setIsOpen(!isOpen);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    // Fake AI response
    setTimeout(() => {
      const fakeReply = `Sure! "${input}" sounds interesting. (AI reply)`;
      setMessages([...newMessages, { role: 'assistant', content: fakeReply }]);
      setLoading(false);
    }, 700);
  };

  const resetChat = () => {
    setMessages([]);
    setInput('');
  };

  return (
    <div className={style.chatbot_cont}>
      {/* Open and Close ChatBot Button */}
      <button className={style.chat_btn} onClick={toggleChat}>
        <Image src={LogoChatBot} alt="ChatBot" width={imgWH} height={imgWH} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={style.chat_window}>
          <div className={style.header_area}>
            <div className={style.header_avatar}>
              <Image
                src={LogoChatBot}
                alt="ChatBot"
                width={imgWH}
                height={imgWH}
              />
            </div>
            <div className={style.header_text}>
              <div
                className={`${style.chatbot_online} ${
                  isConnected ? style.online : style.offline
                }`}
              >
                <div className={style.chat_dot}></div>
                <p className="p_small_small">
                  {isConnected ? 'Online' : 'Offline'}
                </p>
              </div>

              <p className={style.custom_title}>Ghost</p>
            </div>
            <button className={style.reset_btn} onClick={resetChat}>
              <Image src={LogoReset} alt="Reset" width={imgWH} height={imgWH} />
            </button>
          </div>

          <div className={style.messages}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`${style.message} ${
                  msg.role === 'user' ? style.user : style.assistant
                }`}
              >
                <p className="p_small">{msg.content}</p>
              </div>
            ))}
            {loading && <p className="p_small">Processing...</p>}

            <div ref={messagesEndRef} />
          </div>

          <div className={style.input_area}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
            />
            <button onClick={sendMessage} disabled={loading}>
              <Image src={LogoSend} alt="Send" width={imgWH} height={imgWH} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
