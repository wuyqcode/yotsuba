import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import Board from 'Frontend/components/task/Board';

export const config: ViewConfig = {
  menu: {
    order: 6,
    icon: 'DescriptionIcon'
  },
  title: 'task'
};

export default function TaskView() {
  return <Board />;
}
