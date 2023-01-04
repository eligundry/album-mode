const config = {
  siteTitle: 'Album Mode.party 🎉',
  cacheControl: {
    public: `public, max-age=${60 * 60 * 24}, s-maxage=${60 * 60 * 24}`,
    private: `private, max-age=${60 * 60 * 12}`,
  },
  asyncRetryConfig: {
    retries: 5,
    factor: 0,
    minTimeout: 0,
    randomize: false,
  },
}

export default config
