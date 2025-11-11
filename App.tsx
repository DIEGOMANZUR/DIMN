import React, { useState, useEffect } from 'react';
import type { FormData, SavedImage } from './types';
import { generateImage, editImage, fileToBase64, generateImprovementPrompt } from './services/geminiService';
import { FormField } from './components/FormField';
import { Button } from './components/Button';
import { ImageDisplay } from './components/ImageDisplay';
import { Icon } from './components/Icon';
import { SavedLaminaView } from './components/SavedLaminaView';

const initialFormData: FormData = {
  sheetColor: 'White with a subtle grain texture',
  header: 'UNLOCK YOUR POTENTIAL',
  titleLine1: 'The Art of Productivity',
  titleLine2: 'Master Your Day',
  titleLine3: '',
  bullet1Line1: 'Morning Routine: Start your day with intention.',
  bullet1Line2: 'Set clear, achievable goals.',
  bullet1Line3: '',
  bullet2Line1: 'Time Blocking: Allocate specific time slots for tasks.',
  bullet2Line2: 'Eliminate distractions.',
  bullet2Line3: '',
  bullet3Line1: 'Deep Work: Focus on one high-impact task at a time.',
  bullet3Line2: 'Take regular breaks to recharge.',
  bullet3Line3: '',
  bullet4Line1: '',
  bullet4Line2: '',
  bullet4Line3: '',
  footer: 'yourhandle | yourwebsite.com',
  texture: 'Modern, clean, sans-serif fonts, with gold accents.',
  otherDetails: 'Include minimalist line art icons for each bullet point.',
};

type View = 'generator' | 'saved';

const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>('generator');
  const [savedImages, setSavedImages] = useState<SavedImage[]>([]);

  useEffect(() => {
    try {
      const storedImages = localStorage.getItem('savedLamina');
      if (storedImages) {
        setSavedImages(JSON.parse(storedImages));
      }
    } catch (e) {
      console.error("Failed to load saved images from localStorage", e);
    }
  }, []);
  
  const updateSavedImages = (newImages: SavedImage[]) => {
      setSavedImages(newImages);
      localStorage.setItem('savedLamina', JSON.stringify(newImages));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setTemplateFile(file);
    if (file) {
      setFormData(prev => ({
        ...prev,
        sheetColor: '',
        texture: '',
        otherDetails: ''
      }));
    }
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);
    setEditedImage(null);

    try {
      if (templateFile) {
        const base64Image = await fileToBase64(templateFile);
        const mimeType = templateFile.type;
        const prompt = `
          Take the provided image template and add the following text content onto it.
          The text must be perfectly integrated, respecting the original design, style, and color palette.
          All text must be strictly left-aligned and placed within a safe area of 1030x1300 pixels to ensure margins.
          Use a font that complements the template's existing typography.
          
          **Header:**
          - "${formData.header}"

          **Title:**
          - Line 1: "${formData.titleLine1}"
          - Line 2: "${formData.titleLine2}"
          - Line 3: "${formData.titleLine3}"

          **Body:**
          - Point 1: "${formData.bullet1Line1} ${formData.bullet1Line2} ${formData.bullet1Line3}"
          - Point 2: "${formData.bullet2Line1} ${formData.bullet2Line2} ${formData.bullet2Line3}"
          - Point 3: "${formData.bullet3Line1} ${formData.bullet3Line2} ${formData.bullet3Line3}"
          - Point 4: "${formData.bullet4Line1} ${formData.bullet4Line2} ${formData.bullet4Line3}"

          **Footer:**
          - "${formData.footer}"
        `;
        const result = await editImage(base64Image, mimeType, prompt);
        setGeneratedImage(result);

      } else {
        const result = await generateImage(formData);
        setGeneratedImage(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = async () => {
    if (!generatedImage) return;

    setIsEditing(true);
    setError(null);
    setEditedImage(null);

    try {
      const improvementPrompt = await generateImprovementPrompt(formData);
      const result = await editImage(generatedImage, 'image/jpeg', improvementPrompt);
      setEditedImage(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsEditing(false);
    }
  };

  const downloadImage = (base64Image: string | null, filename: string) => {
    if (!base64Image) return;
    const link = document.createElement('a');
    link.href = `data:image/jpeg;base64,${base64Image}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleSaveImage = (imageBase64: string, type: 'normal' | 'improved') => {
    const newImage: SavedImage = {
        id: `lamina-${Date.now()}`,
        type,
        imageBase64,
        savedAt: Date.now(),
    };
    updateSavedImages([newImage, ...savedImages]);
    alert('¡Lámina guardada!');
  };

  const handleDeleteImage = (id: string) => {
    if(confirm('¿Estás seguro de que quieres eliminar esta lámina?')) {
        const filteredImages = savedImages.filter(img => img.id !== id);
        updateSavedImages(filteredImages);
    }
  };

  const FormSection: React.FC<{title: string; children: React.ReactNode}> = ({title, children}) => (
    <div className="p-6 bg-gray-800/50 rounded-lg mb-6">
      <h3 className="text-lg font-semibold text-indigo-400 border-b border-gray-700 pb-2 mb-4">{title}</h3>
      {children}
    </div>
  );
  
  const NavTab: React.FC<{title: string; active: boolean; onClick: () => void}> = ({ title, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-6 py-2 text-lg font-semibold rounded-t-md transition ${
            active
                ? 'bg-gray-800/50 text-indigo-400 border-b-2 border-indigo-500'
                : 'text-gray-500 hover:text-gray-300'
        }`}
    >
        {title}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-8 font-sans">
      <header className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
          Instagram Post Generator AI
        </h1>
        <p className="text-gray-400 mt-2">Create stunning Instagram visuals in seconds with the power of Gemini.</p>
      </header>
      
      <nav className="flex justify-center border-b border-gray-700 mb-8">
        <NavTab title="Generador" active={view === 'generator'} onClick={() => setView('generator')} />
        <NavTab title="Láminas Guardadas" active={view === 'saved'} onClick={() => setView('saved')} />
      </nav>

      <main>
        {view === 'generator' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Form Column */}
            <div className="lg:pr-4">
              <form onSubmit={handleGenerate}>
                <FormSection title="1. Color de la Lámina">
                    <FormField id="sheetColor" label="Color de fondo y estilo general" value={formData.sheetColor} onChange={handleInputChange} disabled={!!templateFile} />
                </FormSection>

                <FormSection title="2. Encabezado de la Lámina">
                  <FormField id="header" label="Texto del encabezado" value={formData.header} onChange={handleInputChange} />
                </FormSection>

                <FormSection title="3. Título de la Lámina">
                  <FormField id="titleLine1" label="Primera Línea" value={formData.titleLine1} onChange={handleInputChange} labelClassName="text-yellow-400" />
                  <FormField id="titleLine2" label="Segunda Línea" value={formData.titleLine2} onChange={handleInputChange} labelClassName="text-yellow-400" />
                  <FormField id="titleLine3" label="Tercera Línea" value={formData.titleLine3} onChange={handleInputChange} labelClassName="text-yellow-400" />
                </FormSection>
                
                <FormSection title="4. Cuerpo de la Lámina">
                    <h4 className="font-bold mb-2 text-red-500">Viñeta Número Uno</h4>
                    <FormField id="bullet1Line1" label="Primera Línea" value={formData.bullet1Line1} onChange={handleInputChange} labelClassName="text-yellow-400" />
                    <FormField id="bullet1Line2" label="Segunda Línea" value={formData.bullet1Line2} onChange={handleInputChange} labelClassName="text-yellow-400" />
                    <FormField id="bullet1Line3" label="Tercera Línea" value={formData.bullet1Line3} onChange={handleInputChange} labelClassName="text-yellow-400" />
                    <h4 className="font-bold my-2 text-red-500 pt-2 border-t border-gray-700/50">Viñeta Número Dos</h4>
                    <FormField id="bullet2Line1" label="Primera Línea" value={formData.bullet2Line1} onChange={handleInputChange} labelClassName="text-yellow-400" />
                    <FormField id="bullet2Line2" label="Segunda Línea" value={formData.bullet2Line2} onChange={handleInputChange} labelClassName="text-yellow-400" />
                    <FormField id="bullet2Line3" label="Tercera Línea" value={formData.bullet2Line3} onChange={handleInputChange} labelClassName="text-yellow-400" />
                    <h4 className="font-bold my-2 text-red-500 pt-2 border-t border-gray-700/50">Viñeta Número Tres</h4>
                    <FormField id="bullet3Line1" label="Primera Línea" value={formData.bullet3Line1} onChange={handleInputChange} labelClassName="text-yellow-400" />
                    <FormField id="bullet3Line2" label="Segunda Línea" value={formData.bullet3Line2} onChange={handleInputChange} labelClassName="text-yellow-400" />
                    <FormField id="bullet3Line3" label="Tercera Línea" value={formData.bullet3Line3} onChange={handleInputChange} labelClassName="text-yellow-400" />
                    <h4 className="font-bold my-2 text-red-500 pt-2 border-t border-gray-700/50">Viñeta Número Cuatro</h4>
                    <FormField id="bullet4Line1" label="Primera Línea" value={formData.bullet4Line1} onChange={handleInputChange} labelClassName="text-yellow-400" />
                    <FormField id="bullet4Line2" label="Segunda Línea" value={formData.bullet4Line2} onChange={handleInputChange} labelClassName="text-yellow-400" />
                    <FormField id="bullet4Line3" label="Tercera Línea" value={formData.bullet4Line3} onChange={handleInputChange} labelClassName="text-yellow-400" />
                </FormSection>

                <FormSection title="5. Pie de la Lámina">
                     <FormField id="footer" label="Texto del pie" value={formData.footer} onChange={handleInputChange} />
                </FormSection>

                <FormSection title="6. Textura y Estilo de la Lámina">
                    <FormField id="texture" label="Textura, estilo de fuente, acentos" value={formData.texture} onChange={handleInputChange} disabled={!!templateFile}/>
                </FormSection>
                
                <FormSection title="7. Otros Detalles de Diseño">
                    <FormField id="otherDetails" label="Iconos, elementos gráficos, etc." value={formData.otherDetails} onChange={handleInputChange} disabled={!!templateFile}/>
                </FormSection>

                <FormSection title="8. Subir Plantilla de Lámina (Opcional)">
                  <label htmlFor="template-upload" className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 cursor-pointer">
                      <Icon type="upload" className="w-5 h-5 mr-2" />
                      <span>{templateFile ? templateFile.name : 'Explorar Archivos'}</span>
                  </label>
                  <input id="template-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*"/>
                  <p className="text-xs text-gray-500 mt-2">Si subes una plantilla, los campos de color, textura y detalles serán ignorados.</p>
                </FormSection>

                <div className="mt-8">
                  <Button type="submit" isLoading={isGenerating} className="w-full text-lg py-4">
                    Generar Lámina
                  </Button>
                </div>
              </form>
            </div>

            {/* Results Column */}
            <div className="flex flex-col items-center space-y-8">
                {error && <div className="bg-red-900/50 text-red-300 p-4 rounded-md w-full">{error}</div>}
                
                <div className="w-full">
                    <ImageDisplay 
                        title="LÁMINA GENERADA"
                        titleClassName='text-yellow-400'
                        isLoading={isGenerating}
                        imageBase64={generatedImage}
                    />
                </div>
                
                {generatedImage && !isGenerating && (
                     <div className="w-full max-w-lg flex flex-col space-y-3">
                        <Button onClick={() => downloadImage(generatedImage, 'lamina-generada.jpg')} icon="download">
                            Descargar Lámina
                        </Button>
                        <Button onClick={() => handleSaveImage(generatedImage, 'normal')} icon="save">
                            Guardar Lámina
                        </Button>
                        <Button onClick={handleEdit} isLoading={isEditing} icon="sparkles">
                           Mejorar y Revisar Lámina con IA (Se Utiliza para ello Gemini 2.5 Pro)
                        </Button>
                    </div>
                )}

                {(isEditing || editedImage) && (
                    <div className="w-full flex flex-col items-center">
                        <ImageDisplay 
                            title="LÁMINA MEJORADA CON IA"
                            titleClassName='text-yellow-400'
                            isLoading={isEditing}
                            imageBase64={editedImage}
                        />
                         {editedImage && !isEditing && (
                            <div className="w-full max-w-lg flex flex-col space-y-3 mt-4">
                                <Button onClick={() => downloadImage(editedImage, 'lamina-mejorada-ia.jpg')} icon="download">
                                   Descargar
                                </Button>
                                <Button onClick={() => handleSaveImage(editedImage, 'improved')} icon="save">
                                   Guardar Lámina Mejorada con IA
                                </Button>
                            </div>
                         )}
                    </div>
                )}
            </div>
          </div>
        ) : (
          <SavedLaminaView images={savedImages} onDelete={handleDeleteImage} />
        )}
      </main>
    </div>
  );
};

export default App;
