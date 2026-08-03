import { Gallery } from "@/components/Gallery/Gallery";
import { getIllustrations } from "@/lib/getIllustrations";

export default function Home() {
  const illustrations = getIllustrations();

  return <Gallery illustrations={illustrations} />;
}
