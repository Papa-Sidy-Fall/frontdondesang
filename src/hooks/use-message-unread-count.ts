import { useEffect, useState } from "react";
import { ApiError } from "../services/http-client";
import { getConversations } from "../services/message-api";

const MESSAGE_BADGE_REFRESH_INTERVAL_MS = 15_000;

export function useMessageUnreadCount(enabled = true): number {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setUnreadCount(0);
      return;
    }

    let disposed = false;

    const refreshUnreadCount = async () => {
      try {
        const response = await getConversations();

        if (disposed) {
          return;
        }

        const totalUnread = response.conversations.reduce(
          (total, conversation) => total + conversation.unreadCount,
          0
        );

        setUnreadCount(totalUnread);
      } catch (caughtError) {
        if (disposed) {
          return;
        }

        if (caughtError instanceof ApiError && caughtError.status === 401) {
          setUnreadCount(0);
          return;
        }
      }
    };

    void refreshUnreadCount();

    const intervalId = window.setInterval(() => {
      void refreshUnreadCount();
    }, MESSAGE_BADGE_REFRESH_INTERVAL_MS);

    const handleFocus = () => {
      void refreshUnreadCount();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refreshUnreadCount();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      disposed = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled]);

  return unreadCount;
}
