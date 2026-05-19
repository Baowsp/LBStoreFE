import { Link } from 'react-router-dom';

interface AdBannerProps {
  image: string;
  link: string;
  alt?: string;
  className?: string;
}

export const AdBanner = ({ image, link, alt = "Advertisement", className = "" }: AdBannerProps) => {
  return (
    <Link to={link} className={`block overflow-hidden rounded-2xl shadow-sm group relative bg-gray-200 ${className}`}>
      <img 
        src={image} 
        alt={alt} 
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
    </Link>
  );
};