import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  icon,
  className = '',
  ...props 
}) => {
  const baseStyles = "px-6 py-3 rounded-lg font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)] border-2 border-cyan-400",
    secondary: "bg-transparent hover:bg-slate-800 text-cyan-400 border-2 border-cyan-500/30",
    danger: "bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.5)]"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="w-5 h-5">{icon}</span>}
      {children}
    </button>
  );
};
