(() => {
  const profile = {
    name: 'Travis Ramsey',
    firstName: 'Travis',
    lastName: 'Ramsey',
    brand: 'DevSkits',
    title: 'Retro web builder / DevSkits OS creator',
    headline: 'Personal links, contact info, and support options for the DevSkits universe.',
    location: 'California, USA',
    summary: 'Builder of DevSkits OS, browser experiments, and retro-styled portfolio projects.'
  };

  const supportMethods = [
    {
      id: 'gofundme',
      label: 'GoFundMe',
      icon: 'gofundme',
      description: 'Featured fundraiser for helping DevSkits OS keep growing.',
      url: 'https://gofund.me/6bbc0274e',
      value: 'https://gofund.me/6bbc0274e',
      copyValue: 'https://gofund.me/6bbc0274e',
      featured: true,
      openLabel: 'Open campaign'
    },
    {
      id: 'venmo',
      label: 'Venmo',
      icon: 'venmo',
      description: 'Quick direct support for builds, updates, and late-night experiments.',
      url: 'https://venmo.com/u/DevSkits',
      value: '@DevSkits',
      copyValue: '@DevSkits',
      openLabel: 'Open Venmo'
    },
    {
      id: 'cashapp',
      label: 'Cash App',
      icon: 'cashapp',
      description: 'Fast tip jar for DevSkits projects and creative work.',
      url: 'https://cash.app/$DevSkits916',
      value: '$DevSkits916',
      copyValue: '$DevSkits916',
      openLabel: 'Open Cash App'
    },
    {
      id: 'paypal',
      label: 'PayPal',
      icon: 'paypal',
      description: 'Classic support option for one-time contributions.',
      url: 'https://www.paypal.me/DevSkits916',
      value: 'paypal.me/DevSkits916',
      copyValue: 'https://www.paypal.me/DevSkits916',
      openLabel: 'Open PayPal'
    },
    {
      id: 'chime',
      label: 'Chime',
      icon: 'chime',
      description: 'Personal support option for small utility boosts.',
      url: 'https://www.chime.com',
      value: '$DevSkits',
      copyValue: '$DevSkits',
      openLabel: 'Open Chime'
    }
  ];

  const contacts = [
    { id: 'name', label: 'Name', value: profile.name, type: 'text', icon: 'person' },
    { id: 'brand', label: 'Brand', value: profile.brand, type: 'text', icon: 'location' },
    { id: 'title', label: 'Title', value: profile.title, type: 'text', icon: 'document' },
    { id: 'github', label: 'GitHub', value: 'https://github.com/DevSkits916', type: 'url', icon: 'github', copyValue: 'github.com/DevSkits916', description: 'Main code and project home.' },
    { id: 'facebook', label: 'Facebook', value: 'https://facebook.com/DevSkits', type: 'url', icon: 'facebook', copyValue: 'facebook.com/DevSkits', description: 'Social updates and public posts.' },
    { id: 'reddit', label: 'Reddit', value: 'https://www.reddit.com/u/DevSkits/s/RE9W0sZoV1', type: 'url', icon: 'reddit', copyValue: 'reddit.com/u/DevSkits', description: 'Reddit profile and community threads.' },
    { id: 'twitter', label: 'X / Twitter', value: 'https://x.com/DevSkits916', type: 'url', icon: 'x', copyValue: '@DevSkits916', description: 'Short updates and launch posts.' },
    { id: 'email', label: 'Email', value: 'DevSkits@icloud.com', type: 'email', icon: 'email', copyValue: 'DevSkits@icloud.com', description: 'Best direct contact for collabs and questions.' },
    { id: 'phone', label: 'Phone', value: '916-420-3052', type: 'phone', icon: 'phone', copyValue: '916-420-3052', description: 'Direct call or text.' }
  ];

  const projectLinks = [
    {
      id: 'github-main',
      label: 'DevSkits GitHub',
      icon: 'github',
      category: 'Projects',
      type: 'url',
      url: 'https://github.com/DevSkits916',
      description: 'Main source hub for DevSkits projects.',
      searchText: 'github code repo repository devskits',
      primaryProfile: true
    },
    {
      id: 'projects-app',
      label: 'Projects App',
      icon: 'projects',
      category: 'Projects',
      type: 'app',
      url: 'devskits://projects',
      description: 'Open the internal project browser inside DevSkits OS.',
      searchText: 'internal projects launcher app'
    },
    {
      id: 'contact-app',
      label: 'Contact Card',
      icon: 'person',
      category: 'Contact',
      type: 'app',
      url: 'devskits://contact',
      description: 'Open the built-in contact card and vCard tools.',
      searchText: 'contact card email phone'
    }
  ];

  const links = [
    {
      id: 'github',
      label: 'GitHub',
      icon: 'github',
      category: 'Social',
      type: 'url',
      url: 'https://github.com/DevSkits916',
      copyValue: 'github.com/DevSkits916',
      description: 'Code, builds, and repo updates.',
      primaryProfile: true,
      searchText: 'github social repo code'
    },
    {
      id: 'facebook',
      label: 'Facebook',
      icon: 'facebook',
      category: 'Social',
      type: 'url',
      url: 'https://facebook.com/DevSkits',
      copyValue: 'facebook.com/DevSkits',
      description: 'Public profile and community posts.',
      primaryProfile: true,
      searchText: 'facebook social page'
    },
    {
      id: 'reddit',
      label: 'Reddit',
      icon: 'reddit',
      category: 'Social',
      type: 'url',
      url: 'https://www.reddit.com/u/DevSkits/s/RE9W0sZoV1',
      copyValue: 'reddit.com/u/DevSkits',
      description: 'Profile posts and Reddit presence.',
      primaryProfile: true,
      searchText: 'reddit social community'
    },
    {
      id: 'twitter',
      label: 'X / Twitter',
      icon: 'x',
      category: 'Social',
      type: 'url',
      url: 'https://x.com/DevSkits916',
      copyValue: '@DevSkits916',
      description: 'Short-form updates and launch announcements.',
      primaryProfile: true,
      searchText: 'twitter x social updates'
    },
    {
      id: 'email',
      label: 'Email',
      icon: 'email',
      category: 'Contact',
      type: 'email',
      url: 'mailto:DevSkits@icloud.com',
      value: 'DevSkits@icloud.com',
      copyValue: 'DevSkits@icloud.com',
      description: 'Direct inbox for work, questions, and collabs.',
      searchText: 'email contact inbox'
    },
    {
      id: 'phone',
      label: 'Phone',
      icon: 'phone',
      category: 'Contact',
      type: 'phone',
      url: 'tel:916-420-3052',
      value: '916-420-3052',
      copyValue: '916-420-3052',
      description: 'Call or text directly.',
      searchText: 'phone contact mobile'
    },
    ...projectLinks
  ];

  const SYSTEM_DATA = {
    profile,
    contacts,
    supportMethods,
    links,
    about: {
      version: '2.0.0',
      codename: 'RetroShell 2',
      features: ['Windowed desktop shell + start menu', 'Terminal, faux filesystem, and Navigator routes', 'Standalone productivity and creator apps', 'Updater, process monitor, logs, profile, and presence tools', 'LocalStorage persistence for notes, reminders, drafts, quotes, and settings'],
      changelog: ['Consolidated bundled apps into standalone modules', 'Standardized app ids, aliases, and launcher visibility', 'Aligned terminal commands and docs with the live feature set']
    }
  };

  window.DevSkitsSystemData = SYSTEM_DATA;
})();
