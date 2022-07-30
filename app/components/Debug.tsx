import React from 'react'
import clsx from 'clsx'

interface Props {
  data: any
}

const Debug: React.FC<Props> = ({ data }) => (
  <div className={clsx('container', 'mx-auto', 'prose')}>
    <pre>{JSON.stringify(data, undefined, 2)}</pre>
  </div>
)

export default Debug
