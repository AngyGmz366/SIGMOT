'use client';

interface LoadingProps {
  height?: string;
}

export default function Loading({ height = '200px' }: LoadingProps) {
  return (
    <div 
      className="flex items-center justify-center bg-gray-50 animate-pulse rounded-lg"
      style={{ height }}
    >
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-gray-500">Cargando...</span>
      </div>
    </div>
  );
}