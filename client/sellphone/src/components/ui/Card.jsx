const Card = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-white rounded-3xl p-5 shadow-sm
      transition-all duration-300 ease-out
      hover:shadow-lg hover:-translate-y-1
      ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
