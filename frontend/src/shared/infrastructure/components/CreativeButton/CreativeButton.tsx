import './CreativeButton.css';

interface CreativeButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  color?: string;
}

export const CreativeButton = ({ href, children, className = '', color = '#FF5A00' }: CreativeButtonProps) => {
  return (
    <a 
      href={href} 
      className={`creative-button ${className}`} 
      style={{ '--clr': color } as React.CSSProperties}
    >
      <span className="creative-button__icon-wrapper">
        <svg
          viewBox="0 0 14 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="creative-button__icon-svg"
          width="10"
        >
          <path
            d="M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z"
            fill="currentColor"
          ></path>
        </svg>

        <svg
          viewBox="0 0 14 15"
          fill="none"
          width="10"
          xmlns="http://www.w3.org/2000/svg"
          className="creative-button__icon-svg creative-button__icon-svg--copy"
        >
          <path
            d="M13.376 11.552l-.264-10.44-10.44-.24.024 2.28 6.96-.048L.2 12.56l1.488 1.488 9.432-9.432-.048 6.912 2.304.024z"
            fill="currentColor"
          ></path>
        </svg>
      </span>
      {children}
    </a>
  );
};
