interface HeroSectionProps {
  bgImage?: string;
  title?: string;
  subtitle?: string;
}

const HeroSection = ({ bgImage, title, subtitle }: HeroSectionProps) => {
  return (
    <section className="relative flex h-[70vh] w-full items-center justify-center overflow-hidden after:absolute after:bottom-0 after:left-0 after:z-[1] after:h-[200px] after:w-full after:bg-gradient-to-t after:from-[#0a0a0a] after:to-transparent after:content-[''] md:h-[85vh]">
      <div
        className="flex h-full w-full flex-col items-center justify-center bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="z-[2] mb-20 animate-zoom-in text-center">
          <h1 className="m-0 text-[2.5rem] font-extrabold uppercase leading-none tracking-[2px] text-white [text-shadow:0_0_20px_rgba(255,199,9,0.3)] md:text-[4rem]">
            {title} <span className="pr-2.5 italic text-accent">TUNING</span>
          </h1>
          <div className="mt-5 inline-block rounded-[50px] border border-white/20 bg-black/50 px-[30px] py-2.5 text-[1.2rem] font-light text-white/80 backdrop-blur-[5px]">
            {subtitle}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
