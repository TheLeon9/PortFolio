//=============================================================================
// ChatBot — Floating chat widget with predefined Q&A and a "Ghost" persona
//
// The bot has two modes driven by `userList.user_chatbot`:
//   • Online  → predefined Q&A buttons + a free-text input that fakes a
//               reply after a short delay.
//   • Offline → a banner explaining that "Ghost" is unavailable.
//
// The component owns its own messages state — there is no backend.
//=============================================================================

//-- Imports ------------------------------------------------------------------
import React, { useState, useRef, useEffect } from 'react';

import Image from 'next/image';

// Constants: image size, predefined Q&A list, user profile (drives online flag).
import { imgWH, predefinedQuestions, userList } from '@/constants';

// Icons served from /public.
import LogoReset from 'p/img/custom_img/reset.svg';
import LogoChatBot from 'p/img/custom_img/chatbot.svg';
import LogoSend from 'p/img/custom_img/send.svg';

// CSS module — full chat window layout, message bubbles, suggestion chips.
import style from './index.module.scss';

//-- Constants ----------------------------------------------------------------
// Delay before the fake bot reply appears, in milliseconds.
const REPLY_DELAY_MS = 700;

/**
 * ChatBot
 * Owns: open/close state, message list, current input value, loading flag,
 * remaining predefined questions.
 */
const ChatBot = () => {
  //-- State / Refs -----------------------------------------------------------

  // Whether the chat window is currently open.
  const [isOpen, setIsOpen] = useState(false);

  // Conversation history: `{ role: 'user' | 'assistant', content: string }`.
  const [messages, setMessages] = useState([]);

  // Current text in the input field.
  const [input, setInput] = useState('');

  // True while we are waiting for the fake bot reply timeout.
  const [loading, setLoading] = useState(false);

  // Remaining predefined questions (one is removed once it's been asked).
  const [availableQuestions, setAvailableQuestions] =
    useState(predefinedQuestions);

  // Pulled from the user profile so the persona can be toggled at compile
  // time without any UI hint.
  const isOnline = userList.user_chatbot === true;

  // Ref to a sentinel <div> at the bottom of the message list — used to
  // auto-scroll on every new message.
  const messagesEndRef = useRef(null);

  // Stored timeout id so we can clear it when the component unmounts before
  // the bot has answered.
  const replyTimeoutRef = useRef(null);

  //-- Effects ----------------------------------------------------------------

  // Auto-scroll to the latest message whenever the list grows or the
  // loading state changes.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Cleanup the reply timeout if the component unmounts mid-reply.
  useEffect(() => {
    return () => {
      if (replyTimeoutRef.current) clearTimeout(replyTimeoutRef.current);
    };
  }, []);

  //-- Handlers ---------------------------------------------------------------

  /** Toggle the chat window open/closed. */
  const toggleChat = () => setIsOpen(!isOpen);

  /**
   * sendMessage
   * Push the user message into the history, set the loading flag, then
   * after `REPLY_DELAY_MS` push a fake assistant reply (or the predefined
   * answer if one was provided).
   */
  const sendMessage = async (text, predefinedAnswer = null) => {
    // Bail out if the chat is offline or the user typed only whitespace.
    if (!isOnline || !text.trim()) return;

    // Append the user message immediately so the UI feels responsive.
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    // Schedule the fake reply.
    replyTimeoutRef.current = setTimeout(() => {
      const reply =
        predefinedAnswer || `Sure! "${text}" sounds interesting. (AI reply)`;
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
      setLoading(false);
    }, REPLY_DELAY_MS);
  };

  /**
   * handleQuestionClick
   * When the user picks a predefined question chip, send it as a message
   * and remove it from the available list so it can't be asked twice.
   */
  const handleQuestionClick = (q) => {
    if (!isOnline) return;
    sendMessage(q.question, q.answer);
    setAvailableQuestions((prev) => prev.filter((item) => item.id !== q.id));
  };

  /**
   * resetChat
   * Wipe the conversation history and re-populate the predefined questions.
   */
  const resetChat = () => {
    setMessages([]);
    setInput('');
    setAvailableQuestions(predefinedQuestions);
  };

  //-- Render -----------------------------------------------------------------
  return (
    <div className={style.chatbot_cont}>
      {/* Toggle button — always visible. */}
      <button
        className={`${style.chat_btn} hover_target_big`}
        onClick={toggleChat}
        aria-label="Open chat"
      >
        <Image src={LogoChatBot} alt="ChatBot" width={imgWH} height={imgWH} />
      </button>

      {isOpen && (
        <div className={style.chat_window}>
          {/* Header: avatar + name + online/offline status + reset button. */}
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
              aria-label="Reset conversation"
            >
              <Image src={LogoReset} alt="Reset" width={imgWH} height={imgWH} />
            </button>
          </div>

          {/* Messages list (scrollable). `data-allow-scroll` whitelists this
              element for the global custom scroll handler in ThemeContext. */}
          <div
            className={style.messages}
            role="log"
            aria-live="polite"
            data-allow-scroll
          >
            {isOnline ? (
              <>
                {/* Render every message bubble — class depends on role. */}
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
                {/* Loading indicator while the fake bot is "typing". */}
                {loading && <p className="p_small">Processing...</p>}

                {/* Up to 2 predefined question chips — handy starters. */}
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
              // Offline placeholder.
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
            {/* Sentinel for auto-scroll. */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input row — only rendered when the bot is online. */}
          <div className={style.input_area}>
            {isOnline && (
              <>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  // Pressing Enter sends the message without a click.
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                  placeholder="Type a message..."
                  className="hover_target_small"
                />
                <button
                  className="hover_target_small"
                  onClick={() => sendMessage(input)}
                  // Disable the send button while the fake bot is replying.
                  disabled={loading}
                  aria-label="Send message"
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
