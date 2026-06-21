const SearchInput = () => {
  return (
    <div className="relative inline-block" aria-hidden={false}>
      <input
        type="text"
        placeholder="Search"
        name="text"
        aria-label="Search"
        className="w-[120px] rounded-full border border-black/12 bg-white py-2.5 pl-10 pr-0 text-[#222]
          opacity-95 shadow-[0_1px_2px_rgba(0,0,0,0.06)] outline-none transition-all duration-200 ease-in-out
          focus:w-[200px] focus:opacity-100 sm:w-[150px] sm:focus:w-[250px]"
      />

      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20px"
        height="20px"
        viewBox="0 0 1920 1920"
        fill="#666"
        aria-hidden="true"
        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2"
      >
        <path
          d="M790.588 1468.235c-373.722 0-677.647-303.924-677.647-677.647 0-373.722 303.925-677.647 677.647-677.647 373.723 0 677.647 303.925 677.647 677.647 0 373.723-303.924 677.647-677.647 677.647Zm596.781-160.715c120.396-138.692 193.807-319.285 193.807-516.932C1581.176 354.748 1226.428 0 790.588 0S0 354.748 0 790.588s354.748 790.588 790.588 790.588c197.647 0 378.24-73.411 516.932-193.807l516.028 516.142 79.963-79.963-516.142-516.028Z"
          fillRule="evenodd"
        />
      </svg>
    </div>
  );
};

export default SearchInput;
