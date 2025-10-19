/**
 * Action Injector
 *
 * Automatically injects action cards and containers into AI responses based on keyword detection.
 * This allows the AI to trigger interactive components without explicitly using custom syntax.
 */

export interface InjectionRule {
  // Patterns to match (all must match for rule to trigger)
  patterns: RegExp[]
  // Type of injection
  type: 'action' | 'container' | 'multi-choice'
  // Component configuration
  config: {
    title?: string
    description?: string
    content?: string
    variant?: string
    icon?: string
    buttonText?: string
    // Multi-choice specific
    question?: string
    choiceType?: 'single' | 'multiple'
    options?: string[]
  }
  // Where to inject (before or after the text)
  position?: 'before' | 'after'
  // Only inject once per response
  once?: boolean
  // Category for organization
  category?: string
  // Priority (higher = inject first)
  priority?: number
}

/**
 * Default injection rules organized by category
 */
const defaultRules: InjectionRule[] = [
  // ========================================
  // CATEGORY: Account Management
  // ========================================

  // Login
  {
    patterns: [/(log in|login|sign in|signin)/i],
    type: 'action',
    category: 'account',
    priority: 90,
    config: {
      title: 'Login',
      description: 'Sign in to your account',
      variant: 'primary',
      icon: '🔑',
      buttonText: 'Sign In'
    },
    position: 'after',
    once: true
  },

  // Logout
  {
    patterns: [/(log out|logout|sign out|signout)/i],
    type: 'action',
    category: 'account',
    priority: 85,
    config: {
      title: 'Logout',
      description: 'Sign out of your account',
      variant: 'default',
      icon: '🚪',
      buttonText: 'Sign Out'
    },
    position: 'after',
    once: true
  },

  // Password Reset
  {
    patterns: [/password/i, /(reset|recover|forgot|forgotten)/i],
    type: 'action',
    category: 'account',
    priority: 95,
    config: {
      title: 'Reset Password',
      description: 'Send reset link to your email',
      variant: 'primary',
      icon: '🔐',
      buttonText: 'Reset'
    },
    position: 'after',
    once: true
  },

  // Profile Settings
  {
    patterns: [/(profile|account).*settings/i],
    type: 'action',
    category: 'account',
    priority: 80,
    config: {
      title: 'Profile Settings',
      description: 'Manage your profile',
      variant: 'default',
      icon: '⚙️',
      buttonText: 'Settings'
    },
    position: 'after',
    once: true
  },

  // Account Deletion
  {
    patterns: [/(delete|remove|close).*account/i],
    type: 'action',
    category: 'account',
    priority: 100,
    config: {
      title: 'Delete Account',
      description: 'This action cannot be undone',
      variant: 'danger',
      icon: '⚠️',
      buttonText: 'Delete'
    },
    position: 'after',
    once: true
  },

  // ========================================
  // CATEGORY: Support & Help
  // ========================================

  // Contact Support
  {
    patterns: [/(contact|call|reach|talk).*support/i],
    type: 'action',
    category: 'support',
    priority: 90,
    config: {
      title: 'Contact Support',
      description: 'Get help from our team',
      variant: 'primary',
      icon: '💬',
      buttonText: 'Contact'
    },
    position: 'after',
    once: true
  },

  // View Documentation
  {
    patterns: [/(documentation|docs|guide)/i],
    type: 'action',
    category: 'support',
    priority: 70,
    config: {
      title: 'View Documentation',
      description: 'Read the full guide',
      variant: 'default',
      icon: '📚',
      buttonText: 'View Docs'
    },
    position: 'after',
    once: true
  },

  // FAQ
  {
    patterns: [/(faq|frequently asked|common questions)/i],
    type: 'action',
    category: 'support',
    priority: 75,
    config: {
      title: 'View FAQ',
      description: 'Find answers to common questions',
      variant: 'default',
      icon: '❓',
      buttonText: 'View FAQ'
    },
    position: 'after',
    once: true
  },

  // Tutorial
  {
    patterns: [/(tutorial|walkthrough|getting started)/i],
    type: 'action',
    category: 'support',
    priority: 72,
    config: {
      title: 'Start Tutorial',
      description: 'Learn step by step',
      variant: 'primary',
      icon: '🎓',
      buttonText: 'Start'
    },
    position: 'after',
    once: true
  },

  // ========================================
  // CATEGORY: Data & Files
  // ========================================

  // Download
  {
    patterns: [/download/i, /(report|file|data|document)/i],
    type: 'action',
    category: 'data',
    priority: 85,
    config: {
      title: 'Download',
      description: 'Get your file',
      variant: 'success',
      icon: '⬇️',
      buttonText: 'Download'
    },
    position: 'after',
    once: true
  },

  // Export
  {
    patterns: [/export/i, /(csv|pdf|excel|json)/i],
    type: 'action',
    category: 'data',
    priority: 83,
    config: {
      title: 'Export Data',
      description: 'Export to file format',
      variant: 'success',
      icon: '📤',
      buttonText: 'Export'
    },
    position: 'after',
    once: true
  },

  // Import
  {
    patterns: [/import/i, /(upload|file|data)/i],
    type: 'action',
    category: 'data',
    priority: 82,
    config: {
      title: 'Import Data',
      description: 'Upload your files',
      variant: 'primary',
      icon: '📥',
      buttonText: 'Import'
    },
    position: 'after',
    once: true
  },

  // Backup
  {
    patterns: [/(backup|save|archive)/i, /data/i],
    type: 'action',
    category: 'data',
    priority: 80,
    config: {
      title: 'Backup Data',
      description: 'Create a backup',
      variant: 'default',
      icon: '💾',
      buttonText: 'Backup'
    },
    position: 'after',
    once: true
  },

  // ========================================
  // CATEGORY: Commerce
  // ========================================

  // Upgrade
  {
    patterns: [/(upgrade|premium|pro)/i],
    type: 'action',
    category: 'commerce',
    priority: 88,
    config: {
      title: 'Upgrade to Premium',
      description: 'Unlock all features',
      variant: 'success',
      icon: '⭐',
      buttonText: 'Upgrade'
    },
    position: 'after',
    once: true
  },

  // Subscribe
  {
    patterns: [/(subscribe|subscription)/i, /(plan|newsletter)/i],
    type: 'action',
    category: 'commerce',
    priority: 85,
    config: {
      title: 'Subscribe',
      description: 'Join our community',
      variant: 'primary',
      icon: '✉️',
      buttonText: 'Subscribe'
    },
    position: 'after',
    once: true
  },

  // Purchase/Buy
  {
    patterns: [/(purchase|buy|checkout)/i],
    type: 'action',
    category: 'commerce',
    priority: 90,
    config: {
      title: 'Complete Purchase',
      description: 'Proceed to checkout',
      variant: 'success',
      icon: '🛒',
      buttonText: 'Buy Now'
    },
    position: 'after',
    once: true
  },

  // ========================================
  // CATEGORY: Communication
  // ========================================

  // Send Email
  {
    patterns: [/(send|compose).*email/i],
    type: 'action',
    category: 'communication',
    priority: 85,
    config: {
      title: 'Send Email',
      description: 'Compose and send',
      variant: 'primary',
      icon: '📧',
      buttonText: 'Send'
    },
    position: 'after',
    once: true
  },

  // Share
  {
    patterns: [/(share|sharing)/i],
    type: 'action',
    category: 'communication',
    priority: 80,
    config: {
      title: 'Share',
      description: 'Share with others',
      variant: 'default',
      icon: '🔗',
      buttonText: 'Share'
    },
    position: 'after',
    once: true
  },

  // Invite
  {
    patterns: [/(invite|invitation)/i, /(user|team|friend)/i],
    type: 'action',
    category: 'communication',
    priority: 82,
    config: {
      title: 'Send Invite',
      description: 'Invite someone',
      variant: 'primary',
      icon: '👥',
      buttonText: 'Invite'
    },
    position: 'after',
    once: true
  },

  // ========================================
  // CATEGORY: Scheduling
  // ========================================

  // Schedule Meeting
  {
    patterns: [/(schedule|book|arrange)/i, /(meeting|appointment|call)/i],
    type: 'action',
    category: 'scheduling',
    priority: 88,
    config: {
      title: 'Schedule Meeting',
      description: 'Book a time slot',
      variant: 'primary',
      icon: '📅',
      buttonText: 'Schedule'
    },
    position: 'after',
    once: true
  },

  // Calendar
  {
    patterns: [/(view|check|open).*calendar/i],
    type: 'action',
    category: 'scheduling',
    priority: 75,
    config: {
      title: 'View Calendar',
      description: 'See your schedule',
      variant: 'default',
      icon: '📆',
      buttonText: 'Open Calendar'
    },
    position: 'after',
    once: true
  },

  // ========================================
  // CATEGORY: Notifications
  // ========================================

  // Enable Notifications
  {
    patterns: [/(enable|turn on|activate).*notifications/i],
    type: 'action',
    category: 'notifications',
    priority: 85,
    config: {
      title: 'Enable Notifications',
      description: 'Stay updated',
      variant: 'primary',
      icon: '🔔',
      buttonText: 'Enable'
    },
    position: 'after',
    once: true
  },

  // Notification Settings
  {
    patterns: [/notification.*settings/i],
    type: 'action',
    category: 'notifications',
    priority: 78,
    config: {
      title: 'Notification Settings',
      description: 'Manage your alerts',
      variant: 'default',
      icon: '⚙️',
      buttonText: 'Settings'
    },
    position: 'after',
    once: true
  },

  // ========================================
  // CATEGORY: Development
  // ========================================

  // Deploy
  {
    patterns: [/(deploy|deployment)/i, /(production|live|server)/i],
    type: 'action',
    category: 'development',
    priority: 90,
    config: {
      title: 'Deploy Now',
      description: 'Deploy to production',
      variant: 'success',
      icon: '🚀',
      buttonText: 'Deploy'
    },
    position: 'after',
    once: true
  },

  // Run Tests
  {
    patterns: [/(run|execute).*tests/i],
    type: 'action',
    category: 'development',
    priority: 85,
    config: {
      title: 'Run Tests',
      description: 'Execute test suite',
      variant: 'primary',
      icon: '🧪',
      buttonText: 'Run'
    },
    position: 'after',
    once: true
  },

  // Debug
  {
    patterns: [/(debug|debugging|troubleshoot)/i],
    type: 'action',
    category: 'development',
    priority: 82,
    config: {
      title: 'Start Debugging',
      description: 'Debug your code',
      variant: 'warning',
      icon: '🐛',
      buttonText: 'Debug'
    },
    position: 'after',
    once: true
  },

  // ========================================
  // CATEGORY: System
  // ========================================

  // Refresh
  {
    patterns: [/(refresh|reload|update page)/i],
    type: 'action',
    category: 'system',
    priority: 75,
    config: {
      title: 'Refresh',
      description: 'Reload the page',
      variant: 'default',
      icon: '🔄',
      buttonText: 'Refresh'
    },
    position: 'after',
    once: true
  },

  // Sync
  {
    patterns: [/(sync|synchronize)/i],
    type: 'action',
    category: 'system',
    priority: 80,
    config: {
      title: 'Sync Data',
      description: 'Synchronize your data',
      variant: 'primary',
      icon: '🔄',
      buttonText: 'Sync'
    },
    position: 'after',
    once: true
  },

  // ========================================
  // CATEGORY: Multi-Choice Questions
  // ========================================

  // Experience Rating
  {
    patterns: [/(rate|rating|experience|satisfaction)/i, /(how|what).*think/i],
    type: 'multi-choice',
    category: 'feedback',
    priority: 85,
    config: {
      question: 'How would you rate your experience?',
      choiceType: 'single',
      options: [
        'Excellent:Best experience ever!',
        'Good:Pretty satisfied',
        'Okay:Could be better',
        'Poor:Not happy at all'
      ],
      variant: 'primary'
    },
    position: 'after',
    once: true
  },

  // Feature Preferences
  {
    patterns: [/(feature|features)/i, /(want|need|prefer|interested)/i],
    type: 'multi-choice',
    category: 'preferences',
    priority: 80,
    config: {
      question: 'Which features are you most interested in?',
      choiceType: 'multiple',
      options: [
        'Dark Mode:Toggle dark theme',
        'Email Notifications:Stay updated via email',
        'Export Data:Download your data',
        'Advanced Analytics:Detailed insights'
      ],
      variant: 'primary'
    },
    position: 'after',
    once: true
  },

  // Feedback Type
  {
    patterns: [/(feedback|comment|suggestion)/i],
    type: 'multi-choice',
    category: 'feedback',
    priority: 82,
    config: {
      question: 'What type of feedback would you like to share?',
      choiceType: 'single',
      options: [
        'Bug Report:Something is broken',
        'Feature Request:Suggest a new feature',
        'General Comment:Share your thoughts',
        'Compliment:Say something nice'
      ],
      variant: 'info'
    },
    position: 'after',
    once: true
  },

  // Plan Selection
  {
    patterns: [/(plan|plans|pricing)/i, /(choose|select|which)/i],
    type: 'multi-choice',
    category: 'commerce',
    priority: 88,
    config: {
      question: 'Which plan works best for you?',
      choiceType: 'single',
      options: [
        'Free:Basic features',
        'Pro:Advanced features - $9/mo',
        'Team:Collaboration tools - $29/mo',
        'Enterprise:Custom solution'
      ],
      variant: 'success'
    },
    position: 'after',
    once: true
  },

  // Contact Method
  {
    patterns: [/(contact|reach|get in touch)/i, /(how|way|method)/i],
    type: 'multi-choice',
    category: 'support',
    priority: 78,
    config: {
      question: 'How would you prefer to be contacted?',
      choiceType: 'multiple',
      options: [
        'Email:Via email address',
        'Phone:Phone call',
        'Chat:Live chat support',
        'SMS:Text message'
      ],
      variant: 'default'
    },
    position: 'after',
    once: true
  },

  // Survey/Poll
  {
    patterns: [/(survey|poll|questionnaire)/i],
    type: 'multi-choice',
    category: 'feedback',
    priority: 85,
    config: {
      question: 'Quick poll: How often do you use this feature?',
      choiceType: 'single',
      options: [
        'Daily',
        'Weekly',
        'Monthly',
        'Rarely'
      ],
      variant: 'info'
    },
    position: 'after',
    once: true
  },

  // ========================================
  // CONTAINERS
  // ========================================

  // Warning
  {
    patterns: [/(warning|caution|careful|attention)/i],
    type: 'container',
    category: 'status',
    priority: 95,
    config: {
      title: 'Important Notice',
      variant: 'warning'
    },
    position: 'before',
    once: true
  },

  // Error
  {
    patterns: [/(error|failed|failure)/i],
    type: 'container',
    category: 'status',
    priority: 98,
    config: {
      title: 'Error Detected',
      variant: 'error'
    },
    position: 'before',
    once: true
  },

  // Success
  {
    patterns: [/(success|completed|done)/i, /(successfully|complete)/i],
    type: 'container',
    category: 'status',
    priority: 90,
    config: {
      title: 'Success',
      variant: 'success'
    },
    position: 'before',
    once: true
  },

  // Info/Tips
  {
    patterns: [/(tip|hint|note|info)/i],
    type: 'container',
    category: 'status',
    priority: 70,
    config: {
      title: 'Pro Tip',
      variant: 'info'
    },
    position: 'before',
    once: true
  }
]

/**
 * Check if a rule matches the text
 */
function ruleMatches(text: string, rule: InjectionRule): boolean {
  return rule.patterns.every(pattern => pattern.test(text))
}

/**
 * Generate the injection syntax for a rule
 */
function generateInjection(rule: InjectionRule, extractedText?: string): string {
  if (rule.type === 'action') {
    const { title, description, variant, icon, buttonText } = rule.config
    // Extended syntax to include icon and buttonText metadata
    let syntax = `[action: ${title} | ${description || ''} | ${variant || 'default'}`
    if (icon) syntax += ` | icon:${icon}`
    if (buttonText) syntax += ` | button:${buttonText}`
    syntax += ']'
    return syntax
  } else if (rule.type === 'container') {
    const { title, variant, content } = rule.config
    const containerContent = content || extractedText || 'See details above'
    return `[container: ${variant || 'info'} | ${title} | ${containerContent}]`
  } else if (rule.type === 'multi-choice') {
    const { question, choiceType, options, variant } = rule.config
    const optionsStr = options?.join(', ') || ''
    return `[multi-choice: ${question} | ${choiceType || 'single'} | ${optionsStr} | ${variant || 'default'}]`
  }
  return ''
}

/**
 * Extract relevant text for container content
 */
function extractRelevantText(text: string, rule: InjectionRule): string {
  // For containers, try to extract the sentence containing the matched pattern
  const sentences = text.split(/[.!?]+/)

  for (const sentence of sentences) {
    if (ruleMatches(sentence, rule)) {
      return sentence.trim()
    }
  }

  // Fallback to first 100 characters
  return text.substring(0, 100) + (text.length > 100 ? '...' : '')
}

/**
 * Inject action cards and containers into text based on keyword detection
 */
export function injectActions(
  text: string,
  rules: InjectionRule[] = defaultRules,
  options: {
    debug?: boolean
    maxInjections?: number
  } = {}
): {
  text: string
  injections: Array<{ rule: InjectionRule; injection: string }>
} {
  const { debug = false, maxInjections = 5 } = options
  const injections: Array<{ rule: InjectionRule; injection: string }> = []
  let processedText = text
  const usedRules = new Set<InjectionRule>()

  // Sort rules by priority (highest first)
  const sortedRules = [...rules].sort((a, b) => {
    const priorityA = a.priority || 50
    const priorityB = b.priority || 50
    return priorityB - priorityA
  })

  for (const rule of sortedRules) {
    // Skip if already used and rule is set to inject once
    if (rule.once && usedRules.has(rule)) {
      continue
    }

    // Skip if max injections reached
    if (injections.length >= maxInjections) {
      break
    }

    // Check if rule matches
    if (!ruleMatches(text, rule)) {
      continue
    }

    // Generate injection
    const extractedText = rule.type === 'container'
      ? extractRelevantText(text, rule)
      : undefined

    const injection = generateInjection(rule, extractedText)

    if (debug) {
      console.log(`[ActionInjector] Matched rule:`, rule)
      console.log(`[ActionInjector] Generated injection:`, injection)
    }

    // Add injection
    if (rule.position === 'before') {
      processedText = `${injection}\n\n${processedText}`
    } else {
      processedText = `${processedText}\n\n${injection}`
    }

    injections.push({ rule, injection })
    usedRules.add(rule)
  }

  if (debug && injections.length > 0) {
    console.log(`[ActionInjector] Total injections: ${injections.length}`)
  }

  return {
    text: processedText,
    injections
  }
}

/**
 * Create a custom rule
 */
export function createRule(config: {
  keywords: string[]
  type: 'action' | 'container' | 'multi-choice'
  title?: string
  description?: string
  content?: string
  variant?: string
  icon?: string
  buttonText?: string
  question?: string
  choiceType?: 'single' | 'multiple'
  options?: string[]
  position?: 'before' | 'after'
  once?: boolean
  requireAll?: boolean
  category?: string
  priority?: number
}): InjectionRule {
  const patterns = config.keywords.map(keyword =>
    new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
  )

  return {
    patterns: config.requireAll ? patterns : [patterns[0]], // If requireAll, use all patterns
    type: config.type,
    config: {
      title: config.title,
      description: config.description,
      content: config.content,
      variant: config.variant,
      icon: config.icon,
      buttonText: config.buttonText,
      question: config.question,
      choiceType: config.choiceType,
      options: config.options
    },
    position: config.position || 'after',
    once: config.once !== false,
    category: config.category,
    priority: config.priority || 50
  }
}

/**
 * Create action handler with mock alert
 */
export function createActionHandler(title: string, variant: string = 'default') {
  return () => {
    const variantEmojis: Record<string, string> = {
      default: 'ℹ️',
      primary: '🔵',
      success: '✅',
      warning: '⚠️',
      danger: '❌'
    }

    const emoji = variantEmojis[variant] || '📌'
    const message = `${emoji} Action Triggered: ${title}\n\n[This is a mock action - no actual operation was performed]`

    alert(message)
  }
}

/**
 * Disable injection for specific response
 */
export function shouldSkipInjection(text: string): boolean {
  // Skip if text already contains custom syntax
  if (text.includes('[action:') || text.includes('[container:') || text.includes('[multi-choice:')) {
    return true
  }

  // Skip if text is too short
  if (text.trim().length < 20) {
    return true
  }

  // Skip if text looks like code only
  if (text.trim().startsWith('```') && text.trim().endsWith('```')) {
    return true
  }

  return false
}

/**
 * Get statistics about injection rules
 */
export function getRuleStats() {
  return {
    totalRules: defaultRules.length,
    actionRules: defaultRules.filter(r => r.type === 'action').length,
    containerRules: defaultRules.filter(r => r.type === 'container').length,
    rules: defaultRules.map(r => ({
      type: r.type,
      patterns: r.patterns.map(p => p.source),
      config: r.config
    }))
  }
}
