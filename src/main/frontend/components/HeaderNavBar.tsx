import * as React from 'react';
import { useLocation, useNavigate } from 'react-router';
import { createMenuItems } from '@vaadin/hilla-file-router/runtime.js';
import { ChevronDownIcon, DocumentIcon, HelpIcon, HomeIcon } from './ui/Icons';

const renderIcon = (iconName?: string) => {
  switch (iconName) {
    case 'HomeIcon':
      return <HomeIcon className="h-4 w-4" />;
    case 'DescriptionIcon':
      return <DocumentIcon className="h-4 w-4" />;
    default:
      return <HelpIcon className="h-4 w-4" />;
  }
};

export default function HeaderNavBar() {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (anchorRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <nav className="relative">
      <ul className="m-0 flex list-none items-center gap-2 p-0">
        <li className="relative">
          <button
            ref={anchorRef}
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={open ? 'header-menu-popper' : undefined}
            onClick={() => setOpen((prev) => !prev)}
            className="btn btn-ghost btn-sm gap-2 rounded-full border border-transparent px-4 font-semibold text-base-content/70 hover:border-base-200 hover:bg-base-100 hover:text-base-content">
            Menu
            <ChevronDownIcon className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div
              id="header-menu-popper"
              ref={menuRef}
              className="absolute left-0 top-full z-[1200] mt-3 min-w-[300px] rounded-3xl border border-base-200 bg-base-100/95 p-3 shadow-2xl backdrop-blur">
              <div className="grid gap-2 sm:grid-cols-2">
                {createMenuItems().map((item) => {
                  const active = location.pathname === item.to;

                  return (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => {
                        navigate(item.to);
                        setOpen(false);
                      }}
                      className={[
                        'flex items-start gap-3 rounded-2xl border p-3 text-left transition',
                        active
                          ? 'border-primary/40 bg-primary/10 text-primary'
                          : 'border-transparent bg-transparent text-base-content/80 hover:border-base-300 hover:bg-base-200/60 hover:text-base-content',
                      ].join(' ')}>
                      <span className="mt-0.5 rounded-xl bg-base-200/80 p-2 text-base-content/70">{renderIcon(item.icon)}</span>
                      <span className="text-sm font-semibold">{item.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
}
