(() => {
  const SYSTEM_DATA = {
    contacts: [
      { id: 'name', label: 'Name', value: 'Travis Ramsey', type: 'text', icon: 'person' },
      { id: 'brand', label: 'Brand', value: 'DevSkits', type: 'text', icon: 'location' },
      { id: 'github', label: 'GitHub', value: 'https://github.com/DevSkits916', type: 'url', icon: 'github' },
      { id: 'reddit', label: 'Reddit', value: 'https://www.reddit.com/u/DevSkits/s/RE9W0sZoV1', type: 'url', icon: 'reddit' },
      { id: 'twitter', label: 'Twitter', value: 'https://x.com/DevSkits916', type: 'url', icon: 'x' },
      { id: 'email', label: 'Email', value: 'DevSkits@icloud.com', type: 'email', icon: 'email' },
      { id: 'phone', label: 'Phone', value: '916-420-3052', type: 'phone', icon: 'phone' },
      { id: 'gofundme', label: 'GoFundMe', value: 'https://gofund.me/6bbc0274e', type: 'url', icon: 'gofundme' },
      { id: 'venmo', label: 'Venmo', value: 'https://venmo.com', type: 'url', icon: 'venmo' },
      { id: 'chime', label: 'Chime', value: 'https://www.chime.com', type: 'url', icon: 'chime' }
    ],
    links: {
      identity: [
        { label: 'GitHub', url: 'https://github.com/DevSkits916', icon: 'github' },
        { label: 'Facebook', url: 'https://www.facebook.com/DevSkits?mibextid=wwXIfr', icon: 'facebook' }
      ],
      social: [
        { label: 'X / Twitter', url: 'https://x.com/DevSkits916', icon: 'x' },
        { label: 'Reddit', url: 'https://www.reddit.com/u/DevSkits/s/RE9W0sZoV1', icon: 'reddit' }
      ],
      support: [
        { label: 'GoFundMe', url: 'https://gofund.me/6bbc0274e', icon: 'gofundme' },
        { label: 'Donate Center', url: 'devskits://donate', icon: 'donate' }
      ]
    },
    about: {
      version: '3.2.0',
      codename: 'RetroShell',
      features: ['Windowed desktop shell', 'App launcher + categories', 'Persistent notes + terminal history', 'Fake filesystem + navigator', 'Settings, recycle, activity tracking'],
      changelog: ['New staged boot with skip + fast boot', 'Improved Notes, Projects, Contact, Links, About', 'Expanded terminal command set']
    }
  };

  window.DevSkitsSystemData = SYSTEM_DATA;
})();
