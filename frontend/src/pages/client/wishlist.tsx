'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronRight,
  Heart,
  Package,
  Tag,
  Search,
  Grid,
  List,
  SlidersHorizontal,
  ShoppingCart,
  Eye,
  ArrowRightLeft,
  Star,
  HeartCrack,
  Mail
} from 'lucide-react'

// Tùy chỉnh đường dẫn này theo cấu trúc thư mục shadcn của bạn
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// ==========================================
// 1. TYPES & MOCK DATA
// ==========================================
type Book = {
  id: string
  title: string
  author: string
  coverImage: string
  price: number
  originalPrice?: number
  rating: number
  soldCount: number
  inStock: boolean
  badges: ('Bestseller' | 'Sale' | 'New')[]
  shortDescription: string
}

const MOCK_WISHLIST: Book[] = [
  {
    id: '1',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    coverImage:
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop',
    price: 18.99,
    originalPrice: 24.99,
    rating: 4.8,
    soldCount: 12500,
    inStock: true,
    badges: ['Bestseller', 'Sale'],
    shortDescription: 'A novel about all the choices that go into a life well lived.'
  },
  {
    id: '2',
    title: 'Atomic Habits',
    author: 'James Clear',
    coverImage:
      'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800&auto=format&fit=crop',
    price: 20.0,
    rating: 4.9,
    soldCount: 89000,
    inStock: true,
    badges: ['Bestseller'],
    shortDescription: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones.'
  },
  {
    id: '3',
    title: 'Dune',
    author: 'Frank Herbert',
    coverImage:
      'https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?q=80&w=800&auto=format&fit=crop',
    price: 15.5,
    originalPrice: 19.99,
    rating: 4.7,
    soldCount: 45000,
    inStock: false,
    badges: ['Sale'],
    shortDescription: 'A stunning blend of adventure and mysticism, environmentalism and politics.'
  },
  {
    id: '4',
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    coverImage:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
    price: 22.0,
    rating: 4.8,
    soldCount: 32000,
    inStock: true,
    badges: ['New'],
    shortDescription: 'A lone astronaut must save the earth from disaster.'
  },
  {
    id: '5',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    coverImage:
      'https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=800&auto=format&fit=crop',
    price: 19.5,
    rating: 4.6,
    soldCount: 54000,
    inStock: true,
    badges: [],
    shortDescription:
      'The groundbreaking tour of the mind and explains the two systems that drive the way we think.'
  },
  {
    id: '6',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    coverImage:
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop',
    price: 24.0,
    originalPrice: 30.0,
    rating: 4.8,
    soldCount: 110000,
    inStock: true,
    badges: ['Bestseller', 'Sale'],
    shortDescription: 'A brief history of humankind.'
  },
  {
    id: '7',
    title: '1984',
    author: 'George Orwell',
    coverImage:
      'https://images.unsplash.com/photo-1626618318256-42d87e07a126?q=80&w=800&auto=format&fit=crop',
    price: 12.99,
    rating: 4.5,
    soldCount: 200000,
    inStock: true,
    badges: [],
    shortDescription: 'Among the seminal texts of the 20th century.'
  },
  {
    id: '8',
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    coverImage:
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop',
    price: 14.5,
    rating: 4.7,
    soldCount: 85000,
    inStock: false,
    badges: [],
    shortDescription:
      'A mystical story that teaches us about the essential wisdom of listening to our hearts.'
  }
]

// ==========================================
// 2. SUB-COMPONENTS
// ==========================================

function WishlistHeader() {
  return (
    <div className='flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10'>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className='space-y-4'
      >
        <div className='flex items-center text-sm text-muted-foreground'>
          <span>Home</span>
          <ChevronRight className='w-4 h-4 mx-2' />
          <span className='text-emerald-600 font-medium'>Wishlist</span>
        </div>
        <div>
          <h1 className='text-4xl font-bold tracking-tight text-foreground mb-2'>My Wishlist</h1>
          <p className='text-lg text-muted-foreground'>
            Save your favorite books and revisit them anytime.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className='flex gap-4'
      >
        <Card className='p-4 rounded-2xl flex items-center gap-4 bg-emerald-50/50 border-emerald-100/50 shadow-sm'>
          <div className='p-3 bg-white rounded-xl shadow-sm text-emerald-600'>
            <Heart className='w-5 h-5 fill-emerald-600' />
          </div>
          <div>
            <p className='text-sm font-medium text-muted-foreground'>Total Items</p>
            <p className='text-2xl font-bold text-emerald-950'>8</p>
          </div>
        </Card>
        <Card className='p-4 rounded-2xl flex items-center gap-4 border-slate-100 shadow-sm hidden sm:flex'>
          <div className='p-3 bg-slate-50 rounded-xl text-slate-600'>
            <Package className='w-5 h-5' />
          </div>
          <div>
            <p className='text-sm font-medium text-muted-foreground'>In Stock</p>
            <p className='text-2xl font-bold'>6</p>
          </div>
        </Card>
        <Card className='p-4 rounded-2xl flex items-center gap-4 border-slate-100 shadow-sm hidden md:flex'>
          <div className='p-3 bg-rose-50 rounded-xl text-rose-500'>
            <Tag className='w-5 h-5' />
          </div>
          <div>
            <p className='text-sm font-medium text-muted-foreground'>On Sale</p>
            <p className='text-2xl font-bold'>3</p>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

function WishlistToolbar() {
  return (
    <div className='flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-100'>
      <div className='flex items-center gap-2 w-full sm:w-auto flex-1'>
        <div className='relative w-full max-w-sm'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
          <Input
            placeholder='Search wishlist...'
            className='pl-9 bg-slate-50/50 border-none rounded-xl focus-visible:ring-emerald-500 h-10'
          />
        </div>
        <Button variant='outline' size='icon' className='rounded-xl shrink-0'>
          <SlidersHorizontal className='w-4 h-4' />
        </Button>
      </div>

      <div className='flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end'>
        <Select defaultValue='newest'>
          <SelectTrigger className='w-[160px] rounded-xl bg-slate-50/50 border-none'>
            <SelectValue placeholder='Sort by' />
          </SelectTrigger>
          <SelectContent className='rounded-xl'>
            <SelectItem value='newest'>Newest Added</SelectItem>
            <SelectItem value='price-asc'>Price: Low to High</SelectItem>
            <SelectItem value='price-desc'>Price: High to Low</SelectItem>
            <SelectItem value='rating'>Highest Rated</SelectItem>
          </SelectContent>
        </Select>

        <Tabs defaultValue='grid' className='w-[100px]'>
          <TabsList className='grid w-full grid-cols-2 rounded-xl h-10 bg-slate-50'>
            <TabsTrigger value='grid' className='rounded-lg'>
              <Grid className='w-4 h-4' />
            </TabsTrigger>
            <TabsTrigger value='list' className='rounded-lg'>
              <List className='w-4 h-4' />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}

function WishlistCard({ book, index }: { book: Book; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className='group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-[0_8px_30px_rgb(16,185,129,0.08)] transition-all duration-300'
    >
      {/* Cover Image & Hover Actions */}
      <div className='relative aspect-[3/4] overflow-hidden bg-slate-50'>
        <img
          src={book.coverImage}
          alt={book.title}
          className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out'
        />

        {/* Badges */}
        <div className='absolute top-4 left-4 flex flex-col gap-2'>
          {book.badges.map((badge) => (
            <Badge
              key={badge}
              className={`rounded-md font-semibold ${
                badge === 'Sale'
                  ? 'bg-rose-500 hover:bg-rose-600'
                  : badge === 'New'
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-emerald-500 hover:bg-emerald-600'
              }`}
            >
              {badge}
            </Badge>
          ))}
        </div>

        {/* Action Overlay */}
        <div className='absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 bg-gradient-to-t from-black/60 to-transparent flex justify-center gap-2'>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size='icon'
                  variant='secondary'
                  className='rounded-xl w-10 h-10 hover:bg-emerald-500 hover:text-white transition-colors'
                >
                  <Eye className='w-4 h-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent className='rounded-lg'>Quick View</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size='icon'
                  variant='secondary'
                  className='rounded-xl w-10 h-10 hover:bg-emerald-500 hover:text-white transition-colors'
                >
                  <ArrowRightLeft className='w-4 h-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent className='rounded-lg'>Compare</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Remove Button */}
        <button className='absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-transform'>
          <Heart className='w-5 h-5 fill-rose-500 text-rose-500' />
        </button>
      </div>

      {/* Content */}
      <div className='p-5 flex flex-col flex-1'>
        <div className='flex items-center justify-between mb-2'>
          <p className='text-xs font-medium text-slate-500'>{book.author}</p>
          <div className='flex items-center gap-1'>
            <Star className='w-3.5 h-3.5 fill-amber-400 text-amber-400' />
            <span className='text-xs font-medium'>{book.rating}</span>
          </div>
        </div>

        <h3 className='font-semibold text-lg text-slate-900 line-clamp-1 mb-1'>{book.title}</h3>
        <p className='text-sm text-slate-500 line-clamp-2 mb-4 flex-1'>{book.shortDescription}</p>

        <div className='flex items-center justify-between mt-auto pt-4 border-t border-slate-100'>
          <div className='flex flex-col'>
            <div className='flex items-center gap-2'>
              <span className='font-bold text-lg text-emerald-600'>${book.price.toFixed(2)}</span>
              {book.originalPrice && (
                <span className='text-sm text-slate-400 line-through'>
                  ${book.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider ${book.inStock ? 'text-emerald-500' : 'text-rose-500'}`}
            >
              {book.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <Button
            disabled={!book.inStock}
            className='rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 px-4 h-10'
          >
            <ShoppingCart className='w-4 h-4 mr-2' />
            Add
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

function WishlistEmpty() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className='flex flex-col items-center justify-center py-20 px-4 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200'
    >
      <div className='w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-6'>
        <HeartCrack className='w-12 h-12 text-rose-300' />
      </div>
      <h2 className='text-2xl font-bold text-slate-900 mb-2'>Your wishlist is empty</h2>
      <p className='text-slate-500 max-w-md mb-8'>
        Looks like you haven't added any books to your wishlist yet. Discover our top picks and save
        your favorites!
      </p>
      <Button className='rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-8 text-base'>
        Continue Shopping
      </Button>
    </motion.div>
  )
}

function NewsletterSection() {
  return (
    <div className='mt-20 relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-500 to-emerald-700 px-6 py-16 sm:px-16 sm:py-20 flex flex-col items-center text-center shadow-2xl shadow-emerald-600/20'>
      {/* Decorative background shapes */}
      <div className='absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl'></div>
      <div className='absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl'></div>

      <div className='relative z-10 max-w-2xl'>
        <div className='w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6'>
          <Mail className='w-6 h-6 text-white' />
        </div>
        <h2 className='text-3xl sm:text-4xl font-bold text-white mb-4'>
          Stay Updated with ZenBook
        </h2>
        <p className='text-emerald-50 text-lg mb-8'>
          Get notified about new releases, exclusive offers, and personalized book recommendations.
        </p>
        <div className='flex flex-col sm:flex-row gap-3 max-w-md mx-auto w-full'>
          <Input
            placeholder='Enter your email'
            className='h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-emerald-100 focus-visible:ring-white/50 w-full'
          />
          <Button className='h-12 rounded-xl bg-white text-emerald-700 hover:bg-slate-50 px-8 font-semibold w-full sm:w-auto'>
            Subscribe
          </Button>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 3. MAIN PAGE EXPORT
// ==========================================

export default function WishlistPage() {
  // Thay đổi cái này thành false để xem giao diện Empty State
  const [hasItems] = useState(true)
  const displayItems = hasItems ? MOCK_WISHLIST : []

  return (
    <div className='min-h-screen bg-[#fafafa] py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-emerald-200 selection:text-emerald-900'>
      <div className='max-w-7xl mx-auto'>
        <WishlistHeader />

        {displayItems.length > 0 ? (
          <>
            <WishlistToolbar />
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              {displayItems.map((book, index) => (
                <WishlistCard key={book.id} book={book} index={index} />
              ))}
            </div>
          </>
        ) : (
          <WishlistEmpty />
        )}

        <NewsletterSection />
      </div>
    </div>
  )
}
