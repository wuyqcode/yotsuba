import { Divider } from '@mui/material';

import TagList from 'Frontend/features/note/components/TagList';
import CollectionList from './CollectionList';

const Sidebar = () => {
  return (
    <>
      <CollectionList />
      <Divider sx={{ borderColor: 'divider', opacity: 0.6 }} />
      <TagList />
    </>
  );
};

export default Sidebar;
