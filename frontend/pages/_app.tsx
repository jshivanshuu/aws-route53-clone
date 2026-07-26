import type { AppProps } from "next/app";
import "../styles/globals.css";
import "../styles/console.css";
import "../styles/themes.css";
import { ToastProvider } from "../components/Notifications";
import { ThemeProvider } from "../components/Theme";
export default function App({ Component, pageProps }: AppProps) { return <ThemeProvider><ToastProvider><Component {...pageProps} /></ToastProvider></ThemeProvider>; }
