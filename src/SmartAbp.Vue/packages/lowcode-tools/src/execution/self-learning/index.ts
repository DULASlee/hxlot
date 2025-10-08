// 🔥 架构铁律三合规：self-learning模块导出
// 自学习功能

export const SelfLearning = {
    enabled: false,
    learningData: [] as any[],

    toggle() {
        this.enabled = !this.enabled
        return this.enabled
    },

    addLearningData(data: any) {
        this.learningData.push(data)
    },

    clear() {
        this.learningData = []
    }
}

export default SelfLearning
