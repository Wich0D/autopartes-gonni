import AboutSection from "@/components/AboutPage/AboutSection";
import MissionSection from "@/components/AboutPage/MissionSection";
import VisionSection from "@/components/AboutPage/VisionSection";

export default function AboutPage() {
    return (
        <div className="w-full h-full flex flex-col items-center">
            <AboutSection />
            <MissionSection />
            <VisionSection />
        </div>
    );
}