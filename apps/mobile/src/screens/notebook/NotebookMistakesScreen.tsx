import { useEffect } from "react";
import { NotebookController } from "../../controllers/NotebookController";
import { tr } from "../../i18n/tr";
import { MistakeList } from "./MistakeList";
import { NotebookPage } from "./NotebookPage";

/** Gramer: konuşurken yapılan hatalar ve "daha doğal söylenir" önerileri. */
export function NotebookMistakesScreen() {
  useEffect(() => {
    void NotebookController.loadMistakes();
    return () => NotebookController.stopAudio(); // sayfadan çıkınca ses sussun
  }, []);
  return (
    <NotebookPage title={tr.notebook.grammarTitle}>
      <MistakeList />
    </NotebookPage>
  );
}
