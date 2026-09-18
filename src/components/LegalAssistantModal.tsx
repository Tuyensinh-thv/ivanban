import React, { useState } from 'react';
import { Bot, Send, User, Copy, Check, X, Sparkles } from 'lucide-react';
import { ChatMessage } from '../types/nd30';

interface LegalAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  contextText?: string;
}

export const LegalAssistantModal: React.FC<LegalAssistantModalProps> = ({
  isOpen,
  onClose,
  contextText = '',
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Xin chào đồng chí! Tôi là **Trợ lý Pháp chế & Thể thức Văn bản Hành chính** của Trường Đại học Hùng Vương.\n\nTôi có thể hỗ trợ đồng chí tra cứu quy định **Nghị định 30/2020/NĐ-CP**, quy tắc viết hoa tên cơ quan, thẩm quyền ký duyệt (KT., TL., TUQ.), hoặc kỹ thuật căn lề chuẩn A4. Đồng chí cần giải đáp vấn đề gì hôm nay?',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const QUICK_QUESTIONS = [
    'Quy định viết hoa tên cơ quan, chức vụ theo Nghị định 30?',
    'Trong mục Nơi nhận có được dùng dấu ngoặc đơn (để b/c) không?',
    'Phân biệt thẩm quyền Ký thay (KT.) và Ký thừa lệnh (TL.)?',
    'Căn lề và giãn dòng trang A4 chuẩn theo NĐ 30 là bao nhiêu?',
    'UBND cấp xã có được ban hành Quyết định QPPL không?',
  ];

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!questionText) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat-legal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          context: contextText,
        }),
      });

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || 'Không có nội dung phản hồi từ máy chủ.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Đã xảy ra lỗi: ${err.message}. Vui lòng thử lại.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden my-auto animate-scaleUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white px-6 py-4 flex items-center justify-between border-b border-indigo-900">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/80 border border-indigo-400 flex items-center justify-center text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                Trợ lý Pháp chế & Thể thức NĐ 30
                <span className="text-[10px] bg-indigo-500 text-white font-extrabold px-2 py-0.5 rounded-full">
                  AI CONSULTANT
                </span>
              </h3>
              <p className="text-xs text-indigo-200">
                Hỏi đáp chuyên sâu về quy định thể thức, phân cấp thẩm quyền và kỹ thuật văn bản hành chính
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Questions Pill Bar */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 overflow-x-auto">
          <div className="flex items-center space-x-2 text-xs whitespace-nowrap">
            <span className="text-slate-500 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Gợi ý hỏi nhanh:
            </span>
            {QUICK_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(q)}
                className="px-3 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-full border border-slate-200 transition text-[11px] font-medium"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-200">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-4 rounded-2xl max-w-2xl text-xs sm:text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-slate-100 text-slate-900 border border-slate-200 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>

                {m.role === 'assistant' && (
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleCopy(m.id, m.content)}
                      className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1"
                    >
                      {copiedId === m.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedId === m.id ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>
                )}
              </div>

              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-200">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 bg-slate-100 rounded-2xl rounded-bl-none text-xs text-slate-500 flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce"></div>
                <div
                  className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                ></div>
                <span>Trợ lý đang tra cứu Nghị định 30...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi cần tư vấn pháp chế hoặc thể thức văn bản..."
              className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Gửi</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
