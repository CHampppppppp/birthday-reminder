'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Camera, X, Upload } from 'lucide-react'

interface AvatarUploadProps {
  currentAvatar?: string | null
  onAvatarUpdate: (avatarUrl: string) => void
  uploadUrl: string
  size?: number
  className?: string
}

export function AvatarUpload({
  currentAvatar,
  onAvatarUpdate,
  uploadUrl,
  size = 120,
  className = ''
}: AvatarUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('文件大小不能超过5MB')
      return
    }

    setSelectedFile(file)
    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('avatar', selectedFile)

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '上传失败')
      }

      onAvatarUpdate(result.avatarUrl)
      setSelectedFile(null)
      setPreviewUrl(null)
      toast.success('头像上传成功')

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : '上传失败，请重试')
    } finally {
      setIsUploading(false)
    }
  }

  const handleCancel = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const displayAvatar = previewUrl || currentAvatar

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Avatar Display */}
      <div className="relative">
        <div
          className="rounded-full border-4 border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-100 dark:bg-gray-800"
          style={{ width: size, height: size }}
        >
          {displayAvatar ? (
            <img
              src={displayAvatar}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
              <Camera size={size * 0.4} />
            </div>
          )}
        </div>

        {/* Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute -bottom-2 -right-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow-lg transition-colors"
          disabled={isUploading}
        >
          <Camera size={16} />
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Action Buttons */}
      {selectedFile && (
        <div className="flex space-x-2">
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleUpload}
            disabled={isUploading}
            className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>上传中...</span>
              </>
            ) : (
              <>
                <Upload size={16} />
                <span>上传</span>
              </>
            )}
          </motion.button>

          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleCancel}
            disabled={isUploading}
            className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={16} />
            <span>取消</span>
          </motion.button>
        </div>
      )}

      {/* Upload Instructions */}
      {!selectedFile && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-xs">
          点击相机图标选择图片，支持 JPG、PNG 格式，最大 5MB
        </p>
      )}
    </div>
  )
}
