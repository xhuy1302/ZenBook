import 'i18next'

import enLogin from './locales/en/login.json'
import enAuth from './locales/en/auth.json'
import enCommon from './locales/en/common.json'
import enUser from './locales/en/user.json'
import enCategory from './locales/en/category.json'
import enAuthor from './locales/en/author.json'
import enPublisher from './locales/en/publisher.json'
import enBreadCrummb from './locales/en/breadcrumb.json'
import enProduct from './locales/en/product.json'
import enReceipt from './locales/en/receipt.json'
import enOrder from './locales/en/order.json'
import enPromotion from './locales/en/promotion.json'
import enTag from './locales/en/tag.json'
import enCoupon from './locales/en/coupon.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      login: typeof enLogin
      auth: typeof enAuth
      common: typeof enCommon
      user: typeof enUser
      category: typeof enCategory
      author: typeof enAuthor
      publisher: typeof enPublisher
      breadcrumb: typeof enBreadCrummb
      product: typeof enProduct
      receipt: typeof enReceipt
      order: typeof enOrder
      promotion: typeof enPromotion
      tag: typeof enTag
      coupon: typeof enCoupon
    }
  }
}
