const SectionTitle = ({ children, align = "center", className = "" }) => {
  const alignment = {
    center: "text-center mx-auto",
    left: "text-left",
  };

  return (
    <div className={`w-full ${alignment[align]} ${className}`}>
      <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900">
        {children}
      </h2>
    </div>
  );
};

export default SectionTitle;
