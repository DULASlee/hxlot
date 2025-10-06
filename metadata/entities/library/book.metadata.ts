/**
 * Book 实体元数据
 * 示例：图书管理
 */

import type { EntityMetadata } from '../../../src/SmartAbp.Vue/packages/metadata-core/src/types'

export const BookMetadata: EntityMetadata = {
  schemaVersion: '1.0.0',
  name: 'Book',
  module: 'Library',
  description: '图书信息',
  keyType: 'Guid',
  isAggregateRoot: true,
  isMultiTenant: true,
  isSoftDelete: true,
  hasExtraProperties: true,
  
  properties: [
    {
      name: 'title',
      type: 'string',
      isRequired: true,
      isReadOnly: false,
      isUnique: false,
      maxLength: 200,
      displayName: '书名',
      description: '图书标题'
    },
    {
      name: 'isbn',
      type: 'string',
      isRequired: true,
      isReadOnly: false,
      isUnique: true,
      maxLength: 20,
      regex: '^(97[89])?\\d{9}(\\d|X)$',
      displayName: 'ISBN',
      description: '国际标准书号'
    },
    {
      name: 'author',
      type: 'string',
      isRequired: true,
      isReadOnly: false,
      isUnique: false,
      maxLength: 100,
      displayName: '作者'
    },
    {
      name: 'publisher',
      type: 'string',
      isRequired: false,
      isReadOnly: false,
      isUnique: false,
      maxLength: 100,
      displayName: '出版社'
    },
    {
      name: 'publishDate',
      type: 'DateTime',
      isRequired: false,
      isReadOnly: false,
      isUnique: false,
      displayName: '出版日期'
    },
    {
      name: 'price',
      type: 'decimal',
      isRequired: true,
      isReadOnly: false,
      isUnique: false,
      minValue: 0,
      maxValue: 99999.99,
      displayName: '价格'
    },
    {
      name: 'stock',
      type: 'int',
      isRequired: true,
      isReadOnly: false,
      isUnique: false,
      minValue: 0,
      defaultValue: '0',
      displayName: '库存数量'
    },
    {
      name: 'description',
      type: 'string',
      isRequired: false,
      isReadOnly: false,
      isUnique: false,
      maxLength: 2000,
      displayName: '简介'
    }
  ],
  
  xUiConfig: {
    listColumns: ['title', 'author', 'isbn', 'publisher', 'price', 'stock'],
    formFields: ['title', 'isbn', 'author', 'publisher', 'publishDate', 'price', 'stock', 'description'],
    searchFields: ['title', 'author', 'isbn'],
    defaultSort: 'createdAt',
    pageSize: 20
  },
  
  xBackendConfig: {
    generateRepository: true,
    generateAppService: true,
    generateController: true,
    generateDto: true
  }
}

export default BookMetadata

