'use client';

import React, { useState, useRef } from 'react';
import { Camera, Plus, X, Edit3, Check, Trash2, Package } from 'lucide-react';
import { Ingredient, IngredientApiResponse } from '@/types/food';

interface InventoryManagerProps {
    userId: string;
    onInventoryUpdate?: (ingredients: Ingredient[]) => void;
}

export default function InventoryManager({ userId, onInventoryUpdate }: InventoryManagerProps) {
    const [inventory, setInventory] = useState<Ingredient[]>([]);
    const [staples, setStaples] = useState<Ingredient[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [scanResults, setScanResults] = useState<Ingredient[]>([]);
    const [editingItem, setEditingItem] = useState<string | null>(null);
    const [newStaple, setNewStaple] = useState({ name: '', category: 'other' as Ingredient['category'] });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const compressImage = (file: File, maxWidth: number = 1024, quality: number = 0.8): Promise<string> => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Calculate new dimensions
                let { width, height } = img;
                
                if (width > height && width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                } else if (height > maxWidth) {
                    width = (width * maxWidth) / height;
                    height = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw and compress
                ctx?.drawImage(img, 0, 0, width, height);
                const compressedImage = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedImage);
            };
            
            img.src = URL.createObjectURL(file);
        });
    };

    const handleImageScan = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsScanning(true);
        try {
            // Compress image on client side before sending
            const compressedImage = await compressImage(file, 1024, 0.7);
            console.log(`Compressed image size: ${compressedImage.length} characters`);
                
            const response = await fetch('/api/recognize-ingredients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: compressedImage }),
            });

            if (response.ok) {
                const data: IngredientApiResponse = await response.json();
                const ingredients = data.data.ingredientAnalysis.identifiedIngredients;
                setScanResults(ingredients);
            } else {
                console.error('Failed to analyze image');
            }
        } catch (error) {
            console.error('Error scanning image:', error);
        } finally {
            setIsScanning(false);
        }
    };

    const addScannedIngredients = () => {
        const newInventory = [...inventory, ...scanResults];
        setInventory(newInventory);
        setScanResults([]);
        onInventoryUpdate?.(newInventory);
    };

    const addStaple = () => {
        if (newStaple.name.trim()) {
            const stapleIngredient: Ingredient = {
                ...newStaple,
                quantity: 'toujours disponible',
                isStaple: true,
                confidence: 'high'
            };
            setStaples([...staples, stapleIngredient]);
            setNewStaple({ name: '', category: 'other' });
        }
    };

    const removeIngredient = (index: number, isStaple: boolean) => {
        if (isStaple) {
            const newStaples = staples.filter((_, i) => i !== index);
            setStaples(newStaples);
        } else {
            const newInventory = inventory.filter((_, i) => i !== index);
            setInventory(newInventory);
            onInventoryUpdate?.(newInventory);
        }
    };

    const updateIngredient = (index: number, field: keyof Ingredient, value: string, isStaple: boolean) => {
        if (isStaple) {
            const newStaples = [...staples];
            newStaples[index] = { ...newStaples[index], [field]: value };
            setStaples(newStaples);
        } else {
            const newInventory = [...inventory];
            newInventory[index] = { ...newInventory[index], [field]: value };
            setInventory(newInventory);
            onInventoryUpdate?.(newInventory);
        }
    };

    const getAllAvailableIngredients = (): Ingredient[] => {
        return [...inventory, ...staples];
    };

    const categories = ['vegetables', 'fruits', 'meat', 'dairy', 'grains', 'spices', 'condiments', 'beverages', 'other'];

    return (
        <div className="space-y-6">
            {/* Scan Fridge Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Scanner mon frigo/garde-manger
                </h3>
                
                <div className="space-y-4">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isScanning}
                        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <Camera className="w-5 h-5" />
                        {isScanning ? 'Analyse en cours...' : 'Prendre une photo'}
                    </button>
                    
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageScan}
                        className="hidden"
                    />
                </div>

                {/* Scan Results */}
                {scanResults.length > 0 && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-800 mb-2">
                            Ingrédients détectés ({scanResults.length})
                        </h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {scanResults.map((ingredient, index) => (
                                <div key={index} className="text-sm text-green-700 flex justify-between items-center">
                                    <span>{ingredient.name} ({ingredient.quantity})</span>
                                    <span className="text-xs bg-green-200 px-2 py-1 rounded">
                                        {ingredient.confidence}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={addScannedIngredients}
                            className="w-full mt-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            Ajouter à mon inventaire
                        </button>
                    </div>
                )}
            </div>

            {/* Staples Management */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Mes ingrédients de base
                </h3>
                
                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        placeholder="Nom de l'ingrédient de base"
                        value={newStaple.name}
                        onChange={(e) => setNewStaple({ ...newStaple, name: e.target.value })}
                        className="flex-1 px-3 py-2 border rounded-lg"
                    />
                    <select
                        value={newStaple.category}
                        onChange={(e) => setNewStaple({ ...newStaple, category: e.target.value as Ingredient['category'] })}
                        className="px-3 py-2 border rounded-lg"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <button
                        onClick={addStaple}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                    {staples.map((staple, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            {editingItem === `staple-${index}` ? (
                                <>
                                    <input
                                        type="text"
                                        value={staple.name}
                                        onChange={(e) => updateIngredient(index, 'name', e.target.value, true)}
                                        className="flex-1 px-2 py-1 border rounded"
                                    />
                                    <button
                                        onClick={() => setEditingItem(null)}
                                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span className="flex-1">{staple.name}</span>
                                    <span className="text-xs text-gray-500 px-2 py-1 bg-gray-200 rounded">
                                        {staple.category}
                                    </span>
                                    <button
                                        onClick={() => setEditingItem(`staple-${index}`)}
                                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => removeIngredient(index, true)}
                                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Current Inventory */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Inventaire actuel ({inventory.length})</h3>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {inventory.map((ingredient, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                            <div className="flex-1">
                                <div className="font-medium">{ingredient.name}</div>
                                <div className="text-sm text-gray-500">
                                    {ingredient.quantity} • {ingredient.category}
                                    {ingredient.condition && ` • ${ingredient.condition}`}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-1 rounded ${
                                    ingredient.confidence === 'high' ? 'bg-green-100 text-green-800' :
                                    ingredient.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {ingredient.confidence}
                                </span>
                                <button
                                    onClick={() => removeIngredient(index, false)}
                                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {inventory.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                        Aucun ingrédient dans l'inventaire. Scannez votre frigo pour commencer !
                    </div>
                )}
            </div>

            {/* Summary */}
            <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Résumé</h4>
                <div className="text-sm text-blue-700">
                    <div>Ingrédients disponibles: {getAllAvailableIngredients().length}</div>
                    <div>Ingrédients scannés: {inventory.length}</div>
                    <div>Ingrédients de base: {staples.length}</div>
                </div>
            </div>
        </div>
    );
}