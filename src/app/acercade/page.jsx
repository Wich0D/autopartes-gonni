import AboutSection from "@/components/AboutPage/AboutSection";
import MissionSection from "@/components/AboutPage/MissionSection";
import VisionSection from "@/components/AboutPage/VisionSection";

export const metadata = {
    title: "Acerca de Nosotros",
    description: "Conoce más sobre la historia, misión, visión y el compromiso de calidad que tenemos en Autopartes GONNI.",
};

export default function AboutPage() {
    return (
        <div className="w-full h-full flex flex-col items-center">
            <AboutSection />
            <MissionSection />
            <VisionSection />
        </div>
    );
}