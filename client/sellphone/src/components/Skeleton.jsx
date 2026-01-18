const Skeleton = ({ className = "" }) => {
  return (
    <div className={`animate-pulse bg-white/10 rounded-lg ${className}`} />
  );
};

export default Skeleton;
