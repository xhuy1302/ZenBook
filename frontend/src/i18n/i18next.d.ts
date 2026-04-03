import 'i18next'

import enLogin from './locales/en/login.json'
import enAuth from './locales/en/auth.json'
import enCommon from './locales/en/common.json'
import enProduct from './locales/en/product.json'
import enUser from './locales/en/user.json'
import enCategory from './locales/en/category.json'
import enAuthor from './locales/en/author.json'
import enBreadCrummb from './locales/en/breadcrumb.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      login: typeof enLogin
      auth: typeof enAuth
      common: typeof enCommon
      product: typeof enProduct
      user: typeof enUser
      category: typeof enCategory
      author: typeof enAuthor
      breadcrumb: typeof enBreadCrummb
    }
  }
}
