import Home from "@/components/Home";
import { listNotes } from "@/lib/notes";

export default function Page() {
  return <Home noteCount={listNotes().length} />;
}
