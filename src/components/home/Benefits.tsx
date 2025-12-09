import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

function BenefitsStrip() {
  const t = useTranslations("home.benefits");

  const items = [t("1"), t("2"), t("3"), t("4")];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
      className="border-b border-neutral-200 bg-neutral-50/60"
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap gap-3 items-center justify-between text-[11px] text-neutral-600">
        {items.map((item) => (
          <span key={item} className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-neutral-900" />
            {item}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export default BenefitsStrip;
