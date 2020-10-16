const nextTick = () => new Promise(resolve => setTimeout(resolve, 1000 / 30))

export { nextTick }
