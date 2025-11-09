"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, Upload, X } from "lucide-react"
import { uploadFile } from "@/lib/supabase/storage"

interface PhotoUploadProps {
  bucket?: string
  folder?: string
  onUpload?: (urls: string[]) => void
  maxFiles?: number
}

export function PhotoUpload({ bucket = "attachments", folder = "", onUpload, maxFiles = 5 }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previews, setPreviews] = useState<string[]>([])
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploading(true)

    // Create previews
    const newPreviews = files.map((file) => URL.createObjectURL(file))
    setPreviews((prev) => [...prev, ...newPreviews])

    // Upload files
    const results = await Promise.all(files.map((file) => uploadFile(file, bucket, folder)))

    const urls = results.filter((r) => !r.error).map((r) => r.url)
    setUploadedUrls((prev) => [...prev, ...urls])

    if (onUpload) {
      onUpload(urls)
    }

    setUploading(false)
  }

  const removePreview = (index: number) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index))
    setUploadedUrls((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {previews.map((preview, index) => (
            <div key={index} className="relative">
              <img
                src={preview || "/placeholder.svg"}
                alt={`Preview ${index + 1}`}
                className="h-24 w-full rounded-lg object-cover"
              />
              <button
                onClick={() => removePreview(index)}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {previews.length < maxFiles && (
        <Card className="border-2 border-dashed border-slate-300 bg-slate-50">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <label htmlFor="photo-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <Camera className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-slate-900">Upload Photos</p>
                  <p className="text-xs text-slate-600">Click to capture or select from device</p>
                </div>
                <Button type="button" size="sm" disabled={uploading}>
                  <Upload className="mr-2 h-4 w-4" />
                  {uploading ? "Uploading..." : "Select Photos"}
                </Button>
              </div>
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
