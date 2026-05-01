import { useNavigate } from 'react-router-dom'

const UnauthorizedPage = () => {
  const navigate = useNavigate()

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 text-center'>
      <div className='bg-white p-8 md:p-10 rounded-2xl shadow-xl max-w-lg w-full'>
        {/* Icon Cảnh báo (Dấu chấm than màu cam/đỏ) */}
        <div className='text-red-500 mb-6 flex justify-center'>
          <svg
            className='w-24 h-24 animate-pulse'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1.5}
              d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
            />
          </svg>
        </div>

        {/* Nội dung thông báo */}
        <h1 className='text-3xl font-bold text-gray-800 mb-3'>403 - Từ Chối Truy Cập</h1>
        <p className='text-gray-600 mb-8 leading-relaxed'>
          Xin lỗi, bạn không có đủ quyền hạn để xem trang này. Vui lòng kiểm tra lại tài khoản hoặc
          liên hệ với Quản trị viên nếu đây là một sự nhầm lẫn.
        </p>

        {/* Nhóm nút điều hướng */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <button
            onClick={() => navigate(-1)} // Quay lại trang trước đó
            className='px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200'
          >
            Quay lại trang trước
          </button>

          <button
            onClick={() => navigate('/')} // Về trang chủ
            className='px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg'
          >
            Về Trang Chủ
          </button>
        </div>
      </div>
    </div>
  )
}

export default UnauthorizedPage
