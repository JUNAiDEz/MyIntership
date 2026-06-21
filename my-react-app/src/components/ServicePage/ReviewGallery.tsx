interface ReviewItem {
  type?: string;
  videoId?: string;
  src?: string;
  title?: string;
  desc?: string;
}

interface ReviewGalleryProps {
  reviewItems: ReviewItem[];
}

const ReviewGallery = ({ reviewItems }: ReviewGalleryProps) => {
  return (
    <section className="bg-[#111] px-5 py-20">
      <div className="mb-[50px] text-center">
        <h2 className="mb-2.5 text-[2.2rem] font-bold text-white">GALLERY &amp; REVIEW</h2>
        <div className="mx-auto h-1 w-20 rounded-sm bg-accent"></div>
      </div>
      <div className="mt-10 grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
        {reviewItems.map((item, idx) => (
          <div key={idx} className="group border border-[#333] bg-[#111]">
            <div className="h-[220px] overflow-hidden">
              {item.type === 'video' ? (
                <iframe
                  width="100%"
                  height="250"
                  src={`https://www.youtube.com/embed/${item.videoId}`}
                  title={item.title}
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              ) : (
                <img
                  src={item.src}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  width="1000"
                  height="600"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              )}
            </div>
            <div className="p-5">
              <h4 className="m-0 mb-[5px] text-white">{item.title}</h4>
              <p className="text-[0.9rem] text-[#777]">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ReviewGallery;
