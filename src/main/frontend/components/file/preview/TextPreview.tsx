interface TextPreviewProps {
  loadingText: boolean;
  textContent: string | null;
}

export default function TextPreview({ loadingText, textContent }: TextPreviewProps) {
  return (
    <div className="flex h-full w-full items-center justify-center p-2">
      <div className="h-full max-h-full w-full overflow-auto rounded-2xl border border-base-300 bg-base-200/40 p-4">
        {loadingText ? (
          <div className="grid min-h-[200px] place-items-center">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : (
          <pre className="m-0 whitespace-pre-wrap break-words font-mono text-sm leading-7 text-base-content">
            {textContent || '无内容'}
          </pre>
        )}
      </div>
    </div>
  );
}
