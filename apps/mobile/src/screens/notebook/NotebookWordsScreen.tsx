import { useEffect } from "react";
import { NotebookController } from "../../controllers/NotebookController";
import { tr } from "../../i18n/tr";
import { NotebookPage } from "./NotebookPage";
import { WordList } from "./WordList";

/** Kelimeler: derste dokunup kaydedilen kelimeler. */
export function NotebookWordsScreen() {
  useEffect(() => {
    void NotebookController.loadWords();
    return () => NotebookController.stopAudio(); // sayfadan çıkınca ses sussun
  }, []);
  return (
    <NotebookPage title={tr.notebook.wordsTitle}>
      <WordList />
    </NotebookPage>
  );
}
