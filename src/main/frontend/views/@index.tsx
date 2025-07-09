import { Navigate } from 'react-router';
import { ViewConfig } from '@vaadin/hilla-file-router/types.js';

export const config: ViewConfig = {
  menu: {
    exclude: true,
  }
};

export default function IndexView() {
  return <Navigate to="/post" replace />;
}
