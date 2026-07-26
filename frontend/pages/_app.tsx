import type { AppProps } from "next/app";
import "../styles/globals.css";
import "../styles/console.css";
import { ToastProvider } from "../components/Notifications";
export default function App({ Component, pageProps }: AppProps) { return <ToastProvider><Component {...pageProps} /></ToastProvider>; }
