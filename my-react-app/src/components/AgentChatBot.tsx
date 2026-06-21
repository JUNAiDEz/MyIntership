import { useState, useRef, useEffect } from 'react';
import styles from './AgentChatBot.module.css';
import { FaRobot, FaPaperPlane, FaTimes, FaFacebookF, FaMapMarkerAlt } from 'react-icons/fa';

// แชทบอท widget — สไตล์/อนิเมชัน (typing dots, status pulse) เก็บไว้ใน AgentChatBot.module.css
const WEBHOOK_URL = 'https://mikeygt7.app.n8n.cloud/webhook/g7-chat';

interface ChatMessage {
  from: 'bot' | 'user';
  text: string;
}

const AgentChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { from: 'bot', text: 'สวัสดีค่ะ! ฉันคือ GT7น้องเทอร์โบเป็นผู้ช่วย\nช่องทางติดต่อเพิ่มเติม:\nFacebook: https://www.facebook.com/GT7MOTOR' },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: open ? 'instant' : 'smooth' });
    }
  }, [messages, open]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = input;
    setMessages((msgs) => [...msgs, { from: 'user', text: userMessage }]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await res.json().catch(() => ({}));
      const reply = data?.reply || 'ขออภัยค่ะ ระบบไม่สามารถตอบกลับได้ในขณะนี้';
      setMessages((msgs) => [...msgs, { from: 'bot', text: reply }]);
    } catch {
      setMessages((msgs) => [...msgs, { from: 'bot', text: 'ขออภัยค่ะ ระบบขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้งนะคะ' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button className={styles.fab} onClick={() => setOpen((v) => !v)} aria-label="เปิด/ปิดแชทบอท">
        {open ? <FaTimes /> : <FaRobot className={styles.botIcon} />}
      </button>
      {open && (
        <div className={styles.chatBox}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.brandBadge}>GT7</div>
              <div className={styles.headerText}>
                <div className={styles.headerTitle}>น้องเทอร์โบ</div>
                <div className={styles.statusRow}>
                  <span className={styles.statusDot} />
                  <span className={styles.statusText}>Online Now</span>
                </div>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="ปิดแชท">
              <FaTimes />
            </button>
          </div>
          <div className={styles.messages}>
            {messages.map((msg, i) => (
              <div key={i} className={msg.from === 'user' ? styles.msgRowUser : styles.msgRowBot}>
                <div className={styles.msgBubbleWrap}>
                  {msg.from === 'bot' ? (
                    <>
                      <div className={styles.botMsg}>
                        <div className={styles.msgText}>{msg.text}</div>
                        {msg.text?.includes('Facebook:') && (
                          <a
                            className={styles.fbLink}
                            href="https://www.facebook.com/GT7MOTOR"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FaFacebookF />
                            Facebook
                          </a>
                        )}
                        {msg.text?.includes('ที่อยู่') && (
                          <div className={styles.mapHint}>
                            <FaMapMarkerAlt />
                            <span>สาขาสามวา (Hathairat Road)</span>
                          </div>
                        )}
                      </div>
                      <div className={styles.msgMeta}>Agent • Just now</div>
                    </>
                  ) : (
                    <>
                      <div className={styles.userMsg}>
                        <div className={styles.msgText}>{msg.text}</div>
                      </div>
                      <div className={styles.msgMetaUser}>You • Sent</div>
                    </>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className={styles.msgRowBot}>
                <div className={styles.msgBubbleWrap}>
                  <div className={styles.botMsg}>
                    <span className={styles.typingDots} aria-label="กำลังพิมพ์">
                      <span className={styles.dot} />
                      <span className={styles.dot} />
                      <span className={styles.dot} />
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className={styles.inputWrap}>
            <div className={styles.inputRow}>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="พิมพ์ข้อความของคุณ..."
                className={styles.input}
              />
              <button className={styles.sendBtn} onClick={handleSend} aria-label="ส่งข้อความ" disabled={isTyping || !input.trim()}>
                <FaPaperPlane />
              </button>
            </div>
          </div>
          <div className={styles.footerBrand}>
            GT7 MOTOR INDUSTRIAL SOLUTIONS
          </div>
        </div>
      )}
    </>
  );
};

export default AgentChatBot;
