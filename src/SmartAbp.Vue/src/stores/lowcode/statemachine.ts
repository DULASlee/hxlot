import { defineStore } from "pinia"
import { ref } from "vue"

// Using a simplified type structure for now. This can be expanded later.
export interface StateNode {
  id: string
  type: "start" | "end" | "default"
  label: string
  position: { x: number; y: number }
}

export interface StateEdge {
  id: string
  source: string
  target: string
  label?: string
}

export const useStateMachineStore = defineStore("stateMachine", () => {
  const nodes = ref<StateNode[]>([])
  const edges = ref<StateEdge[]>([])

  function findNodeById(id: string): StateNode | undefined {
    return nodes.value.find((node) => node.id === id)
  }

  function addNode(node: StateNode) {
    if (findNodeById(node.id)) {
      // Prevent duplicate nodes
      return
    }
    nodes.value.push(node)
  }

  function addEdge(edge: StateEdge) {
    const sourceNode = findNodeById(edge.source)
    const targetNode = findNodeById(edge.target)

    if (!sourceNode || !targetNode) {
      throw new Error("Source or target node not found.")
    }

    if (sourceNode.type === "end") {
      throw new Error("Cannot create a transition from an end node.")
    }

    if (targetNode.type === "start") {
      throw new Error("Cannot create a transition to a start node.")
    }

    edges.value.push(edge)
  }

  return {
    nodes,
    edges,
    findNodeById,
    addNode,
    addEdge,
  }
})
