import CustomersComponents from "./ui/components/Customers";
import EventsComponents from "./ui/components/Events";
import Footer from "./ui/components/footer";
import HeaderComponents from "./ui/components/Header";
import HeroPages from "./ui/components/Hero";
import IdeasComponents from "./ui/components/Ideas";
import LeadingCompanies from "./ui/components/LeadingCompanies";
import PowerfullTools from "./ui/components/PowerfullTools";
import SpeedComponents from "./ui/components/Speed";
import TestimonialsComponents from "./ui/components/Testimonials";


const WeepApps = () => {
  return (
    <>
    <div className="bg-gray-950 min-h-screen overflow-hidden flex flex-col items-center justify-center text-white">
     <HeaderComponents/>
     <HeroPages/>
     <LeadingCompanies/>
     <IdeasComponents/>
     <PowerfullTools/>
     <CustomersComponents/>
     <SpeedComponents/>
     <TestimonialsComponents/>
    </div>
    <EventsComponents/>
    <Footer/>
    </>
  );
}
export default WeepApps;
