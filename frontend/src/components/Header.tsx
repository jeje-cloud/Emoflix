import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APP_NAME } from "@/lib/constants";
import { Film, Home, User, BarChart3, LogOut, Compass, Search } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const Header = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/") {
      const handleScroll = () => setIsScrolled(window.scrollY > 10);
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      setIsScrolled(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const oauthSession = sessionStorage.getItem("oauthSession");
    setIsLoggedIn(!!(token || oauthSession) && location.pathname !== "/");
  }, [location.pathname]);

  const handleGoogleAuth = () => {
    window.open(
      "https://accounts.google.com/o/oauth2/auth?client_id=751047087683-kd88h5t67glb9c12b2g12svtr9a3a4co.apps.googleusercontent.com&redirect_uri=http://localhost:8080&response_type=token&scope=email%20profile",
      "_self"
    );
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("oauthSession");
    navigate("/");
  };

  const TMDB_API_KEY =
    "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlZTJhYTBjODE1NTQzNzkxNjIyMmIxZmYyOWE3ZGI4NiIsIm5iZiI6MTc0MDkyODAzOS41MTIsInN1YiI6IjY3YzQ3NDI3MTExY2RkNGVkOGI0YWUyMyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.nmjaNuIPThzM0BrtWckOXBERsIELOoWImWjXHQ9mxqA";

  const fetchMoviesByName = async (query: string) => {
    if (!query.trim()) return;
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${TMDB_API_KEY}`,
            "Content-Type": "application/json;charset=utf-8",
          },
        }
      );
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const token = localStorage.getItem("token");
      const oauthSession = sessionStorage.getItem("oauthSession");
      const destination = (token || oauthSession) ? "/search" : "/guest-search";
      navigate(`${destination}?query=${encodeURIComponent(searchQuery)}`);
      setSearchResults([]);
      setSearchQuery('');
    }
  };

  const handleSelectMovie = (movie: any) => {
    const token = localStorage.getItem("token");
    const oauthSession = sessionStorage.getItem("oauthSession");
    const destination = (token || oauthSession) ? "/search" : "/guest-search";
    navigate(`${destination}?query=${encodeURIComponent(movie.title)}`);
    setSearchResults([]);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4 ${
          isScrolled
            ? "bg-[hsl(var(--header-background))] border-b border-gray-800/40 text-[hsl(var(--header-foreground))]"
            : "bg-transparent text-white"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 transition-opacity duration-300 hover:opacity-80 text-[hsl(var(--header-foreground))]"
          >
            <Film className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">{APP_NAME}</span>
          </Link>

          <form onSubmit={handleSearch} className="flex-grow max-w-md">
            <div className="relative">
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies..."
                className="w-full pr-10"
              />
              <Button type="submit" variant="ghost" size="icon" className="absolute right-0 top-0">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          <nav className="hidden md:flex items-center gap-8">
            {isLoggedIn && (
              <>
                <NavLink to="/explore" icon={<Compass className="h-4 w-4" />}>
                  Explore
                </NavLink>
                <NavLink to="/emotions" icon={<Home className="h-4 w-4" />}>
                  Home
                </NavLink>
                <NavLink to="/dashboard" icon={<BarChart3 className="h-4 w-4" />}>
                  History
                </NavLink>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-[hsl(var(--header-foreground))]"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </>
            )}
            {!isLoggedIn && location.pathname === "/" && (
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="text-[hsl(var(--header-foreground))]">
                  Get Started
                </Button>
              </Link>
            )}
            <ThemeToggle />
          </nav>

          <div className="flex md:hidden items-center gap-2">
            {isLoggedIn && (
              <Button variant="ghost" size="icon" className="text-[hsl(var(--header-foreground))]">
                <User className="h-5 w-5" />
              </Button>
            )}
            {!isLoggedIn && location.pathname === "/" && (
              <Link to="/auth">
                <Button variant="ghost" size="icon" className="text-[hsl(var(--header-foreground))]">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}
            <ThemeToggle />
          </div>
        </div>

        {searchResults.length > 0 && (
          <div className="mt-2 bg-white shadow rounded p-2">
            {searchResults.map((movie) => (
              <div
                key={movie.id}
                className="p-1 hover:bg-gray-100 rounded cursor-pointer"
                onClick={() => handleSelectMovie(movie)}
              >
                <span className="text-sm font-medium">{movie.title}</span>
              </div>
            ))}
          </div>
        )}
      </header>
    </>
  );
};

const NavLink = ({
  to,
  children,
  icon,
}: {
  to: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-2 font-medium transition-colors hover:text-primary ${
        isActive
          ? "text-primary"
          : "text-[hsl(var(--header-foreground))] text-opacity-80"
      }`}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
};

export default Header;