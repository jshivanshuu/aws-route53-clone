import { ReactNode, useEffect } from "react";
import { useRouter } from "next/router";
import Sidebar from "./Sidebar";

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  useEffect(() => { if (!localStorage.getItem("route53_token")) router.replace("/login"); }, [router]);
  return <div className="app-shell"><Sidebar /><main className="main-content">{children}</main></div>;
}
