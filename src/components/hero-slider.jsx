"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";
import Image1 from "@/assets/Gemini_Generated_Image_nydvybnydvybnydv.png";
import Image2 from "@/assets/Gemini_Generated_Image_hdpwqqhdpwqqhdpw.png";
import Image3 from "@/assets/Gemini_Generated_Image_ghip0sghip0sghip.png";
import { RiSearchEyeLine } from "react-icons/ri";
import { BsFillCalendar2PlusFill } from "react-icons/bs";
import Link from "next/link";

const slides = [
  {
    id: 1,
    image: Image1.src,
    title: "Build Your Startup Team",
    subtitle: "Find co-founders & collaborators",
    description:
      "Publish your idea, review applicants, and recruit talented makers to join your journey.",
    buttonText: "Post Opportunity",
  },
  {
    id: 2,
    image: Image2.src,
    title: "Discover Opportunities",
    subtitle: "Browse startup roles",
    description:
      "Explore curated opportunities that match your skills and interests.",
    buttonText: "Browse Roles",
  },
  {
    id: 3,
    image: Image3.src,
    title: "Join Ambitious Teams",
    subtitle: "Collaborate & grow",
    description:
      "Apply to startups, showcase your portfolio, and become part of founding teams.",
    buttonText: "Get Started",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
  exit: { opacity: 0, transition: { duration: 0.4 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function HeroSlider() {
  return (
    <div className="w-full">
      <Swiper
        modules={[Autoplay]}
        autoplay={{
          delay: 8000,
          disableOnInteraction: false,
        }}
        loop={true}
        className="w-full h-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                className="relative w-full h-[320px] sm:h-[420px] md:h-[520px] lg:h-[640px] overflow-hidden bg-cover bg-center"
                style={{
                  backgroundImage: `url(${slide.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
                initial={{ scale: 1.08, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.05, opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,7,18,0.78)_0%,rgba(3,7,18,0.5)_45%,rgba(3,7,18,0.18)_100%)]" />

                <motion.div
                  className="relative mx-auto flex h-full max-w-7xl items-center px-6 sm:px-8 md:px-10 lg:px-12 justify-start"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="flex w-full max-w-2xl flex-col gap-3 md:gap-4 text-left">
                    <motion.span
                      variants={itemVariants}
                      className="md:mx-0 w-fit rounded-full border border-white/20 bg-white/10 px-4 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200 backdrop-blur-sm"
                    >
                      {slide.subtitle}
                    </motion.span>

                    <motion.h2
                      variants={itemVariants}
                      className="max-w-xl text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black leading-tight text-white"
                    >
                      {slide.title}
                    </motion.h2>

                    <motion.p
                      variants={itemVariants}
                      className="max-w-lg text-sm sm:text-base leading-6 md:leading-7 text-white/85 md:text-lg"
                    >
                      {slide.description}
                    </motion.p>

                    <motion.div
                      variants={itemVariants}
                      className="mt-4 flex flex-col items-start sm:flex-row sm:items-start gap-4"
                    >
                      <Link href="/browse-startups">
                        <motion.button
                          whileHover={{ y: -2, scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                          className="inline-flex w-fit min-w-[170px] shrink-0 items-center justify-center gap-2 rounded-full bg-linear-to-r from-orange-500 to-orange-400 px-5 py-3 font-bold text-white shadow-lg shadow-orange-500/25 cursor-pointer whitespace-nowrap transition-shadow duration-300 hover:shadow-orange-500/40"
                        >
                          <RiSearchEyeLine />
                          {slide.buttonText}
                        </motion.button>
                      </Link>

                      <div className="rounded-full border border-orange-300 bg-white/6 p-[1.5px] shadow-lg shadow-black/10 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5">
                        <Link href="/dashboard">
                          <button className="inline-flex w-fit min-w-[170px] shrink-0 items-center justify-center gap-2 rounded-full bg-transparent px-5 py-3 font-bold text-white cursor-pointer whitespace-nowrap transition-colors duration-300 hover:text-orange-100">
                            <BsFillCalendar2PlusFill />
                            My Dashboard
                          </button>
                        </Link>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
