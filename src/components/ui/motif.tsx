import type { SVGProps } from "react";
import type { SubjectMotif } from "@/lib/subjects";
import { Icon } from "./icons";

export const MOTIF: Record<SubjectMotif, (p: SVGProps<SVGSVGElement>) => React.JSX.Element> = {
  graph: Icon.Graph,
  helix: Icon.Helix,
  clock: Icon.Clock,
  stethoscope: Icon.Stethoscope,
};
