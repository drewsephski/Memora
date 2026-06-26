"use client";

import { useEffect } from "react";
import { ArrowDown, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TryChatButton() {
  useEffect(() => {
    if (window.location.hash !== "#dashboard-chat") {
      return;
    }

    window.requestAnimationFrame(() => {
      document
        .getElementById("dashboard-chat")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const scrollToChat = () => {
    window.history.pushState(null, "", "#dashboard-chat");
    document
      .getElementById("dashboard-chat")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Button type="button" variant="outline" onClick={scrollToChat}>
      <MessageCircle className="size-4" />
      Try chat
      <ArrowDown className="size-4" />
    </Button>
  );
}
