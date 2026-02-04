const AppContainer = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-100">
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6">{children}</div>
    </div>
  );
};

export default AppContainer;
