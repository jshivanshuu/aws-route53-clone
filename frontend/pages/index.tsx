import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace(localStorage.getItem("route53_token") ? "/dashboard" : "/login");
  }, [router]);

  return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>Opening Route 53 console…</main>;
}
