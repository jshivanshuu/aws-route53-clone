import Link from "next/link";
import { useRouter } from "next/router";
import { currentUser, logout } from "../lib/store";

const navigation = [
  { href: "/dashboard", label: "Dashboard" }, { href: "/hosted-zones", label: "Hosted zones" },
  { href: "/traffic-policies", label: "Traffic policies" }, { href: "/health-checks", label: "Health checks" },
  { href: "/resolver", label: "Resolver" }, { href: "/profiles", label: "Profiles" },
];

export default function Sidebar() {
  const router = useRouter(); const user = typeof window !== "undefined" ? currentUser() : null;
  return <aside className="sidebar"><Link href="/dashboard" className="brand"><span className="brand-mark">53</span><span>Route 53 <small>DNS management</small></span></Link><span className="nav-caption">ROUTE 53</span><nav>{navigation.map(item => <Link key={item.href} className={router.pathname === item.href || (item.href === "/hosted-zones" && router.pathname.startsWith("/hosted-zones")) ? "active" : ""} href={item.href}>{item.label}</Link>)}</nav><div className="account"><span>{user?.email || "Signed in"}</span><button onClick={() => { logout(); router.push("/login"); }}>Sign out</button></div></aside>;
}
