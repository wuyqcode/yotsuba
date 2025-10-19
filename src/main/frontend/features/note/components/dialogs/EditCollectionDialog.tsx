import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from '@mui/material';
import { Collection, useCollectionStore } from 'Frontend/features/note/hooks/useCollectionStore';

interface Props {
  open: boolean;
  onClose: () => void;
  collection: Collection | null;
}

const EditCollectionDialog: React.FC<Props> = ({ open, onClose, collection }) => {
  const [name, setName] = useState('');
  const updateCollection = useCollectionStore((state) => state.updateCollection);

  useEffect(() => {
    if (collection) {
      setName(collection.name);
    }
  }, [collection]);

  const handleSave = () => {
    if (collection && name.trim()) {
      updateCollection(collection.id, name.trim()); // ✅ 更新 Zustand store
      setName('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
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
        <Button onClick={onClose}>キャンセル</Button>
        <Button onClick={handleSave} disabled={!name.trim()} variant="contained">
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditCollectionDialog;