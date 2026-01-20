import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RetellWebClient } from "retell-client-js-sdk";

type CallStatus = "idle" | "connecting" | "active" | "ended";

const AGENT_ID = "agent_7a2a607afcad37a8c4536018b3";
const API_KEY = "key_d08d4717775e3a48fce3aae399ed";

export function VoiceCallButton() {
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const retellClientRef = useRef<RetellWebClient | null>(null);

  useEffect(() => {
    const client = new RetellWebClient();
    retellClientRef.current = client;

    client.on("call_started", () => {
      setCallStatus("active");
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
        onClick={isActive ? endCall : startCall}
        disabled={callStatus === "connecting"}
        className={`
          relative w-20 h-20 rounded-full flex items-center justify-center
          transition-all duration-300 transform hover:scale-105
          ${isActive 
            ? "bg-destructive text-destructive-foreground" 
            : "bg-cta text-accent-foreground pulse-ring"
          }
          ${isSpeaking ? "speaking-pulse" : ""}
          disabled:opacity-70 disabled:cursor-not-allowed
        `}
      >
        {isActive ? (
          <PhoneOff className="w-8 h-8" />
        ) : (
          <Mic className="w-8 h-8" />
        )}
        
        {callStatus === "active" && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full animate-pulse" />
        )}
      </button>
      
      <p className="text-sm font-medium text-muted-foreground">
        {getStatusText()}
      </p>
    </div>
  );
}

export function FloatingVoiceButton() {
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const retellClientRef = useRef<RetellWebClient | null>(null);

  useEffect(() => {
    const client = new RetellWebClient();
    retellClientRef.current = client;

    client.on("call_started", () => {
      setCallStatus("active");
    });

    client.on("call_ended", () => {
      setCallStatus("ended");
      setIsSpeaking(false);
      setTimeout(() => {
        setCallStatus("idle");
        setIsExpanded(false);
      }, 2000);
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

  const isActive = callStatus === "active" || callStatus === "connecting";

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isExpanded && (
        <div className="bg-card border border-border rounded-lg p-4 shadow-xl animate-in slide-in-from-bottom-2 duration-200">
          <p className="text-sm font-semibold text-foreground mb-1">
            {callStatus === "connecting" && "Connecting..."}
            {callStatus === "active" && (isSpeaking ? "Sarah is speaking..." : "Listening...")}
            {callStatus === "ended" && "Call Ended"}
            {callStatus === "idle" && "Ready to call"}
          </p>
          <p className="text-xs text-muted-foreground">
            24/7 Live Dispatch Available
          </p>
        </div>
      )}
      
      <button
        onClick={() => {
          if (isActive) {
            endCall();
          } else if (callStatus === "idle") {
            setIsExpanded(true);
            startCall();
          }
        }}
        onMouseEnter={() => !isActive && setIsExpanded(true)}
        onMouseLeave={() => !isActive && setIsExpanded(false)}
        className={`
          relative w-16 h-16 rounded-full flex items-center justify-center
          shadow-xl transition-all duration-300 transform hover:scale-110
          ${isActive 
            ? "bg-destructive text-destructive-foreground" 
            : "bg-cta text-accent-foreground pulse-ring"
          }
          ${isSpeaking ? "speaking-pulse" : ""}
        `}
      >
        {isActive ? (
          <PhoneOff className="w-7 h-7" />
        ) : (
          <Mic className="w-7 h-7" />
        )}
        
        {callStatus === "active" && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full animate-pulse" />
        )}
      </button>
    </div>
  );
}
