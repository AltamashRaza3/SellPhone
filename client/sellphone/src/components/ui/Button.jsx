const Button = ({
  children,
  variant = "primary",
  className = "",
  disabled = false,
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-black/20 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-black text-white hover:opacity-90 active:scale-[0.98]",
    secondary:
      "bg-gray-100 text-gray-800 hover:bg-gray-200 active:scale-[0.98]",
    outline:
      "border border-gray-300 text-gray-800 hover:bg-gray-100 active:scale-[0.98]",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
