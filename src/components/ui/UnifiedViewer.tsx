import { File, FileCode, Music } from "lucide-react"
import { useEffect } from "react"
import { useAppStore } from "../../store/useAppStore"
import { detectFileType } from "../../utils/fileTypeDetection"
import { useAgentToolStore } from "../../store/useAgentToolStore"
import { ImageViewer } from "../image-viewer/ImageViewer"
import { ModelViewer } from "../model-viewer/ModelViewer"
import { CodeViewer } from "./CodeViewer"


export function UnifiedViewer() {
    const selectedAsset = useAppStore((state) => state.selectedAsset)
    const images = useAppStore((state) => state.images)
    const rawGeneratedFiles = useAppStore((state) => state.generatedFiles)
    const generatedFiles = useAgentToolStore(s => s.getMergedFiles(rawGeneratedFiles))

    // Debugging system for tracking asset loading
    useEffect(() => {
        if (selectedAsset) {
            const assetPath = (selectedAsset as any).path
            const assetType = (selectedAsset as any).type
            const hasContent = !!(selectedAsset as any).content
            const hasUrl = !!(selectedAsset as any).url
            
            console.group(`[UnifiedViewer] Loading Asset: ${assetPath || 'Unknown'}`)
            console.log("Type:", assetType)
            console.log("Full Object:", selectedAsset)
            console.log("Status:", { hasContent, hasUrl })
            
            if (hasUrl) console.log("URL Source:", (selectedAsset as any).url)
            else if (hasContent && String((selectedAsset as any).content).startsWith('http')) {
                console.log("URL extracted from content:", (selectedAsset as any).content)
            }
            console.groupEnd()
        }
    }, [selectedAsset])

    if (!selectedAsset) {
        return (
            <div className="flex h-full flex-col items-center justify-center bg-muted/20 text-muted-foreground font-mono">
                <FileCode className="h-16 w-16 mb-4 opacity-20" />
                <p className="text-sm">Select a file to view</p>
            </div>
        )
    }

    // Handle Folder selection
    if ((selectedAsset as any).type === 'folder') {
        const path = (selectedAsset as any).path
        const name = (selectedAsset as any).name || path.split('/').pop() || 'Folder'
        return (
            <div className="flex h-full flex-col items-center justify-center bg-muted/20 text-muted-foreground font-mono p-8">
                <div className="p-6 rounded-full bg-border/30 mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{name}</h3>
                <p className="text-xs opacity-60 max-w-xs text-center break-all">{path}</p>
                <div className="mt-8 px-4 py-2 border border-border bg-background/50 rounded text-xs">
                    Directory Node
                </div>
            </div>
        )
    }

    const assetPath = (selectedAsset as any).path
    const assetName = (selectedAsset as any).name || (assetPath ? assetPath.split('/').pop() : 'Unknown')

    // Detect file type from path if available
    let fileType = assetPath ? detectFileType(assetPath) : null

    // Helper function to rewrite unplayable R2 S3 endpoints to Worker URL
    const resolvePlayableUrl = (url: string): string => {
        if (!url) return url;
        if (url.includes(".r2.cloudflarestorage.com")) {
            const workerUrl = import.meta.env.VITE_R2_WORKER_URL;
            if (workerUrl) {
                try {
                    const urlObj = new URL(url);
                    const parts = urlObj.pathname.split('/').filter(Boolean);
                    if (parts.length >= 2) {
                        const userId = parts[0];
                        const r2Key = parts.slice(1).join('/');
                        return `${workerUrl.replace(/\/+$/, "")}/file/${userId}/${r2Key}`;
                    }
                } catch (e) {
                    console.error("Failed to parse R2 url for rewrite", e);
                }
            }
        }
        return url;
    }

    // Helper function to extract URL from markdown reference text
    const normalizeUrlString = (value: unknown): string | null => {
        if (typeof value !== "string") return null
        let url = value.trim()
        if (!url) return null
        if ((url.startsWith("`") && url.endsWith("`")) || (url.startsWith('"') && url.endsWith('"')) || (url.startsWith("'") && url.endsWith("'"))) {
            url = url.slice(1, -1).trim()
        }
        url = url.replace(/`/g, "").trim()
        if (!url) return null
        if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:") || url.startsWith("data:")) return resolvePlayableUrl(url)
        return null
    }

    const extractUrlFromContent = (content: string): string | null => {
        // Check for URL pattern in markdown reference (e.g. - **URL:** https://...)
        const urlMatch = content.match(/\**URL:\**\s*(https?:\/\/[^\s\n*)]+)/i) || content.match(/# URL:\s*(https?:\/\/[^\s\n]+)/i)
        if (urlMatch) {
            return normalizeUrlString(urlMatch[1])
        }
        // Fallback: simply find the first http(s) link in the content
        const httpMatch = content.match(/(https?:\/\/[^\s\n*)]+)/i)
        if (httpMatch) {
            return normalizeUrlString(httpMatch[1])
        }
        // Check for blob URL
        const blobMatch = content.match(/(blob:[^\s\n*)]+)/)
        if (blobMatch) {
            return normalizeUrlString(blobMatch[1])
        }
        return null
    }

    // Handle Image - check by type property, view property, data.url, or file extension
    if (
        (selectedAsset as any).type === 'image' ||
        ('view' in selectedAsset && 'url' in selectedAsset) ||
        (fileType && fileType.category === 'image')
    ) {
        // First check if selectedAsset.data has URL (from FileSystemSidebar) or the content itself is a URL
        const dataUrl = normalizeUrlString((selectedAsset as any).data?.url) ||
            normalizeUrlString((selectedAsset as any).url) ||
            normalizeUrlString((selectedAsset as any).content)
            
        if (dataUrl) {
            console.log(`[UnifiedViewer] Rendering IMAGE from resolved URL: ${dataUrl}`)
            return (
                <div className="flex h-full items-center justify-center bg-muted/20 p-4 relative">
                    <img
                        src={dataUrl}
                        alt={assetName}
                        className="max-h-full max-w-full object-contain"
                    />

                </div>
            )
        }

        // If it's a file path pointing to an image, try to load it
        if (fileType && fileType.category === 'image' && assetPath && generatedFiles[assetPath]) {
            const imageContent = generatedFiles[assetPath]
            // Direct URL or data URL
            const normalizedImageContentUrl = normalizeUrlString(imageContent)
            if (normalizedImageContentUrl) {
                return (
                    <div className="flex h-full items-center justify-center bg-muted/20 p-4 relative">
                        <img
                            src={normalizedImageContentUrl}
                            alt={assetName}
                            className="max-h-full max-w-full object-contain"
                        />

                    </div>
                )
            }
            // Try to extract URL from markdown reference
            const extractedUrl = extractUrlFromContent(imageContent)
            if (extractedUrl) {
                return (
                    <div className="flex h-full items-center justify-center bg-muted/20 p-4 relative">
                        <img
                            src={extractedUrl}
                            alt={assetName}
                            className="max-h-full max-w-full object-contain"
                        />

                    </div>
                )
            }
        }

        if ('view' in selectedAsset && 'url' in selectedAsset) {
            return (
                <div className="relative h-full w-full">
                    <ImageViewer images={images} />

                </div>
            )
        }

        // Fallback: try to show as image if URL exists in any form
        const fallbackUrl = normalizeUrlString((selectedAsset as any).url)
        if (fallbackUrl) {
            return (
                <div className="flex h-full items-center justify-center bg-muted/20 p-4 relative">
                    <img
                        src={fallbackUrl}
                        alt={assetName}
                        className="max-h-full max-w-full object-contain"
                    />

                </div>
            )
        }
    }

    // Handle Model - ONLY when explicitly typed as model (set by Builder.tsx) or actual model file extension
    if (
        (selectedAsset as any).type === 'model' ||
        (fileType && fileType.category === 'model')
    ) {
        // Already has format + url (e.g. set by Builder.tsx handleSelectFile)
        const directModelUrl = normalizeUrlString((selectedAsset as any).url)
        if ('url' in selectedAsset && directModelUrl) {
            return <ModelViewer model={{ ...(selectedAsset as any), url: directModelUrl } as any} onClose={() => { }} />
        }

        // If it's an actual model file (.glb, .fbx etc), try to get URL from generatedFiles
        let modelUrl = normalizeUrlString((selectedAsset as any).url) ||
            normalizeUrlString((selectedAsset as any).data?.url) ||
            normalizeUrlString((selectedAsset as any).content)

        if (!modelUrl && assetPath && generatedFiles[assetPath]) {
            const modelContent = generatedFiles[assetPath]
            modelUrl = normalizeUrlString(modelContent) || extractUrlFromContent(modelContent)
        }

        if (modelUrl) {
            const ext = assetPath?.split('.').pop()?.toLowerCase() || 'glb'
            const format = ['glb', 'gltf', 'obj', 'fbx', 'stl'].includes(ext) ? ext : ((selectedAsset as any).format || 'glb')

            const modelObj = {
                url: modelUrl,
                format,
                name: assetName,
                status: 'completed' as const,
            }
            return <ModelViewer model={modelObj as any} onClose={() => { }} />
        }
    }

    // Handle Video - check by type property or file extension
    if (
        (selectedAsset as any).type === 'video' ||
        (fileType && fileType.category === 'video')
    ) {
        const fileContent = (selectedAsset as any).content || (assetPath ? generatedFiles[assetPath] : null);
        let videoUrl = normalizeUrlString((selectedAsset as any).url) || normalizeUrlString(fileContent)

        // Try to extract URL from markdown reference content
        if (!videoUrl && fileContent) {
            videoUrl = extractUrlFromContent(String(fileContent))
        }

        if (videoUrl) {
            console.log(`[UnifiedViewer] Rendering VIDEO from resolved URL: ${videoUrl}`)
            return (
                <div className="flex h-full items-center justify-center bg-background">
                    <video
                        src={videoUrl}
                        controls
                        className="max-h-full max-w-full"
                    />
                </div>
            )
        }
    }

    // Handle Audio - check by type property or file extension
    if (
        (selectedAsset as any).type === 'audio' ||
        (fileType && fileType.category === 'audio')
    ) {
        const fileContent = (selectedAsset as any).content || (assetPath ? generatedFiles[assetPath] : null);
        let audioUrl = normalizeUrlString((selectedAsset as any).url) || normalizeUrlString(fileContent)

        // Try to extract URL from markdown reference content
        if (!audioUrl && fileContent) {
            audioUrl = extractUrlFromContent(String(fileContent))
        }

        if (audioUrl) {
            console.log(`[UnifiedViewer] Rendering AUDIO from resolved URL: ${audioUrl}`)
            return (
                <div className="flex h-full flex-col items-center justify-center bg-background text-foreground p-8">
                    <Music className="h-24 w-24 mb-8 text-green-500" />
                    <audio
                        src={audioUrl}
                        controls
                        className="w-full max-w-md"
                    />
                    <p className="mt-4 font-mono text-sm">{assetName}</p>
                </div>
            )
        }
    }

    // Handle Code/Text files - check by content, type property, or file extension
    const content = (selectedAsset as any).content ||
        (assetPath && generatedFiles[assetPath])

    if (content !== undefined && content !== null) {
        // Check if it's actually a code/text file
        if (
            (selectedAsset as any).type === 'code' ||
            (fileType && (fileType.category === 'code' || fileType.category === 'text'))
        ) {
            return (
                <CodeViewer
                    content={String(content)}
                    fileName={assetName}
                    path={assetPath}
                />
            )
        }

        // Fallback: show as text if no specific type detected
        if (!fileType || fileType.category === 'unknown') {
            return (
                <CodeViewer
                    content={String(content)}
                    fileName={assetName}
                    path={assetPath}
                />
            )
        }
    }

    // Unsupported or unknown type
    return (
        <div className="flex h-full flex-col items-center justify-center bg-muted/20 text-muted-foreground font-mono p-8">
            <File className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-sm mb-2">Unsupported file type</p>
            <p className="text-xs text-muted-foreground/70">{assetName}</p>
        </div>
    )
}
