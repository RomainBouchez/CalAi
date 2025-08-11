"use client";

import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { Modal, ModalBody, ModalContent, ModalTrigger, useModal } from "./ui/animated-modal";

interface ProductScannerProps {
    onProductFound: (product: any) => void;
    children?: React.ReactNode;
}

interface ScannedProduct {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    barcode?: string;
    brand?: string;
}

const ProductScannerContent = ({ onProductFound }: Omit<ProductScannerProps, 'children'>) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { setOpen } = useModal();

    const analyzeImage = async (imageFile: File) => {
        setIsAnalyzing(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('image', imageFile);

            const response = await fetch('/api/scan-product', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.success && result.data) {
                onProductFound(result.data);
                setOpen(false);
            } else {
                setError(result.error || "Unable to analyze this product");
            }
        } catch (err) {
            console.error('Scan error:', err);
            setError("Error analyzing the image");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Créer une preview de l'image
            const reader = new FileReader();
            reader.onload = (e) => {
                setCapturedImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
            
            // Analyser l'image
            analyzeImage(file);
        }
    };

    const startCamera = async () => {
        try {
            // Créer un input file avec capture pour mobile et desktop
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            
            // Détecter si on est sur mobile pour utiliser la caméra arrière
            const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            if (isMobile) {
                input.setAttribute('capture', 'environment'); // Caméra arrière sur mobile
            }
            
            input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        setCapturedImage(event.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                    analyzeImage(file);
                }
            };
            input.click();
        } catch (err) {
            console.error('Camera error:', err);
            setError("Unable to access camera");
        }
    };

    const openGallery = () => {
        fileInputRef.current?.click();
    };

    return (
        <ModalContent className="w-full max-w-md p-0">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Scan a product</h2>
                </div>

                {error && (
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {capturedImage && (
                    <div className="mb-4">
                        <img 
                            src={capturedImage} 
                            alt="Captured image" 
                            className="w-full h-48 object-cover rounded-lg"
                        />
                    </div>
                )}

                {isAnalyzing ? (
                    <div className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">
                            Analyzing...
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Searching for nutritional information
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="text-center text-sm text-muted-foreground mb-6">
                            Scan the barcode or take a photo of the product to get nutritional information
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button 
                                onClick={startCamera}
                                className="h-16 flex flex-col gap-2"
                                disabled={isAnalyzing}
                            >
                                <Camera className="h-6 w-6" />
                                <span className="text-sm">Camera</span>
                            </Button>

                            <Button 
                                variant="outline" 
                                onClick={openGallery}
                                className="h-16 flex flex-col gap-2"
                                disabled={isAnalyzing}
                            >
                                <Upload className="h-6 w-6" />
                                <span className="text-sm">Gallery</span>
                            </Button>
                        </div>

                        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                            <h3 className="font-medium text-sm mb-2">Tips for a good scan:</h3>
                            <ul className="text-xs text-muted-foreground space-y-1">
                                <li>• Make sure the barcode is clearly visible</li>
                                <li>• Keep the device stable while taking the photo</li>
                                <li>• Sufficient lighting for good quality</li>
                            </ul>
                        </div>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </div>
        </ModalContent>
    );
};

export function ProductScanner({ onProductFound, children }: ProductScannerProps) {
    return (
        <Modal>
            {children && (
                <ModalTrigger>
                    {children}
                </ModalTrigger>
            )}
            <ModalBody>
                <ProductScannerContent onProductFound={onProductFound} />
            </ModalBody>
        </Modal>
    );
}