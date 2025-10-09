import { defineStore } from "pinia";
import { ref } from "vue";
export const useStateMachineStore = defineStore("stateMachine", () => {
    const nodes = ref([]);
    const edges = ref([]);
    function findNodeById(id) {
        return nodes.value.find((node) => node.id === id);
    }
    function addNode(node) {
        if (findNodeById(node.id)) {
            // Prevent duplicate nodes
            return;
        }
        nodes.value.push(node);
    }
    function addEdge(edge) {
        const sourceNode = findNodeById(edge.source);
        const targetNode = findNodeById(edge.target);
        if (!sourceNode || !targetNode) {
            throw new Error("Source or target node not found.");
        }
        if (sourceNode.type === "end") {
            throw new Error("Cannot create a transition from an end node.");
        }
        if (targetNode.type === "start") {
            throw new Error("Cannot create a transition to a start node.");
        }
        edges.value.push(edge);
    }
    return {
        nodes,
        edges,
        findNodeById,
        addNode,
        addEdge,
    };
});
