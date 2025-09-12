import { ref, reactive, readonly } from "vue"

export interface DragItem {
  id: string
  type: string
  data: any
}

export interface DropZone {
  id: string
  accepts: string[]
  onDrop: (item: DragItem) => void
}

export interface DragState {
  isDragging: boolean
  dragItem: DragItem | null
  dragOverZone: string | null
  dragPreview: HTMLElement | null
}

/**
 * Advanced drag and drop composable for entity designer
 */
export function useDragDrop() {
  const dragState = reactive<DragState>({
    isDragging: false,
    dragItem: null,
    dragOverZone: null,
    dragPreview: null,
  })

  const dropZones = ref<Map<string, DropZone>>(new Map())

  /**
   * Register a drop zone
   */
  const registerDropZone = (zone: DropZone) => {
    dropZones.value.set(zone.id, zone)
  }

  /**
   * Unregister a drop zone
   */
  const unregisterDropZone = (zoneId: string) => {
    dropZones.value.delete(zoneId)
  }

  /**
   * Start dragging an item
   */
  const startDrag = (item: DragItem, event: DragEvent) => {
    dragState.isDragging = true
    dragState.dragItem = item

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "copy"
      event.dataTransfer.setData("application/json", JSON.stringify(item))

      // Create custom drag preview
      createDragPreview(item, event)
    }
  }

  /**
   * Handle drag over event
   */
  const dragOver = (zoneId: string, event: DragEvent) => {
    event.preventDefault()

    const zone = dropZones.value.get(zoneId)
    if (zone && dragState.dragItem && canAcceptDrop(zone, dragState.dragItem)) {
      dragState.dragOverZone = zoneId
      event.dataTransfer!.dropEffect = "copy"
    } else {
      event.dataTransfer!.dropEffect = "none"
    }
  }

  /**
   * Handle drag leave event
   */
  const dragLeave = (zoneId: string) => {
    if (dragState.dragOverZone === zoneId) {
      dragState.dragOverZone = null
    }
  }

  /**
   * Handle drop event
   */
  const drop = (zoneId: string, event: DragEvent) => {
    event.preventDefault()

    const zone = dropZones.value.get(zoneId)
    if (!zone) return

    let dragItem: DragItem

    // Get drag item from event or current state
    if (dragState.dragItem) {
      dragItem = dragState.dragItem
    } else {
      try {
        const data = event.dataTransfer?.getData("application/json")
        if (!data) return
        dragItem = JSON.parse(data)
      } catch (error) {
        console.error("Failed to parse drag data:", error)
        return
      }
    }

    // Check if drop is allowed
    if (canAcceptDrop(zone, dragItem)) {
      zone.onDrop(dragItem)
    }

    // Reset drag state
    endDrag()
  }

  /**
   * End dragging
   */
  const endDrag = () => {
    dragState.isDragging = false
    dragState.dragItem = null
    dragState.dragOverZone = null

    if (dragState.dragPreview) {
      document.body.removeChild(dragState.dragPreview)
      dragState.dragPreview = null
    }
  }

  /**
   * Check if a zone can accept a drag item
   */
  const canAcceptDrop = (zone: DropZone, item: DragItem): boolean => {
    return zone.accepts.includes(item.type) || zone.accepts.includes("*")
  }

  /**
   * Create a custom drag preview
   */
  const createDragPreview = (item: DragItem, event: DragEvent) => {
    const preview = document.createElement("div")
    preview.className = "drag-preview"
    preview.style.cssText = `
      position: absolute;
      top: -1000px;
      left: -1000px;
      background: #409eff;
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      pointer-events: none;
      z-index: 9999;
    `
    preview.textContent = `Adding ${item.type}`

    document.body.appendChild(preview)
    dragState.dragPreview = preview

    if (event.dataTransfer) {
      event.dataTransfer.setDragImage(preview, 0, 0)
    }
  }

  /**
   * Check if currently dragging over a specific zone
   */
  const isDragOverZone = (zoneId: string): boolean => {
    return dragState.dragOverZone === zoneId
  }

  /**
   * Check if a specific type is being dragged
   */
  const isDraggingType = (type: string): boolean => {
    return dragState.isDragging && dragState.dragItem?.type === type
  }

  /**
   * Get visual feedback for drag state
   */
  const getDragFeedback = (zoneId: string) => {
    if (!dragState.isDragging) return "normal"

    const zone = dropZones.value.get(zoneId)
    if (!zone || !dragState.dragItem) return "invalid"

    const canAccept = canAcceptDrop(zone, dragState.dragItem)
    const isOverZone = isDragOverZone(zoneId)

    if (isOverZone && canAccept) return "drop-ready"
    if (canAccept) return "drop-allowed"
    return "drop-forbidden"
  }

  return {
    // State
    dragState: readonly(dragState),

    // Methods
    registerDropZone,
    unregisterDropZone,
    startDrag,
    dragOver,
    dragLeave,
    drop,
    endDrag,

    // Utilities
    isDragOverZone,
    isDraggingType,
    getDragFeedback,
    canAcceptDrop,
  }
}

/**
 * Property-specific drag and drop utilities
 */
export function usePropertyDragDrop() {
  const { registerDropZone, startDrag, dragOver, dragLeave, drop, getDragFeedback } = useDragDrop()

  /**
   * Create a property drag item
   */
  const createPropertyDragItem = (propertyType: any): DragItem => ({
    id: `property_${Date.now()}`,
    type: "property-type",
    data: propertyType,
  })

  /**
   * Register entity canvas as drop zone
   */
  const registerEntityCanvas = (onPropertyDrop: (propertyType: any) => void) => {
    registerDropZone({
      id: "entity-canvas",
      accepts: ["property-type"],
      onDrop: (item) => {
        if (item.type === "property-type") {
          onPropertyDrop(item.data)
        }
      },
    })
  }

  /**
   * Handle property type drag start
   */
  const startPropertyDrag = (propertyType: any, event: DragEvent) => {
    const dragItem = createPropertyDragItem(propertyType)
    startDrag(dragItem, event)
  }

  return {
    createPropertyDragItem,
    registerEntityCanvas,
    startPropertyDrag,
    dragOver,
    dragLeave,
    drop,
    getDragFeedback,
  }
}

/**
 * Sortable list utilities for property reordering
 */
export function useSortableProperties() {
  const sortState = reactive({
    isDragging: false,
    dragIndex: -1,
    hoverIndex: -1,
  })

  const startSort = (index: number) => {
    sortState.isDragging = true
    sortState.dragIndex = index
  }

  const hoverSort = (index: number) => {
    if (sortState.isDragging && index !== sortState.dragIndex) {
      sortState.hoverIndex = index
    }
  }

  const endSort = () => {
    sortState.isDragging = false
    sortState.dragIndex = -1
    sortState.hoverIndex = -1
  }

  const getSortFeedback = (index: number) => {
    if (!sortState.isDragging) return "normal"

    if (index === sortState.dragIndex) return "dragging"
    if (index === sortState.hoverIndex) return "drop-target"

    return "normal"
  }

  return {
    sortState: readonly(sortState),
    startSort,
    hoverSort,
    endSort,
    getSortFeedback,
  }
}
