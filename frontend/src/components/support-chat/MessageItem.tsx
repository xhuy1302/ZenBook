import React from 'react'
import { motion } from 'framer-motion'
import { Check, CheckCheck, ShoppingCart, ChevronRight, Store, Zap } from 'lucide-react'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import type { ChatMessageResponse } from '@/services/chat/chat.type'
import { toast } from 'sonner'

interface Props {
  msg: ChatMessageResponse
  isMe: boolean
  avatarLabel: string
}

const SYSTEM_ADMIN_ID = '00000000-0000-7000-0000-000000000100'

const MessageItem: React.FC<Props> = ({ msg, isMe, avatarLabel }) => {
  const timeDisplay = msg.createdAt ? format(new Date(msg.createdAt), 'HH:mm') : '...'
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addItem } = useCart()
  const isSystem = msg.senderId === SYSTEM_ADMIN_ID
  const isAdminView = user?.roles.some((r: string) => r === 'ADMIN' || r === 'STAFF')

  const renderProductCard = () => {
    try {
      const product = JSON.parse(msg.content)

      const handleAddToCart = async (e: React.MouseEvent) => {
        e.stopPropagation()
        try {
          await addItem(
            {
              id: product.id,
              slug: product.slug,
              title: product.name,
              thumbnail: product.image,
              price: product.price,
              originalPrice: product.price,
              author: '',
              stock: product.stock ?? 0
            },
            1
          )
          toast.success('Đã thêm vào giỏ hàng!')
        } catch {
          toast.error('Lỗi khi thêm vào giỏ!')
        }
      }

      const goToDetail = () => {
        if (product.slug) {
          navigate(`/products/${product.slug}`)
        } else {
          toast.error('Sách này chưa cập nhật đường dẫn chi tiết!')
        }
      }

      return (
        <div
          onClick={goToDetail}
          className='flex flex-col gap-2 w-[240px] p-1 cursor-pointer group'
        >
          <div className='bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm transition-all group-hover:shadow-md'>
            <div className='relative h-[180px] overflow-hidden'>
              <img
                src={product.image || 'https://via.placeholder.com/150'}
                alt={product.name}
                className='w-full h-full object-cover transition-transform group-hover:scale-105'
              />
            </div>
            <div className='p-4'>
              <h4 className='text-[13px] font-bold text-slate-800 line-clamp-2 leading-tight mb-2 min-h-[32px]'>
                {product.name}
              </h4>
              <p className='text-emerald-600 font-extrabold text-base'>
                {new Intl.NumberFormat('vi-VN').format(product.price)}đ
              </p>
            </div>
          </div>
          {!isMe && (
            <button
              onClick={handleAddToCart}
              className='w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-[12px] font-bold transition-all active:scale-95 shadow-sm shadow-emerald-100'
            >
              <ShoppingCart size={15} /> Thêm vào giỏ
            </button>
          )}
        </div>
      )
    } catch {
      return <div className='text-[10px] italic text-red-400'>Dữ liệu sản phẩm lỗi</div>
    }
  }

  const renderOrderCard = () => {
    try {
      const order = JSON.parse(msg.content)
      const handleViewDetail = () => {
        if (isAdminView) {
          navigate(`/dashboard/orders?code=${order.orderCode}`)
        } else {
          navigate(`/customer/orders/${order.orderCode}`)
        }
      }

      return (
        <div className='flex flex-col gap-3 w-[260px] p-1'>
          <div className='bg-white rounded-2xl border-2 border-emerald-50 shadow-lg overflow-hidden'>
            <div className='bg-gradient-to-r from-emerald-600 to-teal-500 p-3 flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <div className='p-1 bg-white/20 rounded-lg text-white'>
                  <Store size={14} />
                </div>
                <span className='text-white text-[10px] font-bold tracking-wider uppercase'>
                  ZenBook System
                </span>
              </div>
              <div className='bg-white/20 text-[9px] text-white px-2 py-0.5 rounded-full font-bold'>
                AUTO
              </div>
            </div>
            <div className='p-4 space-y-3 text-center'>
              <h3 className='text-emerald-600 font-bold text-[13px]'>🎉 Thông báo đơn hàng</h3>
              <p className='text-[10px] text-slate-400 mt-1 font-mono'>Mã: {order.orderCode}</p>
              <p className='text-[11px] text-emerald-700 font-medium mt-2 bg-emerald-50 py-2 px-1 rounded-lg leading-relaxed'>
                {order.message}
              </p>
              <div className='bg-slate-50 rounded-xl p-3 space-y-2 border border-slate-100'>
                <div className='flex justify-between text-[11px]'>
                  <span className='text-slate-500'>Tổng thanh toán</span>
                  <span className='font-bold text-slate-800'>
                    {new Intl.NumberFormat('vi-VN').format(order.total)}đ
                  </span>
                </div>
                {order.paymentMethod && (
                  <div className='flex justify-between text-[11px]'>
                    <span className='text-slate-500'>Phương thức</span>
                    <span className='font-medium text-emerald-600'>{order.paymentMethod}</span>
                  </div>
                )}
              </div>
              <div className='flex items-start gap-2 bg-amber-50 p-2.5 rounded-lg border border-amber-100 text-left'>
                <Zap size={14} className='text-amber-500 shrink-0 mt-0.5' />
                <p className='text-[10px] text-amber-800 leading-normal font-medium'>
                  Đánh giá ngay để nhận thêm xu thưởng!
                </p>
              </div>
            </div>
            <button
              onClick={handleViewDetail}
              className='w-full py-3 bg-slate-50 hover:bg-emerald-50 text-emerald-700 text-[11px] font-bold border-t border-slate-100 transition-colors flex items-center justify-center gap-2 group cursor-pointer'
            >
              {isAdminView ? 'Quản lý đơn hàng này' : 'Xem chi tiết đơn hàng'}
              <ChevronRight size={14} className='group-hover:translate-x-1 transition-transform' />
            </button>
          </div>
        </div>
      )
    } catch {
      return <div className='text-[10px] italic text-red-400'>Dữ liệu đơn hàng lỗi</div>
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2 w-full mb-3 ${isMe ? 'justify-end' : 'justify-start'}`}
    >
      {!isMe && (
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-bold shadow-sm ${isSystem ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'}`}
        >
          {isSystem ? <Store size={16} /> : avatarLabel.charAt(0).toUpperCase()}
        </div>
      )}
      <div className={`max-w-[85%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
        {!isMe && isSystem && (
          <span className='text-[10px] font-bold text-emerald-600 mb-1 ml-1 tracking-wide'>
            HỆ THỐNG
          </span>
        )}
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words shadow-sm ${isMe && !['PRODUCT', 'ORDER'].includes(msg.messageType) ? 'rounded-tr-sm text-white' : 'bg-white text-gray-700 rounded-tl-sm border border-emerald-100'}`}
          style={
            isMe && !['PRODUCT', 'ORDER'].includes(msg.messageType)
              ? { background: 'linear-gradient(135deg, #10b981, #059669)' }
              : {}
          }
        >
          {msg.messageType === 'TEXT' && (
            <span className='whitespace-pre-wrap'>{msg.content ?? ''}</span>
          )}
          {msg.messageType === 'IMAGE' && (
            <img
              src={msg.content}
              alt='media'
              className='rounded-lg max-w-full h-auto cursor-pointer max-h-[200px] object-cover'
              onClick={() => window.open(msg.content)}
            />
          )}
          {msg.messageType === 'PRODUCT' && renderProductCard()}
          {msg.messageType === 'ORDER' && renderOrderCard()}
        </div>
        <div className='flex items-center gap-1 mt-1.5 px-1'>
          <span className='text-[9px] text-gray-400 font-medium'>{timeDisplay}</span>
          {isMe && (
            <span className='ml-0.5'>
              {msg.status === 'SEEN' ? (
                <CheckCheck size={14} className='text-emerald-500' />
              ) : msg.status === 'DELIVERED' ? (
                <CheckCheck size={14} className='text-gray-400' />
              ) : (
                <Check size={14} className='text-gray-400' />
              )}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default MessageItem
