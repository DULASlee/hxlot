/**
 * AdvancedUpload Component E2E Test Suite
 * 测试批量上传、进度跟踪、错误处理、文件管理等完整用户交互流程
 */

import '../support/component-commands'

describe('AdvancedUpload E2E Tests', () => {
  const mockUploadConfig = {
    action: '/api/upload',
    method: 'POST',
    multiple: true,
    accept: 'image/*,application/pdf,.doc,.docx',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    autoUpload: true,
    showFileList: true,
    listType: 'card',
    dragDrop: true
  }

  const mockFileListData = [
    {
      id: 'file1',
      name: 'document.pdf',
      size: 2048576,
      type: 'application/pdf',
      status: 'success',
      url: '/files/document.pdf',
      uploadTime: '2024-01-15 10:30:00'
    },
    {
      id: 'file2',
      name: 'image.jpg',
      size: 1024000,
      type: 'image/jpeg',
      status: 'uploading',
      progress: 65,
      uploadTime: '2024-01-15 10:35:00'
    },
    {
      id: 'file3',
      name: 'large-file.zip',
      size: 15728640,
      type: 'application/zip',
      status: 'error',
      error: '文件大小超过限制',
      uploadTime: '2024-01-15 10:40:00'
    }
  ]

  // Mock file objects for testing
  const createMockFile = (name: string, size: number, type: string) => {
    const file = new File([''], name, { type })
    Object.defineProperty(file, 'size', { value: size })
    return file
  }

  const mockFiles = {
    validImage: createMockFile('test-image.jpg', 1024000, 'image/jpeg'),
    validDocument: createMockFile('test-document.pdf', 2048576, 'application/pdf'),
    oversizedFile: createMockFile('large-file.zip', 15728640, 'application/zip'),
    invalidType: createMockFile('test-file.exe', 1024000, 'application/x-executable')
  }

  beforeEach(() => {
    cy.visit('/')
    
    // Mock upload API
    cy.intercept('POST', '/api/upload', (req) => {
      const formData = req.body
      cy.wait(1000) // Simulate upload delay
      req.reply({
        statusCode: 200,
        body: {
          success: true,
          fileId: Math.random().toString(36).substring(7),
          url: '/uploaded-files/' + req.body.get('file').name,
          message: '上传成功'
        }
      })
    }).as('uploadFile')
  })

  it('should render upload component with correct configuration', () => {
    cy.mountComponent('AdvancedUpload', mockUploadConfig)

    // Verify basic structure
    cy.get('.advanced-upload').should('exist')
    cy.get('.upload-area').should('exist')
    cy.get('.file-list').should('exist')

    // Verify drag drop area
    cy.get('.drag-drop-area').should('be.visible')
    cy.get('.upload-icon').should('be.visible')
    cy.get('.upload-text').should('contain', '拖拽文件到此处')

    // Verify file input
    cy.get('input[type="file"]').should('have.attr', 'accept', mockUploadConfig.accept)
    cy.get('input[type="file"]').should('have.attr', 'multiple')
  })

  it('should handle file selection via file input', () => {
    cy.mountComponent('AdvancedUpload', mockUploadConfig)

    // Simulate file selection
    cy.get('input[type="file"]').selectFile([
      { contents: Cypress.Buffer.from('test content'), fileName: 'test.jpg' },
      { contents: Cypress.Buffer.from('document content'), fileName: 'doc.pdf' }
    ], { force: true })

    // Verify files are added to the list
    cy.get('.file-item').should('have.length', 2)
    cy.get('[data-file-name="test.jpg"]').should('exist')
    cy.get('[data-file-name="doc.pdf"]').should('exist')

    // Verify file information display
    cy.get('[data-file-name="test.jpg"] .file-name').should('contain', 'test.jpg')
    cy.get('[data-file-name="test.jpg"] .file-size').should('exist')
  })

  it('should support drag and drop file upload', () => {
    cy.mountComponent('AdvancedUpload', {
      ...mockUploadConfig,
      dragDrop: true
    })

    // Test drag over effects
    cy.get('.drag-drop-area').trigger('dragover', {
      dataTransfer: {
        files: [mockFiles.validImage]
      }
    })

    cy.get('.drag-drop-area').should('have.class', 'drag-over')

    // Test drop
    cy.get('.drag-drop-area').trigger('drop', {
      dataTransfer: {
        files: [mockFiles.validImage, mockFiles.validDocument]
      }
    })

    cy.get('.drag-drop-area').should('not.have.class', 'drag-over')
    cy.get('.file-item').should('have.length', 2)

    // Verify drag drop events
    cy.window().its('lastFileDrop').should('exist')
  })

  it('should validate file types and sizes', () => {
    cy.mountComponent('AdvancedUpload', mockUploadConfig)

    // Test invalid file type
    cy.get('input[type="file"]').selectFile([
      { contents: Cypress.Buffer.from('executable'), fileName: 'virus.exe' }
    ], { force: true })

    cy.get('.file-validation-error').should('be.visible')
    cy.get('.validation-message').should('contain', '文件类型不支持')

    // Test oversized file
    const oversizedFileData = new Array(11 * 1024 * 1024).join('x') // 11MB
    cy.get('input[type="file"]').selectFile([
      { contents: oversizedFileData, fileName: 'large.jpg' }
    ], { force: true })

    cy.get('.file-validation-error').should('be.visible')
    cy.get('.validation-message').should('contain', '文件大小超过限制')

    // Test maximum files limit
    const files = Array.from({ length: 6 }, (_, i) => ({
      contents: Cypress.Buffer.from('content'),
      fileName: `file${i}.jpg`
    }))

    cy.get('input[type="file"]').selectFile(files, { force: true })

    cy.get('.file-limit-error').should('be.visible')
    cy.get('.limit-message').should('contain', '最多只能上传5个文件')
  })

  it('should handle upload progress and status', () => {
    cy.mountComponent('AdvancedUpload', {
      ...mockUploadConfig,
      autoUpload: true
    })

    // Add files for upload
    cy.get('input[type="file"]').selectFile([
      { contents: Cypress.Buffer.from('test content'), fileName: 'upload-test.jpg' }
    ], { force: true })

    // Verify upload starts automatically
    cy.get('[data-file-name="upload-test.jpg"]').should('have.class', 'uploading')
    cy.get('[data-file-name="upload-test.jpg"] .progress-bar').should('be.visible')

    // Wait for upload completion
    cy.wait('@uploadFile')
    
    cy.get('[data-file-name="upload-test.jpg"]').should('have.class', 'upload-success')
    cy.get('[data-file-name="upload-test.jpg"] .success-icon').should('be.visible')
    cy.get('[data-file-name="upload-test.jpg"] .file-url').should('exist')
  })

  it('should support manual upload control', () => {
    cy.mountComponent('AdvancedUpload', {
      ...mockUploadConfig,
      autoUpload: false
    })

    // Add files without auto upload
    cy.get('input[type="file"]').selectFile([
      { contents: Cypress.Buffer.from('manual test'), fileName: 'manual.pdf' }
    ], { force: true })

    // Verify file is in pending state
    cy.get('[data-file-name="manual.pdf"]').should('have.class', 'upload-pending')
    cy.get('[data-file-name="manual.pdf"] .upload-button').should('be.visible')

    // Manually trigger upload
    cy.get('[data-file-name="manual.pdf"] .upload-button').click()

    cy.get('[data-file-name="manual.pdf"]').should('have.class', 'uploading')
    cy.wait('@uploadFile')
    cy.get('[data-file-name="manual.pdf"]').should('have.class', 'upload-success')

    // Test batch upload
    cy.get('input[type="file"]').selectFile([
      { contents: Cypress.Buffer.from('batch1'), fileName: 'batch1.jpg' },
      { contents: Cypress.Buffer.from('batch2'), fileName: 'batch2.jpg' }
    ], { force: true })

    cy.get('.upload-all-button').should('be.visible')
    cy.get('.upload-all-button').click()

    cy.get('.uploading').should('have.length', 2)
  })

  it('should handle upload errors and retry mechanism', () => {
    // Mock upload failure
    cy.intercept('POST', '/api/upload', {
      statusCode: 500,
      body: { error: '服务器错误', message: '上传失败，请重试' }
    }).as('uploadError')

    cy.mountComponent('AdvancedUpload', mockUploadConfig)

    // Add file for upload
    cy.get('input[type="file"]').selectFile([
      { contents: Cypress.Buffer.from('error test'), fileName: 'error-test.jpg' }
    ], { force: true })

    // Wait for upload error
    cy.wait('@uploadError')
    
    cy.get('[data-file-name="error-test.jpg"]').should('have.class', 'upload-error')
    cy.get('[data-file-name="error-test.jpg"] .error-message').should('contain', '上传失败')
    cy.get('[data-file-name="error-test.jpg"] .retry-button').should('be.visible')

    // Test retry functionality
    cy.intercept('POST', '/api/upload', {
      statusCode: 200,
      body: { success: true, fileId: 'retry-success', url: '/files/error-test.jpg' }
    }).as('uploadRetry')

    cy.get('[data-file-name="error-test.jpg"] .retry-button').click()
    
    cy.wait('@uploadRetry')
    cy.get('[data-file-name="error-test.jpg"]').should('have.class', 'upload-success')
  })

  it('should support file preview functionality', () => {
    cy.mountComponent('AdvancedUpload', {
      ...mockUploadConfig,
      previewable: true,
      fileList: mockFileListData
    })

    // Test image preview
    cy.get('[data-file-id="file2"] .preview-button').click()
    cy.get('.image-preview-modal').should('be.visible')
    cy.get('.preview-image').should('be.visible')
    cy.get('.preview-toolbar').should('exist')

    // Test preview controls
    cy.get('.zoom-in-button').click()
    cy.get('.zoom-out-button').click()
    cy.get('.rotate-button').click()

    // Close preview
    cy.get('.close-preview').click()
    cy.get('.image-preview-modal').should('not.exist')

    // Test document preview
    cy.get('[data-file-id="file1"] .preview-button').click()
    cy.get('.document-preview-modal').should('be.visible')
    cy.get('.pdf-viewer').should('exist')
  })

  it('should handle file management operations', () => {
    cy.mountComponent('AdvancedUpload', {
      ...mockUploadConfig,
      fileList: mockFileListData,
      editable: true
    })

    // Test file rename
    cy.get('[data-file-id="file1"] .rename-button').click()
    cy.get('.rename-input').should('be.visible').clear().type('renamed-document.pdf')
    cy.get('.confirm-rename').click()
    
    cy.get('[data-file-id="file1"] .file-name').should('contain', 'renamed-document.pdf')

    // Test file deletion
    cy.get('[data-file-id="file2"] .delete-button').click()
    cy.get('.confirm-delete-modal').should('be.visible')
    cy.get('.confirm-delete-button').click()
    
    cy.get('[data-file-id="file2"]').should('not.exist')

    // Test file download
    cy.get('[data-file-id="file1"] .download-button').click()
    cy.window().its('lastDownload').should('exist')

    // Test file copy/move
    cy.get('[data-file-id="file1"] .more-actions').click()
    cy.get('.action-menu').should('be.visible')
    cy.get('.copy-action').click()
    
    cy.get('.copy-modal').should('be.visible')
    cy.get('.destination-folder').select('Documents')
    cy.get('.confirm-copy').click()
  })

  it('should support different display modes', () => {
    // Test list mode
    cy.mountComponent('AdvancedUpload', {
      ...mockUploadConfig,
      listType: 'list',
      fileList: mockFileListData
    })

    cy.get('.file-list').should('have.class', 'list-mode')
    cy.get('.file-item').should('have.class', 'list-item')
    cy.get('.file-info-table').should('exist')

    // Test card mode
    cy.mountComponent('AdvancedUpload', {
      ...mockUploadConfig,
      listType: 'card',
      fileList: mockFileListData
    })

    cy.get('.file-list').should('have.class', 'card-mode')
    cy.get('.file-item').should('have.class', 'card-item')
    cy.get('.file-thumbnail').should('exist')

    // Test grid mode
    cy.mountComponent('AdvancedUpload', {
      ...mockUploadConfig,
      listType: 'grid',
      fileList: mockFileListData
    })

    cy.get('.file-list').should('have.class', 'grid-mode')
    cy.get('.file-grid').should('exist')
  })

  it('should be responsive across different screen sizes', () => {
    cy.mountComponent('AdvancedUpload', {
      ...mockUploadConfig,
      fileList: mockFileListData
    })

    cy.testResponsiveBreakpoints('.advanced-upload')

    // Test mobile-specific behaviors
    cy.viewport(375, 667)
    cy.wait(200)

    cy.get('.advanced-upload').should('have.class', 'mobile-upload')
    cy.get('.file-list').should('have.class', 'mobile-list')

    // Test mobile file actions
    cy.get('.file-item').first().find('.mobile-actions-button').click()
    cy.get('.mobile-actions-panel').should('be.visible')

    // Test tablet layout
    cy.viewport(768, 1024)
    cy.get('.advanced-upload').should('have.class', 'tablet-upload')
  })

  it('should pass accessibility standards', () => {
    cy.mountComponent('AdvancedUpload', {
      ...mockUploadConfig,
      fileList: mockFileListData
    })

    cy.testAriaAttributes('.advanced-upload')

    // Test upload-specific accessibility
    cy.get('[role="button"]').should('exist')
    cy.get('[aria-label]').should('have.length.greaterThan', 0)
    
    // Test keyboard navigation
    cy.get('.upload-button').focus()
    cy.focused().type('{enter}')
    
    // Test screen reader announcements
    cy.get('[aria-live="polite"]').should('exist')
    
    // Test file list accessibility
    cy.get('[role="list"]').should('exist')
    cy.get('[role="listitem"]').should('have.length.greaterThan', 0)
  })

  it('should handle advanced enterprise scenarios', () => {
    const enterpriseConfig = {
      ...mockUploadConfig,
      chunkUpload: true,
      chunkSize: 1024 * 1024, // 1MB chunks
      resumableUpload: true,
      duplicateCheck: true,
      virusScan: true,
      watermark: {
        enabled: true,
        text: '机密文档',
        position: 'bottom-right'
      },
      approval: {
        required: true,
        approvers: ['manager@company.com', 'admin@company.com']
      },
      metadata: {
        category: { required: true, options: ['合同', '报告', '图片', '其他'] },
        department: { required: true, options: ['技术部', '销售部', '市场部'] },
        confidential: { type: 'boolean', default: false }
      }
    }

    cy.mountComponent('AdvancedUpload', enterpriseConfig)

    // Test chunk upload
    const largeFileData = new Array(5 * 1024 * 1024).join('x') // 5MB file
    cy.get('input[type="file"]').selectFile([
      { contents: largeFileData, fileName: 'large-document.pdf' }
    ], { force: true })

    // Verify chunked upload progress
    cy.get('.chunk-progress').should('be.visible')
    cy.get('.chunk-indicator').should('contain', '1/5')

    // Test metadata form
    cy.get('.metadata-form').should('be.visible')
    cy.get('[data-field="category"] select').select('合同')
    cy.get('[data-field="department"] select').select('技术部')
    cy.get('[data-field="confidential"] input[type="checkbox"]').check()

    // Test duplicate detection
    cy.get('input[type="file"]').selectFile([
      { contents: 'duplicate content', fileName: 'existing-file.pdf' }
    ], { force: true })

    cy.get('.duplicate-warning').should('be.visible')
    cy.get('.duplicate-options').should('exist')
    cy.get('.replace-option').click()

    // Test virus scan
    cy.intercept('POST', '/api/virus-scan', {
      statusCode: 200,
      body: { clean: true, scanId: 'scan-123' }
    }).as('virusScan')

    cy.get('.virus-scan-status').should('contain', '扫描中')
    cy.wait('@virusScan')
    cy.get('.virus-scan-status').should('contain', '扫描通过')

    // Test approval workflow
    cy.get('.approval-required-notice').should('be.visible')
    cy.get('.submit-for-approval').click()
    
    cy.get('.approval-modal').should('be.visible')
    cy.get('.approval-comment').type('请审批这份重要合同文档')
    cy.get('.send-approval').click()

    cy.get('.approval-status').should('contain', '等待审批')

    // Test watermark preview
    cy.get('.watermark-preview-button').click()
    cy.get('.watermark-preview-modal').should('be.visible')
    cy.get('.watermarked-preview').should('contain', '机密文档')
  })

  it('should handle performance with batch uploads', () => {
    const batchUploadConfig = {
      ...mockUploadConfig,
      maxConcurrentUploads: 3,
      queueManagement: true,
      progressAggregation: true
    }

    cy.mountComponent('AdvancedUpload', batchUploadConfig)

    // Upload large batch of files
    const batchFiles = Array.from({ length: 20 }, (_, i) => ({
      contents: Cypress.Buffer.from(`batch file content ${i}`),
      fileName: `batch-file-${i}.jpg`
    }))

    cy.get('input[type="file"]').selectFile(batchFiles, { force: true })

    // Test queue management
    cy.get('.upload-queue').should('be.visible')
    cy.get('.queue-item').should('have.length', 20)
    cy.get('.uploading').should('have.length.lessThan', 4) // Max 3 concurrent

    // Test batch progress
    cy.get('.batch-progress').should('be.visible')
    cy.get('.overall-progress-bar').should('exist')
    cy.get('.upload-summary').should('contain', '0/20 完成')

    // Test queue controls
    cy.get('.pause-queue-button').click()
    cy.get('.queue-status').should('contain', '已暂停')

    cy.get('.resume-queue-button').click()
    cy.get('.queue-status').should('contain', '上传中')

    // Test performance monitoring
    cy.measurePerformance(() => {
      cy.get('.batch-progress').should('be.visible')
      cy.wait(5000) // Wait for some uploads to complete
    })

    // Verify concurrent upload limits are maintained
    cy.get('.uploading').should('have.length.lessThan', 4)
  })

  it('should support cloud storage integration', () => {
    const cloudConfig = {
      ...mockUploadConfig,
      cloudStorage: {
        providers: ['aws-s3', 'azure-blob', 'google-cloud'],
        defaultProvider: 'aws-s3',
        buckets: ['documents', 'images', 'backups'],
        defaultBucket: 'documents'
      },
      directUpload: true,
      cdn: {
        enabled: true,
        baseUrl: 'https://cdn.example.com'
      }
    }

    cy.mountComponent('AdvancedUpload', cloudConfig)

    // Test cloud provider selection
    cy.get('.cloud-provider-selector').should('be.visible')
    cy.get('.cloud-provider-option[data-provider="aws-s3"]').should('have.class', 'selected')

    // Switch cloud provider
    cy.get('.cloud-provider-option[data-provider="azure-blob"]').click()
    cy.get('.bucket-selector').should('contain', 'Container')

    // Test bucket selection
    cy.get('.bucket-selector').select('images')

    // Test direct upload to cloud
    cy.get('input[type="file"]').selectFile([
      { contents: Cypress.Buffer.from('cloud upload test'), fileName: 'cloud-test.jpg' }
    ], { force: true })

    // Verify direct upload indicators
    cy.get('.direct-upload-indicator').should('be.visible')
    cy.get('.cloud-upload-progress').should('exist')

    // Test CDN URL generation
    cy.wait('@uploadFile')
    cy.get('.cdn-url').should('contain', 'https://cdn.example.com')
    cy.get('.copy-cdn-url').click()
    cy.window().its('copiedText').should('include', 'cdn.example.com')

    // Test cloud storage management
    cy.get('.cloud-storage-manager').click()
    cy.get('.storage-usage').should('be.visible')
    cy.get('.quota-indicator').should('exist')
  })
})