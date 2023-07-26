import clsx from 'clsx'
import sample from 'lodash/sample'
import React from 'react'

import { Heading } from '~/components/Base'
import ButtonLinkGroup from '~/components/Base/ButtonLinkGroup'
import Card from '~/components/Base/Card'

import ReviewButtons from './ReviewButtons'
import type { ReviewButtonProps } from './ReviewButtons'

export interface Props {
  embed: React.ReactNode
  title: React.ReactNode
  footer?: React.ReactNode
  reviewProps: Omit<ReviewButtonProps, 'bottomNav'>
  genres?: string[]
  className?: string
  releaseDate?: string
  popularity?: number
}

const AlbumWrapper: React.FC<Props> = ({
  embed,
  title,
  footer,
  reviewProps,
  className,
  releaseDate,
  genres,
  popularity,
}) => {
  return (
    <>
      <Card
        className={clsx(
          'mx-auto',
          'sm:card-side',
          'album-card-wrapper',
          'w-full',
          'sm:w-5/6',
          ['min-h-[calc(100vh-6rem)]', 'sm:min-h-fit'],
          ['shadow-none', 'sm:shadow-xl'],
          'phone:pb-[4rem]',
          'phone:rounded-none',
          className
        )}
        media={embed}
        title={title}
        body={footer}
        actionsClassName={clsx('flex-col', 'sticky')}
        actions={
          <>
            <div
              className={clsx(
                'stats',
                'w-full',
                ['stats-vertical', 'sm:stats-horizontal'],
                [
                  'sm:[&>.stat:first-child]:pl-0',
                  'sm:[&>.stat:last-child]:pr-0',
                ],
                ['phone:[&>.stat]:px-0', 'phone:grid-cols-2'],
                ['[&_.stat-title]:font-bold', '[&_.stat-title]:uppercase'],
                ['[&_.stat-desc]:whitespace-normal']
              )}
            >
              {!!genres?.length && (
                <div className="stat phone:col-span-2">
                  <h5 className="stat-title">Genres</h5>
                  <ButtonLinkGroup
                    items={genres.slice(0, 3)}
                    keyFunction={(genre, i) => `${genre}-${i}`}
                    toFunction={(genre) => `/genre/${genre}`}
                    childFunction={(genre) => genre}
                    className={clsx('btn-xs')}
                    wrapperClassName={clsx(
                      'stat-actions',
                      'sm:flex-col',
                      'mt-2'
                    )}
                  />
                </div>
              )}
              {typeof popularity === 'number' && (
                <div className="stat">
                  <h5 className="stat-title">Popularity</h5>
                  <div className="stat-value">{popularity}%</div>
                  <div className="stat-desc">
                    <PopularityDescription popularity={popularity} />
                  </div>
                </div>
              )}
              {releaseDate && (
                <div className="stat">
                  <h5 className="stat-title">Released</h5>
                  <time dateTime={releaseDate} className="stat-value">
                    {new Date(releaseDate).getFullYear()}
                  </time>
                  <div className="stat-desc">
                    <ReleaseDateDescription
                      year={new Date(releaseDate).getFullYear()}
                    />
                  </div>
                </div>
              )}
            </div>
            <Heading level="h5" noSpacing className={clsx('phone:hidden')}>
              Rate to get the next recommendation
            </Heading>
            <ReviewButtons className={clsx('phone:hidden')} {...reviewProps} />
          </>
        }
      />
      <ReviewButtons className={clsx('sm:hidden')} bottomNav {...reviewProps} />
    </>
  )
}

const PopularityDescription: React.FC<{ popularity: number }> = React.memo(
  ({ popularity }) => {
    switch (Math.round(popularity / 20)) {
      case 0:
        return sample([
          'Hipster AF',
          'Not For Everyone, But Perfect 4️⃣ U',
          'Unheard Talent',
          'Hidden Gem',
          'Get In On The Ground Floor',
        ])
      case 1:
        return sample([
          'Rising Like A Phoenix',
          'Modest Buzz',
          'Root For An Underdog',
          'Cult Following',
          'Still On The Come Up',
        ])
      case 2:
        return sample([
          'Indie Darling',
          'Underground Gem',
          "I'd Check Them Out",
          "Don't Sleep On Them",
        ])
      case 3:
        return sample([
          'Rising Trendsetter',
          'Melodic Charmer',
          <>
            They've Got <i>"It"</i>
          </>,
        ])
      case 4:
        return sample([
          'Popular',
          'Temporary Fad',
          'Overhyped',
          'Fan Favorite',
          'Chart Topper',
          'Headliner Status',
          <>
            <i>Some</i> People Are Into Them
          </>,
        ])
      default:
        return sample(['Hot 🔥', 'Festival Headliner'])
    }
  }
)

const ReleaseDateDescription: React.FC<{ year: number }> = ({ year }) => {
  const currentYear = new Date().getFullYear()

  if (year === currentYear) {
    return sample(['That New New', 'Just Came Out', 'Brand New'])
  } else if (year >= currentYear - 5) {
    return sample([
      'Still In Rotation',
      <abbr key={1} title="I See You Missed It">
        ICYMI
      </abbr>,
      'Toddler Status',
    ])
  } else if (year === currentYear - 16) {
    return 'Old Enough to Drive'
  } else if (year === currentYear - 18) {
    return 'Old Enough To Smoke'
  } else if (year === currentYear - 21) {
    return 'Old Enough To Drink'
  } else if (year >= 2000 && year <= 2011) {
    return sample([
      'ZoomerCore',
      'Welcome To The Millenium',
      'I Prayed For Y2K',
    ])
  } else if (year >= 1990 && year <= 1999) {
    return sample([
      '90s Baby',
      '90s Nostolgia',
      'I Have This On 💿',
      'Boy Band Mania',
      'Grunge Flannel Era',
    ])
  } else if (year >= 1980 && year <= 1989) {
    return sample([
      'As Heard On Stranger Things 🙄',
      'New Wave Was Fun',
      'I Miss Hair Rock',
    ])
  } else if (year <= currentYear - 30) {
    return sample([
      'Oldie But A Goodie',
      'Classic',
      'Ask Your Parents About Them',
    ])
  }

  return <abbr title="I See You Missed It">ICYMI</abbr>
}

export default AlbumWrapper
