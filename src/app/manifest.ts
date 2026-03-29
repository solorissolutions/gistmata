import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GistMata",
    short_name: "GistMata",
    description: "Anonymous hyperlocal gist board for Nigeria.",
    start_url: "/mata",
    display: "standalone",
    background_color: "#0e1a14",
    theme_color: "#0e1a14",
    orientation: "portrait",
    lang: "en",
    categories: ["social", "news"],
    icons: [
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Drop Gist",
        short_name: "Drop",
        url: "/drop",
        icons: [{ src: "/logo.png", sizes: "96x96" }],
      },
      {
        name: "National Mata",
        short_name: "Nigeria",
        url: "/mata/nigeria",
        icons: [{ src: "/logo.png", sizes: "96x96" }],
      },
    ],
  };
}
