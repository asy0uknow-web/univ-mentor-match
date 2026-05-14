import { memo, useMemo, useCallback, useRef, useEffect } from "react";
import { List } from "react-window";
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
  onScroll?: (info: { scrollOffset: number }) => void;
}

export const VirtualMessageList = memo(function VirtualMessageList({
  groupedMessages,
  renderMessage,
  typingStatus,
  otherUserName = "",
  messagesEndRef,
  containerHeight,
}: VirtualMessageListProps) {
  const listRef = useRef<any>(null);

  // 모든 메시지를 평타화하여 가상 스크롤링용 아이템 생성
  // 메시지 끌을 추적하기 위한 레퍼
  const prevLengthRef = useRef(0);

  const flatItems = useMemo(() => {
    const items: Array<{
      type: "date" | "message" | "typing";
      date?: Date;
      message?: any;
    }> = [];

    groupedMessages.forEach((group) => {
      items.push({ type: "date", date: group.date });
      group.messages.forEach((msg) => {
        items.push({ type: "message", message: msg });
      });
    });

    // 타이핑 표시기 추가
    if (typingStatus?.isTyping) {
      items.push({ type: "typing" });
    }

    return items;
  }, [groupedMessages, typingStatus?.isTyping]);

  // 새 메시지 추가 시 자동 스크롤
  useEffect(() => {
    // 메시지가 실제로 추가되면 스크롤 실패
    if (listRef.current && flatItems.length > prevLengthRef.current) {
      const lastIndex = flatItems.length - 1;
      // 단순 스크롤만 실패하면 누락되는 단점을 보완하기 위해 단순 지연 추가
      setTimeout(() => {
        if (listRef.current) {
          listRef.current.scrollToItem(lastIndex, "end");
        }
      }, 50);
    }
    prevLengthRef.current = flatItems.length;
  }, [flatItems.length]);

  // 각 아이템의 높이 계산 (추정값)
  const getItemSize = useCallback((index: number) => {
    const item = flatItems[index];
    if (item.type === "date") return 40; // DateDivider 높이
    if (item.type === "typing") return 50; // TypingIndicator 높이
    return 60; // 일반 메시지 평균 높이
  }, [flatItems]);

  // 아이템 렌더링 함수
  const Row = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const item = flatItems[index];

      return (
        <div style={style} className="px-2 sm:px-4">
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
      );
    },
    [flatItems, renderMessage, otherUserName]
  );

  if (flatItems.length === 0) {
    return null;
  }

  const ListComponent = List as any;
  return (
    <div style={{ height: containerHeight, width: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <ListComponent
        ref={listRef}
        height={containerHeight}
        itemCount={flatItems.length}
        itemSize={getItemSize}
        width="100%"
        overscanCount={5}
      >
        {Row}
      </ListComponent>
      {/* 메시지 끌 스크롤 보정용 */}
      <div ref={messagesEndRef} style={{ height: 0 }} />
    </div>
  );
});

VirtualMessageList.displayName = "VirtualMessageList";
