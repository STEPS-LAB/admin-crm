import { LoadingState } from "@/components/feedback/LoadingState";

export function PageLoader(): React.JSX.Element {
  return <LoadingState fullPage label="Loading page…" />;
}
