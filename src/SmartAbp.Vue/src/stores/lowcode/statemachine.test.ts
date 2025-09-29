import { describe, it, expect, beforeEach } from "vitest"
import { createPinia, setActivePinia } from "pinia"
import { useStateMachineStore } from "./statemachine.ts"

describe("StateMachine Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it("should initialize with an empty state machine", () => {
    const store = useStateMachineStore()
    expect(store.nodes).toHaveLength(0)
    expect(store.edges).toHaveLength(0)
  })

  it("should allow adding new states (nodes)", () => {
    const store = useStateMachineStore()
    store.addNode({ id: "start", type: "start", label: "Start", position: { x: 0, y: 0 } })
    store.addNode({ id: "end", type: "end", label: "End", position: { x: 200, y: 0 } })

    expect(store.nodes).toHaveLength(2)
    expect(store.findNodeById("start")?.label).toBe("Start")
  })

  it("should allow adding valid transitions (edges) between nodes", () => {
    const store = useStateMachineStore()
    store.addNode({ id: "start", type: "start", label: "Start", position: { x: 0, y: 0 } })
    store.addNode({ id: "intermediate", type: "default", label: "In Progress", position: { x: 100, y: 0 } })
    store.addNode({ id: "end", type: "end", label: "End", position: { x: 200, y: 0 } })

    const transition1 = { id: "t1", source: "start", target: "intermediate", label: "Begin" }
    const transition2 = { id: "t2", source: "intermediate", target: "end", label: "Finish" }

    store.addEdge(transition1)
    store.addEdge(transition2)

    expect(store.edges).toHaveLength(2)
  })

  it("should prevent adding a transition from an end state", () => {
    const store = useStateMachineStore()
    store.addNode({ id: "start", type: "start", label: "Start", position: { x: 0, y: 0 } })
    store.addNode({ id: "end", type: "end", label: "End", position: { x: 200, y: 0 } })

    const invalidTransition = { id: "invalid", source: "end", target: "start", label: "Reset" }
    
    // Expect the addEdge function to throw an error for an invalid transition
    expect(() => store.addEdge(invalidTransition)).toThrow("Cannot create a transition from an end node.")
    expect(store.edges).toHaveLength(0)
  })

  it("should prevent adding a transition to a start state", () => {
    const store = useStateMachineStore()
    store.addNode({ id: "start", type: "start", label: "Start", position: { x: 0, y: 0 } })
    store.addNode({ id: "other", type: "default", label: "Other", position: { x: 200, y: 0 } })

    const invalidTransition = { id: "invalid", source: "other", target: "start", label: "Go Back" }
    
    expect(() => store.addEdge(invalidTransition)).toThrow("Cannot create a transition to a start node.")
    expect(store.edges).toHaveLength(0)
  })
})
