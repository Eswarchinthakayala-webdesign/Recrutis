import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import companies from "../data/companies.json";
import faqs from "../data/faq.json";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import TextShimmer from "../components/text-shimmer";
import JobSection from "../components/JobSection";
import { GridBackground } from "../components/gridBackground";
import { useTheme } from "../components/theme-provider";

const LandingPage = () => {

  const { theme } = useTheme();

  // Determine if dark mode is active
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  return (
    <main className="flex flex-col gap-10 sm:gap-20 py-10 sm:py-20">
      <section className="text-center ">
       
        <TextShimmer className="flex flex-col  items-center justify-center gradient-title font-extrabold text-4xl sm:text-6xl lg:text-8xl tracking-tighter py-4 text-center" duration={4} repeatDelay={0.5}>
      
  Discover Your Next Opportunity
  <span className="flex items-center gap-2 sm:gap-6">
    with
    <img
      src="/logo.png"
      className={`h-14 sm:h-24 lg:h-32  ${isDark ? "invert brightness-10" : "invert brightness-1000"} `}
      alt="Recrutis Logo"
    />
  </span>
</TextShimmer>

        <p className="text-gray-400 sm:mt-4 text-xs sm:text-xl">
          Explore thousands of job listings or find the perfect candidate
        </p>
      </section>
      <div className="flex gap-6 justify-center">
        <Link to={"/jobs"}>
          <Button variant="outline" className=" p-2 text-white hover:text-gray-200 bg-gradient-to-br from-zinc-500 via-zinc-600 via-zinc-800 to-zinc-900 cursor-pointer" size="xl">
            Find Jobs
          </Button>
        </Link>
        <Link to={"/post-job"}>
          <Button variant="destructive" className="p-2 cursor-pointer" size="xl">
            Post a Job
          </Button>
        </Link>
      </div>
     
      <Carousel
        plugins={[
          Autoplay({
            delay: 2000,
          }),
        ]}
        className="w-full py-10"
      >
        <CarouselContent className="flex gap-5 sm:gap-20 items-center">
          {companies.map(({ name, id, path }) => (
            <CarouselItem key={id} className="basis-1/3 lg:basis-1/6 flex justify-center items-center">
              <div
                className={`
                  p-2 rounded-lg transition-all duration-300 flex justify-center items-center
                `}
              >
                <img
                  src={path}
                  alt={name}
                  className={`
                    h-9 sm:h-14 object-contain
                    transition-all duration-300
                    ${isDark ? "invert brightness-100" : ""}
                  `}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <img src="/banner.jpeg" className="w-full h-100 sm:h-150 md:h-180 px-4 rounded-2xl" />

     <JobSection/>

      <Accordion type="multiple" className="w-full px-4">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index + 1}`}>
            <AccordionTrigger className="cursor-pointer">{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </main>
  );
};

export default LandingPage;