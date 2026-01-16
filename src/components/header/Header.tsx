import Link from "next/link";

export default function Header() {
  return (
    <header>
      <div>
        <nav className="bg-header p-2">
          <div className="flex space-x-6 justify-center">
            <Link
              href={"/"}
              className="link-btn"
            >
              Home
            </Link>         
            <Link
              href={"/FAQ"}
              className="link-btn"
            >
              FAQ
            </Link> 
            
          </div>
        </nav>
      </div>
    </header>
  );
}
