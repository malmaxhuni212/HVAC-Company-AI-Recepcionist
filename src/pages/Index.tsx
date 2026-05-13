import { useRef } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { TalkToSarahButton, VoiceCallButtonHandle } from "@/components/VoiceCallButton";

const Index = () => {
  const voiceButtonRef = useRef<VoiceCallButtonHandle>(null);

  const handleTalkToSarah = () => {
    voiceButtonRef.current?.triggerAttention();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection micRef={voiceButtonRef} />
        <FeaturesSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />
      <TalkToSarahButton onTrigger={handleTalkToSarah} />
    </div>
  );
};

export default Index;
