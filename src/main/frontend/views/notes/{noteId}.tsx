import { MilkdownProvider } from '@milkdown/react';
import { Box } from '@mui/material';
import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import MilkdownEditor from 'Frontend/components/MilkdownEditor';
import { useParams } from 'react-router-dom';

export const config: ViewConfig = {
  menu: { exclude: true }
};

export default function MilkdownEditorWrapper() {
  const { noteId } = useParams();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        padding: 2,
        width: '100%'
      }}
    >
      <MilkdownProvider>
        <MilkdownEditor />
      </MilkdownProvider>
    </Box>
  );
}
