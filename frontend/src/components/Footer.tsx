import { Link } from "react-router-dom";
import { APP_NAME } from "@/lib/constants";
import {
  Film,
  Heart,
  Github,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[hsl(var(--footer-background))] shadow-lg text-[hsl(var(--footer-foreground))] py-12 border-t border-gray-800/40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <Film className="h-5 w-5 text-primary" />
              <span className="font-bold text-lg">{APP_NAME}</span>
            </Link>
            <p className="text-[hsl(var(--footer-foreground))] text-opacity-80 text-sm max-w-xs">
              Discover movies that match your mood through our emotion-based
              recommendation system.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <Link
                to="/"
                className="text-[hsl(var(--footer-foreground))] text-opacity-80 hover:text-[hsl(var(--footer-foreground))] text-sm transition-colors"
                onClick={() => {
                  localStorage.removeItem("token");
                  sessionStorage.removeItem("oauthSession");
                }}
              >
                Home
              </Link>
              <li>
                <Link
                  to="/"
                  className="text-[hsl(var(--footer-foreground))] text-opacity-80 hover:text-[hsl(var(--footer-foreground))] text-sm transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              {/* <li>
                <Link to="/dashboard" className="text-[hsl(var(--footer-foreground))] text-opacity-80 hover:text-[hsl(var(--footer-foreground))] text-sm transition-colors">
                  Terms and Conditions
                </Link>
              </li> */}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Connect</h3>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="text-[hsl(var(--footer-foreground))] text-opacity-80 hover:text-[hsl(var(--footer-foreground))] transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-[hsl(var(--footer-foreground))] text-opacity-80 hover:text-[hsl(var(--footer-foreground))] transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-[hsl(var(--footer-foreground))] text-opacity-80 hover:text-[hsl(var(--footer-foreground))] transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[hsl(var(--footer-foreground))] border-opacity-20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[hsl(var(--footer-foreground))] text-opacity-80">
            © {currentYear} {APP_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              to="#"
              className="text-xs text-[hsl(var(--footer-foreground))] text-opacity-80 hover:text-[hsl(var(--footer-foreground))] transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="#"
              className="text-xs text-[hsl(var(--footer-foreground))] text-opacity-80 hover:text-[hsl(var(--footer-foreground))] transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
