import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { Mic, PhoneOff, MessageCircle } from "lucide-react";
import { RetellWebClient } from "retell-client-js-sdk";

type CallStatus = "idle" | "connecting" | "active" | "ended";

const AGENT_ID = "agent_7a2a607afcad37a8c4536018b3";
const API_KEY = "key_d08d4717775e3a48fce3aae399ed";

export interface VoiceCallButtonHandle {
  triggerAttention: () => void;
}

export const VoiceCallButton = forwardRef<VoiceCallButtonHandle, object>((_, ref) => {
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAttention, setIsAttention] = useState(false);
  const retellClientRef = useRef<RetellWebClient | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useImperativeHandle(ref, () => ({
    triggerAttention: () => {
      setIsAttention(true);
      setTimeout(() => setIsAttention(false), 3000);
    }
  }));

  useEffect(() => {
    const client = new RetellWebClient();
    retellClientRef.current = client;

    client.on("call_started", () => {
      setCallStatus("active");
      setIsAttention(false);
    });

    client.on("call_ended", () => {
      setCallStatus("ended");
      setIsSpeaking(false);
      setTimeout(() => setCallStatus("idle"), 2000);
    });

    client.on("agent_start_talking", () => {
      setIsSpeaking(true);
    });

    client.on("agent_stop_talking", () => {
      setIsSpeaking(false);
    });

    client.on("error", (error) => {
      console.error("Retell error:", error);
      setCallStatus("idle");
    });

    return () => {
      client.stopCall();
    };
  }, []);

  const startCall = async () => {
    setCallStatus("connecting");
    setIsAttention(false);

    try {
      const response = await fetch("https://api.retellai.com/v2/create-web-call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          agent_id: AGENT_ID,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create web call");
      }

      const data = await response.json();
      
      await retellClientRef.current?.startCall({
        accessToken: data.access_token,
      });
    } catch (error) {
      console.error("Error starting call:", error);
      setCallStatus("idle");
    }
  };

  const endCall = () => {
    retellClientRef.current?.stopCall();
    setCallStatus("ended");
  };

  const getStatusText = () => {
    switch (callStatus) {
      case "connecting":
        return "Connecting to Sarah...";
      case "active":
        return isSpeaking ? "Sarah is speaking..." : "Listening...";
      case "ended":
        return "Call Ended";
      default:
        return "Speak to Sarah (Live Dispatch)";
    }
  };

  const isActive = callStatus === "active" || callStatus === "connecting";

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        ref={buttonRef}
        onClick={isActive ? endCall : startCall}
        disabled={callStatus === "connecting"}
        className={`
          relative w-20 h-20 rounded-full flex items-center justify-center
          transition-all duration-300 transform hover:scale-105
          ${isActive 
            ? "bg-destructive text-destructive-foreground" 
            : "bg-cta text-accent-foreground"
          }
          ${isSpeaking ? "speaking-pulse" : ""}
          ${isAttention ? "attention-shake" : "pulse-ring"}
          disabled:opacity-70 disabled:cursor-not-allowed
        `}
      >
        {isActive ? (
          <PhoneOff className="w-8 h-8" />
        ) : (
          <Mic className={`w-8 h-8 ${isAttention ? "animate-bounce" : ""}`} />
        )}
        
        {callStatus === "active" && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full animate-pulse" />
        )}
      </button>
      
      <p className={`text-sm font-medium ${isAttention ? "text-cta animate-pulse" : "text-primary-foreground/80"}`}>
        {getStatusText()}
      </p>
    </div>
  );
});

VoiceCallButton.displayName = "VoiceCallButton";

export function TalkToSarahButton({ onTrigger }: { onTrigger: () => void }) {
  const handleClick = () => {
    // Scroll to the hero section
    const heroSection = document.getElementById("services");
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: "smooth" });
    }
    // Trigger the attention animation
    setTimeout(() => {
      onTrigger();
    }, 500);
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-cta text-accent-foreground 
        px-5 py-3 rounded-full shadow-xl hover:bg-cta-hover transition-all duration-300 
        transform hover:scale-105 font-semibold"
    >
      <MessageCircle className="w-5 h-5" />
      <span>Talk to Sarah</span>
    </button>
  );
}
