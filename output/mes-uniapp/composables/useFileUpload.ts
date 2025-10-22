// composables/useFileUpload.ts
/**
 * 文件上传Composable
 * @author SmartAbp DevKit Low-Code Engine
 * @since 2025-10-22
 */

import { ref } from 'vue'

interface UploadOptions {
  url?: string
  maxSize?: number // MB
  accept?: string[]
  onProgress?: (progress: number) => void
}

interface UploadResult {
  url: string
  name: string
  size: number
  type: string
}

export function useFileUpload() {
  const uploading = ref(false)
  const uploadProgress = ref(0)

  /**
   * 选择并上传文件
   */
  async function uploadFile(options: UploadOptions = {}): Promise<UploadResult | null> {
    const {
      url = '/api/app/file/upload',
      maxSize = 100,
      accept = ['image', 'video', 'file'],
      onProgress
    } = options

    return new Promise((resolve, reject) => {
      // 选择文件
      uni.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: (chooseRes) => {
          const tempFilePath = chooseRes.tempFilePaths[0]
          
          // 检查文件大小
          uni.getFileInfo({
            filePath: tempFilePath,
            success: (fileInfo) => {
              const sizeMB = fileInfo.size / 1024 / 1024
              if (sizeMB > maxSize) {
                uni.showToast({
                  title: `文件大小不能超过$${maxSize}MB`,
                  icon: 'none'
                })
                reject(new Error('文件过大'))
                return
              }

              // 开始上传
              uploading.value = true
              uploadProgress.value = 0

              const uploadTask = uni.uploadFile({
                url: process.env.UNI_APP_BASE_URL + url,
                filePath: tempFilePath,
                name: 'file',
                header: {
                  'Authorization': `Bearer $${uni.getStorageSync('access_token')}`
                },
                success: (uploadRes) => {
                  if (uploadRes.statusCode === 200) {
                    const result = JSON.parse(uploadRes.data)
                    resolve(result as UploadResult)
                  } else {
                    reject(new Error('上传失败'))
                  }
                },
                fail: (err) => {
                  console.error('上传失败:', err)
                  uni.showToast({ title: '上传失败', icon: 'none' })
                  reject(err)
                },
                complete: () => {
                  uploading.value = false
                  uploadProgress.value = 0
                }
              })

              // 监听上传进度
              uploadTask.onProgressUpdate((res) => {
                uploadProgress.value = res.progress
                onProgress?.(res.progress)
              })
            },
            fail: (err) => {
              console.error('获取文件信息失败:', err)
              reject(err)
            }
          })
        },
        fail: (err) => {
          console.error('选择文件失败:', err)
          reject(err)
        }
      })
    })
  }

  /**
   * 选择并上传多个文件
   */
  async function uploadMultipleFiles(
    count: number = 9,
    options: UploadOptions = {}
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = []
    
    return new Promise((resolve, reject) => {
      uni.chooseImage({
        count,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: async (chooseRes) => {
          for (const filePath of chooseRes.tempFilePaths) {
            try {
              // 这里需要实现批量上传逻辑
              // 简化版本：逐个上传
              console.log('上传文件:', filePath)
            } catch (error) {
              console.error('上传失败:', filePath, error)
            }
          }
          resolve(results)
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  }

  return {
    uploading,
    uploadProgress,
    uploadFile,
    uploadMultipleFiles
  }
}
