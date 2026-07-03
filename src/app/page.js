import Banner from "@/components/MainPage/Banner";
import BrandsSection from "@/components/MainPage/BrandsSection";

export default function Home() {
  return (
    <div className="w-full h-full flex flex-col items-center">
      <Banner />
      <BrandsSection />
    </div>
  );
}
