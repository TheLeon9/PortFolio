import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import style from './index.module.scss';

import LogoReset from 'p/img/custom_img/reset.svg';
import LogoChatBot from 'p/img/custom_img/chatbot.svg';
import LogoSend from 'p/img/custom_img/send.svg';

import { imgWH, predefinedQuestions } from '@/constants';
import { useConstants } from '@/context/ConstantsContext';

const ChatBot = () => {
  const { user } = useConstants();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableQuestions, setAvailableQuestions] =
    useState(predefinedQuestions);

  const isOnline = user.user_chatbot === true;
  const messagesEndRef = useRef(null);

  const toggleChat = () => setIsOpen(!isOpen);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleQuestionClick = (q) => {
    if (!isOnline) return;
    sendMessage(q.question, q.answer);
    setAvailableQuestions((prev) => prev.filter((item) => item.id !== q.id));
  };

  const sendMessage = async (text, predefinedAnswer = null) => {
    if (!isOnline || !text.trim()) return;

    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const reply =
        predefinedAnswer || `Sure! "${text}" sounds interesting. (AI reply)`;
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
      setLoading(false);
    }, 700);
  };

  const resetChat = () => {
    setMessages([]);
    setInput('');
    setAvailableQuestions(predefinedQuestions);
  };

  return (
    <div className={style.chatbot_cont}>
      {/* Opening Button */}
      <button
        className={`${style.chat_btn} hover_target_big`}
        onClick={toggleChat}
      >
        <Image src={LogoChatBot} alt="ChatBot" width={imgWH} height={imgWH} />
      </button>

      {isOpen && (
        <div className={style.chat_window}>
          {/* Header */}
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
                  isOnline ? style.online : style.offline
                }`}
              >
                <div className={style.chat_dot}></div>
                <p className="p_small_small">
                  {isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
              <p className={style.custom_title}>Ghost</p>
            </div>
            <button
              className={`${style.reset_btn} hover_target_small`}
              onClick={resetChat}
            >
              <Image src={LogoReset} alt="Reset" width={imgWH} height={imgWH} />
            </button>
          </div>

          {/*  Messages Area */}
          <div className={style.messages}>
            {isOnline ? (
              <>
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

                <div className={style.suggested_questions}>
                  {availableQuestions.slice(0, 2).map((q) => (
                    <button
                      key={q.id}
                      className={`${style.question_btn} hover_target_big`}
                      onClick={() => handleQuestionClick(q)}
                    >
                      {q.question}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className={style.offline_banner}>
                <Image
                  src={LogoChatBot}
                  alt="Offline"
                  width={100}
                  height={100}
                  className={style.ghost_offline}
                />
                <p className={style.offline_text}>
                  <span className={style.custom_span}>GHOST</span> not available
                  at the moment
                </p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={style.input_area}>
            {isOnline && (
              <>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                  placeholder="Type a message..."
                  className="hover_target_small"
                />
                <button
                  className="hover_target_small"
                  onClick={() => sendMessage(input)}
                  disabled={loading}
                >
                  <Image
                    src={LogoSend}
                    alt="Send"
                    width={imgWH}
                    height={imgWH}
                  />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
