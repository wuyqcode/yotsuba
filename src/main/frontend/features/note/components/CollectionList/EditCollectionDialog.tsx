import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from '@mui/material';
import type CollectionDto from 'Frontend/generated/io/github/dutianze/yotsuba/note/application/dto/CollectionDto';

interface Props {
  open: boolean;
  onClose: () => void;
  collection: CollectionDto | null;
  onSave: (id: string, name: string) => Promise<void> | void;
}

const EditCollectionDialog: React.FC<Props> = ({ open, onClose, collection, onSave }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    setName(collection?.name ?? '');
  }, [collection, open]);

  const handleClose = () => {
    onClose();
  };

  const handleSave = () => {
    if (!collection || !collection.id || !name.trim()) return;
    Promise.resolve(onSave(collection.id, name.trim()))
      .then(() => {
        onClose();
      })
      .catch((err) => {
        console.error('[EditCollectionDialog] 更新集合失败:', err);
      });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>コレクションを編集</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          autoFocus
          margin="dense"
          label="コレクション名"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>キャンセル</Button>
        <Button onClick={handleSave} disabled={!name.trim()} variant="contained">
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditCollectionDialog;
