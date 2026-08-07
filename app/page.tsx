import { Suspense } from "react";

import { Gallery } from "@/components/Gallery/Gallery";
import { buildIllustrationFilterLists } from "@/lib/filterIllustrations";
import { getIllustrations } from "@/lib/getIllustrations";

export default function Home() {
  const lists = buildIllustrationFilterLists(getIllustrations());

  return (
    <Suspense fallback={null}>
      <Gallery lists={lists} />
    </Suspense>
  );
}
