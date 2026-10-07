import Home from "@/components/Home";
import { listNotes } from "@/lib/notes";
import { listProjects } from "@/lib/projects";

export default function Page() {
  return <Home noteCount={listNotes().length} projects={listProjects()} />;
}
