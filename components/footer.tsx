import React from "react";
import { allsavfeUrl } from "@/lib/variables";

const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 bg-white w-full py-2 flex items-center justify-center gap-2 border-t border-gray-200 z-50">
      <span className="text-xs text-[#6E6E6E] font-poppins">
        Desarrollado por
      </span>
      <a
        href={allsavfeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center hover:opacity-80 transition-opacity"
      >
        <img
          src="/allsavfe_logo.png"
          alt="Allsavfe Logo"
          className="h-4"
        />
      </a>
    </footer>
  );
};

export default Footer;
