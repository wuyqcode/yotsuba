import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import { NavLink } from 'react-router-dom';

export const config: ViewConfig = {
  menu: { order: 5, icon: 'line-awesome/svg/comment-solid.svg' },
  title: 'note'
};

export default function AdminView() {
  return (
    <div className="flex flex-col h-full items-center justify-center p-l text-center box-border">
      <NavLink to="/notes/123">notes</NavLink>
    </div>
  );
}
