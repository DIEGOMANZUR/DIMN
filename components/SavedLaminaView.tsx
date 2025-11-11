import React from 'react';
import { SavedImage } from '../types';
import { Button } from './Button';

interface SavedLaminaViewProps {
  images: SavedImage[];
  onDelete: (id: string) => void;
}

const SavedLaminaSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-12">
    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600 mb-6 border-b-2 border-gray-700 pb-2">
      {title}
    </h2>
    {children}
  </section>
);

export const SavedLaminaView: React.FC<SavedLaminaViewProps> = ({ images, onDelete }) => {
  const normalImages = images
    .filter((img) => img.type === 'normal')
    .sort((a, b) => b.savedAt - a.savedAt);

  const improvedImages = images
    .filter((img) => img.type === 'improved')
    .sort((a, b) => b.savedAt - a.savedAt);

  return (
    <div className="w-full max-w-7xl mx-auto py-8">
      <SavedLaminaSection title="Láminas Normales">
        {normalImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {normalImages.map((image) => (
              <div key={image.id} className="group relative bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                <img
                  src={`data:image/jpeg;base64,${image.imageBase64}`}
                  alt={`Lámina guardada ${image.id}`}
                  className="aspect-[3/4] w-full object-contain"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    onClick={() => onDelete(image.id)}
                    icon="trash"
                    className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-10">No tienes láminas normales guardadas todavía.</p>
        )}
      </SavedLaminaSection>

      <SavedLaminaSection title="Láminas Mejoradas con IA">
        {improvedImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {improvedImages.map((image) => (
              <div key={image.id} className="group relative bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                <img
                  src={`data:image/jpeg;base64,${image.imageBase64}`}
                  alt={`Lámina mejorada guardada ${image.id}`}
                  className="aspect-[3/4] w-full object-contain"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    onClick={() => onDelete(image.id)}
                    icon="trash"
                    className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-10">No tienes láminas mejoradas con IA guardadas todavía.</p>
        )}
      </SavedLaminaSection>
    </div>
  );
};
