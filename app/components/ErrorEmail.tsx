import * as React from 'react'

interface Props {
  info: any
}

const ErrorEmailTemplate: React.FC<Readonly<Props>> = ({ info }) => {
  return (
    <div>
      <h1>Uh-oh! 😵</h1>
      <p>
        A really serious error happened on album-mode.party that requires your
        attention!
      </p>
      <pre>{JSON.stringify(info, undefined, 2)}</pre>
    </div>
  )
}

export default ErrorEmailTemplate
