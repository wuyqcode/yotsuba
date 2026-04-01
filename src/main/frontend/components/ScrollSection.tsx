import React from 'react';

interface ScrollSectionProps<T> {
  title?: string;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function ScrollSection<T>({ title, items, renderItem }: ScrollSectionProps<T>) {
  return (
    <>
      {title && (
        <h2 className="mb-2 ml-2 mt-5 text-2xl font-bold tracking-wide text-base-content">
          {title}
        </h2>
      )}

      <div className="relative flex gap-2 overflow-x-auto px-2 pb-1 scroll-smooth [scrollbar-width:thin]">
        <div className="pointer-events-none sticky left-0 z-10 w-10 shrink-0 bg-gradient-to-r from-white to-transparent" />
        {items.map((item, idx) => (
          <div key={idx} className="shrink-0">
            {renderItem(item)}
          </div>
        ))}
        <div className="pointer-events-none sticky right-0 z-10 w-10 shrink-0 bg-gradient-to-l from-white to-transparent" />
      </div>
    </>
  );
}

export default ScrollSection;
