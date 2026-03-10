const FloatingShapes = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div
        className="absolute w-72 h-72 rounded-full opacity-20 blur-3xl animate-float-slow"
        style={{ background: "hsl(122 46% 33% / 0.3)", top: "10%", left: "5%" }}
      />
      <div
        className="absolute w-96 h-96 rounded-full opacity-15 blur-3xl animate-float"
        style={{ background: "hsl(122 38% 57% / 0.25)", top: "60%", right: "10%" }}
      />
      <div
        className="absolute w-64 h-64 rounded-full opacity-10 blur-3xl animate-float-slow"
        style={{ background: "hsl(38 92% 50% / 0.2)", bottom: "20%", left: "40%" }}
      />
    </div>
  );
};

export default FloatingShapes;
