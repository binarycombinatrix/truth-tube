import "@/styles/app.css"
import spinner from "@/styles/spinner"
import type { AppProps } from "next/app"
import { Amplify } from "aws-amplify"
import NextNProgress from "nextjs-progressbar"
import outputs from "@/amplify_outputs.json"
import "@aws-amplify/ui-react/styles.css"
import Search from "@/components/search"
Amplify.configure(outputs)

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <NextNProgress
        color="white"
        height={3}
        transformCSS={(css) => {
          return <style>{spinner}</style>
        }}
      />
      <Search />
      <Component {...pageProps} />;
    </>
  )
}
