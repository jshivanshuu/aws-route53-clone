import Link from "next/link";
import { useRouter } from "next/router";
import { currentUser, logout } from "../lib/store";

export default function Sidebar() {
  const router = useRouter(); const user = typeof window !== "undefined" ? currentUser() : null;
  const signOut = () => { logout(); router.push("/login"); };
  return <aside className="sidebar"><Link href="/dashboard" className="brand"><span className="brand-mark">53</span><span>Route 53 <small>clone</small></span></Link><nav><Link className={router.pathname === "/dashboard" ? "active" : ""} href="/dashboard">Overview</Link><Link className={router.pathname.startsWith("/hosted-zones") ? "active" : ""} href="/hosted-zones">Hosted zones</Link></nav><div className="account"><span>{user?.email || "Signed in"}</span><button onClick={signOut}>Sign out</button></div></aside>;
}
