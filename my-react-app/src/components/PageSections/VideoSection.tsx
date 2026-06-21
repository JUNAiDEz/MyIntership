interface VideoSectionProps {
  title?: string;
  youtubeId?: string;
  backgroundColor?: string;
}

function VideoSection({ title, youtubeId, backgroundColor }: VideoSectionProps) {
  return (
    <div className="border-y border-[#e0e0e0] py-[30px] md:py-[50px]" style={{ backgroundColor }}>
      <div className="mx-auto max-w-[1200px] px-3 md:px-[15px]">

        <h2 className="mb-5 mt-0 text-center text-[1.3rem] font-black text-black md:mb-[30px] md:text-[1.8rem]">{title}</h2>

        {/* 16:9 responsive wrapper */}
        <div className="relative h-0 overflow-hidden rounded-md pb-[56.25%] shadow-[0_10px_25px_rgba(0,0,0,0.15)] md:rounded-lg">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute left-0 top-0 h-full w-full"
          ></iframe>
        </div>
      </div>
    </div>
  );
}

export default VideoSection;
