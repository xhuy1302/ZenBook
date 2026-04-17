'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Search, X, Plus, Minus, PackageOpen, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { BookStatus } from '@/defines/book.enum'
import { getAllBooksApi } from '@/services/book/book.api'
import type { BookResponse } from '@/services/book/book.type'

export interface SelectedBook {
  bookId: string
  quantity: number
}

interface BookSelectorProps {
  value: SelectedBook[]
  onChange: (value: SelectedBook[]) => void
}

export function BookSelector({ value, onChange }: BookSelectorProps) {
  useTranslation('order')
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBooks, setSelectedBooks] = useState<Map<string, number>>(() => {
    const map = new Map<string, number>()
    value.forEach((item) => map.set(item.bookId, item.quantity))
    return map
  })

  // Lấy danh sách sách đang active, còn hàng
  const { data: booksData = [], isLoading } = useQuery({
    queryKey: ['books', 'active'],
    queryFn: getAllBooksApi
  })

  const books = booksData.filter(
    (book: BookResponse) => book.status === BookStatus.ACTIVE && book.stockQuantity > 0
  )

  const filteredBooks = useMemo(() => {
    if (!searchTerm.trim()) return books
    const lower = searchTerm.toLowerCase()
    return books.filter(
      (b: BookResponse) =>
        b.title.toLowerCase().includes(lower) || b.isbn?.toLowerCase().includes(lower)
    )
  }, [books, searchTerm])

  const handleQuantityChange = (bookId: string, inputVal: string) => {
    const book = books.find((b: BookResponse) => b.id === bookId)
    if (!book) return

    // Nếu rỗng, set bằng 0 để xóa đi, nếu không thì ép về số
    let validQty = inputVal === '' ? 0 : parseInt(inputVal, 10)
    if (isNaN(validQty) || validQty < 0) validQty = 0
    // Chặn không cho vượt kho
    validQty = Math.min(validQty, book.stockQuantity)

    setSelectedBooks((prev) => {
      const newMap = new Map(prev)
      if (validQty === 0) {
        newMap.delete(bookId)
      } else {
        newMap.set(bookId, validQty)
      }
      return newMap
    })
  }

  const updateTempQuantity = (bookId: string, delta: number) => {
    const book = books.find((b: BookResponse) => b.id === bookId)
    if (!book) return
    setSelectedBooks((prev) => {
      const newMap = new Map(prev)
      const current = newMap.get(bookId) || 0
      const newQty = Math.max(0, Math.min(current + delta, book.stockQuantity))
      if (newQty === 0) {
        newMap.delete(bookId)
      } else {
        newMap.set(bookId, newQty)
      }
      return newMap
    })
  }

  const handleConfirm = () => {
    const newValue: SelectedBook[] = []
    selectedBooks.forEach((quantity, bookId) => {
      newValue.push({ bookId, quantity })
    })
    onChange(newValue)
    setOpen(false)
  }

  const removeBook = (bookId: string) => {
    const newValue = value.filter((item) => item.bookId !== bookId)
    onChange(newValue)
    setSelectedBooks((prev) => {
      const newMap = new Map(prev)
      newMap.delete(bookId)
      return newMap
    })
  }

  const getBookInfo = (bookId: string) => {
    return books.find((b: BookResponse) => b.id === bookId)
  }

  const totalSelected = value.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = value.reduce((sum, item) => {
    const book = getBookInfo(item.bookId)
    return sum + (book?.salePrice || 0) * item.quantity
  }, 0)

  return (
    <div className='space-y-4'>
      {/* Danh sách sách ĐÃ CHỌN ở ngoài Form */}
      {value.length > 0 ? (
        <div className='border rounded-lg overflow-hidden bg-background'>
          <div className='flex items-center justify-between bg-muted/20 px-4 py-3 border-b'>
            <Label className='font-medium'>Sản phẩm đã chọn ({totalSelected})</Label>
            <span className='font-bold text-primary'>{totalPrice.toLocaleString('vi-VN')}đ</span>
          </div>
          <ScrollArea className='max-h-[300px]'>
            <div className='p-2 space-y-2'>
              {value.map((item) => {
                const book = getBookInfo(item.bookId)
                return (
                  <div
                    key={item.bookId}
                    className='flex items-center justify-between bg-background p-3 rounded-md border shadow-sm'
                  >
                    <div className='flex items-center gap-4'>
                      {book?.thumbnail ? (
                        <img
                          src={book.thumbnail}
                          alt={book.title}
                          className='w-12 h-16 object-cover rounded border'
                        />
                      ) : (
                        <div className='w-12 h-16 bg-muted rounded border flex items-center justify-center text-xs'>
                          No Img
                        </div>
                      )}
                      <div>
                        <p className='text-base font-medium line-clamp-1'>
                          {book?.title || item.bookId}
                        </p>
                        <p className='text-sm text-muted-foreground mt-1'>
                          {book?.salePrice?.toLocaleString('vi-VN')}đ{' '}
                          <span className='font-bold text-foreground'>x {item.quantity}</span>
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-4'>
                      <p className='font-semibold'>
                        {((book?.salePrice || 0) * item.quantity).toLocaleString('vi-VN')}đ
                      </p>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive'
                        onClick={() => removeBook(item.bookId)}
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </div>
      ) : (
        <div className='border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground bg-muted/10'>
          <PackageOpen className='mx-auto h-10 w-10 mb-3 opacity-40' />
          <p>Giỏ hàng đang trống.</p>
          <p className='text-sm mt-1'>Bấm nút bên dưới để chọn sách vào đơn hàng.</p>
        </div>
      )}

      {/* Dialog Tìm & Chọn sách */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type='button' variant='outline' className='w-full border-dashed border-2 py-6'>
            <Plus className='mr-2 h-5 w-5' />
            Thêm sản phẩm vào đơn hàng
          </Button>
        </DialogTrigger>
        {/* Lớp Dialog to, ko đóng khi click ra ngoài */}
        <DialogContent
          className='!w-[90vw] !max-w-5xl h-[85vh] flex flex-col p-0'
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className='px-6 py-4 border-b'>
            <DialogTitle>Tìm kiếm và chọn sách</DialogTitle>
          </DialogHeader>

          <div className='flex-1 flex flex-col p-6 overflow-hidden gap-4 bg-slate-50 dark:bg-zinc-950/50'>
            {/* Thanh tìm kiếm */}
            <div className='relative bg-background rounded-md shadow-sm'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground' />
              <Input
                placeholder='Nhập tên sách hoặc mã ISBN...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10 h-12 text-base border-border/50'
              />
            </div>

            {/* Bảng sách */}
            <div className='flex-1 border border-border/50 rounded-xl overflow-hidden bg-background shadow-sm flex flex-col'>
              <ScrollArea className='flex-1'>
                {isLoading ? (
                  <div className='p-8 text-center flex flex-col items-center justify-center h-40'>
                    <Loader2 className='w-6 h-6 animate-spin mb-2' /> Đang tải dữ liệu...
                  </div>
                ) : filteredBooks.length === 0 ? (
                  <div className='p-8 text-center text-muted-foreground h-40 flex items-center justify-center'>
                    Không tìm thấy sách phù hợp.
                  </div>
                ) : (
                  <Table>
                    <TableHeader className='bg-muted/30 sticky top-0 z-10 shadow-sm'>
                      <TableRow>
                        <TableHead>Sản phẩm</TableHead>
                        <TableHead className='text-right'>Đơn giá</TableHead>
                        <TableHead className='text-center'>Kho</TableHead>
                        <TableHead className='text-center w-[200px]'>Số lượng mua</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBooks.map((book: BookResponse) => {
                        const selectedQty = selectedBooks.get(book.id) || 0
                        const isSelected = selectedQty > 0

                        return (
                          <TableRow key={book.id} className={isSelected ? 'bg-primary/5' : ''}>
                            <TableCell>
                              <div className='flex items-center gap-4'>
                                {book.thumbnail ? (
                                  <img
                                    src={book.thumbnail}
                                    alt={book.title}
                                    className='w-12 h-16 object-cover rounded border bg-white'
                                  />
                                ) : (
                                  <div className='w-12 h-16 bg-muted rounded border flex items-center justify-center text-xs'>
                                    Img
                                  </div>
                                )}
                                <div>
                                  <p className='font-medium text-base line-clamp-1'>{book.title}</p>
                                  <p className='text-sm text-muted-foreground'>
                                    {book.authors?.map((author) => author.name).join(', ')}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className='text-right font-medium text-base'>
                              {book.salePrice?.toLocaleString('vi-VN')}đ
                            </TableCell>
                            <TableCell className='text-center'>
                              <Badge
                                variant={book.stockQuantity > 10 ? 'secondary' : 'destructive'}
                                className='font-mono'
                              >
                                {book.stockQuantity}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className='flex items-center justify-center gap-2 bg-background p-1 border rounded-md'>
                                <Button
                                  type='button'
                                  variant='ghost'
                                  size='icon'
                                  className='h-8 w-8 text-muted-foreground hover:text-foreground'
                                  disabled={selectedQty <= 0}
                                  onClick={() => updateTempQuantity(book.id, -1)}
                                >
                                  <Minus className='h-4 w-4' />
                                </Button>
                                <Input
                                  type='text'
                                  value={selectedQty || ''}
                                  onChange={(e) => handleQuantityChange(book.id, e.target.value)}
                                  placeholder='0'
                                  className='h-8 w-14 text-center font-semibold border-none focus-visible:ring-0 p-0 text-base'
                                />
                                <Button
                                  type='button'
                                  variant='ghost'
                                  size='icon'
                                  className='h-8 w-8 text-primary hover:text-primary hover:bg-primary/10'
                                  disabled={selectedQty >= book.stockQuantity}
                                  onClick={() => updateTempQuantity(book.id, 1)}
                                >
                                  <Plus className='h-4 w-4' />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </ScrollArea>
            </div>
          </div>

          {/* Footer Tổng kết */}
          <div className='px-6 py-4 bg-background border-t shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] z-10'>
            <div className='flex items-center justify-between'>
              <div className='text-base'>
                Đã chọn{' '}
                <span className='font-bold text-primary text-xl mx-1'>
                  {Array.from(selectedBooks.values()).reduce((a, b) => a + b, 0)}
                </span>{' '}
                quyển sách
              </div>
              <div className='flex gap-3'>
                <DialogClose asChild>
                  <Button type='button' variant='outline' className='px-6'>
                    Đóng
                  </Button>
                </DialogClose>
                <Button type='button' onClick={handleConfirm} className='px-8 shadow-sm'>
                  Xác nhận đưa vào đơn
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
