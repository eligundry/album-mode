const config = {
  siteTitle: 'Album Mode.party 🎉',
  siteDescription: "Don't know what to listen to?",
  siteURL: 'https://album-mode.party',
  cacheControl: {
    public: `public, max-age=${60 * 60}, s-maxage=${60 * 60}`,
    publicLonger: `public, max-age=${60 * 60 * 24}, s-maxage=${60 * 60 * 24}`,
    private: `private, max-age=${60 * 60}`,
  },
  asyncRetryConfig: {
    retries: 5,
    factor: 0,
    minTimeout: 0,
    randomize: false,
  },
  allowedQueryParametersInCanoncialURL: ['artist', 'artistID', 'genre'],
  requiredLoginFailureRedirect:
    '/?error=You must login to access this&showLoginButton=1',
}

export default config
