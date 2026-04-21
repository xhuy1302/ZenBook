export const categories = [
  { id: 1, name: 'Technology', icon: 'Cpu' },
  { id: 2, name: 'Literature', icon: 'BookOpen' },
  { id: 3, name: 'Economics', icon: 'TrendingUp' },
  { id: 4, name: 'Self-Help', icon: 'Lightbulb' },
  { id: 5, name: 'Kids & Family', icon: 'Baby' },
  { id: 6, name: 'Comics & Manga', icon: 'Smile' },
  { id: 7, name: 'History', icon: 'Globe' },
  { id: 8, name: 'Science', icon: 'Microscope' },
  { id: 9, name: 'Philosophy', icon: 'Brain' },
  { id: 10, name: 'Arts & Design', icon: 'Palette' },
  { id: 11, name: 'Biography', icon: 'User' },
  { id: 12, name: 'Travel', icon: 'Map' }
]

export const heroBanners = [
  {
    id: 1,
    image: '/images/hero-1.jpg',
    title: 'Discover Your Next\nGreat Read',
    subtitle: 'Thousands of titles across every genre',
    cta: 'Shop Now',
    badge: 'New Collection 2025'
  },
  {
    id: 2,
    image: '/images/hero-2.jpg',
    title: 'Read More.\nLive Better.',
    subtitle: 'Hand-picked selections from expert curators',
    cta: 'Explore Books',
    badge: "Editor's Choice"
  },
  {
    id: 3,
    image: '/images/hero-3.jpg',
    title: 'Flash Sale\nUp to 50% Off',
    subtitle: 'Limited time offers on bestsellers',
    cta: 'View Deals',
    badge: 'Sale Ends Soon'
  }
]

export interface Book {
  id: number
  title: string
  author: string
  cover: string
  price: number
  originalPrice?: number
  discount?: number
  rating: number
  reviews: number
  stock?: number
  maxStock?: number
  badge?: string
  isNew?: boolean
  award?: string
}

export const flashSaleBooks: Book[] = [
  {
    id: 101,
    title: 'Atomic Habits',
    author: 'James Clear',
    cover: '/images/book-1.jpg',
    price: 9.99,
    originalPrice: 16.99,
    discount: 41,
    rating: 4.8,
    reviews: 2341,
    stock: 14,
    maxStock: 50
  },
  {
    id: 102,
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    cover: '/images/book-2.jpg',
    price: 11.49,
    originalPrice: 18.99,
    discount: 40,
    rating: 4.7,
    reviews: 1892,
    stock: 8,
    maxStock: 40
  },
  {
    id: 103,
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    cover: '/images/book-3.jpg',
    price: 12.99,
    originalPrice: 22.0,
    discount: 41,
    rating: 4.6,
    reviews: 3102,
    stock: 21,
    maxStock: 60
  },
  {
    id: 104,
    title: 'The Midnight Library',
    author: 'Matt Haig',
    cover: '/images/book-4.jpg',
    price: 10.49,
    originalPrice: 17.99,
    discount: 42,
    rating: 4.5,
    reviews: 1556,
    stock: 5,
    maxStock: 30
  },
  {
    id: 105,
    title: 'Deep Work',
    author: 'Cal Newport',
    cover: '/images/book-5.jpg',
    price: 13.99,
    originalPrice: 24.0,
    discount: 42,
    rating: 4.7,
    reviews: 987,
    stock: 19,
    maxStock: 45
  },
  {
    id: 106,
    title: 'The Little Prince',
    author: 'Antoine de Saint-Exupery',
    cover: '/images/book-6.jpg',
    price: 7.49,
    originalPrice: 12.99,
    discount: 42,
    rating: 4.9,
    reviews: 5200,
    stock: 32,
    maxStock: 80
  }
]

export const trendingBooks: Book[] = [
  {
    id: 201,
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    cover: '/images/book-7.jpg',
    price: 15.99,
    rating: 4.7,
    reviews: 4120,
    isNew: false
  },
  {
    id: 202,
    title: 'The 4-Hour Work Week',
    author: 'Tim Ferriss',
    cover: '/images/book-8.jpg',
    price: 13.49,
    rating: 4.4,
    reviews: 2890
  },
  {
    id: 203,
    title: 'Atomic Habits',
    author: 'James Clear',
    cover: '/images/book-1.jpg',
    price: 16.99,
    rating: 4.8,
    reviews: 2341
  },
  {
    id: 204,
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    cover: '/images/book-2.jpg',
    price: 18.99,
    rating: 4.7,
    reviews: 1892
  },
  {
    id: 205,
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    cover: '/images/book-3.jpg',
    price: 22.0,
    rating: 4.6,
    reviews: 3102
  },
  {
    id: 206,
    title: 'The Midnight Library',
    author: 'Matt Haig',
    cover: '/images/book-4.jpg',
    price: 17.99,
    rating: 4.5,
    reviews: 1556
  },
  {
    id: 207,
    title: 'Deep Work',
    author: 'Cal Newport',
    cover: '/images/book-5.jpg',
    price: 24.0,
    rating: 4.7,
    reviews: 987
  },
  {
    id: 208,
    title: 'The Little Prince',
    author: 'Antoine de Saint-Exupery',
    cover: '/images/book-6.jpg',
    price: 12.99,
    rating: 4.9,
    reviews: 5200
  }
]

export const awardWinners: Book[] = [
  {
    id: 301,
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    cover: '/images/book-7.jpg',
    price: 15.99,
    rating: 4.7,
    reviews: 4120,
    award: 'National Book Award'
  },
  {
    id: 302,
    title: 'The 4-Hour Work Week',
    author: 'Tim Ferriss',
    cover: '/images/book-8.jpg',
    price: 13.49,
    rating: 4.4,
    reviews: 2890,
    award: 'Business Book of the Year'
  },
  {
    id: 303,
    title: 'Atomic Habits',
    author: 'James Clear',
    cover: '/images/book-1.jpg',
    price: 16.99,
    rating: 4.8,
    reviews: 2341,
    award: 'Goodreads Choice Award'
  },
  {
    id: 304,
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    cover: '/images/book-3.jpg',
    price: 22.0,
    rating: 4.6,
    reviews: 3102,
    award: 'Nobel Prize Author'
  }
]

export const recentlyViewed: Book[] = [
  {
    id: 401,
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    cover: '/images/book-2.jpg',
    price: 18.99,
    rating: 4.7,
    reviews: 1892
  },
  {
    id: 402,
    title: 'The Midnight Library',
    author: 'Matt Haig',
    cover: '/images/book-4.jpg',
    price: 17.99,
    rating: 4.5,
    reviews: 1556
  },
  {
    id: 403,
    title: 'Deep Work',
    author: 'Cal Newport',
    cover: '/images/book-5.jpg',
    price: 24.0,
    rating: 4.7,
    reviews: 987
  },
  {
    id: 404,
    title: 'The Little Prince',
    author: 'Antoine de Saint-Exupery',
    cover: '/images/book-6.jpg',
    price: 12.99,
    rating: 4.9,
    reviews: 5200
  }
]

export const testimonials = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    location: 'New York, USA',
    rating: 5,
    comment:
      'ZenBook has completely changed how I shop for books. The curation is excellent and delivery is always faster than expected. My go-to bookstore!',
    avatar: 'SM'
  },
  {
    id: 2,
    name: 'David Chen',
    location: 'San Francisco, USA',
    rating: 5,
    comment:
      "I've discovered so many hidden gems through ZenBook's recommendation engine. The flash sales are incredible—I saved 40% on my last order.",
    avatar: 'DC'
  },
  {
    id: 3,
    name: 'Emma Rodriguez',
    location: 'London, UK',
    rating: 4,
    comment:
      'The selection is vast and the interface is clean. I love the category browsing feature. Shipping to the UK is reliable and well-packaged.',
    avatar: 'ER'
  }
]

export const publishers = [
  { id: 1, name: 'Oxford University Press' },
  { id: 2, name: 'Penguin Random House' },
  { id: 3, name: 'HarperCollins' },
  { id: 4, name: 'Pearson Education' },
  { id: 5, name: 'Macmillan Publishers' },
  { id: 6, name: 'Simon & Schuster' },
  { id: 7, name: 'Scholastic' },
  { id: 8, name: 'Hachette Book Group' }
]
