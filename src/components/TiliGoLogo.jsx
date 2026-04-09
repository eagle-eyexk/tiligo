export default function TiliGoLogo({ size = "md", className = "" }) {
  const sizes = {
    sm: "h-7",
    md: "h-9",
    lg: "h-14",
    xl: "h-20",
  };
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <picture>
        <source
          srcSet="https://media.base44.com/images/public/69d519273be8cf966434f77a/51149fad3_IMG_0106.jpeg"
          media="(prefers-color-scheme: dark)"
        />
        <img
          src="https://media.base44.com/images/public/69d519273be8cf966434f77a/f678192b5_IMG_0105.jpeg"
          alt="TiliGo"
          className={`${sizes[size]} w-auto object-contain rounded-lg`}
        />
      </picture>
      <span className="sr-only">TiliGo</span>
    </div>
  );
}