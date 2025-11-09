import { createClient } from "./client"
import crypto from "crypto"

export interface UploadResult {
  url: string
  path: string
  checksum: string
  error?: string
}

export async function uploadFile(file: File, bucket: string, folder = ""): Promise<UploadResult> {
  const supabase = createClient()

  const fileExt = file.name.split(".").pop()
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
  const filePath = folder ? `${folder}/${fileName}` : fileName

  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file)

  if (error) {
    return { url: "", path: "", checksum: "", error: error.message }
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(filePath)

  return { url: publicUrl, path: filePath, checksum: "" }
}

export async function uploadMultipleFiles(files: File[], bucket: string, folder = ""): Promise<UploadResult[]> {
  return Promise.all(files.map((file) => uploadFile(file, bucket, folder)))
}

export async function deleteFile(bucket: string, path: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.storage.from(bucket).remove([path])
  return !error
}

export async function uploadFileWithChecksum(file: File, bucket: string, folder = ""): Promise<UploadResult> {
  const supabase = createClient()

  // Calculate checksum
  const arrayBuffer = await file.arrayBuffer()
  const checksum = await calculateChecksum(arrayBuffer)

  const fileExt = file.name.split(".").pop()
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
  const filePath = folder ? `${folder}/${fileName}` : fileName

  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  })

  if (error) {
    return { url: "", path: "", checksum: "", error: error.message }
  }

  // Get signed URL with 1 hour expiry
  const { data: signedData } = await supabase.storage.from(bucket).createSignedUrl(filePath, 3600)

  return {
    url: signedData?.signedUrl || "",
    path: filePath,
    checksum,
  }
}

async function calculateChecksum(buffer: ArrayBuffer): Promise<string> {
  if (typeof window !== "undefined") {
    // Browser environment
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  } else {
    // Node environment (for Edge Functions)
    const hash = crypto.createHash("sha256")
    hash.update(Buffer.from(buffer))
    return hash.digest("hex")
  }
}

export async function verifyFileChecksum(bucket: string, path: string, expectedChecksum: string): Promise<boolean> {
  const supabase = createClient()

  const { data, error } = await supabase.storage.from(bucket).download(path)

  if (error || !data) return false

  const arrayBuffer = await data.arrayBuffer()
  const actualChecksum = await calculateChecksum(arrayBuffer)

  return actualChecksum === expectedChecksum
}

export async function getSignedUrl(bucket: string, path: string, expiresIn = 3600): Promise<string | null> {
  const supabase = createClient()

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)

  if (error) {
    console.error("[v0] Failed to get signed URL:", error)
    return null
  }

  return data?.signedUrl || null
}
