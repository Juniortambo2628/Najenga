import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Annotorious, ImageAnnotator as AnnotoriousImageAnnotator, useAnnotator, useSelection } from '@annotorious/react';
import '@annotorious/react/annotorious-react.css';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Popup component for editing annotations
function AnnotationPopup() {
    const { selected } = useSelection();
    const anno = useAnnotator();
    const [body, setBody] = useState('');

    useEffect(() => {
        if (selected && selected.length > 0) {
            setBody(getAnnotationBody(selected[0]));
        }
    }, [selected]);

    if (!selected || selected.length === 0) return null;

    const onSave = () => {
        const current = selected[0];
        const now = new Date().toISOString();
        const updated = {
            '@context': 'http://www.w3.org/ns/anno.jsonld',
            id: current.id,
            type: 'Annotation',
            created: current.created || now,
            modified: now,
            body: [{
                type: 'TextualBody',
                value: body,
                purpose: 'commenting'
            }],
            target: current.target
        };
        anno.updateAnnotation(updated);
        if (anno.cancelSelected) anno.cancelSelected();
        else if (anno.setSelected) anno.setSelected(undefined);
    };

    return (
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur shadow-2xl rounded-xl p-4 w-72 border border-gray-100/20 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-sm text-gray-900">Annotation Details</h3>
                <button onClick={() => anno.cancelSelected ? anno.cancelSelected() : anno.setSelected(undefined)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <i className="fas fa-times"></i>
                </button>
            </div>
            
            <textarea
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-900 focus:ring-2 focus:ring-[#8B0000] focus:border-transparent outline-none resize-none mb-4 transition-all placeholder:text-gray-400"
                rows={3}
                placeholder="Add a label or comment..."
                value={body}
                onChange={e => setBody(e.target.value)}
                autoFocus
            />
            
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <button 
                    onClick={() => anno.removeAnnotation(selected[0])}
                    className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1 px-2 py-1.5 rounded hover:bg-red-50 transition-colors"
                >
                    <i className="fas fa-trash-alt"></i> Delete
                </button>
                <button 
                    onClick={onSave}
                    className="text-xs font-bold text-white bg-[#8B0000] hover:bg-[#DC143C] px-4 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all transform hover:-translate-y-0.5 active:scale-95"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
}

// Toolbar for switching annotation tools
function AnnotationToolbar() {
    const anno = useAnnotator();
    const [tool, setTool] = useState('rectangle');

    const handleTool = (t) => {
        setTool(t);
        anno.setDrawingTool(t);
        anno.cancelSelected();
    };

    return (
        <div className="absolute top-4 left-4 z-10 flex gap-2 p-1 bg-white/90 backdrop-blur-sm shadow-md rounded-lg border border-gray-200">
            <button 
                onClick={() => handleTool('rectangle')}
                className={`p-2 rounded transition-colors ${tool === 'rectangle' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                title="Rectangle Tool"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                </svg>
            </button>
            <button 
                onClick={() => handleTool('polygon')}
                className={`p-2 rounded transition-colors ${tool === 'polygon' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                title="Polygon Tool"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l-8.66 5v10l8.66 5 8.66-5v-10z"></path>
                </svg>
            </button>
        </div>
    );
}

// Inner component that uses the Annotorious hooks
const AnnotatorCore = memo(function AnnotatorCore({ resource, type, imageUrl, onLoad, isLoaded }) {
    const anno = useAnnotator();
    const isSyncing = useRef(false);
    const imgRef = useRef(null);

    // Check if image is already loaded (cached) to trigger onLoad
    useEffect(() => {
        if (imgRef.current && imgRef.current.complete) {
            onLoad();
        }
    }, [onLoad]);

    // Helper to get geometry in percent
    const getGeometry = (annotation) => {
        const img = imgRef.current;
        if (!img) return { x: 0, y: 0, width: 0, height: 0 };
        
        const selector = annotation.target.selector;
        const value = selector.value || '';
        
        if (value.includes('percent:')) {
            const match = value.match(/percent:([\d.]+),([\d.]+),([\d.]+),([\d.]+)/);
            if (match) return {
                x: parseFloat(match[1]),
                y: parseFloat(match[2]),
                width: parseFloat(match[3]),
                height: parseFloat(match[4])
            };
        } else {
             // Assume pixels (xywh=x,y,w,h or xywh=pixel:x,y,w,h)
             const match = value.match(/xywh=(?:pixel:)?([\d.]+),([\d.]+),([\d.]+),([\d.]+)/);
             if (match) {
                 const x = parseFloat(match[1]);
                 const y = parseFloat(match[2]);
                 const w = parseFloat(match[3]);
                 const h = parseFloat(match[4]);
                 return {
                     x: (x / img.naturalWidth) * 100,
                     y: (y / img.naturalHeight) * 100,
                     width: (w / img.naturalWidth) * 100,
                     height: (h / img.naturalHeight) * 100
                 };
             }
        }
        return { x: 0, y: 0, width: 0, height: 0 };
    };

    // Load annotations from the backend
    useEffect(() => {
        if (!resource?.id || !anno || !isLoaded) return;
        
        isSyncing.current = true;
        
        const loadAnnotations = async () => {
            try {
                // Determine target type for API
                const targetType = type === 'project_document' ? 'document' : 'photo';
                const res = await axios.get('/annotations', { 
                    params: { 
                        annotatable_type: targetType, 
                        annotatable_id: resource.id 
                    } 
                });
                
                anno.clearAnnotations();
                
                // Add each annotation to Annotorious in W3C format
                for (const ann of res.data) {
                    const w3c = backendToW3C(ann);
                    anno.addAnnotation(w3c);
                }
            } catch (error) {
                console.error('Failed to load annotations:', error);
                toast.error('Failed to load annotations');
            } finally {
                // Small delay to prevent initial load from triggering sync
                setTimeout(() => { isSyncing.current = false; }, 100);
            }
        };

        loadAnnotations();
    }, [resource.id, anno, isLoaded, type]);

    // Event Listeners
    useEffect(() => {
        if (!anno || !isLoaded) return;

        const onCreate = async (annotation) => {
            if (isSyncing.current) return;
            
            try {
                // Use getGeometry to normalize percent/pixel
                const { x, y, width, height } = getGeometry(annotation);
                
                const targetType = type === 'project_document' ? 'document' : 'photo';
                const payload = {
                    annotatable_type: targetType,
                    annotatable_id: resource.id,
                    x, y, width, height,
                    body: '' // Initial body is empty
                };
                
                const res = await axios.post('/annotations', payload);
                const savedAnnotation = res.data;
                
                // Update the local annotation with the backend ID (essential for updates later)
                const updatedW3C = {
                    ...annotation,
                    id: `#anno-${savedAnnotation.id}`
                };
                
                // Flag to ignore own update
                isSyncing.current = true;
                anno.updateAnnotation(annotation, updatedW3C); 
                setTimeout(() => { isSyncing.current = false; }, 100);
                
            } catch (error) {
                console.error('Create error:', error);
                toast.error('Failed to save annotation');
                anno.removeAnnotation(annotation);
            }
        };

        const onUpdate = async (annotation, previous) => {
             if (isSyncing.current) return;
             
             // Check if it's a backend annotation
             if (!annotation.id.startsWith('#anno-')) return;
             
             try {
                const id = annotation.id.replace('#anno-', '');
                const { x, y, width, height } = getGeometry(annotation);
                
                // Extract body text safely
                const bodyText = annotation.body && annotation.body.length > 0 ? annotation.body[0].value : '';
                
                await axios.patch(`/annotations/${id}`, {
                    x, y, width, height,
                    body: bodyText
                });
             } catch (error) {
                 console.error('Update error:', error);
                 toast.error('Failed to update annotation');
             }
        };

        const onDelete = async (annotation) => {
            if (isSyncing.current) return;
            if (!annotation.id.startsWith('#anno-')) return; // Don't delete unsaved/temp
            
            try {
                const id = annotation.id.replace('#anno-', '');
                await axios.delete(`/annotations/${id}`);
                toast.success('Annotation deleted');
            } catch (error) {
                console.error('Delete error:', error);
                toast.error('Failed to delete annotation');
            }
        };

        anno.on('createAnnotation', onCreate);
        anno.on('updateAnnotation', onUpdate);
        anno.on('deleteAnnotation', onDelete);

        return () => {
            anno.off('createAnnotation', onCreate);
            anno.off('updateAnnotation', onUpdate);
            anno.off('deleteAnnotation', onDelete);
        };
    }, [anno, resource.id, isLoaded, type]);

    return (
        <AnnotoriousImageAnnotator
            drawingEnabled={true}
            containerClassName="w-full h-full"
        >
            <img
                ref={imgRef}
                src={imageUrl}
                alt={resource.title || 'Annotatable Image'}
                className="w-full h-full object-contain"
                onLoad={onLoad}
            />
        </AnnotoriousImageAnnotator>
    );    
});


// Convert backend annotation (percentage-based) to W3C format
function backendToW3C(ann) {
    return {
        '@context': 'http://www.w3.org/ns/anno.jsonld',
        id: `#anno-${ann.id}`,
        type: 'Annotation',
        created: ann.created_at || new Date().toISOString(),
        modified: ann.updated_at || ann.created_at || new Date().toISOString(),
        body: ann.body ? [{
            type: 'TextualBody',
            value: ann.body,
            purpose: 'commenting'
        }] : [],
        target: {
            selector: {
                type: 'FragmentSelector',
                conformsTo: 'http://www.w3.org/TR/media-frags/',
                value: `xywh=percent:${ann.x},${ann.y},${ann.width},${ann.height}`
            }
        }
    };
}

// Parse the fragment selector from a W3C annotation
function parseFragmentSelector(annotation) {
    const selector = annotation.target?.selector;
    
    if (selector?.type === 'FragmentSelector') {
        const match = selector.value?.match(/xywh=percent:([\d.]+),([\d.]+),([\d.]+),([\d.]+)/);
        if (match) {
            return {
                x: parseFloat(match[1]),
                y: parseFloat(match[2]),
                width: parseFloat(match[3]),
                height: parseFloat(match[4])
            };
        }
    }

    // Fallback: try SVG selector or pixel-based
    if (Array.isArray(selector)) {
        const frag = selector.find(s => s.type === 'FragmentSelector');
        if (frag) {
            const match = frag.value?.match(/xywh=percent:([\d.]+),([\d.]+),([\d.]+),([\d.]+)/);
            if (match) {
                return {
                    x: parseFloat(match[1]),
                    y: parseFloat(match[2]),
                    width: parseFloat(match[3]),
                    height: parseFloat(match[4])
                };
            }
        }
    }

    return { x: 0, y: 0, width: 0, height: 0 };
}

// Extract the body text from a W3C annotation
function getAnnotationBody(annotation) {
    if (!annotation.body) return '';
    const bodies = Array.isArray(annotation.body) ? annotation.body : [annotation.body];
    const textBody = bodies.find(b => b.purpose === 'commenting' || b.type === 'TextualBody');
    return textBody?.value || '';
}

// Extract backend ID from W3C annotation ID
function extractBackendId(id) {
    if (!id) return null;
    const match = id.match(/^#anno-(\d+)$/);
    return match ? match[1] : null;
}

export default function ImageAnnotator({ resource, type }) {
    const imageUrl = `/storage/${resource.file_path.split('/').map(seg => encodeURIComponent(seg)).join('/')}`;
    const [imageLoaded, setImageLoaded] = useState(false);

    const handleLoad = useCallback(() => {
        setImageLoaded(true);
    }, []);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-black">
            <Annotorious>
            <div className="relative w-full h-full">
                <AnnotationToolbar />
                <AnnotatorCore 
                    resource={resource} 
                    type={type}
                    imageUrl={imageUrl}
                    onLoad={handleLoad}
                    isLoaded={imageLoaded}
                />
                <AnnotationPopup />
            </div>
        </Annotorious>

            <div 
                className={`absolute inset-0 flex items-center justify-center text-white z-40 bg-black/60 pointer-events-none transition-opacity duration-300 ${imageLoaded ? 'opacity-0' : 'opacity-100'}`}
            >
                <div className="flex flex-col items-center gap-4">
                    <i className="fas fa-spinner fa-spin text-3xl"></i>
                    <span className="text-sm font-medium">Initializing Annotator...</span>
                </div>
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-[10px] uppercase tracking-[0.2em] pointer-events-none select-none z-50 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                Drag to Annotate • Click to Edit
            </div>
        </div>
    );
}
