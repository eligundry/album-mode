import React from 'react'

interface Props {
  data: any
}

const Debug: React.FC<Props> = ({ data }) => (
  <pre>{JSON.stringify(data, undefined, 2)}</pre>
)

export default Debug
