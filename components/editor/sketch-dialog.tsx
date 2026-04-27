import { useState, useRef, useEffect } from "react";
import { Excalidraw, exportToSvg, loadLibraryFromBlob } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, PenTool, Maximize2, Minimize2, Check, X, Library, Download } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Set the path to load excalidraw assets (fonts) to fix the TypeError: Failed to fetch
if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).EXCALIDRAW_ASSET_PATH = "https://unpkg.com/@excalidraw/excalidraw@0.18.1/dist/prod/";
}

interface SketchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (svgString: string) => void;
}

interface ExcalidrawLibrary {
  id: string;
  name: string;
  description: string;
  authors: { name: string; url: string }[];
  source: string;
  preview: string;
  created: string;
  updated: string;
}

export function SketchDialog({ isOpen, onClose, onSave }: SketchDialogProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const excalidrawAPIRef = useRef<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [showLibraryBrowser, setShowLibraryBrowser] = useState(false);
  const [publicLibraries, setPublicLibraries] = useState<ExcalidrawLibrary[]>([]);
  const [isLoadingLibraries, setIsLoadingLibraries] = useState(false);
  const [installingLibraryId, setInstallingLibraryId] = useState<string | null>(null);

  const handleOpenLibraryBrowser = () => {
    setShowLibraryBrowser((prev) => !prev);
    if (!showLibraryBrowser && publicLibraries.length === 0) {
      setIsLoadingLibraries(true);
      fetch("https://libraries.excalidraw.com/libraries.json")
        .then((res) => res.json())
        .then((data) => setPublicLibraries(data))
        .catch((err) => {
          console.error("Failed to load libraries", err);
          toast.error("Failed to load public libraries");
        })
        .finally(() => setIsLoadingLibraries(false));
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    // We use an interval to periodically check for the "Browse libraries" button that Excalidraw renders
    // in its library empty state, and hijack it to open our custom inline library menu instead.
    const intervalId = setInterval(() => {
      const elements = document.querySelectorAll('.excalidraw button, .excalidraw a');
      elements.forEach((el) => {
        if (el.textContent === 'Browse libraries' && !el.hasAttribute('data-custom-library-handler')) {
          el.setAttribute('data-custom-library-handler', 'true');
          
          if (el.tagName === 'A') {
            el.removeAttribute('href');
            el.removeAttribute('target');
          }

          // We use capture phase so we can stop propagation before Excalidraw's React handlers trigger window.open
          el.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowLibraryBrowser(true);
            
            // Trigger fetch if empty
            if (publicLibraries.length === 0) {
              setIsLoadingLibraries(true);
              fetch("https://libraries.excalidraw.com/libraries.json")
                .then((res) => res.json())
                .then((data) => setPublicLibraries(data))
                .catch((err) => {
                  console.error("Failed to load libraries", err);
                  toast.error("Failed to load public libraries");
                })
                .finally(() => setIsLoadingLibraries(false));
            }
          }, true);
        }
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isOpen, publicLibraries.length]);

  const handleInstallLibrary = async (library: ExcalidrawLibrary) => {
    if (!excalidrawAPIRef.current) return;
    setInstallingLibraryId(library.id);
    try {
      const res = await fetch(`https://libraries.excalidraw.com/libraries/${library.source}`);
      if (!res.ok) throw new Error("Failed to download library");
      const blob = await res.blob();
      const libraryItems = await loadLibraryFromBlob(blob, "published");
      
      // Add to current library
      excalidrawAPIRef.current.updateLibrary({
        libraryItems,
        merge: true,
        openLibrary: true
      });
      
      toast.success(`Installed ${library.name}!`);
      setShowLibraryBrowser(false);
    } catch (err) {
      console.error("Failed to install library", err);
      toast.error(`Failed to install ${library.name}`);
    } finally {
      setInstallingLibraryId(null);
    }
  };

  const handleSave = async () => {
    if (!excalidrawAPIRef.current) return;
    setIsExporting(true);
    
    try {
      const elements = excalidrawAPIRef.current.getSceneElements();
      const appState = excalidrawAPIRef.current.getAppState();
      
      if (!elements || elements.length === 0) {
        toast.error("Sketch is empty!");
        setIsExporting(false);
        return;
      }
      
      const svg = await exportToSvg({
        elements,
        appState: {
          ...appState,
          exportWithDarkMode: false,
          exportBackground: true,
        },
        files: excalidrawAPIRef.current.getFiles()
      });
      
      svg.setAttribute("width", "100%");
      svg.setAttribute("height", "auto");
      svg.style.maxWidth = "100%";
      svg.style.display = "block";
      
      const svgString = svg.outerHTML;
      onSave(svgString);
      onClose();
    } catch (e) {
      console.error(e);
      toast.error("Failed to export sketch");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        showCloseButton={false}
        className={cn(
          "flex flex-col gap-0 p-0 transition-all duration-300 ease-in-out bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl overflow-hidden",
          isFullscreen ? "max-w-[100vw] w-screen h-screen rounded-none" : "max-w-[95vw] w-full lg:max-w-6xl h-[90vh] sm:rounded-2xl lg:rounded-3xl"
        )}
      >
        <DialogHeader className="px-3 sm:px-5 py-3 flex-row items-center justify-between border-b shrink-0 bg-background/95 z-50">
          <DialogTitle className="flex items-center gap-2 m-0 text-foreground">
            <PenTool className="w-4 h-4 sm:w-5 sm:h-5 text-primary hidden sm:block" />
            <span className="font-semibold tracking-tight text-sm sm:text-base">Freehand Canvas</span>
          </DialogTitle>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenLibraryBrowser}
              className="hidden sm:inline-flex rounded-full px-4 text-xs sm:text-sm font-medium mr-2"
            >
              <Library className="w-4 h-4 mr-1.5" />
              Public Libraries
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isExporting}
              className="hidden sm:inline-flex rounded-full text-muted-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              disabled={isExporting}
              className="sm:hidden w-8 h-8 rounded-full text-muted-foreground hover:bg-muted hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </Button>
            
            <Button 
              size="sm"
              onClick={handleSave} 
              disabled={isExporting} 
              className="rounded-full px-4 sm:px-6 flex items-center gap-1.5 sm:gap-2 shadow-sm h-8 sm:h-9 text-xs sm:text-sm"
            >
              {isExporting ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-0 animate-spin" /> : <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              {isExporting ? "Saving..." : "Insert"}
            </Button>

            <div className="w-px h-5 bg-border mx-1 hidden sm:block" />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="w-8 h-8 rounded-full text-muted-foreground hover:bg-muted hidden sm:inline-flex"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 w-full relative isolate overflow-hidden bg-background">
          <div className="absolute inset-0 z-0 bg-grid-black/[0.02]" />
          <div className="absolute inset-0 z-10 w-full h-full">
            {isOpen && (
              <Excalidraw
                excalidrawAPI={(api) => { excalidrawAPIRef.current = api; }}
                theme="light"
                UIOptions={{
                  canvasActions: {
                    changeViewBackgroundColor: true,
                    clearCanvas: true,
                    loadScene: false,
                    export: false,
                    saveToActiveFile: false,
                    saveAsImage: false,
                    toggleTheme: true,
                  }
                }}
              />
            )}
          </div>
          
          {/* Custom Public Library Browser Overlay */}
          {showLibraryBrowser && (
            <div className="absolute top-0 right-0 bottom-0 w-full sm:w-[400px] bg-background/95 backdrop-blur-md border-l shadow-2xl z-[100] flex flex-col pt-2 animate-in slide-in-from-right-full duration-300">
              <div className="px-5 py-3 flex items-center justify-between border-b">
                <h3 className="font-semibold text-foreground flex items-center">
                  <Library className="w-4 h-4 mr-2 text-primary" />
                  Public Libraries
                </h3>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setShowLibraryBrowser(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <ScrollArea className="flex-1 p-4">
                {isLoadingLibraries ? (
                  <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                    <p className="text-sm">Loading libraries...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 pb-10">
                    {publicLibraries.map((lib, index) => (
                      <div key={lib.id || index} className="border rounded-xl bg-card overflow-hidden shadow-sm flex flex-col group">
                        <div className="bg-muted aspect-video relative flex items-center justify-center p-4">
                          <img 
                            src={`https://libraries.excalidraw.com/libraries/${lib.preview}`} 
                            alt={lib.name}
                            className="max-w-full max-h-full object-contain filter drop-shadow-md"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <h4 className="font-medium text-sm text-foreground line-clamp-1">{lib.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed flex-1">
                            {lib.description}
                          </p>
                          <Button 
                            className="w-full mt-4 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                            size="sm"
                            onClick={() => handleInstallLibrary(lib)}
                            disabled={installingLibraryId === lib.id}
                          >
                            {installingLibraryId === lib.id ? (
                              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Installing...</>
                            ) : (
                              <><Download className="w-4 h-4 mr-2" /> Add to Library</>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
