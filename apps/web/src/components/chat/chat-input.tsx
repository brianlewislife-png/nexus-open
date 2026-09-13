"use client";

import * as React from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [value, setValue] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const send = async () => {
    const content = value.trim();
    if (!content || sending) return;
    setSending(true);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    try {
      await onSend(content);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  return (
    <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-card/80 p-3 backdrop-blur">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={autoResize}
        onKeyDown={handleKeyDown}
        disabled={sending || disabled}
        rows={1}
        placeholder={disabled ? "Waiting for agent…" : placeholder ?? "Type a message…"}
        className="max-h-40 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-zinc-100 placeholder:text-muted-foreground focus:outline-none disabled:opacity-60"
      />
      <Button size="icon" onClick={send} disabled={sending || disabled || !value.trim()} aria-label="Send">
        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      </Button>
    </div>
  );
}