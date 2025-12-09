import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import { useNoteStore } from '../hooks/useNotes';

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  noteId: string;
  noteTitle: string;
}

export default function DeleteConfirmDialog({
  open,
  onClose,
  noteId,
  noteTitle,
}: DeleteConfirmDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const removeNote = useNoteStore((s) => s.removeNote);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await removeNote(noteId);
      onClose();
    } catch (error) {
      console.error('删除失败:', error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>确认删除</DialogTitle>
      <DialogContent>
        <DialogContentText>
          确定要删除笔记「{noteTitle}」吗？此操作无法撤销。
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={deleting}>
          取消
        </Button>
        <Button
          onClick={handleConfirm}
          color="error"
          variant="contained"
          disabled={deleting}
          startIcon={deleting ? <CircularProgress size={16} /> : null}>
          删除
        </Button>
      </DialogActions>
    </Dialog>
  );
}

