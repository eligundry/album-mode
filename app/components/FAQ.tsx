import clsx from 'clsx'

interface Props {
  question: string | React.ReactNode
  answer: string | React.ReactNode
}

const FAQ: React.FC<Props> = ({ question, answer }) => {
  return (
    <div
      itemScope
      itemProp="mainEntity"
      itemType="https://schema.org/Question"
      className={clsx('prose')}
    >
      <h3 itemProp="name">{question}</h3>
      <div
        itemScope
        itemProp="acceptedAnswer"
        itemType="https://schema.org/Answer"
      >
        <div itemProp="text">{answer}</div>
      </div>
    </div>
  )
}

export default FAQ
