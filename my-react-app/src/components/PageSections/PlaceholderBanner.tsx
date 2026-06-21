function PlaceholderBanner() {
  return (
    <div className="relative flex min-h-[300px] w-full items-center justify-center overflow-hidden md:min-h-[730px] md:border-y md:border-[#ccc]">
      <img
        src="https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1920&h=730&fit=crop&q=80"
        alt="Car Banner"
        className="block h-full min-h-[300px] w-full object-cover md:min-h-[730px]"
        onError={(e) => {
          console.error('Image failed to load');
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
}

export default PlaceholderBanner;
