import { memo, useMemo, useRef, useEffect } from "react";
import { DateDivider } from "./DateDivider";
import { TypingIndicator } from "./TypingIndicator";

interface MessageGroup {
  date: Date;
  messages: any[];
}

interface VirtualMessageListProps {
  groupedMessages: MessageGroup[];
  renderMessage: (msg: any) => React.ReactNode;
  typingStatus?: { isTyping: boolean };
  otherUserName?: string;
  messagesEndRef?: React.RefObject<HTMLDivElement>;
  containerHeight: number;
}

export const VirtualMessageList = memo(function VirtualMessageList({
  groupedMessages,
  renderMessage,
  typingStatus,
  otherUserName = "",
  messagesEndRef,
  containerHeight,
}: VirtualMessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // 모든 메시지를 평탄화하여 렌더링
  const flatItems = useMemo(() => {
    const items: Array<{
      type: "date" | "message" | "typing";
      date?: Date;
      message?: any;
    }> = [];

    groupedMessages.forEach((group) => {
      if (!group || !group.date) return;
      items.push({ type: "date", date: group.date });
      if (group.messages && Array.isArray(group.messages)) {
        group.messages.forEach((msg) => {
          items.push({ type: "message", message: msg });
        });
      }
    });

    // 타이핑 표시기 추가
    if (typingStatus?.isTyping) {
      items.push({ type: "typing" });
    }

    return items;
  }, [groupedMessages, typingStatus?.isTyping]);

  // 새 메시지 추가 시 자동 스크롤
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [flatItems.length]);

  if (flatItems.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      style={{ height: containerHeight }}
      className="overflow-y-auto"
    >
      <div className="px-2 sm:px-4">
        {flatItems.map((item, index) => (
          <div key={index}>
            {item.type === "date" && item.date && (
              <DateDivider date={item.date} />
            )}
            {item.type === "message" && item.message && (
              <div
                className={`${
                  item.message.isGrouped ? "mt-0.5" : "mt-3"
                }`}
              >
                {renderMessage(item.message)}
              </div>
            )}
            {item.type === "typing" && (
              <TypingIndicator name={otherUserName} />
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
});

VirtualMessageList.displayName = "VirtualMessageList";
