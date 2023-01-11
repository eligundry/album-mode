import clsx from 'clsx'
import React from 'react'

interface Props {
  data: any
}

const Debug: React.FC<Props> = ({ data }) => (
  <div className={clsx('container', 'mx-auto', 'prose')}>
    <pre>{JSON.stringify(data, undefined, 2)}</pre>
  </div>
)

export default Debug
