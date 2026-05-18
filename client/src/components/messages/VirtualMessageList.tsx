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

type FlatItem =
  | { type: "date"; date: Date }
  | { type: "message"; message: any }
  | { type: "typing" };

// react-window 2.x RowComponent props 타입
interface RowComponentProps {
  index: number;
  style: React.CSSProperties;
  // react-window 2.x는 rowProps를 RowComponent에 직접 전달
  renderMessage: (msg: any) => React.ReactNode;
  flatItems: FlatItem[];
  otherUserName: string;
}

// react-window 2.x에서 rowComponent는 별도 컴포넌트로 정의해야 함
const RowComponent = memo(function RowComponent({
  index,
  style,
  renderMessage,
  flatItems,
  otherUserName,
}: RowComponentProps) {
  const item = flatItems[index];
  if (!item) return null;

  return (
    <div style={style} className="px-2 sm:px-4">
      {item.type === "date" && (
        <DateDivider date={item.date} />
      )}
      {item.type === "message" && item.message && (
        <div className={item.message?.isGrouped ? "mt-0.5" : "mt-3"}>
          {renderMessage(item.message)}
        </div>
      )}
      {item.type === "typing" && (
        <TypingIndicator name={otherUserName} />
      )}
    </div>
  );
});

export const VirtualMessageList = memo(function VirtualMessageList({
  groupedMessages,
  renderMessage,
  typingStatus,
  otherUserName = "",
  messagesEndRef,
  containerHeight,
}: VirtualMessageListProps) {
  const listRef = useRef<any>(null);
  const prevLengthRef = useRef(0);

  // 모든 메시지를 평탄화하여 가상 스크롤링용 아이템 생성
  const flatItems = useMemo<FlatItem[]>(() => {
    const items: FlatItem[] = [];

    if (!groupedMessages || !Array.isArray(groupedMessages)) {
      return items;
    }

    groupedMessages.forEach((group) => {
      if (!group || !group.date) return;
      items.push({ type: "date", date: group.date });
      if (Array.isArray(group.messages)) {
        group.messages.forEach((msg) => {
          if (msg) items.push({ type: "message", message: msg });
        });
      }
    });

    if (typingStatus?.isTyping) {
      items.push({ type: "typing" });
    }

    return items;
  }, [groupedMessages, typingStatus?.isTyping]);

  // 새 메시지 추가 시 자동 스크롤
  useEffect(() => {
    if (listRef.current && flatItems.length > prevLengthRef.current) {
      const lastIndex = flatItems.length - 1;
      setTimeout(() => {
        if (listRef.current) {
          listRef.current.scrollToRow({ index: lastIndex, align: "end" });
        }
      }, 50);
    }
    prevLengthRef.current = flatItems.length;
  }, [flatItems.length]);

  // 각 아이템의 높이 계산
  const getRowHeight = useCallback((index: number) => {
    if (!flatItems || flatItems.length === 0 || index < 0 || index >= flatItems.length) {
      return 60;
    }
    const item = flatItems[index];
    if (!item) return 60;
    if (item.type === "date") return 40;
    if (item.type === "typing") return 50;
    return 60;
  }, [flatItems]);

  // containerHeight가 유효하지 않으면 일반 스크롤로 폴백
  if (!containerHeight || containerHeight <= 0) {
    return (
      <div style={{ height: 300, width: "100%", overflowY: "auto" }}>
        {flatItems.map((item, idx) => (
          <div key={idx} className="px-2 sm:px-4">
            {item.type === "date" && <DateDivider date={item.date} />}
            {item.type === "message" && item.message && renderMessage(item.message)}
            {item.type === "typing" && <TypingIndicator name={otherUserName} />}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    );
  }

  if (flatItems.length === 0) {
    return <div ref={messagesEndRef} />;
  }

  // react-window 2.x API: rowCount, rowHeight, rowComponent, rowProps
  const ListComponent = List as any;

  return (
    <div style={{ height: containerHeight, width: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <ListComponent
        listRef={listRef}
        defaultHeight={containerHeight}
        rowCount={flatItems.length}
        rowHeight={getRowHeight}
        rowComponent={RowComponent}
        rowProps={{
          renderMessage,
          flatItems,
          otherUserName,
        }}
        overscanCount={5}
        style={{ height: containerHeight, width: "100%" }}
      >
      </ListComponent>
      <div ref={messagesEndRef} style={{ height: 0 }} />
    </div>
  );
});

VirtualMessageList.displayName = "VirtualMessageList";
