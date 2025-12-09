"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function VideoIntro() {
  const t = useTranslations("home.videoIntro");

  return (
    <section className="relative w-full h-[80vh] md:h-[80vh] overflow-hidden">
      {/* Background video */}
      <video
        src="/videos/intro-fashion.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/80" />

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center text-white px-4"
      >
        {/* Brand logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
        >
          <Image
            src="/logs/LBlanco.png"
            alt="KOI Streetwear"
            width={260}
            height={260}
            className="opacity-70 drop-shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:opacity-100 transition duration-500"
          />
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight"
        >
          {t("title")}
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-3 text-base md:text-xl text-neutral-200 max-w-2xl"
        >
          {t("subtitle")}
        </motion.p>
      </motion.div>
    </section>
  );
}
