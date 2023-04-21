import { Partytown } from '@builder.io/partytown/react'

import env from '~/env.server'

interface Props {
  disablePartytown?: boolean
}

const Tracking: React.FC<Props> = ({ disablePartytown }) => {
  const scriptType = disablePartytown ? 'text/javascript' : 'text/partytown'

  return (
    <>
      {!disablePartytown && (
        <Partytown
          debug={env.NODE_ENV === 'development'}
          forward={['dataLayer.push']}
        />
      )}
      <script
        type={scriptType}
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-P67HTXJ');
          `,
        }}
      />
    </>
  )
}

export default Tracking
