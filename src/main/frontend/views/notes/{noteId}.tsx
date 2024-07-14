import { MilkdownProvider } from '@milkdown/react';
import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import MilkdownEditor from 'Frontend/components/MilkdownEditor';
import { useParams } from 'react-router-dom';

export const config: ViewConfig = {
  menu: { exclude: true }
};

export default function MilkdownEditorWrapper() {
  const { noteId } = useParams();

  return (
    <MilkdownProvider>
      <MilkdownEditor />
    </MilkdownProvider>
  );
}
