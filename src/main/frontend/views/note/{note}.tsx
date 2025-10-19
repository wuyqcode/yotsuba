import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import { Box, Button, Stack, TextField } from '@mui/material';
import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import Editor from 'Frontend/components/EditorWrapper';
import { NoteService } from 'Frontend/generated/endpoints';
import NoteDto from 'Frontend/generated/io/github/dutianze/yotsuba/note/application/dto/NoteDto';

export const config: ViewConfig = {
  menu: { exclude: true },
};

export default function NoteEditorView() {
  const { note: noteId } = useParams();
  if (!noteId) {
    throw new Error('noteId is required but not found');
  }

  const navigate = useNavigate();
  const [note, setNote] = useState<NoteDto>();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');

  useEffect(() => {
    NoteService.findById(noteId)
      .then((data) => {
        if (data) {
          setNote(data);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch note:', error);
      });
  }, [noteId]);

  const onChange = (content: string) => {
    setNote((prevNote) => (prevNote ? { ...prevNote, content: content } : prevNote));
  };

  const handleSave = async (closeAfterSave = false) => {
    try {
      await NoteService.updateNote(noteId, note?.title ?? '', note?.cover ?? '', note?.content ?? '');
      if (closeAfterSave) {
        closeNoteEditor();
      }
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  const closeNoteEditor = () => {
    navigate(-1);
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNote((prevNote) => (prevNote ? { ...prevNote, title: e.target.value } : prevNote));
  };

  return (
    <Box sx={{ mx: 2, mt: 2 }}>
      {note && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <TextField
              label="Title"
              value={note.title}
              onChange={handleTitleChange}
              size="small"
              sx={{ maxWidth: 300 }}
            />

            <Stack direction="row" spacing={1}>
              <Button variant="outlined" color="secondary" onClick={closeNoteEditor}>
                close
              </Button>
              <Button variant="contained" color="primary" onClick={() => handleSave(false)}>
                Save
              </Button>
            </Stack>
          </Box>

          <Editor content={note?.content ?? ''} onChange={onChange} />
        </Box>
      )}
    </Box>
  );
}

