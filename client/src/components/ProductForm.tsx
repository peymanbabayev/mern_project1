import { useState, useRef, useEffect } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { CreateProductDTO } from "@/services/products/product.service";

interface ProductFormProps {
    defaultValues?: Partial<CreateProductDTO>;
    onSubmit: (data: FormData) => void;
    isLoading: boolean;
    buttonText?: string;
}

export default function ProductForm({
    defaultValues,
    onSubmit,
    isLoading,
    buttonText = "Yadda Saxla",
}: ProductFormProps) {
    const [name, setName] = useState(defaultValues?.name || "");
    const [price, setPrice] = useState(defaultValues?.price?.toString() || "");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(defaultValues?.image || null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Clean up object URL on unmount to prevent memory leaks
    useEffect(() => {
        return () => {
            if (imagePreview && imagePreview.startsWith("blob:")) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const objectUrl = URL.createObjectURL(file);
            setImagePreview(objectUrl);
        }
    };

    // Drag and Drop handlers
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];

            // Check if it's an image
            if (file.type.startsWith("image/")) {
                setImageFile(file);
                const objectUrl = URL.createObjectURL(file);
                setImagePreview(objectUrl);
            } else {
                alert("Zəhmət olmasa yalnız şəkil faylı seçin!");
            }
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("name", name);
        formData.append("price", price);

        if (imageFile) {
            formData.append("image", imageFile);
        }

        onSubmit(formData);
    };

    return (
        <Card className="w-full">
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6 pt-6">
                    <div className="space-y-2">
                        <Label>Məhsul Şəkli</Label>
                        <div
                            className={`
                relative flex flex-col items-center justify-center w-full h-64 
                border-2 border-dashed rounded-lg cursor-pointer 
                transition-all duration-200 ease-in-out
                ${imagePreview
                                    ? "border-primary/50 bg-accent/20"
                                    : isDragging
                                        ? "border-primary bg-primary/5 scale-[1.02]"
                                        : "border-muted-foreground/25 hover:bg-accent/10"
                                }
              `}
                            onClick={() => !imagePreview && fileInputRef.current?.click()}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            {imagePreview ? (
                                <div className="relative w-full h-full p-2 group">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-contain rounded-md"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-md m-2">
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeImage();
                                            }}
                                        >
                                            <X className="w-4 h-4 mr-2" /> Sil
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                fileInputRef.current?.click();
                                            }}
                                        >
                                            <Upload className="w-4 h-4 mr-2" /> Dəyiş
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                                    <div className={`p-4 rounded-full mb-3 transition-colors ${isDragging ? "bg-primary/20" : "bg-primary/10"}`}>
                                        <ImageIcon className={`w-8 h-8 transition-colors ${isDragging ? "text-primary animate-bounce" : "text-primary"}`} />
                                    </div>
                                    <p className="mb-2 text-sm font-medium">
                                        {isDragging ? "Buraya buraxın..." : "Şəkil yükləmək üçün klikləyin və ya sürüşdürün"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        PNG, JPG və ya GIF (Maks. 5MB)
                                    </p>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Name Input */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Məhsulun Adı <span className="text-destructive">*</span></Label>
                            <Input
                                id="name"
                                placeholder="Məs: iPhone 15 Pro"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="bg-background"
                            />
                        </div>

                        {/* Price Input */}
                        <div className="space-y-2">
                            <Label htmlFor="price">Qiymət (AZN) <span className="text-destructive">*</span></Label>
                            <div className="relative">
                                <Input
                                    id="price"
                                    type="number"
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    required
                                    className="pl-8 bg-background"
                                />
                                <span className="absolute left-3 top-2.5 text-muted-foreground font-semibold">₼</span>
                            </div>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex justify-end gap-2 border-t bg-muted/20 p-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => window.history.back()}
                        disabled={isLoading}
                    >
                        Ləğv et
                    </Button>
                    <Button type="submit" disabled={isLoading} className="min-w-[120px]">
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Gözləyin
                            </>
                        ) : (
                            buttonText
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
