import { useState, useRef, useCallback } from "react";
import { Upload, X, GripVertical, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface GalleryImage {
  id?: number;
  file?: File;
  preview: string;
  order: number;
  isNew?: boolean;
}

interface GalleryUploadProps {
  mentorId: number;
  onUploadSuccess?: () => void;
  initialImages?: Array<{ id: number; imageUrl: string; order?: number }>;
}

export function GalleryUpload({
  mentorId,
  onUploadSuccess,
  initialImages = [],
}: GalleryUploadProps) {
  const [images, setImages] = useState<GalleryImage[]>(
    initialImages.map((img, idx) => ({
      id: img.id,
      preview: img.imageUrl,
      order: img.order ?? idx,
    }))
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImageMutation = trpc.gallery.uploadImage.useMutation();
  const updateOrderMutation = trpc.gallery.updateOrder.useMutation();
  const deleteImageMutation = trpc.gallery.deleteImage.useMutation();

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const newImages: GalleryImage[] = [];
      let validCount = 0;
      const totalFiles = Array.from(files).length;

      Array.from(files).forEach((file) => {
        // 파일 검증
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name}은 이미지 파일이 아닙니다.`);
          return;
        }

        if (file.size > 10 * 1024 * 1024) {
          // 10MB 제한
          toast.error(`${file.name}은 10MB 이하여야 합니다.`);
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const preview = e.target?.result as string;
          newImages.push({
            file,
            preview,
            order: images.length + validCount,
            isNew: true,
          });

          if (validCount === Array.from(files).length - 1) {
            setImages((prev) => [...prev, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
        validCount++;
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [images.length]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleRemoveImage = async (index: number) => {
    const image = images[index];

    // 기존 이미지 삭제
    if (image.id) {
      try {
        await deleteImageMutation.mutateAsync({ imageId: image.id });
        toast.success("이미지가 삭제되었습니다.");
      } catch (error) {
        toast.error("이미지 삭제에 실패했습니다.");
        return;
      }
    }

    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOverItem = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedItem = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedItem);

    // 순서 업데이트
    newImages.forEach((img, idx) => {
      img.order = idx;
    });

    setImages(newImages);
    setDraggedIndex(index);
  };

  const handleUploadClick = async () => {
    const newImages = images.filter((img) => img.isNew && img.file);

    if (newImages.length === 0) {
      toast.info("새로운 이미지가 없습니다.");
      return;
    }

    setIsUploading(true);

    try {
      for (const image of newImages) {
        if (!image.file) continue;

        const reader = new FileReader();
        await new Promise<void>((resolve, reject) => {
          reader.onload = async () => {
            try {
              const base64 = reader.result as string;
              await uploadImageMutation.mutateAsync({
                mentorId,
                imageData: base64,
                displayOrder: image.order,
              });
              resolve();
            } catch (error) {
              reject(error);
            }
          };
          reader.onerror = () => reject(reader.error);
          if (image.file) {
            reader.readAsDataURL(image.file);
          } else {
            reject(new Error("File is missing"));
          }
        });
      }

      // 순서 업데이트
      const orderedImages = images.filter((img) => img.id);
      if (orderedImages.length > 0) {
        for (const image of orderedImages) {
          if (image.id) {
            await updateOrderMutation.mutateAsync({
              imageId: image.id,
              displayOrder: image.order,
            });
          }
        }
      }

      toast.success("이미지가 업로드되었습니다.");
      // 업로드 후 새 이미지 제거
      setImages((prev) => prev.map((img) => ({ ...img, isNew: false })));
      onUploadSuccess?.();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-lg sm:text-xl">갤러리</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 드래그 앤 드롭 영역 */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-gray-300 hover:border-primary/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-3">
            <Upload className="w-8 h-8 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">
                이미지를 드래그하거나 클릭하여 업로드
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF (최대 10MB)
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2"
            >
              파일 선택
            </Button>
          </div>
        </div>

        {/* 이미지 미리보기 */}
        {images.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">
              미리보기 ({images.length}개)
            </p>

            {/* PC: 3열 그리드 */}
            <div className="hidden sm:grid grid-cols-3 gap-3">
              {images.map((image, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={() => handleDragOverItem(index)}
                  onDragEnd={() => setDraggedIndex(null)}
                  className={`relative group cursor-move rounded-lg overflow-hidden bg-slate-100 800 aspect-square transition-opacity ${
                    draggedIndex === index ? "opacity-50" : ""
                  }`}
                >
                  <img
                    src={image.preview}
                    alt="미리보기"
                    className="w-full h-full object-cover"
                  />

                  {/* 오버레이 */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2">
                    <GripVertical className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {image.isNew && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-blue-500 text-white text-xs rounded">
                      새로움
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 모바일: 가로 스크롤 */}
            <div className="sm:hidden overflow-x-auto pb-2">
              <div className="flex gap-3 min-w-min">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="relative group flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-slate-100 800"
                  >
                    <img
                      src={image.preview}
                      alt="미리보기"
                      className="w-full h-full object-cover"
                    />

                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>

                    {image.isNew && (
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded">
                        새
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 업로드 버튼 */}
        {images.some((img) => img.isNew) && (
          <Button
            onClick={handleUploadClick}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                업로드 중...
              </>
            ) : (
              "이미지 업로드"
            )}
          </Button>
        )}

        {images.length === 0 && (
          <p className="text-sm text-center text-gray-500 py-4">
            아직 갤러리 이미지가 없습니다.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
