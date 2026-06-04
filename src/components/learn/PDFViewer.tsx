'use client';

interface PDFViewerProps {
  url: string;
  title?: string;
}

export default function PDFViewer({ url, title }: PDFViewerProps) {
  return (
    <div className="w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
      <object
        data={url}
        type="application/pdf"
        className="w-full min-h-[85vh]"
        title={title || 'PDF Viewer'}
      >
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <p className="text-gray-600 mb-4">
            Your browser doesn&apos;t support embedded PDF viewing.
          </p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
          >
            Download PDF to view
          </a>
        </div>
      </object>
    </div>
  );
}
