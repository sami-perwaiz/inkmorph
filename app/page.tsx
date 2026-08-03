import { Gallery } from "@/components/Gallery/Gallery";
import { buildIllustrationFilterLists } from "@/lib/filterIllustrations";
import { getIllustrations } from "@/lib/getIllustrations";

export default function Home() {
  const lists = buildIllustrationFilterLists(getIllustrations());

  return <Gallery lists={lists} />;
}
