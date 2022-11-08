class ServerTiming {
  public headerKey = 'Server-Timing'
  private timings: Map<
    string,
    {
      from: Date
      to?: Date
      desc?: string
    }
  >

  constructor() {
    this.timings = new Map()
  }

  start(label: string, desc?: string) {
    this.timings.set(label, {
      from: new Date(),
      desc,
    })

    return this
  }

  end(label: string) {
    const from = this.timings.get(label)

    if (!from) {
      throw new Error(`timing '${label}' was never started`)
    }

    this.timings.set(label, {
      ...from,
      to: new Date(),
    })

    return this
  }

  async time<T extends () => Promise<any>>(
    label: string,
    fn: T
  ): Promise<Awaited<ReturnType<T>>> {
    this.start(label)

    try {
      const ret = await fn()
      return ret
    } finally {
      this.end(label)
    }
  }

  header(): string {
    return Array.from(this.timings.entries())
      .map(([label, timing]) => {
        if (!timing.to) {
          timing.to = new Date()
        }

        let value = `${label};`

        if (timing.desc) {
          value += `desc="${timing.desc}"`
        }

        value += `dur=${timing.to.getTime() - timing.from.getTime()}`

        return value
      })
      .join(', ')
  }
}

export default ServerTiming
